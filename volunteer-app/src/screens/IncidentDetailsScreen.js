import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function IncidentDetailsScreen({ route, navigation }) {
  const { incident } = route.params || {
    incident: {
      id: 'sample-1',
      type: 'Medical Emergency',
      location: 'Sample Location',
      distance: '0.5 km away',
      patientId: 'PAT-123456',
      description: 'Sample incident description',
    },
  };

  const handleAccept = () => {
    // Navigate to patient map with patient details
    navigation.navigate('PatientMap', {
      patientId: incident.patientId,
      location: incident.location,
    });
  };

  const handleDecline = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{incident.type}</Text>
        <Text style={styles.distance}>{incident.distance}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.sectionText}>{incident.location}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient ID</Text>
        <Text style={styles.sectionText}>{incident.patientId}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.sectionText}>
          {incident.description || 'Emergency assistance required'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Reported</Text>
        <Text style={styles.sectionText}>{incident.time || 'Just now'}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptButtonText}>Accept & View Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#e74c3c',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  distance: {
    fontSize: 16,
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    padding: 15,
    marginTop: 20,
  },
  acceptButton: {
    backgroundColor: '#27ae60',
    padding: 18,
    borderRadius: 8,
    elevation: 3,
    marginBottom: 10,
  },
  acceptButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  declineButton: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  declineButtonText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
