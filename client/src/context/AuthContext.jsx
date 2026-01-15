// Placeholder for AuthContext
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety check: if auth is not initialized properly (mock env), we just bypass loading
    if (!auth || !auth.app || !auth.app.options || Object.keys(auth.app.options).length === 0) {
        console.warn("Auth not configured, skipping auth check.");
        setLoading(false);
        return;
    }

    try {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        }, (error) => {
            console.error("Auth Error:", error);
            setLoading(false);
        });
        return unsubscribe;
    } catch (e) {
        console.error("Auth Init Error:", e);
        setLoading(false);
    }
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
}
