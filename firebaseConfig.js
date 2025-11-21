// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCZBj7A_RNkcHLLBxY4J2Rb4yIMHpUzFaE",
  authDomain: "receipt-scanner-dbf2d.firebaseapp.com",
  databaseURL:
    "https://receipt-scanner-dbf2d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "receipt-scanner-dbf2d",
  storageBucket: "receipt-scanner-dbf2d.firebasestorage.app",
  messagingSenderId: "905855834800",
  appId: "1:905855834800:web:86a08b7a27de21dc1bf975",
  measurementId: "G-YKQVGJH38J",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

export { app, database };
