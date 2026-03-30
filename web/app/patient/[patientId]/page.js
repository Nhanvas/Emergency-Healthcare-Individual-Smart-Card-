'use client';

import { useEffect, useState } from 'react';
import { db } from '../../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// ==================== STATES ====================
// ST0: info_form      — form nhập SĐT + mô tả (MỚI)
// ST1: loading_gps    — đang xin GPS
// ST2: finding_volunteer
// ST3: volunteer_found
// ST4: no_volunteer
// ST5: gps_denied

export default function PatientPage({ params }) {
  const { patientId } = params;
  const [state, setState] = useState('info_form'); // Bắt đầu từ ST0
  const [incidentId, setIncidentId] = useState(null);
  const [volunteerName, setVolunteerName] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Dữ liệu từ form ST0
  const [bystanderPhone, setBystanderPhone] = useState('');
  const [bystanderNote, setBystanderNote] = useState('');

  // Gọi hàm này sau khi bystander submit form ST0
  const handleFormSubmit = () => {
    setState('loading_gps');
  };

  // Xin GPS và tạo incident — chỉ chạy khi state = loading_gps
  useEffect(() => {
    if (state !== 'loading_gps') return;

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
            process.env.NEXT_PUBLIC_CREATE_INCIDENT_URL,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              // Gửi kèm bystanderPhone và bystanderNote từ ST0 form
              body: JSON.stringify({
                patientId,
                lat: latitude,
                lng: longitude,
                bystanderPhone: bystanderPhone || null,
                bystanderNote: bystanderNote || null,
              }),
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
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Timeout 2 phút — chuyển sang ST4 nếu không có volunteer
  useEffect(() => {
    if (state !== 'finding_volunteer') return;
    const timeout = setTimeout(() => setState('no_volunteer'), 2 * 60 * 1000);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <main style={styles.container}>
      {state === 'info_form' && (
        <InfoForm
          phone={bystanderPhone}
          note={bystanderNote}
          onPhoneChange={setBystanderPhone}
          onNoteChange={setBystanderNote}
          onSubmit={handleFormSubmit}
        />
      )}
      {state === 'loading_gps' && <LoadingGPS />}
      {state === 'finding_volunteer' && <FindingVolunteer elapsed={elapsedTime} />}
      {state === 'volunteer_found' && <VolunteerFound name={volunteerName} />}
      {state === 'no_volunteer' && <NoVolunteer />}
      {state === 'gps_denied' && <GPSDenied onRetry={() => setState('loading_gps')} />}

      {/* Nút 115 cố định ở dưới - luôn hiển thị ở MỌI state */}
      <a href="tel:115" style={styles.emergencyBtn}>
        Gọi 115 ngay
      </a>
    </main>
  );
}

// ==================== COMPONENTS ====================

// ST0 — Form nhập thông tin trước khi báo cấp cứu
function InfoForm({ phone, note, onPhoneChange, onNoteChange, onSubmit }) {
  return (
    <div style={styles.stateContainer}>
      <div style={styles.formHeader}>
        <div style={styles.sosIcon}>🚨</div>
        <h1 style={styles.formTitle}>Báo cấp cứu</h1>
        <p style={styles.formSubtitle}>
          Điền thông tin bên dưới để giúp tình nguyện viên hỗ trợ tốt hơn.
          Cả hai ô đều không bắt buộc.
        </p>
      </div>

      <div style={styles.formBody}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Số điện thoại của bạn</label>
          <input
            type="tel"
            placeholder="Ví dụ: 0901234567"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Mô tả tình huống</label>
          <textarea
            placeholder="Ví dụ: Người bị ngã xe, bất tỉnh..."
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={3}
            style={styles.textarea}
          />
        </div>

        <button onClick={onSubmit} style={styles.reportBtn}>
          Báo cấp cứu
        </button>

        <p style={styles.formNote}>
          Sau khi nhấn, hệ thống sẽ xin phép truy cập vị trí của bạn để
          gửi cảnh báo đến tình nguyện viên gần nhất.
        </p>
      </div>
    </div>
  );
}

// ST1
function LoadingGPS() {
  return (
    <div style={styles.stateContainer}>
      <div style={styles.spinner} />
      <h2 style={styles.title}>Đang xác định vị trí...</h2>
      <p style={styles.subtitle}>Vui lòng cho phép truy cập vị trí khi được hỏi</p>
    </div>
  );
}

// ST2
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

// ST3
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

// ST4
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

// ST5
function GPSDenied({ onRetry }) {
  return (
    <div style={styles.stateContainer}>
      <div style={styles.warningIcon}>📍</div>
      <h2 style={{ ...styles.title, color: '#C00000' }}>Không truy cập được vị trí</h2>
      <p style={styles.subtitle}>Vui lòng cho phép truy cập vị trí và thử lại</p>
      <button onClick={onRetry} style={styles.retryBtn}>
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

  // ST0 Form styles
  formHeader: { textAlign: 'center', marginBottom: '8px' },
  sosIcon: { fontSize: '56px', marginBottom: '8px' },
  formTitle: { fontSize: '26px', fontWeight: 'bold', color: '#D32F2F', margin: '0 0 8px' },
  formSubtitle: { fontSize: '15px', color: '#757575', lineHeight: '1.5', margin: 0 },
  formBody: { width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' },
  label: { fontSize: '14px', fontWeight: '600', color: '#212121' },
  input: {
    height: '48px', padding: '0 14px', fontSize: '16px',
    border: '1.5px solid #E0E0E0', borderRadius: '8px',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  textarea: {
    padding: '12px 14px', fontSize: '16px',
    border: '1.5px solid #E0E0E0', borderRadius: '8px',
    outline: 'none', width: '100%', boxSizing: 'border-box',
    resize: 'none', fontFamily: 'sans-serif',
  },
  reportBtn: {
    height: '56px', backgroundColor: '#D32F2F', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '18px',
    fontWeight: 'bold', cursor: 'pointer', width: '100%',
  },
  formNote: {
    fontSize: '13px', color: '#9E9E9E',
    textAlign: 'center', lineHeight: '1.5', margin: 0,
  },

  // Shared styles
  title: { fontSize: '20px', fontWeight: 'bold', color: '#212121', margin: 0 },
  subtitle: { fontSize: '16px', color: '#757575', margin: 0 },
  spinner: {
    width: '48px', height: '48px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #D32F2F',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  pulseContainer: {
    position: 'relative', width: '100px', height: '100px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute', width: '100px', height: '100px',
    borderRadius: '50%', border: '2px solid #D32F2F',
    animation: 'pulse 2s ease-out infinite',
  },
  crossIcon: { fontSize: '32px', color: '#D32F2F', zIndex: 1 },
  successIcon: { fontSize: '64px' },
  warningIcon: { fontSize: '64px' },
  successBox: {
    backgroundColor: '#E8F5E9', padding: '16px 24px',
    borderRadius: '8px', marginTop: '8px',
  },
  successText: { fontSize: '18px', fontWeight: 'bold', color: '#2E7D32', margin: 0 },
  emergencyBtn: {
    position: 'fixed', bottom: '16px', left: '50%',
    transform: 'translateX(-50%)', width: 'calc(100% - 32px)',
    maxWidth: '448px', backgroundColor: '#D32F2F', color: '#fff',
    padding: '18px', borderRadius: '8px', textAlign: 'center',
    fontSize: '18px', fontWeight: 'bold', textDecoration: 'none', display: 'block',
  },
  retryBtn: {
    backgroundColor: '#D32F2F', color: '#fff', padding: '14px 32px',
    borderRadius: '8px', fontSize: '16px', border: 'none',
    cursor: 'pointer', marginTop: '8px',
  },
};