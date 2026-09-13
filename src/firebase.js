import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // Ensure this exact URL from your Firebase Console is present:
  databaseURL: "https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com", 
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, onValue, push, remove };