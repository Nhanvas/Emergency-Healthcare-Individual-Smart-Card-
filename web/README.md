# Web App

Next.js web application for emergency response accessed via QR code scanning.

## Features

- **Dynamic Patient Pages**: `/patient/[id]` routes for each patient
- **GPS Location Capture**: Automatic one-time location capture
- **Emergency Alert API**: Send alerts to Firebase backend
- **Responsive Design**: Mobile-optimized interface
- **Real-time Updates**: Show status as volunteer is matched

## Pages

1. **Home** (`/`): Landing page with system overview
2. **Patient Emergency** (`/patient/[id]`): Emergency alert page triggered by QR scan

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Emergency Flow

When a bystander scans a patient's QR code:

1. Web app opens at `/patient/{patientId}`
2. Browser requests location permission
3. GPS coordinates are captured
4. Emergency alert is sent to Firebase via API route
5. Waiting screen shows while system finds volunteer
6. Confirmation shown when volunteer accepts

## API Routes

### POST `/api/emergency-alert`

Send emergency alert with patient and location data.

**Request Body:**
```json
{
  "patientId": "PAT-123456789",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "accuracy": 10
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Emergency alert sent successfully",
  "alertId": "ALERT-1234567890"
}
```

## Firebase Integration

Update `lib/firebaseConfig.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

## Building for Production

```bash
npm run build
npm start
```

## Deployment

Deploy to Vercel (recommended for Next.js):

```bash
npm install -g vercel
vercel
```

Or deploy to any Node.js hosting platform.

## Security Considerations

- Always use HTTPS in production
- Implement rate limiting on API routes
- Validate all user input
- Secure Firebase rules for data access
- Comply with medical data regulations
