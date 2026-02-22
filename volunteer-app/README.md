# Volunteer App

Mobile application for Red Cross volunteers to respond to emergency incidents.

## Features

- **Firebase Authentication**: Secure login for volunteers
- **Status Toggle**: Switch between online/offline availability
- **Push Notifications**: Receive alerts for nearby incidents via FCM
- **Incident Management**: View, accept, and respond to emergencies
- **Patient Information**: Access critical medical data when responding
- **Map Integration**: View patient location on interactive map

## Screens

1. **Login Screen**: Firebase email/password authentication
2. **Home Screen**: Status toggle and incident list
3. **Incident Details Screen**: View incident information and accept/decline
4. **Patient Map Screen**: View patient location and medical information

## Setup

```bash
npm install
npm start
```

### Firebase Configuration

1. Create a Firebase project
2. Enable Email/Password authentication
3. Update `src/services/firebaseService.js` with your credentials
4. For Android: Download `google-services.json` and place in root directory

### Push Notifications

The app uses Expo Notifications and Firebase Cloud Messaging:

1. Notifications are registered automatically on app start
2. Volunteers receive notifications when online
3. Tapping a notification opens the incident details

## Volunteer Workflow

1. **Login**: Sign in with volunteer credentials
2. **Go Online**: Toggle status to "Online" to receive incidents
3. **Receive Notification**: Get notified of nearby emergency
4. **View Details**: Review incident information
5. **Accept**: Accept the incident to view patient location
6. **Navigate**: Use the map to reach the patient
7. **Access Info**: View patient's medical information

## Data Access

Volunteers can access:
- Patient location (GPS coordinates)
- Patient medical information (when incident is accepted)
- Incident details and timestamp

All access is logged for security and accountability.
