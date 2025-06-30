import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  limit, 
  orderBy,
  startAt,
  endAt
} from "firebase/firestore";
import { db } from "./firebase";

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: any;
  status?: string;
}

// Get a user by their ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      return {
        uid: userDoc.id,
        ...userDoc.data()
      } as User;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

// Search for users by name or email
export const searchUsers = async (searchTerm: string, currentUserId: string, userLimit = 10): Promise<User[]> => {
  try {
    // Create a case-insensitive range for the search term
    const searchTermLower = searchTerm.toLowerCase();
    const searchTermUpper = searchTerm.toLowerCase() + '\uf8ff';
    
    // Query for users where display name starts with the search term
    const nameQuery = query(
      collection(db, "users"),
      orderBy("displayName"),
      startAt(searchTermLower),
      endAt(searchTermUpper),
      limit(userLimit)
    );
    
    // Query for users where email starts with the search term
    const emailQuery = query(
      collection(db, "users"),
      orderBy("email"),
      startAt(searchTermLower),
      endAt(searchTermUpper),
      limit(userLimit)
    );
    
    // Execute both queries
    const [nameSnapshot, emailSnapshot] = await Promise.all([
      getDocs(nameQuery),
      getDocs(emailQuery)
    ]);
    
    // Combine results and remove duplicates and current user
    const users = new Map<string, User>();
    
    nameSnapshot.forEach((doc) => {
      if (doc.id !== currentUserId) {
        users.set(doc.id, { uid: doc.id, ...doc.data() } as User);
      }
    });
    
    emailSnapshot.forEach((doc) => {
      if (doc.id !== currentUserId) {
        users.set(doc.id, { uid: doc.id, ...doc.data() } as User);
      }
    });
    
    return Array.from(users.values());
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};