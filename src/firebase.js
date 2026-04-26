import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  projectId: "nfc-manager-fv96",
  appId: "1:369384689589:web:2a98456e0b9e38db1913fc",
  storageBucket: "nfc-manager-fv96.firebasestorage.app",
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "",
  authDomain: "nfc-manager-fv96.firebaseapp.com",
  messagingSenderId: "369384689589",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut, onAuthStateChanged };
