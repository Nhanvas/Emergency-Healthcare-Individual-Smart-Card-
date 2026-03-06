import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
  } from 'firebase/auth';
  import { auth } from './firebase';
  
  export async function signInVolunteer(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }
  
  export async function signOutVolunteer() {
    await signOut(auth);
  }
  
  export function getCurrentUser(): User | null {
    return auth.currentUser;
  }
  
  export function subscribeAuthState(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }