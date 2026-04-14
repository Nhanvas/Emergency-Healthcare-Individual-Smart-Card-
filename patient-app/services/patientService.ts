import { db, auth } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

export const savePatient = async (data: {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Chưa đăng nhập");

  await setDoc(doc(db, "patients", uid), {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const getPatient = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Chưa đăng nhập");

  const snap = await getDoc(doc(db, "patients", uid));
  if (snap.exists()) {
    return snap.data();
  }
  return null;
};