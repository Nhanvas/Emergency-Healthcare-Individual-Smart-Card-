'use client';

import { useEffect, useState } from 'react';
import { db } from '../../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// ==================== STATES ====================
// ST1: loading_gps
// ST2: finding_volunteer
// ST3: volunteer_found
// ST4: no_volunteer
// ST5: gps_denied

export default function PatientPage({ params }) {
  const { patientId } = params;
  const [state, setState] = useState('loading_gps');
  const [incidentId, setIncidentId] = useState(null);
  const [volunteerName, setVolunteerName] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Lấy GPS và tạo incident
  useEffect(() => {
    if (!navigator.geolocation) {
      setState('gps_denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setState('finding_volunteer');

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL}/createIncident`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ patientId, lat: latitude, lng: longitude }),
            }
          );
          const data = await res.json();
          setIncidentId(data.incidentId);
        } catch (err) {
          console.error('Lỗi tạo incident:', err);
        }
      },
      () => setState('gps_denied')
    );
  }, [patientId]);

  // Lắng nghe Firestore incident realtime
  useEffect(() => {
    if (!incidentId) return;

    const unsub = onSnapshot(doc(db, 'incidents', incidentId), (snap) => {
      const data = snap.data();
      if (!data) return;

      if (data.status === 'accepted') {
        setVolunteerName(data.volunteerName || 'Tình nguyện viên');
        setState('volunteer_found');
      } else if (data.status === 'expired') {
        setState('no_volunteer');
      }
    });

    return () => unsub();
  }, [incidentId]);

  // Đếm thời gian chờ
  useEffect(() => {
    if (state !== 'finding_volunteer') return;
    const timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [state]);

  // Timeout 10 phút
  useEffect(() => {
    if (state !== 'finding_volunteer') return;
    const timeout = setTimeout(() => setState('no_volunteer'), 2 * 60 * 1000);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <main style={styles.container}>
      {state === 'loading_gps' && <LoadingGPS />}
      {state === 'finding_volunteer' && <FindingVolunteer elapsed={elapsedTime} />}
      {state === 'volunteer_found' && <VolunteerFound name={volunteerName} />}
      {state === 'no_volunteer' && <NoVolunteer />}
      {state === 'gps_denied' && <GPSDenied />}

      {/* Nút 115 cố định ở dưới - luôn hiển thị */}
      <a href="tel:115" style={styles.emergencyBtn}>
        📞 Gọi 115 ngay
      </a>
    </main>
  );
}

// ==================== COMPONENTS ====================

function LoadingGPS() {
  return (
    <div style={styles.stateContainer}>
      <div style={styles.spinner} />
      <h2 style={styles.title}>Đang xác định vị trí...</h2>
      <p style={styles.subtitle}>Vui lòng cho phép truy cập vị trí khi được hỏi</p>
    </div>
  );
}

function FindingVolunteer({ elapsed }) {
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  return (
    <div style={styles.stateContainer}>
      <div style={styles.pulseContainer}>
        <div style={{ ...styles.pulseCircle, animationDelay: '0s' }} />
        <div style={{ ...styles.pulseCircle, animationDelay: '0.5s' }} />
        <div style={{ ...styles.pulseCircle, animationDelay: '1s' }} />
        <span style={styles.crossIcon}>✚</span>
      </div>
      <h2 style={styles.title}>Đang tìm tình nguyện viên...</h2>
      <p style={styles.subtitle}>Thời gian chờ: {minutes}:{seconds}</p>
      <p style={styles.subtitle}>Yêu cầu đã được gửi đến các tình nguyện viên gần đây</p>
    </div>
  );
}

function VolunteerFound({ name }) {
  return (
    <div style={styles.stateContainer}>
      <div style={styles.successIcon}>✅</div>
      <h2 style={{ ...styles.title, color: '#2E7D32' }}>Đã tìm thấy tình nguyện viên!</h2>
      <p style={styles.subtitle}>{name} đang trên đường đến</p>
      <div style={styles.successBox}>
        <p style={styles.successText}>Bạn có thể rời đi</p>
      </div>
    </div>
  );
}

function NoVolunteer() {
  return (
    <div style={styles.stateContainer}>
      <div style={styles.warningIcon}>⚠️</div>
      <h2 style={{ ...styles.title, color: '#C00000' }}>Không tìm thấy tình nguyện viên</h2>
      <p style={styles.subtitle}>Hiện không có tình nguyện viên nào trong khu vực</p>
      <p style={styles.subtitle}>Vui lòng gọi 115 ngay bên dưới</p>
    </div>
  );
}

function GPSDenied() {
  return (
    <div style={styles.stateContainer}>
      <div style={styles.warningIcon}>📍✗</div>
      <h2 style={{ ...styles.title, color: '#C00000' }}>Không truy cập được vị trí</h2>
      <p style={styles.subtitle}>Vui lòng cho phép truy cập vị trí và thử lại</p>
      <button onClick={() => window.location.reload()} style={styles.retryBtn}>
        Thử lại
      </button>
    </div>
  );
}

// ==================== STYLES ====================
const styles = {
  container: {
    maxWidth: '480px',
    margin: '0 auto',
    minHeight: '100vh',
    padding: '24px 16px 100px',
    fontFamily: 'sans-serif',
    backgroundColor: '#fff',
    position: 'relative',
  },
  stateContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
    textAlign: 'center',
    gap: '16px',
  },
  title: { fontSize: '20px', fontWeight: 'bold', color: '#212121', margin: 0 },
  subtitle: { fontSize: '16px', color: '#757575', margin: 0 },
  spinner: {
    width: '48px', height: '48px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #D32F2F',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  pulseContainer: { position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pulseCircle: {
    position: 'absolute',
    width: '100px', height: '100px',
    borderRadius: '50%',
    border: '2px solid #D32F2F',
    animation: 'pulse 2s ease-out infinite',
  },
  crossIcon: { fontSize: '32px', color: '#D32F2F', zIndex: 1 },
  successIcon: { fontSize: '64px' },
  warningIcon: { fontSize: '64px' },
  successBox: {
    backgroundColor: '#E8F5E9',
    padding: '16px 24px',
    borderRadius: '8px',
    marginTop: '8px',
  },
  successText: { fontSize: '18px', fontWeight: 'bold', color: '#2E7D32', margin: 0 },
  emergencyBtn: {
    position: 'fixed',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: '448px',
    backgroundColor: '#D32F2F',
    color: '#fff',
    padding: '18px',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'block',
  },
  retryBtn: {
    backgroundColor: '#D32F2F',
    color: '#fff',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '8px',
  },
};