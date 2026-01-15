
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCollections() {
  try {
    console.log("Checking 'formaciones'...");
    const formacionesSnap = await getDocs(query(collection(db, "formaciones"), limit(1)));
    if (formacionesSnap.empty) {
        console.log("No formaciones found.");
    } else {
        console.log("Formaciones sample:", formacionesSnap.docs[0].data());
    }

    console.log("Checking 'equipos'...");
    const equiposSnap = await getDocs(query(collection(db, "equipos"), limit(1)));
    if (equiposSnap.empty) {
        console.log("No equipos found.");
    } else {
        console.log("Equipos sample:", equiposSnap.docs[0].data());
    }

    console.log("Checking 'jugadores'...");
    const jugadoresSnap = await getDocs(query(collection(db, "jugadores"), limit(1)));
    if (jugadoresSnap.empty) {
        console.log("No jugadores found.");
    } else {
        console.log("Jugadores sample:", jugadoresSnap.docs[0].data());
    }

  } catch (error) {
    console.error("Error checking collections:", error);
  }
}

checkCollections();
