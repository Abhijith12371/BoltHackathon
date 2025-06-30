import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  increment,
  Timestamp,
  getDocs,
  where
} from "firebase/firestore";
import { db } from "./firebase";

export interface Song {
  id: string;
  title: string;
  url: string;
  videoId: string;
  addedBy: string;
  addedByName: string;
  addedAt: Timestamp;
  playCount?: number;
  lastPlayedBy?: string;
  lastPlayedAt?: Timestamp;
  isCurrentlyPlaying?: boolean;
  playingBy?: string;
}

export interface MusicState {
  currentSong?: string;
  isPlaying: boolean;
  playingBy?: string;
  startedAt?: Timestamp;
}

// Extract YouTube video ID from URL with improved regex
export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      // Clean the video ID (remove any additional parameters)
      return match[1].split('&')[0].split('?')[0];
    }
  }
  return null;
};

// Fetch YouTube video title using oEmbed API with better error handling
export const fetchYouTubeTitle = async (videoId: string): Promise<string> => {
  try {
    // First try the oEmbed API
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oEmbedUrl);
    
    if (response.ok) {
      const data = await response.json();
      if (data.title) {
        return data.title;
      }
    }
    
    // Fallback: try to extract from YouTube page (this might be blocked by CORS)
    throw new Error('oEmbed failed');
    
  } catch (error) {
    console.warn('Could not fetch YouTube title via oEmbed:', error);
    
    // Final fallback: return a generic title
    return `YouTube Video (${videoId.substring(0, 8)})`;
  }
};

// Add a song to a chat's music library with validation
export const addSongToChat = async (
  chatId: string,
  songData: {
    title: string;
    url: string;
    videoId: string;
    addedBy: string;
    addedByName: string;
  }
) => {
  try {
    // Validate the video ID
    if (!songData.videoId || songData.videoId.length < 8) {
      throw new Error('Invalid YouTube video ID');
    }

    // Validate the URL
    if (!songData.url.includes('youtube.com') && !songData.url.includes('youtu.be')) {
      throw new Error('Invalid YouTube URL');
    }

    const songsRef = collection(db, "chats", chatId, "songs");
    
    const docRef = await addDoc(songsRef, {
      ...songData,
      addedAt: serverTimestamp(),
      playCount: 0,
      isCurrentlyPlaying: false
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding song:", error);
    throw error;
  }
};

// Listen to songs in a chat with error handling
export const listenToChatSongs = (chatId: string, callback: (songs: Song[]) => void) => {
  try {
    const songsRef = collection(db, "chats", chatId, "songs");
    const q = query(songsRef, orderBy("addedAt", "desc"));
    
    return onSnapshot(q, (snapshot) => {
      try {
        const songs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Song[];
        
        callback(songs);
      } catch (error) {
        console.error("Error processing songs snapshot:", error);
        callback([]);
      }
    }, (error) => {
      console.error("Error listening to songs:", error);
      callback([]);
    });
  } catch (error) {
    console.error("Error setting up songs listener:", error);
    return () => {}; // Return empty unsubscribe function
  }
};

// Play a song for all users in the chat with better error handling
export const playSongForChat = async (chatId: string, songId: string, userId: string) => {
  try {
    // Validate inputs
    if (!chatId || !songId || !userId) {
      throw new Error('Missing required parameters for playing song');
    }

    // Update the song's play status
    const songRef = doc(db, "chats", chatId, "songs", songId);
    await updateDoc(songRef, {
      isCurrentlyPlaying: true,
      playingBy: userId,
      lastPlayedBy: userId,
      lastPlayedAt: serverTimestamp(),
      playCount: increment(1)
    });

    // Update chat's music state
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      musicState: {
        currentSong: songId,
        isPlaying: true,
        playingBy: userId,
        startedAt: serverTimestamp()
      }
    });

    // Reset other songs' playing status
    const songsRef = collection(db, "chats", chatId, "songs");
    const songsSnapshot = await getDocs(songsRef);
    
    const batch = [];
    songsSnapshot.forEach((doc) => {
      if (doc.id !== songId) {
        batch.push(updateDoc(doc.ref, { isCurrentlyPlaying: false }));
      }
    });
    
    if (batch.length > 0) {
      await Promise.all(batch);
    }
  } catch (error) {
    console.error("Error playing song:", error);
    throw new Error(`Failed to play song: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Pause song for all users in the chat
export const pauseSongForChat = async (chatId: string, userId: string) => {
  try {
    if (!chatId || !userId) {
      throw new Error('Missing required parameters for pausing song');
    }

    // Update chat's music state
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      musicState: {
        currentSong: null,
        isPlaying: false,
        playingBy: null,
        startedAt: null
      }
    });

    // Reset all songs' playing status
    const songsRef = collection(db, "chats", chatId, "songs");
    const songsSnapshot = await getDocs(songsRef);
    
    const batch = [];
    songsSnapshot.forEach((doc) => {
      batch.push(updateDoc(doc.ref, { isCurrentlyPlaying: false }));
    });
    
    if (batch.length > 0) {
      await Promise.all(batch);
    }
  } catch (error) {
    console.error("Error pausing song:", error);
    throw new Error(`Failed to pause song: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Listen to music state changes in a chat
export const listenToMusicState = (chatId: string, callback: (musicState: MusicState | null) => void) => {
  try {
    const chatRef = doc(db, "chats", chatId);
    
    return onSnapshot(chatRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.data();
          callback(data.musicState || null);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error("Error processing music state snapshot:", error);
        callback(null);
      }
    }, (error) => {
      console.error("Error listening to music state:", error);
      callback(null);
    });
  } catch (error) {
    console.error("Error setting up music state listener:", error);
    return () => {}; // Return empty unsubscribe function
  }
};

// Get currently playing song info with error handling
export const getCurrentlyPlayingSong = async (chatId: string): Promise<Song | null> => {
  try {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }

    const songsRef = collection(db, "chats", chatId, "songs");
    const q = query(songsRef, where("isCurrentlyPlaying", "==", true));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Song;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting currently playing song:", error);
    return null;
  }
};

// Validate YouTube URL
export const isValidYouTubeUrl = (url: string): boolean => {
  const videoId = extractYouTubeId(url);
  return videoId !== null && videoId.length >= 8;
};

// Get YouTube thumbnail URL
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string => {
  const qualityMap = {
    'default': 'default',
    'medium': 'mqdefault',
    'high': 'hqdefault',
    'maxres': 'maxresdefault'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};