import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

// Đăng ký tài khoản mới
export const register = async (email: string, password: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
};

// Đăng nhập
export const login = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

// Đăng xuất (Firebase signOut)
export const signOut = async () => {
  await firebaseSignOut(auth);
};

/** @deprecated use signOut */
export const logout = signOut;