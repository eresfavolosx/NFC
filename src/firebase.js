import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nfc-manager-fv96",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:369384689589:web:2a98456e0b9e38db1913fc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nfc-manager-fv96.firebasestorage.app",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "", // 🛡️ Sentinel: Removed hardcoded API key
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nfc-manager-fv96.firebaseapp.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "369384689589",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut, onAuthStateChanged };
