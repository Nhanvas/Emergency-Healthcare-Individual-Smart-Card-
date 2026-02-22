import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NFCWriteScreen() {
  const [isWriting, setIsWriting] = useState(false);

  const writeNFC = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Supported', 'NFC writing is only supported on Android devices');
      return;
    }

    try {
      // Get patient ID
      const patientId = await AsyncStorage.getItem('patientId');
      if (!patientId) {
        Alert.alert('Error', 'Please generate a QR code first to create your patient ID');
        return;
      }

      // Initialize NFC
      await NfcManager.start();
      setIsWriting(true);

      Alert.alert(
        'Ready to Write',
        'Hold your phone near an NFC tag to write your patient ID',
        [
          {
            text: 'Cancel',
            onPress: () => {
              setIsWriting(false);
              NfcManager.cancelTechnologyRequest();
            },
          },
        ]
      );

      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Create NDEF message with web URL
      const webUrl = `https://emergency-health.app/patient/${patientId}`;
      const bytes = Ndef.encodeMessage([Ndef.uriRecord(webUrl)]);

      // Write to tag
      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      Alert.alert('Success', 'Patient ID written to NFC tag successfully!');
    } catch (error) {
      console.warn('NFC Error:', error);
      Alert.alert('Error', 'Failed to write to NFC tag. Make sure NFC is enabled.');
    } finally {
      setIsWriting(false);
      NfcManager.cancelTechnologyRequest();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Write to NFC Tag</Text>
      <Text style={styles.subtitle}>
        Store your emergency medical ID on an NFC tag for quick access
      </Text>

      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📱</Text>
      </View>

      <Text style={styles.instructions}>
        1. Make sure NFC is enabled on your device{'\n'}
        2. Tap the button below{'\n'}
        3. Hold your phone near an NFC tag{'\n'}
        4. Wait for confirmation
      </Text>

      <TouchableOpacity
        style={[styles.button, isWriting && styles.buttonDisabled]}
        onPress={writeNFC}
        disabled={isWriting}
      >
        <Text style={styles.buttonText}>
          {isWriting ? 'Waiting for NFC tag...' : 'Write to NFC Tag'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: NFC writing is only available on Android devices
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
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
  iconContainer: {
    marginVertical: 30,
  },
  icon: {
    fontSize: 80,
  },
  instructions: {
    fontSize: 16,
    color: '#333',
    lineHeight: 28,
    marginBottom: 30,
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
