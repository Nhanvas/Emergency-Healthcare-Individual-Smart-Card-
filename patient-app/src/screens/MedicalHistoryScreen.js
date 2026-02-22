import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MedicalHistoryScreen({ navigation }) {
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    try {
      const medicalHistory = {
        bloodType,
        allergies,
        conditions,
        medications,
        notes,
      };
      await AsyncStorage.setItem('medicalHistory', JSON.stringify(medicalHistory));
      Alert.alert('Success', 'Medical history saved!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save medical history');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Blood Type</Text>
        <TextInput
          style={styles.input}
          value={bloodType}
          onChangeText={setBloodType}
          placeholder="e.g., A+, O-, B+, AB+"
        />

        <Text style={styles.label}>Allergies</Text>
        <TextInput
          style={styles.input}
          value={allergies}
          onChangeText={setAllergies}
          placeholder="List any allergies (e.g., penicillin, peanuts)"
          multiline
        />

        <Text style={styles.label}>Medical Conditions</Text>
        <TextInput
          style={styles.input}
          value={conditions}
          onChangeText={setConditions}
          placeholder="List chronic conditions (e.g., diabetes, asthma)"
          multiline
        />

        <Text style={styles.label}>Current Medications</Text>
        <TextInput
          style={styles.input}
          value={medications}
          onChangeText={setMedications}
          placeholder="List current medications"
          multiline
        />

        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={styles.input}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional medical information"
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Medical History</Text>
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
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    minHeight: 50,
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
