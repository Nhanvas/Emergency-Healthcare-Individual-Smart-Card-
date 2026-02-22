import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import PersonalInfoScreen from './src/screens/PersonalInfoScreen';
import MedicalHistoryScreen from './src/screens/MedicalHistoryScreen';
import QRCodeScreen from './src/screens/QRCodeScreen';
import NFCWriteScreen from './src/screens/NFCWriteScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Patient App' }}
        />
        <Stack.Screen 
          name="PersonalInfo" 
          component={PersonalInfoScreen}
          options={{ title: 'Personal Information' }}
        />
        <Stack.Screen 
          name="MedicalHistory" 
          component={MedicalHistoryScreen}
          options={{ title: 'Medical History' }}
        />
        <Stack.Screen 
          name="QRCode" 
          component={QRCodeScreen}
          options={{ title: 'Your QR Code' }}
        />
        <Stack.Screen 
          name="NFCWrite" 
          component={NFCWriteScreen}
          options={{ title: 'Write to NFC Tag' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
