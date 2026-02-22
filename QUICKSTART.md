# Quick Start Guide

This guide will help you get the Emergency Healthcare System up and running quickly.

## Prerequisites Checklist

- [ ] Node.js v16+ installed
- [ ] npm or yarn installed
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] Android Studio (for mobile development)
- [ ] Firebase account created

## Step-by-Step Setup

### 1. Firebase Setup (15 minutes)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project"
   - Name it (e.g., "emergency-healthcare")
   - Disable Google Analytics (optional for development)

2. **Enable Services**
   - **Authentication**: 
     - Go to Authentication → Sign-in method
     - Enable "Email/Password"
   - **Firestore Database**:
     - Go to Firestore Database
     - Click "Create database"
     - Start in test mode
   - **Cloud Messaging**:
     - Already enabled by default

3. **Get Configuration**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Add Web app and Android app
   - Copy configuration objects

4. **Update Config Files**
   ```bash
   # Edit these files with your Firebase credentials:
   patient-app/src/services/firebaseConfig.js
   volunteer-app/src/services/firebaseService.js
   web/lib/firebaseConfig.js
   ```

### 2. Install Dependencies (5 minutes)

```bash
# Patient App
cd patient-app
npm install

# Volunteer App
cd ../volunteer-app
npm install

# Web App
cd ../web
npm install
```

### 3. Running the Apps

#### Option A: All Apps Simultaneously (Recommended for Testing)

```bash
# Terminal 1 - Patient App
cd patient-app
npm start

# Terminal 2 - Volunteer App
cd volunteer-app
npm start

# Terminal 3 - Web App
cd web
npm run dev
```

#### Option B: One at a Time

**Patient App:**
```bash
cd patient-app
npm start
# Press 'a' for Android or scan QR code with Expo Go
```

**Volunteer App:**
```bash
cd volunteer-app
npm start
# Press 'a' for Android or scan QR code with Expo Go
```

**Web App:**
```bash
cd web
npm run dev
# Open http://localhost:3000
```

## Testing the Complete Flow

### Phase 1: Patient Setup
1. Open Patient App
2. Fill in Personal Information
3. Fill in Medical History
4. Generate QR Code (note the patient ID)

### Phase 2: Volunteer Setup
1. Open Volunteer App
2. Create a volunteer account in Firebase Console:
   - Go to Authentication → Users
   - Add user with email/password
3. Login with created credentials
4. Toggle status to "Online"

### Phase 3: Emergency Simulation
1. Get the QR code URL from Patient App (format: `https://emergency-health.app/patient/PAT-xxx`)
2. Replace the domain with `localhost:3000` → `http://localhost:3000/patient/PAT-xxx`
3. Open this URL in a web browser
4. Allow location access
5. Alert will be sent (check console logs)

## Common Issues & Solutions

### Expo App Issues

**Problem**: "Unable to resolve module"
```bash
Solution:
cd patient-app  # or volunteer-app
rm -rf node_modules
npm install
expo start --clear
```

**Problem**: Metro bundler errors
```bash
Solution:
expo start --clear
```

### Web App Issues

**Problem**: Module not found
```bash
Solution:
cd web
rm -rf node_modules .next
npm install
npm run dev
```

**Problem**: API route not working
```bash
Solution: 
Check that Next.js dev server is running
Ensure file is at: pages/api/emergency-alert.js
```

### Firebase Issues

**Problem**: "Firebase not initialized"
```bash
Solution:
1. Check firebaseConfig.js has correct credentials
2. Ensure apiKey is not "YOUR_API_KEY_HERE"
3. Restart the app
```

**Problem**: Authentication errors
```bash
Solution:
1. Verify Email/Password is enabled in Firebase Console
2. Check user exists in Authentication → Users
3. Ensure correct email/password
```

## Next Steps

1. **Add Test Data**: Create test patients and volunteers
2. **Test NFC** (Android only): Use a physical NFC tag
3. **Customize UI**: Modify styles to match your branding
4. **Deploy Web App**: Deploy to Vercel or similar
5. **Build Mobile Apps**: Create APKs for distribution

## Development Tips

- Use Expo Go app for quick testing on physical devices
- Use Chrome DevTools for debugging web app
- Use React Native Debugger for mobile apps
- Check Firebase Console for data and logs
- Use `console.log` liberally for debugging

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Search for the error in Google
3. Check relevant documentation
4. Create an issue in the repository

---

**Ready to go?** Start with Step 1 above! 🚀
