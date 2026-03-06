import {
    doc,
    getDoc,
    updateDoc,
    onSnapshot,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  const FUNCTIONS_BASE_URL =
    'https://asia-southeast1-emergency-qr-medical.cloudfunctions.net';
  
  export interface IncidentData {
    id: string;
    patientId: string;
    reporterLocation: { lat: number; lng: number };
    status: 'pending' | 'accepted' | 'completed' | 'expired';
    acceptedBy?: string;
    acceptedAt?: any;
    createdAt?: any;
    expiresAt?: any;
  }
  
  export interface PatientData {
    name: string;
    dob: string;
    bloodType: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
    emergencyContact: { name: string; phone: string };
    phone?: string;
  }
  
  export async function acceptIncident(
    incidentId: string,
    volunteerId: string
  ): Promise<{ success: boolean; patientId?: string; error?: string }> {
    const res = await fetch(`${FUNCTIONS_BASE_URL}/acceptIncident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId, volunteerId }),
    });
    return res.json();
  }
  
  export async function completeIncident(incidentId: string) {
    await updateDoc(doc(db, 'incidents', incidentId), {
      status: 'completed',
      completedAt: serverTimestamp(),
    });
  }
  
  export async function getPatientInfo(patientId: string): Promise<PatientData | null> {
    const snap = await getDoc(doc(db, 'patients', patientId));
    return snap.exists() ? (snap.data() as PatientData) : null;
  }
  
  export function subscribeIncident(
    incidentId: string,
    callback: (data: IncidentData | null) => void
  ) {
    return onSnapshot(doc(db, 'incidents', incidentId), (snap) => {
      callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as IncidentData) : null);
    });
  }
  
  export async function getVolunteerHistory(volunteerId: string): Promise<IncidentData[]> {
    const q = query(
      collection(db, 'incidents'),
      where('acceptedBy', '==', volunteerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IncidentData));
  }