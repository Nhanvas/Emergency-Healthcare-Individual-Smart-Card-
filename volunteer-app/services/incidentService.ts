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

const CREATE_INCIDENT_URL = 'https://createincident-63u7no4kya-as.a.run.app';
const ACCEPT_INCIDENT_URL = 'https://acceptincident-63u7no4kya-as.a.run.app';

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
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  emergencyContact: string;
}

export async function acceptIncident(
  incidentId: string,
  volunteerId: string
): Promise<{ success: boolean; patientId?: string; error?: string }> {
  const res = await fetch(ACCEPT_INCIDENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incidentId, volunteerId }),
  });
  return res.json();
}

export async function completeIncident(incidentId: string) {
  await updateDoc(doc(db, 'emergencies', incidentId), {
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
  return onSnapshot(doc(db, 'emergencies', incidentId), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as IncidentData) : null);
  });
}

export async function getVolunteerHistory(volunteerId: string): Promise<IncidentData[]> {
  const q = query(
    collection(db, 'emergencies'),
    where('acceptedBy', '==', volunteerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IncidentData));
}