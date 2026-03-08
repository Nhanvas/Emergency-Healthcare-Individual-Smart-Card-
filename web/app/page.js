export default function Home() {
  return (
    <main style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', fontFamily: 'sans-serif',
      backgroundColor: '#fff', padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🚑</div>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#212121', marginBottom: 8 }}>
        Hệ thống hỗ trợ khẩn cấp
      </h1>
      <p style={{ fontSize: 16, color: '#757575' }}>
        Vui lòng quét mã QR trên thẻ bệnh nhân để tiếp tục.
      </p>
    </main>
  );
}