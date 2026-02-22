# Emergency Healthcare Individual Smart Card System

A comprehensive emergency response system built as a monorepo with three interconnected applications: a patient mobile app, a volunteer mobile app, and a web platform for bystanders.

## 🏗️ Architecture Overview

This system enables quick emergency medical response through:

1. **Patient App** - Allows patients to store emergency medical info and generate QR codes
2. **Volunteer App** - Enables Red Cross volunteers to receive and respond to emergency incidents
3. **Web App** - Allows bystanders to scan QR codes and trigger emergency alerts

### Technology Stack

- **Mobile Apps**: React Native with Expo (Android-focused)
- **Web App**: Next.js (React framework)
- **Backend**: Firebase (Firestore, Authentication, Cloud Messaging, Cloud Functions)
- **Location Services**: Expo Location & React Native Maps
- **NFC**: react-native-nfc-manager (Android only)

## 📁 Project Structure

```
.
├── patient-app/          # React Native mobile app for patients
│   ├── src/
│   │   ├── screens/      # App screens (Home, PersonalInfo, MedicalHistory, QRCode, NFCWrite)
│   │   ├── components/   # Reusable components
│   │   └── services/     # Firebase and other services
│   ├── App.js           # Main app with navigation
│   ├── app.json         # Expo configuration
│   └── package.json
│
├── volunteer-app/        # React Native mobile app for volunteers
│   ├── src/
│   │   ├── screens/      # App screens (Login, Home, IncidentDetails, PatientMap)
│   │   ├── components/   # Reusable components
│   │   └── services/     # Firebase, notifications, etc.
│   ├── App.js           # Main app with navigation
│   ├── app.json         # Expo configuration
│   └── package.json
│
├── web/                  # Next.js web application
│   ├── pages/           # Next.js pages
│   │   ├── index.js     # Home page
│   │   ├── patient/[id].js  # Dynamic patient emergency page
│   │   └── api/         # API routes
│   ├── lib/             # Utilities and configs
│   ├── components/      # React components
│   └── package.json
│
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Android Studio (for Android development)
- Firebase account (for backend services)

### Setting Up Firebase

1. Create a new Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)

2. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Firestore Database**
   - **Cloud Messaging**
   - **Cloud Functions** (for matching volunteers to incidents)

3. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Create web app and Android apps
   - Copy the configuration objects

4. Update Firebase config files with your credentials:
   - `patient-app/src/services/firebaseConfig.js`
   - `volunteer-app/src/services/firebaseService.js`
   - `web/lib/firebaseConfig.js`

### Installation & Running

#### Patient App

```bash
cd patient-app
npm install
npm start
# Then press 'a' for Android or scan QR code with Expo Go app
```

**Features:**
- Fill in personal information (name, age, gender, address, emergency contact)
- Add medical history (blood type, allergies, conditions, medications)
- Generate QR code with unique patient ID
- Write patient ID to NFC tag (Android only)

#### Volunteer App

```bash
cd volunteer-app
npm install
npm start
# Then press 'a' for Android or scan QR code with Expo Go app
```

**Features:**
- Firebase Authentication login
- Toggle online/offline availability status
- Receive push notifications for nearby incidents
- View incident details
- Accept incidents and view patient location on map
- Access patient medical information

#### Web App

```bash
cd web
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

**Features:**
- QR code landing page at `/patient/[id]`
- Automatic GPS location capture
- Send emergency alert to Firebase
- Waiting screen for volunteer assignment
- Responsive design for mobile browsers

## 🔄 System Flow

1. **Patient Setup**:
   - Patient installs Patient App
   - Fills in personal and medical information
   - Generates QR code or writes to NFC tag

2. **Emergency Situation**:
   - Bystander scans patient's QR code with phone camera
   - Web app opens automatically
   - Web app captures bystander's GPS location
   - Emergency alert sent to Firebase

3. **Volunteer Response**:
   - Firebase Cloud Function finds nearest online volunteer
   - Push notification sent to volunteer's device
   - Volunteer accepts incident
   - Volunteer views patient location and medical info
   - Volunteer navigates to patient

## 📱 Key Features by App

### Patient App

- ✅ Personal information management
- ✅ Medical history storage
- ✅ QR code generation (links to web app)
- ✅ NFC tag writing (Android only)
- ✅ Offline data storage (AsyncStorage)

### Volunteer App

- ✅ Firebase Authentication
- ✅ Online/Offline status toggle
- ✅ Push notification integration
- ✅ Incident management
- ✅ Patient location mapping
- ✅ Medical information display

### Web App

- ✅ QR code landing pages
- ✅ GPS location capture
- ✅ Emergency alert API
- ✅ Waiting/confirmation screens
- ✅ Responsive mobile design

## 🔐 Security & Privacy

- Patient data stored locally on device (Patient App)
- Firebase Authentication for volunteer access
- HTTPS-only web connections
- Location data captured only during emergencies
- Medical information only accessible to responding volunteers

## 🛠️ Development Notes

### Firebase Cloud Functions (To Be Implemented)

You'll need to create Firebase Cloud Functions to:

1. **Match volunteers to incidents**:
   - Find nearest online volunteer based on GPS
   - Send push notification to volunteer
   - Update incident status in Firestore

2. **Manage patient data**:
   - Store patient information securely
   - Retrieve patient info when volunteer accepts incident

3. **Handle volunteer status**:
   - Track online/offline status
   - Monitor location updates

Example Cloud Function structure:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.handleEmergencyAlert = functions.https.onCall(async (data, context) => {
  // Find nearest online volunteer
  // Send push notification
  // Create incident in Firestore
  // Return incident ID
});
```

### Firestore Data Structure

```
patients/
  {patientId}/
    - personalInfo: {}
    - medicalHistory: {}
    - createdAt: timestamp

volunteers/
  {userId}/
    - email: string
    - isOnline: boolean
    - location: geopoint
    - pushToken: string
    - lastSeen: timestamp

incidents/
  {incidentId}/
    - patientId: string
    - location: geopoint
    - status: string (pending/accepted/completed)
    - volunteerId: string (when accepted)
    - createdAt: timestamp
```

## 📦 Dependencies

### Patient App
- expo, react-native
- @react-navigation/native, @react-navigation/stack
- react-native-qrcode-svg
- react-native-nfc-manager
- @react-native-async-storage/async-storage
- expo-location

### Volunteer App
- expo, react-native
- @react-navigation/native, @react-navigation/stack
- react-native-maps
- firebase (Authentication, Firestore)
- expo-notifications (FCM)
- expo-location

### Web App
- next, react, react-dom
- firebase (Firestore, Cloud Functions)

## 🚧 Future Enhancements

- [ ] Real-time volunteer tracking
- [ ] Multi-language support
- [ ] Offline mode with sync
- [ ] Advanced matching algorithm (consider traffic, volunteer rating)
- [ ] Incident history and analytics
- [ ] Video call capability between volunteer and patient
- [ ] Integration with emergency services (911)
- [ ] iOS support

## 📄 License

This project is created for educational and humanitarian purposes.

## 🤝 Contributing

This is a foundation project. To contribute:

1. Set up Firebase backend
2. Implement Cloud Functions
3. Test end-to-end flow
4. Add error handling and edge cases
5. Implement production security measures

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Note**: This is a foundation/starter project. Before deploying to production:
- Replace all placeholder Firebase credentials
- Implement proper authentication and authorization
- Add comprehensive error handling
- Test on real devices
- Comply with medical data privacy regulations (HIPAA, GDPR, etc.)
- Get proper medical certifications and legal approvals