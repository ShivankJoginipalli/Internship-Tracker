import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpqKl3Gsw4TNDZ3gxbhUQS48PeiwXwplc",
  authDomain: "intern-track-7bb3a.firebaseapp.com",
  projectId: "intern-track-7bb3a",
  storageBucket: "intern-track-7bb3a.firebasestorage.app",
  messagingSenderId: "630748102411",
  appId: "1:630748102411:web:99294c68b8e38ce72a2c0e",
  measurementId: "G-N1Q71FX906"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


