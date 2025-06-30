import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

// Register a new user with email and password
export const register = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's profile with display name
    await updateProfile(userCredential.user, { displayName });
    
    // Create a user document in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isOnline: true,
      lastSeen: serverTimestamp()
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign in with email and password
export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update the user's online status
    await setDoc(doc(db, "users", userCredential.user.uid), {
      isOnline: true,
      lastSeen: serverTimestamp()
    }, { merge: true });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    
    // Check if user document exists, if not create it
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isOnline: true,
      lastSeen: serverTimestamp()
    }, { merge: true });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    // Update the user's online status before signing out
    if (auth.currentUser) {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        isOnline: false,
        lastSeen: serverTimestamp()
      }, { merge: true });
    }
    
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};