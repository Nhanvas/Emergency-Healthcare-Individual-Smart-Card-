import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import IncidentDetailsScreen from './src/screens/IncidentDetailsScreen';
import PatientMapScreen from './src/screens/PatientMapScreen';
import { initializeFirebase } from './src/services/firebaseService';

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    initializeFirebase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isLoggedIn ? (
          <Stack.Screen 
            name="Login" 
            options={{ headerShown: false }}
          >
            {props => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'Volunteer Dashboard' }}
            />
            <Stack.Screen 
              name="IncidentDetails" 
              component={IncidentDetailsScreen}
              options={{ title: 'Incident Details' }}
            />
            <Stack.Screen 
              name="PatientMap" 
              component={PatientMapScreen}
              options={{ title: 'Patient Location' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
