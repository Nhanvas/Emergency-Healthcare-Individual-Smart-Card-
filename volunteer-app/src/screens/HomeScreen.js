import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotifications } from '../services/notificationService';

export default function HomeScreen({ navigation }) {
  const [isOnline, setIsOnline] = useState(false);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    loadOnlineStatus();
    registerForPushNotifications();
  }, []);

  const loadOnlineStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('volunteerOnlineStatus');
      setIsOnline(status === 'true');
    } catch (error) {
      console.error('Error loading status:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      await AsyncStorage.setItem('volunteerOnlineStatus', String(newStatus));
      // TODO: Update status in Firebase
      Alert.alert(
        'Status Updated',
        `You are now ${newStatus ? 'ONLINE' : 'OFFLINE'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderIncident = ({ item }) => (
    <TouchableOpacity
      style={styles.incidentCard}
      onPress={() => navigation.navigate('IncidentDetails', { incident: item })}
    >
      <View style={styles.incidentHeader}>
        <Text style={styles.incidentTitle}>{item.type}</Text>
        <Text style={styles.incidentTime}>{item.time}</Text>
      </View>
      <Text style={styles.incidentLocation}>{item.location}</Text>
      <Text style={styles.incidentDistance}>{item.distance}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Your Status</Text>
        <TouchableOpacity
          style={[
            styles.statusButton,
            isOnline ? styles.statusOnline : styles.statusOffline,
          ]}
          onPress={toggleOnlineStatus}
        >
          <Text style={styles.statusButtonText}>
            {isOnline ? '🟢 ONLINE' : '⚫ OFFLINE'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.statusDescription}>
          {isOnline
            ? 'You will receive incident notifications'
            : 'Toggle online to receive incidents'}
        </Text>
      </View>

      <View style={styles.incidentsContainer}>
        <Text style={styles.sectionTitle}>Nearby Incidents</Text>
        {incidents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {isOnline
                ? 'No incidents nearby. You\'ll be notified when one occurs.'
                : 'Go online to see nearby incidents'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={incidents}
            renderItem={renderIncident}
            keyExtractor={item => item.id}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 150,
  },
  statusOnline: {
    backgroundColor: '#27ae60',
  },
  statusOffline: {
    backgroundColor: '#95a5a6',
  },
  statusButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusDescription: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  incidentsContainer: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  incidentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  incidentTime: {
    fontSize: 14,
    color: '#666',
  },
  incidentLocation: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  incidentDistance: {
    fontSize: 12,
    color: '#3498db',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
