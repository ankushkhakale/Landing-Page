import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCudI61kv2oQHfDS63fKR_0iWHmLHpwqTU",
  authDomain: "brainbuddy-248b1.firebaseapp.com",
  projectId: "brainbuddy-248b1",
  storageBucket: "brainbuddy-248b1.firebasestorage.app",
  messagingSenderId: "123714264941",
  appId: "1:123714264941:web:b45e1227d897bfc2920464",
  measurementId: "G-XP98VB9DWE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Create Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app; 