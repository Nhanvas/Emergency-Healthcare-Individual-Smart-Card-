'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebase';

const TIMEOUT_MS = 2 * 60 * 1000;
const CLOUD_FN_URL =
  'https://asia-southeast1-emergency-qr-medical.cloudfunctions.net/createIncident';

const GLOBAL_STYLE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #fff; font-family: system-ui, -apple-system, sans-serif; }
  input, textarea, button { font-family: inherit; }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

const YELLOW = '#FFD93D';
const GREEN  = '#4CAF50';
const RED    = '#E53935';

/* ── Shared sub-components ─────────────────────────────────── */

function Header() {
  return (
    <div style={{
      backgroundColor: YELLOW,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      padding: '32px 24px 20px',
      textAlign: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 20, fontWeight: 'bold', color: '#212121' }}>
        Báo cấp cứu
      </span>
    </div>
  );
}

function Btn115({ isRed = false }) {
  return (
    <a
      href="tel:115"
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: 432,
        height: 52,
        borderRadius: 8,
        backgroundColor: isRed ? RED : GREEN,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        fontSize: 16,
        fontWeight: 'bold',
        textDecoration: 'none',
        boxShadow: isRed
          ? '0 4px 16px rgba(229,57,53,0.35)'
          : '0 4px 16px rgba(76,175,80,0.35)',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
          fill="white"
        />
      </svg>
      Gọi 115
    </a>
  );
}

function GraySpinner({ size = 48 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: '4px solid #E0E0E0',
      borderTop: '4px solid #9E9E9E',
      animation: 'spin 0.9s linear infinite',
      margin: '0 auto',
    }} />
  );
}

function TriangleIcon({ isRed = true }) {
  const stroke = isRed ? RED      : '#9E9E9E';
  const fill   = isRed ? '#FFEBEE' : '#F5F5F5';
  const accent = isRed ? RED      : '#9E9E9E';
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
      <path
        d="M50 8L6 82h88L50 8z"
        fill={fill}
        stroke={stroke}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect x="46" y="36" width="8" height="22" rx="4" fill={accent} />
      <rect x="46" y="64" width="8" height="8"  rx="4" fill={accent} />
    </svg>
  );
}

/* ── State screens ──────────────────────────────────────────── */

function ST0({ phone, note, onPhone, onNote, onSubmit }) {
  return (
    <div style={{ padding: '32px 24px', paddingBottom: 100 }}>
      <label style={labelStyle}>Số điện thoại của bạn</label>
      <input
        type="tel"
        value={phone}
        onChange={e => onPhone(e.target.value)}
        style={inputStyle}
      />

      <label style={{ ...labelStyle, marginTop: 20 }}>Mô tả tình huống</label>
      <textarea
        value={note}
        onChange={e => onNote(e.target.value)}
        rows={4}
        style={textareaStyle}
      />

      <button onClick={onSubmit} style={reportBtnStyle}>
        BÁO CẤP CỨU
      </button>
    </div>
  );
}

function ST1() {
  return (
    <div style={center}>
      <GraySpinner size={48} />
      <p style={bigTitle}>Đang xác định vị trí ...</p>
      <p style={subText}>Xin vui lòng cho phép truy cập vị trí khi được hỏi</p>
    </div>
  );
}

function ST2({ elapsed }) {
  const fmt = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return (
    <div style={center}>
      <GraySpinner size={48} />
      <p style={bigTitle}>Đang tìm tình nguyện viên ...</p>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: '10px 20px',
      }}>
        <span style={{ fontSize: 14, color: '#757575' }}>Thời gian chờ:</span>
        <span style={{ fontSize: 16, fontWeight: 'bold', color: '#212121' }}>
          {fmt(elapsed)}
        </span>
      </div>

      <p style={subText}>
        Yêu cầu đã được gửi đến các tình nguyện viên gần đây
      </p>
    </div>
  );
}

function ST3({ volunteerName }) {
  return (
    <div style={{ ...center, paddingTop: 40 }}>
      <img
        src="/success-hands.png"
        alt="success"
        style={{ width: 200, height: 200, objectFit: 'contain' }}
      />
      <p style={{ ...bigTitle, marginTop: 0 }}>Đã tìm thấy tình nguyện viên</p>
      <p style={{ ...subText, marginTop: 0 }}>
        {volunteerName} đang trên đường đến
      </p>
      <button style={{
        width: '100%',
        height: 52,
        backgroundColor: '#fff',
        border: '1.5px solid #212121',
        borderRadius: 8,
        fontSize: 16,
        color: '#212121',
        fontWeight: 500,
        cursor: 'default',
      }}>
        Bạn có thể rời đi
      </button>
    </div>
  );
}

function ST4() {
  return (
    <div style={center}>
      <TriangleIcon isRed={true} />
      <p style={{ ...bigTitle, textAlign: 'center' }}>
        Không tìm thấy tình nguyện viên
      </p>
      <p style={subText}>Hiện không có tình nguyện viên nào trong khu vực</p>
      <p style={subText}>Vui lòng gọi 115 ngay bên dưới</p>
    </div>
  );
}

function ST5({ onRetry }) {
  return (
    <div style={center}>
      <TriangleIcon isRed={false} />
      <p style={bigTitle}>Không truy cập được vị trí</p>
      <p style={subText}>Xin vui lòng cho phép truy cập vị trí khi được hỏi</p>
      <button
        onClick={onRetry}
        style={{
          width: '100%',
          height: 52,
          backgroundColor: '#fff',
          border: '1.5px solid #9E9E9E',
          borderRadius: 8,
          fontSize: 16,
          color: '#212121',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Thử lại
      </button>
    </div>
  );
}

/* ── Style constants ────────────────────────────────────────── */

const labelStyle = {
  display: 'block',
  fontSize: 14,
  color: '#212121',
  fontWeight: 500,
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  height: 52,
  padding: '0 14px',
  fontSize: 16,
  border: '1.5px solid #E0E0E0',
  borderRadius: 8,
  outline: 'none',
  color: '#212121',
  backgroundColor: '#fff',
};

const textareaStyle = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 16,
  border: '1.5px solid #E0E0E0',
  borderRadius: 8,
  outline: 'none',
  resize: 'none',
  color: '#212121',
  backgroundColor: '#fff',
};

const reportBtnStyle = {
  width: '100%',
  height: 52,
  backgroundColor: RED,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 'bold',
  letterSpacing: 1,
  cursor: 'pointer',
  marginTop: 24,
};

/** Centered column used by ST1, ST2, ST4, ST5 */
const center = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '60px 24px',
  paddingBottom: 100,
  gap: 16,
  textAlign: 'center',
};

const bigTitle = {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#212121',
  margin: 0,
};

const subText = {
  fontSize: 14,
  color: '#757575',
  margin: 0,
  lineHeight: 1.6,
};

/* ── Main component ─────────────────────────────────────────── */

export default function PatientPage({ params }) {
  const { patientId } = params;

  const [state,         setState]         = useState('loading');
  const [phone,         setPhone]         = useState('');
  const [note,          setNote]          = useState('');
  const [incidentId,    setIncidentId]    = useState(null);
  const [volunteerName, setVolunteerName] = useState('Tình nguyện viên');
  const [elapsed,       setElapsed]       = useState(0);

  const timerRef   = useRef(null);
  const timeoutRef = useRef(null);

  /* loading → st0 after 1.5 s */
  useEffect(() => {
    const t = setTimeout(() => setState('st0'), 1500);
    return () => clearTimeout(t);
  }, []);

  /* ST2 count-up timer */
  useEffect(() => {
    if (state === 'st2') {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [state]);

  /* ST2 → ST4 after 2 min */
  useEffect(() => {
    if (state === 'st2') {
      timeoutRef.current = setTimeout(() => setState('st4'), TIMEOUT_MS);
    } else {
      clearTimeout(timeoutRef.current);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [state]);

  /* Firestore realtime listener */
  useEffect(() => {
    if (!incidentId) return;
    const unsub = onSnapshot(doc(db, 'incidents', incidentId), (snap) => {
      if (!snap.exists()) return;
      const { status, volunteerName: vn } = snap.data();
      if (status === 'accepted') {
        setVolunteerName(vn || 'Tình nguyện viên');
        setState('st3');
      } else if (status === 'expired') {
        setState('st4');
      }
    });
    return unsub;
  }, [incidentId]);

  /* Geolocation + createIncident */
  const requestLocationAndCreate = useCallback(() => {
    setState('st1');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(CLOUD_FN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patientId,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              bystanderPhone: phone || null,
              bystanderNote:  note  || null,
            }),
          });
          const data = await res.json();
          if (data.incidentId) {
            setIncidentId(data.incidentId);
            setState('st2');
          } else {
            setState('st4');
          }
        } catch {
          setState('st4');
        }
      },
      () => setState('st5'),
      { timeout: 10000 }
    );
  }, [patientId, phone, note]);

  /* ── Loading screen (full yellow, no header/115) ── */
  if (state === 'loading') {
    return (
      <>
        <style>{GLOBAL_STYLE}</style>
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: YELLOW,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src="/bystander-logo.png"
            alt="EHIS Card"
            style={{ width: 160, height: 160, objectFit: 'contain' }}
          />
          <p style={{
            color: '#fff',
            fontSize: 28,
            fontWeight: 'bold',
            letterSpacing: 6,
            marginTop: 16,
          }}>
            EHIS CARD
          </p>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #fff',
            animation: 'spin 0.9s linear infinite',
            marginTop: 40,
          }} />
        </div>
      </>
    );
  }

  /* ── Normal layout ST0 – ST5 ── */
  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Header />

        <div style={{ flex: 1 }}>
          {state === 'st0' && (
            <ST0
              phone={phone}
              note={note}
              onPhone={setPhone}
              onNote={setNote}
              onSubmit={requestLocationAndCreate}
            />
          )}
          {state === 'st1' && <ST1 />}
          {state === 'st2' && <ST2 elapsed={elapsed} />}
          {state === 'st3' && <ST3 volunteerName={volunteerName} />}
          {state === 'st4' && <ST4 />}
          {state === 'st5' && <ST5 onRetry={requestLocationAndCreate} />}
        </div>

        <Btn115 isRed={state === 'st4'} />
      </div>
    </>
  );
}