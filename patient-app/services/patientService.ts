import { getPatientPublicProfileUrl } from "../constants/config";
import { db, auth } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

// Lưu hoặc cập nhật thông tin bệnh nhân lên Firestore
export const savePatient = async (data: {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
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
    medications: data.medications ?? [],
    qrUrl: getPatientPublicProfileUrl(uid),
    updatedAt: serverTimestamp()
  });
};

// Lấy thông tin bệnh nhân từ Firestore
export const getPatient = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Chưa đăng nhập");

  const snap = await getDoc(doc(db, "patients", uid));
  if (snap.exists()) {
    return snap.data();
  }
  return null;
};