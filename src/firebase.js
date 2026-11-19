import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  projectId: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_PROJECT_ID : undefined,
  appId: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_APP_ID : undefined,
  storageBucket: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : undefined,
  apiKey: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_API_KEY : undefined,
  authDomain: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : undefined,
  messagingSenderId: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : undefined,
};

let app = null;
let auth = null;
let provider = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
}

function signInWithPopup(authInstance, authProvider) {
  if (!authInstance || !authProvider) {
    return Promise.reject(new Error('Firebase Auth is not configured.'));
  }
  return firebaseSignInWithPopup(authInstance, authProvider);
}

async function signOut(authInstance) {
  if (!authInstance) return;
  return firebaseSignOut(authInstance);
}

function onAuthStateChanged(authInstance, callback, errorCallback) {
  if (!authInstance) {
    queueMicrotask(() => callback(null));
    return () => {};
  }
  return firebaseOnAuthStateChanged(authInstance, callback, errorCallback);
}

export { auth, provider, signInWithPopup, signOut, onAuthStateChanged };
