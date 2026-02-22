# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Emergency Healthcare System                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Patient App │      │Volunteer App │      │   Web App    │
│ (React Native│      │(React Native)│      │  (Next.js)   │
│    Expo)     │      │    Expo)     │      │              │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │                     │                     │
       └─────────────────────┴─────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   Firebase      │
                    │   Backend       │
                    │                 │
                    │ • Firestore     │
                    │ • Auth          │
                    │ • FCM           │
                    │ • Functions     │
                    └─────────────────┘
```

## Data Flow Diagrams

### 1. Patient Registration Flow

```
┌────────┐
│Patient │
└───┬────┘
    │
    │ 1. Opens Patient App
    ├──────────────────────────────┐
    │                              │
    │ 2. Fills Personal Info       │
    │    - Name, Age, Address      │
    │    - Emergency Contact       │
    ├─────────────────────────────►│
    │                              │
    │ 3. Fills Medical History     │
    │    - Blood Type              │
    │    - Allergies               │
    │    - Conditions              │
    ├─────────────────────────────►│
    │                              │
    │ 4. Generates QR Code         │
    │    PatientID: PAT-xxxxx      │
    ◄──────────────────────────────┤
    │                              │
    │ 5. (Optional) Write NFC Tag  │
    │    Saves URL to tag          │
    └─────────────────────────────►│
                                   │
                          ┌────────▼─────────┐
                          │  Local Storage   │
                          │  (AsyncStorage)  │
                          └──────────────────┘
```

### 2. Emergency Alert Flow

```
┌──────────┐    ┌──────────┐    ┌─────────┐    ┌───────────┐    ┌──────────┐
│ Patient  │───▶│Bystander │───▶│Web App  │───▶│ Firebase  │───▶│Volunteer │
│          │    │          │    │         │    │           │    │          │
│QR Code/  │    │Scans QR  │    │Captures │    │Finds      │    │Receives  │
│NFC Tag   │    │Code      │    │GPS      │    │Nearest    │    │Push      │
│          │    │          │    │Location │    │Online Vol.│    │Notification
└──────────┘    └──────────┘    └─────────┘    └───────────┘    └──────────┘
                                      │              │                 │
                                      │              │                 │
                                      │         Creates               │
                                      │         Incident              │
                                      │              │                 │
                                      │         Sends FCM             │
                                      │              │                 │
                                      │              └────────────────►│
                                      │                                │
                                      │              ┌─────────────────┤
                                      │              │                 │
                                      │         Accepts                │
                                      │         Incident               │
                                      │              │                 │
                                      │         Gets Patient           │
                                      │         Info + Location        │
                                      │              │                 │
                                      │              └────────────────►│
                                      │                                │
                                      ▼                                ▼
                                Shows Waiting...                 Views Map +
                                "Volunteer found!"              Medical Info
```

### 3. Volunteer Response Flow

```
┌────────────┐
│ Volunteer  │
└─────┬──────┘
      │
      │ 1. Opens Volunteer App
      ├────────────────────────┐
      │                        │
      │ 2. Login (Firebase)    │
      ├───────────────────────►│
      │                        │
      │ 3. Toggle Online       │
      ├───────────────────────►│
      │                        │
      │                   ┌────▼─────┐
      │                   │ Firebase │
      │                   │ Updates  │
      │                   │ Status   │
      │                   └────┬─────┘
      │                        │
      │ 4. Receives FCM Push   │
      ◄────────────────────────┤
      │   "Emergency nearby!"  │
      │                        │
      │ 5. Views Incident      │
      ├───────────────────────►│
      │                        │
      │ 6. Accepts Incident    │
      ├───────────────────────►│
      │                        │
      │ 7. Gets Patient Info   │
      ◄────────────────────────┤
      │   - Location (GPS)     │
      │   - Medical Data       │
      │                        │
      │ 8. Views on Map        │
      │    Navigate to patient │
      │                        │
      └────────────────────────┘
```

## Component Architecture

### Patient App Components

```
App.js (Navigation Container)
│
├── HomeScreen
│   ├── Navigation buttons
│   └── App branding
│
├── PersonalInfoScreen
│   ├── Form inputs
│   └── AsyncStorage save
│
├── MedicalHistoryScreen
│   ├── Medical form inputs
│   └── AsyncStorage save
│
├── QRCodeScreen
│   ├── PatientID generator
│   └── QRCode component
│
└── NFCWriteScreen
    ├── NFC manager
    └── Write handler (Android)
```

### Volunteer App Components

```
App.js (Navigation Container)
│
├── LoginScreen
│   ├── Firebase Auth
│   └── Form validation
│
├── HomeScreen
│   ├── Status toggle (Online/Offline)
│   ├── Incident list
│   └── Push notification listener
│
├── IncidentDetailsScreen
│   ├── Incident information
│   └── Accept/Decline buttons
│
└── PatientMapScreen
    ├── MapView (Google Maps)
    ├── Patient marker
    └── Medical info display
```

### Web App Pages

```
pages/
│
├── _app.js
│   └── Global layout
│
├── index.js
│   └── Landing page
│
├── patient/[id].js
│   ├── GPS location capture
│   ├── Emergency alert sender
│   ├── Waiting screen
│   └── Status updates
│
└── api/
    └── emergency-alert.js
        ├── Validate request
        ├── Send to Firebase
        └── Return alert ID
```

## Firebase Data Models

### Firestore Collections

```javascript
// patients collection
patients/{patientId}
{
  patientId: "PAT-123456789",
  personalInfo: {
    name: "John Doe",
    age: 35,
    gender: "Male",
    address: "123 Main St",
    phone: "+1-555-0123",
    emergencyContact: "+1-555-0456"
  },
  medicalHistory: {
    bloodType: "O+",
    allergies: ["Penicillin", "Peanuts"],
    conditions: ["Diabetes", "Asthma"],
    medications: ["Insulin", "Albuterol"]
  },
  createdAt: timestamp,
  updatedAt: timestamp
}

// volunteers collection
volunteers/{userId}
{
  userId: "firebase-auth-uid",
  email: "volunteer@redcross.org",
  name: "Jane Smith",
  isOnline: true,
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    lastUpdated: timestamp
  },
  pushToken: "expo-push-token",
  stats: {
    totalIncidents: 25,
    rating: 4.8
  }
}

// incidents collection
incidents/{incidentId}
{
  incidentId: "INCIDENT-timestamp",
  patientId: "PAT-123456789",
  status: "pending|accepted|completed|cancelled",
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10
  },
  volunteerId: "firebase-auth-uid", // when accepted
  createdAt: timestamp,
  acceptedAt: timestamp,
  completedAt: timestamp,
  reportedBy: {
    userAgent: "Mozilla/5.0...",
    ipAddress: "xxx.xxx.xxx.xxx" // for security
  }
}
```

## Technology Stack Detail

### Frontend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Patient App | React Native | 0.72.6 | Mobile framework |
| Patient App | Expo | ~49.0.0 | Development platform |
| Volunteer App | React Native | 0.72.6 | Mobile framework |
| Volunteer App | Expo | ~49.0.0 | Development platform |
| Web App | Next.js | ^14.0.0 | React framework |
| Web App | React | ^18.2.0 | UI library |
| Navigation | React Navigation | ^6.1.7 | App navigation |
| Maps | React Native Maps | 1.7.1 | Map display |
| QR Codes | react-native-qrcode-svg | ^6.2.0 | QR generation |
| NFC | react-native-nfc-manager | ^3.14.0 | NFC tag writing |

### Backend Technologies

| Service | Technology | Purpose |
|---------|-----------|---------|
| Database | Cloud Firestore | NoSQL database |
| Authentication | Firebase Auth | User management |
| Push Notifications | Firebase Cloud Messaging | Real-time alerts |
| Functions | Cloud Functions | Server logic |
| Hosting | Firebase Hosting | Web hosting |

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Data at Rest (Patient App)                         │
│     • Local encryption (AsyncStorage)                   │
│     • No server transmission until emergency            │
│                                                         │
│  2. Authentication (Volunteer App)                      │
│     • Firebase Authentication (Email/Password)          │
│     • JWT tokens for API access                         │
│                                                         │
│  3. Data in Transit                                     │
│     • HTTPS only (TLS 1.2+)                            │
│     • Certificate pinning (production)                  │
│                                                         │
│  4. Authorization (Firebase Rules)                      │
│     • Volunteers can only read accepted incidents       │
│     • Patient data only visible during active incident  │
│                                                         │
│  5. Audit Trail                                         │
│     • All data access logged                            │
│     • IP addresses recorded                             │
│     • Timestamp on all operations                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production Setup                      │
└─────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Patient App │      │Volunteer App │      │   Web App    │
│              │      │              │      │              │
│ Google Play  │      │ Google Play  │      │   Vercel     │
│   Store      │      │   Store      │      │   Hosting    │
│              │      │              │      │              │
│  APK/AAB     │      │  APK/AAB     │      │  Static Gen  │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │                     │                     │
       └─────────────────────┴─────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   Firebase      │
                    │   (Production)  │
                    │                 │
                    │ Paid Plan       │
                    │ Security Rules  │
                    │ Backup Enabled  │
                    │ Monitoring      │
                    └─────────────────┘
```

## Future Enhancements

- Real-time location tracking of volunteers
- Video call integration
- Multi-language support (i18n)
- Offline mode with sync
- Advanced analytics dashboard
- Integration with 911/emergency services
- Wearable device support (smartwatch)
- Automated External Defibrillator (AED) location mapping
