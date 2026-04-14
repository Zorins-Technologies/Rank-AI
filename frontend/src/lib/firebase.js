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

// Initialize Firebase defensively
let app;
let auth = null;
const googleProvider = new GoogleAuthProvider();

try {
  if (firebaseConfig.apiKey) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } else {
    // This branch is expected during build time on Cloud Build if keys aren't provided to the builder
    console.warn("[Firebase] Initialization skipped: Missing API Key. Auth services will be disabled.");
  }
} catch (error) {
  console.error("[Firebase] Initialization error:", error);
}

// --- ADDED DEBUGGING LOGS (ONLY SHOWS IN BROWSER CONSOLE) ---
if (typeof window !== "undefined" && firebaseConfig.apiKey) {
  console.log("Firebase initialized successfully");
} else if (typeof window !== "undefined") {
  console.warn("Firebase Error: Your API key is undefined. Authentication will not work until provided.");
}

export { auth, googleProvider };
export default app;
