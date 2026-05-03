// ⚠️ Replace with your Firebase project credentials
// Firebase Console → Project Settings → Your Apps → Web App
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuDeVca4S1F3CHesvqWWuONzR9xG6_k-o",
  authDomain: "asmira-cda4f.firebaseapp.com",
  projectId: "asmira-cda4f",
  storageBucket: "asmira-cda4f.firebasestorage.app",
  messagingSenderId: "719200934181",
  appId: "1:719200934181:web:768963d9af855ca8ece2cc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
