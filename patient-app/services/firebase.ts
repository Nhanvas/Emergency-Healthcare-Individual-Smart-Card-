import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBEsGI80bMWxJC4rL8wWU80WVZhscG1Ews",
  authDomain: "emergency-qr-medical.firebaseapp.com",
  projectId: "emergency-qr-medical",
  storageBucket: "emergency-qr-medical.firebasestorage.app",
  messagingSenderId: "867493842983",
  appId: "1:867493842983:web:98ceb88518ffae5512fe02"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);