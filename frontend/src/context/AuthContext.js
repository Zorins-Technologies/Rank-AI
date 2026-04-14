"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = (email, password) => {
    if (!auth) throw new Error("Firebase Auth is not initialized");
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    if (!auth) throw new Error("Firebase Auth is not initialized");
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    if (!auth || !googleProvider) throw new Error("Firebase Google Auth is not initialized");
    return signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    setUser(null);
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loginWithGoogle, loading }}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617]">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
            <div className="absolute inset-1 rounded-full border-r-2 border-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
