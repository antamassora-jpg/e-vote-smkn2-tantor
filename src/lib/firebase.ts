
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// This is now correctly pointing to your 'osissmk2-d8804' project.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "osissmk2-d8804.firebaseapp.com",
  projectId: "osissmk2-d8804",
  storageBucket: "osissmk2-d8804.appspot.com",
  messagingSenderId: "366432616231",
  appId: "1:366432616231:web:d705c8680c656d54d90b4d"
};


// Initialize Firebase
// This pattern prevents reinitializing the app on hot reloads.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
