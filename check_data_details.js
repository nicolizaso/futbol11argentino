
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import 'dotenv/config';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkData() {
  try {
    console.log("--- Checking Formations ---");
    const formSnap = await getDocs(query(collection(db, "formaciones"), limit(1)));
    if (!formSnap.empty) {
        console.log("Formation:", JSON.stringify(formSnap.docs[0].data(), null, 2));
    } else {
        console.log("No formaciones found.");
    }

    console.log("\n--- Checking Players ---");
    const playerSnap = await getDocs(query(collection(db, "jugadores"), limit(3)));
    if (!playerSnap.empty) {
        playerSnap.docs.forEach(d => {
            console.log("Player:", JSON.stringify(d.data(), null, 2));
        });
    } else {
        console.log("No jugadores found.");
    }

  } catch (error) {
    console.error("Error checking data:", error);
  }
}

checkData();
