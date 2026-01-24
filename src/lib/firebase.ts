import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - these are publishable keys, safe to include in client code
const firebaseConfig = {
  apiKey: "AIzaSyBm5QUjwbNrqeKl34cU1C0y1TFUsl5VSYY",
  authDomain: "ganayachat.firebaseapp.com",
  projectId: "ganayachat",
  storageBucket: "ganayachat.firebasestorage.app",
  messagingSenderId: "647232543674",
  appId: "1:647232543674:web:70681521058c1d4498db83"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Debug (safe): helps confirm which Firebase project is being used in the browser
console.info('[firebase] initialized', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKeyPrefix: firebaseConfig.apiKey?.slice(0, 10),
});
