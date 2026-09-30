import { auth, db } from '../config/firebase';

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

export { auth, db };
