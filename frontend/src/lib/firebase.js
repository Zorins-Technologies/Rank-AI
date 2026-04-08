import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- FIX: Handle multiple initializations in Next.js ---
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// --- ADDED DEBUGGING LOGS (ONLY SHOWS IN BROWSER CONSOLE) ---
if (typeof window !== "undefined") {
  console.log("Firebase initialized successfully with API Key:", !!firebaseConfig.apiKey);
  if (!firebaseConfig.apiKey) {
    console.warn("Firebase Error: Your API key is undefined. Please restart your dev server (npm run dev).");
  }
}

// Export Auth and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
