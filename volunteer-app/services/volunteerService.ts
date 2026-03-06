import {
    doc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    getDoc,
  } from 'firebase/firestore';
  import { db } from './firebase';
  import { geohashForLocation } from 'geofire-common';
  
  export interface VolunteerData {
    name: string;
    phone: string;
    organization: string;
    isOnline: boolean;
    location?: { lat: number; lng: number };
    geohash?: string;
    locationUpdatedAt?: any;
    fcmToken?: string;
    createdAt?: any;
  }
  
  export async function getVolunteerData(volunteerId: string): Promise<VolunteerData | null> {
    const ref = doc(db, 'volunteers', volunteerId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as VolunteerData) : null;
  }
  
  export async function setOnline(
    volunteerId: string,
    lat: number,
    lng: number,
    fcmToken: string
  ) {
    const geohash = geohashForLocation([lat, lng]);
    await updateDoc(doc(db, 'volunteers', volunteerId), {
      isOnline: true,
      location: { lat, lng },
      geohash,
      locationUpdatedAt: serverTimestamp(),
      fcmToken,
    });
  }
  
  export async function setOffline(volunteerId: string) {
    await updateDoc(doc(db, 'volunteers', volunteerId), {
      isOnline: false,
    });
  }
  
  export async function updateLocation(volunteerId: string, lat: number, lng: number) {
    const geohash = geohashForLocation([lat, lng]);
    await updateDoc(doc(db, 'volunteers', volunteerId), {
      location: { lat, lng },
      geohash,
      locationUpdatedAt: serverTimestamp(),
    });
  }
  
  export async function saveFCMToken(volunteerId: string, token: string) {
    await updateDoc(doc(db, 'volunteers', volunteerId), {
      fcmToken: token,
    });
  }
  
  export function subscribeVolunteer(
    volunteerId: string,
    callback: (data: VolunteerData) => void
  ) {
    return onSnapshot(doc(db, 'volunteers', volunteerId), (snap) => {
      if (snap.exists()) callback(snap.data() as VolunteerData);
    });
  }