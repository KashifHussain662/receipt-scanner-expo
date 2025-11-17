// firebaseConfig.js
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZBj7A_RNkcHLLBxY4J2Rb4yIMHpUzFaE",
  authDomain: "receipt-scanner-dbf2d.firebaseapp.com",
  databaseURL: "https://receipt-scanner-dbf2d-default-rtdb.firebaseio.com",
  projectId: "receipt-scanner-dbf2d",
  storageBucket: "receipt-scanner-dbf2d.firebasestorage.app",
  messagingSenderId: "905855834800",
  appId: "1:905855834800:web:86a08b7a27de21dc1bf975",
  measurementId: "G-YKQVGJH38J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Realtime Database and other services
const database = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only if supported
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { analytics, auth, database, firestore, storage };
export default app;
