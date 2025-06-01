import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBEyg0NMIILtx3RvyD12-MW0h0vKAW-0CA",
  authDomain: "chat-app-721bb.firebaseapp.com",
  projectId: "chat-app-721bb",
  storageBucket: "chat-app-721bb.firebasestorage.app",
  messagingSenderId: "563342594241",
  appId: "1:563342594241:web:eda423641b3e4ef73a4440",
  measurementId: "G-ZNW2GNVVQZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);