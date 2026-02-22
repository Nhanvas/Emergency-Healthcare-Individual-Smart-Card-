import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QRCodeScreen() {
  const [patientId, setPatientId] = useState('');
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    loadOrGeneratePatientId();
  }, []);

  const loadOrGeneratePatientId = async () => {
    try {
      let id = await AsyncStorage.getItem('patientId');
      if (!id) {
        // Generate a unique patient ID
        id = 'PAT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        await AsyncStorage.setItem('patientId', id);
      }
      setPatientId(id);
      // QR code links to web app with patient ID
      const webUrl = `https://emergency-health.app/patient/${id}`;
      setQrValue(webUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate QR code');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Emergency QR Code</Text>
      <Text style={styles.subtitle}>
        Scan this QR code in case of emergency
      </Text>

      {qrValue ? (
        <View style={styles.qrContainer}>
          <QRCode
            value={qrValue}
            size={250}
            backgroundColor="white"
          />
        </View>
      ) : (
        <Text>Generating QR code...</Text>
      )}

      <Text style={styles.patientId}>Patient ID: {patientId}</Text>
      <Text style={styles.instructions}>
        Show this QR code to emergency responders or store it on an NFC tag for quick access.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
    textAlign: 'center',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  patientId: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    color: '#333',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
