// Import core Firebase SDK
import { initializeApp } from "firebase/app";

// Import the Firebase services you plan to use
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRT0iig2B7FO36-7f4ACLZdncrBPvotxk",
  authDomain: "project141-22a01.firebaseapp.com",
  databaseURL: "https://project141-22a01-default-rtdb.firebaseio.com",
  projectId: "project141-22a01",
  storageBucket: "project141-22a01.firebasestorage.app",
  messagingSenderId: "834832501566",
  appId: "1:834832501566:web:78506afb747653f6e8fa6f",
  measurementId: "G-Q23FG3TM2H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
