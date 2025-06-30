import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  limit,
  Timestamp,
  increment
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { getUserById } from "./users";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
  read: boolean;
  deleted: boolean;
  images?: string[];
  reactions?: { [userId: string]: string };
}

// Create a new chat between two users
export const createChat = async (currentUserId: string, otherUserId: string): Promise<string> => {
  try {
    // Check if a chat already exists between these users
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", currentUserId)
    );
    
    const querySnapshot = await getDocs(q);
    let existingChatId: string | null = null;
    
    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      if (chatData.participants.includes(otherUserId)) {
        existingChatId = doc.id;
      }
    });
    
    // If chat already exists, return its ID
    if (existingChatId) {
      return existingChatId;
    }
    
    // Otherwise, create a new chat
    const newChatRef = await addDoc(collection(db, "chats"), {
      participants: [currentUserId, otherUserId],
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTime: serverTimestamp(),
      unreadCounts: {
        [currentUserId]: 0,
        [otherUserId]: 0
      }
    });
    
    return newChatRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

// Listen to all chats for a user
export const getUserChats = (userId: string, callback: (chats: any[]) => void) => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );
  
  return onSnapshot(q, async (snapshot) => {
    const chatsPromises = snapshot.docs.map(async (doc) => {
      const chatData = doc.data();
      
      // Get the other participant's data
      const otherUserId = chatData.participants.find((id: string) => id !== userId);
      const otherUser = await getUserById(otherUserId);
      
      // Get unread count for current user
      const unreadCount = chatData.unreadCounts?.[userId] || 0;
      
      return {
        id: doc.id,
        ...chatData,
        user: otherUser,
        lastMessage: chatData.lastMessage,
        unreadCount: unreadCount
      };
    });
    
    const chats = await Promise.all(chatsPromises);
    callback(chats);
  });
};

// Get chat by ID
export const getChatById = async (chatId: string): Promise<any> => {
  try {
    const chatDoc = await getDoc(doc(db, "chats", chatId));
    if (chatDoc.exists()) {
      return {
        id: chatDoc.id,
        ...chatDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting chat:", error);
    throw error;
  }
};

// Listen to messages in a chat
export const listenToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt"));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    
    callback(messages);
  });
};

// Send a message to a chat with improved error handling and CORS fix
export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string,
  images: Array<{ name: string; data: ArrayBuffer; type: string }> = []
) => {
  try {
    const messageData: any = {
      text,
      senderId,
      createdAt: serverTimestamp(),
      read: false,
      deleted: false
    };
    
    // Upload images if any with improved error handling
    if (images.length > 0) {
      try {
        const imageUrls = await Promise.all(
          images.map(async (image, index) => {
            try {
              // Create a unique filename with timestamp and random string
              const timestamp = Date.now();
              const randomString = Math.random().toString(36).substring(2, 15);
              const fileExtension = image.type.split('/')[1] || 'jpg';
              const fileName = `${timestamp}-${randomString}.${fileExtension}`;
              
              // Use a cleaner path structure
              const storagePath = `chats/${chatId}/images/${fileName}`;
              const storageRef = ref(storage, storagePath);
              
              // Convert ArrayBuffer to Blob with proper MIME type
              const blob = new Blob([image.data], { type: image.type });
              
              // Upload with proper metadata to help with CORS
              const metadata = {
                contentType: image.type,
                cacheControl: 'public,max-age=3600',
                customMetadata: {
                  'originalName': image.name,
                  'uploadedBy': senderId,
                  'chatId': chatId,
                  'uploadedAt': new Date().toISOString()
                }
              };
              
              console.log(`Uploading image ${index + 1}/${images.length}:`, fileName);
              
              // Upload the image with retry logic
              let uploadAttempts = 0;
              const maxAttempts = 3;
              
              while (uploadAttempts < maxAttempts) {
                try {
                  const snapshot = await uploadBytes(storageRef, blob, metadata);
                  console.log(`Successfully uploaded image ${index + 1}:`, snapshot.ref.fullPath);
                  
                  // Get download URL with retry logic
                  let urlAttempts = 0;
                  while (urlAttempts < maxAttempts) {
                    try {
                      const downloadURL = await getDownloadURL(snapshot.ref);
                      console.log(`Got download URL for image ${index + 1}:`, downloadURL);
                      return downloadURL;
                    } catch (urlError) {
                      urlAttempts++;
                      console.warn(`Attempt ${urlAttempts} failed to get download URL:`, urlError);
                      if (urlAttempts >= maxAttempts) {
                        throw urlError;
                      }
                      // Wait before retrying
                      await new Promise(resolve => setTimeout(resolve, 1000 * urlAttempts));
                    }
                  }
                } catch (uploadError) {
                  uploadAttempts++;
                  console.warn(`Upload attempt ${uploadAttempts} failed:`, uploadError);
                  if (uploadAttempts >= maxAttempts) {
                    throw uploadError;
                  }
                  // Wait before retrying
                  await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
                }
              }
              
              throw new Error('Max upload attempts reached');
            } catch (uploadError) {
              console.error(`Error uploading image ${index + 1} (${image.name}):`, uploadError);
              throw new Error(`Failed to upload image "${image.name}": ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
            }
          })
        );
        
        messageData.images = imageUrls;
        console.log('All images uploaded successfully:', imageUrls);
      } catch (imageError) {
        console.error('Error uploading images:', imageError);
        // Don't throw here - allow text message to be sent even if images fail
        console.warn('Sending message without images due to upload failure');
        // You could optionally show a user-friendly error message here
      }
    }
    
    // Add message to the chat
    const messagesRef = collection(db, "chats", chatId, "messages");
    const newMessageRef = await addDoc(messagesRef, messageData);
    
    // Get chat data to update unread counts
    const chatDoc = await getDoc(doc(db, "chats", chatId));
    const chatData = chatDoc.data();
    const participants = chatData?.participants || [];
    const recipientId = participants.find((id: string) => id !== senderId);
    
    // Update last message and unread count for recipient
    if (recipientId) {
      const updateData: any = {
        lastMessage: {
          text,
          senderId,
          createdAt: serverTimestamp()
        },
        lastMessageTime: serverTimestamp()
      };
      
      // Create or increment unread count for recipient
      updateData[`unreadCounts.${recipientId}`] = increment(1);
      
      await updateDoc(doc(db, "chats", chatId), updateData);
    }
    
    return newMessageRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Mark messages as read
export const markMessagesAsRead = async (chatId: string, currentUserId: string) => {
  try {
    // Reset unread count for current user
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      [`unreadCounts.${currentUserId}`]: 0
    });
    
    // Mark individual messages as read
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(
      messagesRef,
      where("senderId", "!=", currentUserId),
      where("read", "==", false),
      limit(100)
    );
    
    const querySnapshot = await getDocs(q);
    
    const batch = [];
    querySnapshot.forEach((doc) => {
      batch.push(updateDoc(doc.ref, { read: true }));
    });
    
    if (batch.length > 0) {
      await Promise.all(batch);
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

// Delete a message
export const deleteMessage = async (chatId: string, messageId: string) => {
  try {
    const messageRef = doc(db, "chats", chatId, "messages", messageId);
    
    // Mark as deleted rather than actually deleting
    await updateDoc(messageRef, {
      deleted: true,
      text: ""
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

// React to a message
export const reactToMessage = async (chatId: string, messageId: string, userId: string, reaction: string) => {
  try {
    const messageRef = doc(db, "chats", chatId, "messages", messageId);
    const messageSnap = await getDoc(messageRef);
    
    if (messageSnap.exists()) {
      const messageData = messageSnap.data();
      const reactions = messageData.reactions || {};
      
      // Toggle reaction (remove if same reaction exists)
      if (reactions[userId] === reaction) {
        delete reactions[userId];
      } else {
        reactions[userId] = reaction;
      }
      
      await updateDoc(messageRef, { reactions });
    }
  } catch (error) {
    console.error("Error reacting to message:", error);
    throw error;
  }
};