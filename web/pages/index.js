import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Emergency Healthcare System</title>
        <meta name="description" content="Emergency healthcare response system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.title}>🚑 Emergency Healthcare System</h1>
          <p style={styles.description}>
            Quick access to emergency medical information
          </p>

          <div style={styles.grid}>
            <div style={styles.card}>
              <h2>For Patients</h2>
              <p>Use the Patient App to store your medical information and generate QR codes</p>
            </div>

            <div style={styles.card}>
              <h2>For Volunteers</h2>
              <p>Use the Volunteer App to respond to emergency incidents in your area</p>
            </div>

            <div style={styles.card}>
              <h2>For Bystanders</h2>
              <p>Scan a patient's QR code to send emergency alert</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    padding: '4rem 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  container: {
    maxWidth: '1200px',
    padding: '0 2rem',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1.5rem',
    textAlign: 'center',
    color: '#666',
    marginBottom: '3rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
};
