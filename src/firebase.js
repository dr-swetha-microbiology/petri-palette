import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  push,
  remove
} from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD5m1dVSQfkbsJ4wZXnKkx9nR90zTVQ--s",
  authDomain: "petri-palette.firebaseapp.com",
  databaseURL: "https://petri-palette-default-rtdb.firebaseio.com",
  projectId: "petri-palette",
  storageBucket: "petri-palette.firebasestorage.app",
  messagingSenderId: "51435365609",
  appId: "1:51435365609:web:cba4a771b87ec38df0fc78",
  measurementId: "G-XMEL42EQKB"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export {
  ref,
  onValue,
  push,
  remove
};