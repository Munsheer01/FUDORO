import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSFGFp3hOYGRiMh-NcmSoD_yiygr9RGpg",
  authDomain: "fudoro-webapp.firebaseapp.com",
  projectId: "fudoro-webapp",
  storageBucket: "fudoro-webapp.firebasestorage.app",
  messagingSenderId: "58376411933",
  appId: "1:58376411933:web:d10d3aaecd394ad6a3dff4",
  measurementId: "G-32T33S8V8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get service instances
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// --- REMOVE EMULATOR CONNECTION BLOCK ---
// if (
//   window.location.hostname === "localhost" ||
//   window.location.hostname === "127.0.0.1"
// ) {
//   console.log("Connecting to Firebase Emulators...");
//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectFirestoreEmulator(db, "localhost", 8080);
//   connectFunctionsEmulator(functions, "localhost", 5001);
//   connectStorageEmulator(storage, "localhost", 9199);
// }

export { app, auth, db, functions, storage };