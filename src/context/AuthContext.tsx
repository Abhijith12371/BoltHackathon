import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextProps {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  loading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Update user online status
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          isOnline: true,
          lastSeen: serverTimestamp()
        }, { merge: true });
      }
      
      setLoading(false);
    });

    // Set up beforeunload handler to mark user as offline when they close the tab
    const handleBeforeUnload = async () => {
      if (auth.currentUser) {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          isOnline: false,
          lastSeen: serverTimestamp()
        }, { merge: true });
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};