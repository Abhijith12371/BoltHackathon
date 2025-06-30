import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkKy7kkOC7XfBhBzDIYcQ_C4UYB_2JAiY",
  authDomain: "messaging-e84d9.firebaseapp.com",
  projectId: "messaging-e84d9",
  storageBucket: "messaging-e84d9.appspot.com",
  messagingSenderId: "638322990840",
  appId: "1:638322990840:web:81128e62b68db5469fa50d",
  measurementId: "G-8DKH1RX2CF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage with proper configuration
export const storage = getStorage(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set custom parameters for better user experience
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;