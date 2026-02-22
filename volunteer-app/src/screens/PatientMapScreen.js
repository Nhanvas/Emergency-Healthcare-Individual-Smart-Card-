import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function PatientMapScreen({ route }) {
  const { patientId, location } = route.params || {
    patientId: 'PAT-123456',
    location: 'Sample Location',
  };

  const [patientData, setPatientData] = useState({
    name: 'Loading...',
    bloodType: 'N/A',
    allergies: 'N/A',
    conditions: 'N/A',
    emergencyContact: 'N/A',
  });

  const [patientLocation, setPatientLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  useEffect(() => {
    // TODO: Fetch patient data from Firebase
    // For now, using placeholder data
    setPatientData({
      name: 'John Doe',
      bloodType: 'O+',
      allergies: 'Penicillin',
      conditions: 'Diabetes',
      emergencyContact: '+1-555-0123',
    });
  }, [patientId]);

  const handleCallEmergencyContact = () => {
    Alert.alert('Call', `Calling ${patientData.emergencyContact}`);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: patientLocation.latitude,
          longitude: patientLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={patientLocation}
          title="Patient Location"
          description={location}
          pinColor="#e74c3c"
        />
      </MapView>

      <ScrollView style={styles.infoContainer}>
        <Text style={styles.headerTitle}>Patient Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{patientData.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Blood Type:</Text>
          <Text style={styles.infoValue}>{patientData.bloodType}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Allergies:</Text>
          <Text style={styles.infoValue}>{patientData.allergies}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Conditions:</Text>
          <Text style={styles.infoValue}>{patientData.conditions}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Emergency Contact:</Text>
          <Text style={styles.infoValue}>{patientData.emergencyContact}</Text>
        </View>

        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCallEmergencyContact}
        >
          <Text style={styles.callButtonText}>📞 Call Emergency Contact</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    height: 300,
  },
  infoContainer: {
    flex: 1,
    padding: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#27ae60',
    padding: 18,
    borderRadius: 8,
    marginTop: 20,
    elevation: 3,
  },
  callButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
