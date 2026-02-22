# Patient App

Mobile application for patients to manage their emergency medical information.

## Features

- **Personal Information**: Store name, age, gender, address, phone, emergency contact
- **Medical History**: Blood type, allergies, medical conditions, current medications
- **QR Code Generation**: Create scannable QR code with unique patient ID
- **NFC Writing**: Write patient ID to NFC tags (Android only)

## Screens

1. **Home Screen**: Navigation hub with buttons to all features
2. **Personal Info Screen**: Form to input personal details
3. **Medical History Screen**: Form to input medical information
4. **QR Code Screen**: Display generated QR code
5. **NFC Write Screen**: Interface to write data to NFC tag

## Setup

```bash
npm install
npm start
```

## NFC Usage

To write to an NFC tag:
1. Ensure NFC is enabled on your Android device
2. Navigate to "Write to NFC Tag" screen
3. Tap the "Write to NFC Tag" button
4. Hold your device near an NFC tag
5. Wait for confirmation

## Data Storage

All patient data is stored locally using AsyncStorage. No data is sent to servers until an emergency occurs (via QR code scan).

## QR Code Format

QR codes contain a URL in the format:
```
https://emergency-health.app/patient/{patientId}
```

When scanned, this URL opens the web app which captures the bystander's location and sends an emergency alert.
