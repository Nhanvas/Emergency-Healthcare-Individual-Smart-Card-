import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function PatientPage() {
  const router = useRouter();
  const { id } = router.query;
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('locating');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      getLocationAndSendAlert();
    }
  }, [id]);

  const getLocationAndSendAlert = async () => {
    try {
      // Get one-time location
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          
          setLocation(coords);
          setStatus('sending');

          // Send alert to Firebase
          await sendEmergencyAlert(id, coords);
          
          setStatus('waiting');
        },
        (error) => {
          console.error('Location error:', error);
          setError('Unable to get your location. Please enable location services.');
          setStatus('error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const sendEmergencyAlert = async (patientId, coordinates) => {
    try {
      // TODO: Send to Firebase Cloud Functions
      const response = await fetch('/api/emergency-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          location: coordinates,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emergency alert');
      }

      console.log('Emergency alert sent successfully');
    } catch (error) {
      console.error('Error sending alert:', error);
      throw error;
    }
  };

  return (
    <>
      <Head>
        <title>Emergency Alert - Patient {id}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={styles.main}>
        <div style={styles.container}>
          {status === 'locating' && (
            <>
              <div style={styles.spinner}></div>
              <h1 style={styles.title}>📍 Getting your location...</h1>
              <p style={styles.text}>Please allow location access</p>
            </>
          )}

          {status === 'sending' && (
            <>
              <div style={styles.spinner}></div>
              <h1 style={styles.title}>📤 Sending emergency alert...</h1>
              <p style={styles.text}>Patient ID: {id}</p>
            </>
          )}

          {status === 'waiting' && (
            <>
              <div style={styles.checkmark}>✓</div>
              <h1 style={styles.title}>🚑 Emergency Alert Sent!</h1>
              <p style={styles.text}>
                Finding the nearest available Red Cross volunteer...
              </p>
              <div style={styles.infoBox}>
                <p><strong>Patient ID:</strong> {id}</p>
                {location && (
                  <>
                    <p><strong>Location:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                    <p><strong>Accuracy:</strong> ±{Math.round(location.accuracy)}m</p>
                  </>
                )}
              </div>
              <p style={styles.waitText}>
                A volunteer will be notified shortly. Please stay calm and stay where you are.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={styles.errorIcon}>⚠️</div>
              <h1 style={styles.title}>Error</h1>
              <p style={styles.errorText}>{error}</p>
              <button 
                style={styles.retryButton}
                onClick={() => {
                  setStatus('locating');
                  setError(null);
                  getLocationAndSendAlert();
                }}
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </main>
    </>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: '2rem',
  },
  container: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '3rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '1rem',
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #e74c3c',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 2rem',
  },
  checkmark: {
    fontSize: '80px',
    color: '#27ae60',
    marginBottom: '1rem',
  },
  errorIcon: {
    fontSize: '80px',
    marginBottom: '1rem',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
    marginTop: '2rem',
    textAlign: 'left',
  },
  waitText: {
    fontSize: '1rem',
    color: '#666',
    marginTop: '2rem',
    lineHeight: '1.6',
  },
  errorText: {
    fontSize: '1.1rem',
    color: '#e74c3c',
    marginBottom: '2rem',
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    fontSize: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
};
