import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { UserProfile, UserRole } from '../types/user';
import { SEED_USERS } from '../utils/seedData';

const AUTH_STORAGE_KEY = 'mitrapulse_current_user';

export const isFirebaseConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  return Boolean(
    apiKey &&
    projectId &&
    !apiKey.includes('your_api_key') &&
    !apiKey.includes('demo') &&
    !projectId.includes('demo')
  );
};

export const loginWithEmailAndPassword = async (
  email: string,
  pass: string,
  roleHint?: UserRole
): Promise<UserProfile> => {
  const isRealFirebase = isFirebaseConfigured();

  if (isRealFirebase) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const uid = userCredential.user.uid;
      
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        return profile;
      }
      
      // If auth succeeds but no doc exists yet in Firestore, create user profile document
      const newProfile: UserProfile = {
        uid,
        name: userCredential.user.displayName || email.split('@')[0],
        email: userCredential.user.email || email,
        role: roleHint || 'student',
        teamId: roleHint === 'student' ? 'vibe-coding' : null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(userDocRef, newProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
      return newProfile;
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';

      if (code === 'auth/user-not-found' || message.includes('user-not-found')) {
        throw new Error('User not found. No user record corresponds to this identifier.');
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-email' ||
        message.includes('invalid-credential') ||
        message.includes('wrong-password')
      ) {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else if (code === 'auth/too-many-requests' || message.includes('too-many-requests')) {
        throw new Error('Too many unsuccessful login attempts. Access to this account has been temporarily disabled.');
      } else if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      throw new Error(err?.message || 'Authentication failed. Please try again.');
    }
  }

  // Development Fallback Mode (when Firebase credentials are not set in .env)
  if (import.meta.env.DEV || !import.meta.env.PROD) {
    const seedMatch = SEED_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (seedMatch) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(seedMatch));
      return seedMatch;
    }
  }

  throw new Error('Firebase credentials not configured. Please set valid VITE_FIREBASE_* variables in .env file.');
};

// Primary login function required by interface
export const loginUser = async (email: string, pass: string, roleHint?: UserRole): Promise<UserProfile> => {
  return loginWithEmailAndPassword(email, pass, roleHint);
};

export const logoutUser = async (): Promise<void> => {
  try {
    if (isFirebaseConfigured()) {
      await firebaseSignOut(auth);
    }
  } catch {
    // ignore error on logout cleanup
  } finally {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  if (isFirebaseConfigured()) {
    try {
      await sendPasswordResetEmail(auth, email);
      return;
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';

      if (code === 'auth/user-not-found' || message.includes('user-not-found')) {
        throw new Error('User not found. No user account found with this email address.');
      } else if (code === 'auth/invalid-email' || message.includes('invalid-email')) {
        throw new Error('Invalid email format provided.');
      } else if (code === 'auth/too-many-requests' || message.includes('too-many-requests')) {
        throw new Error('Too many password reset requests. Please try again later.');
      } else if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
        throw new Error('Network error. Please check your connection.');
      }
      throw new Error(err?.message || 'Failed to send reset email.');
    }
  }

  // Local dev mode fallback
  const exists = SEED_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!exists) {
    throw new Error('No user account found with this email address.');
  }
};

export const getStoredUser = (): UserProfile | null => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserProfile;
  } catch {
    return null;
  }
};
