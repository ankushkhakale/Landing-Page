import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';

// Test Firebase connection
export const testFirebaseConnection = () => {
  console.log('Firebase Auth initialized:', !!auth);
  console.log('Google Provider configured:', !!googleProvider);
  return {
    auth: !!auth,
    googleProvider: !!googleProvider
  };
};

// Test Google Sign In (for development testing)
export const testGoogleSignIn = async () => {
  try {
    console.log('Testing Google Sign In...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Sign in successful:', result.user.email);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Sign in failed:', error.message);
    return { success: false, error: error.message };
  }
}; 