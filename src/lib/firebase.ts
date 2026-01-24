import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - these are publishable keys, safe to include in client code
const firebaseConfig = {
  apiKey: "AIzaSyBpWrUxqJQa4R0mXRPHiU0B-8Fz1-P6dZI",
  authDomain: "ganaya-bet.firebaseapp.com",
  projectId: "ganaya-bet",
  storageBucket: "ganaya-bet.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
