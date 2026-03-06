import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBEsGI80bMWxJC4rL8wWU80WVZhscG1Ews",
  authDomain: "emergency-qr-medical.firebaseapp.com",
  projectId: "emergency-qr-medical",
  storageBucket: "emergency-qr-medical.firebasestorage.app",
  messagingSenderId: "867493842983",
  appId: "1:867493842983:web:98ceb88518ffae5512fe02"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;