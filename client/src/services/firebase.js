import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Ideally these should be environment variables, but for now I'll use the ones from the original code
// In the final step I will move these to the server side as requested in the requirements.
// "Secure Firebase API keys on the server-side to prevent exposure in the browser."
// However, Firebase Client SDKs are designed to be public.
// The requirement might mean to proxy requests or just use environment variables.
// Since I need to run this client side, I need the config here.
// I will start with env vars.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
