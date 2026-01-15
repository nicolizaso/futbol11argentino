import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(key => !import.meta.env[key]);

if (missingVars.length > 0) {
  console.error(
    `%c[Firebase Config Error] Missing environment variables: ${missingVars.join(', ')}.
    Check your .env file or Vercel project settings.`,
    'color: red; font-weight: bold; font-size: 14px;'
  );
}

// Fallback config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id"
};

let app;
let auth;
let db;

try {
    app = initializeApp(firebaseConfig);
    // These might fail if config is totally bogus (like "mock-key") and SDK tries to validate immediately?
    // Usually they don't fail until you use them, but let's be safe.
    try {
        auth = getAuth(app);
    } catch (e) {
        console.warn("Auth init failed:", e);
        auth = null;
    }
    try {
        db = getFirestore(app);
    } catch (e) {
        console.warn("DB init failed:", e);
        db = null;
    }
} catch (e) {
    console.warn("Firebase Init Error (Mocking):", e);
    app = null;
    auth = null;
    db = null;
}

export { auth, db };
