const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { geohashQueryBounds, distanceBetween } = require("geofire-common");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: "asia-southeast1" });

// ==========================================
// 1. createIncident (HTTP)
// ==========================================
exports.createIncident = onRequest(
  {
    cors: true,
    // FIX 3: minInstances: 1 giữ function luôn warm → không bị cold start ~2 phút
    minInstances: 1,
  },
  async (req, res) => {
    try {
      const { patientId, lat, lng, bystanderPhone, bystanderNote } = req.body;

      if (!patientId || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: "Thiếu patientId, lat hoặc lng" });
      }

      const patientDoc = await db.collection("patients").doc(patientId).get();
      if (!patientDoc.exists) {
        return res.status(404).json({ error: "Không tìm thấy patient" });
      }

      const now = admin.firestore.Timestamp.now();
      const expiresAt = admin.firestore.Timestamp.fromMillis(
        now.toMillis() + 2 * 60 * 1000 // 2 phút
      );

      const incidentRef = await db.collection("incidents").add({
        patientId,
        reporterLocation: { lat, lng },
        bystanderPhone: bystanderPhone || null,
        bystanderNote: bystanderNote || null,
        status: "pending",
        acceptedBy: null,
        acceptedAt: null,
        notifiedVolunteers: [],
        createdAt: now,
        expiresAt,
      });

      await findAndNotifyVolunteers(incidentRef.id, { lat, lng });

      return res.status(200).json({ incidentId: incidentRef.id });
    } catch (err) {
      console.error("createIncident error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  }
);

// ==========================================
// 2. findAndNotifyVolunteers (internal)
// ==========================================
async function findAndNotifyVolunteers(incidentId, reporterLocation) {
  const { lat, lng } = reporterLocation;
  const radiusKm = 5;
  const bounds = geohashQueryBounds([lat, lng], radiusKm * 1000);

  let eligibleVolunteers = [];

  for (const b of bounds) {
    const snap = await db
      .collection("volunteers")
      .where("isOnline", "==", true)
      .orderBy("geohash")
      .startAt(b[0])
      .endAt(b[1])
      .get();

    snap.docs.forEach((doc) => {
      const data = doc.data();
      const distance = distanceBetween(
        [data.location.lat, data.location.lng],
        [lat, lng]
      );
      if (distance <= radiusKm) {
        eligibleVolunteers.push({
          id: doc.id,
          fcmToken: data.fcmToken,
          distance: Math.round(distance * 10) / 10,
        });
      }
    });
  }

  if (eligibleVolunteers.length === 0) {
    console.log("Không có volunteer nào trong bán kính 5km");
    return;
  }

  const tokens = eligibleVolunteers.filter((v) => v.fcmToken).map((v) => v.fcmToken);
  const notifiedIds = eligibleVolunteers.map((v) => v.id);

  if (tokens.length > 0) {
    await admin.messaging().sendEachForMulticast({
      tokens,
      data: {
        type: "incident",
        incidentId,
        distance: String(eligibleVolunteers[0]?.distance ?? 0),
      },
      notification: {
        title: "Co su co khan cap gan ban!",
        body: `Cach ban khoang ${eligibleVolunteers[0]?.distance ?? "?"} km`,
      },
      android: {
        priority: "high",
        notification: { channelId: "incident_alerts" },
      },
    });
  }

  await db.collection("incidents").doc(incidentId).update({
    notifiedVolunteers: notifiedIds,
  });
}

// ==========================================
// 3. acceptIncident (HTTP)
// ==========================================
exports.acceptIncident = onRequest(
  {
    cors: true,
    // FIX 3: minInstances: 1 giữ function luôn warm
    minInstances: 1,
  },
  async (req, res) => {
    try {
      const { incidentId, volunteerId } = req.body;

      if (!incidentId || !volunteerId) {
        return res.status(400).json({ error: "Thiếu incidentId hoặc volunteerId" });
      }

      const incidentRef = db.collection("incidents").doc(incidentId);

      const result = await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(incidentRef);
        if (!snap.exists) throw new Error("incident_not_found");

        const data = snap.data();
        if (data.status !== "pending") {
          return { success: false, error: "already_taken" };
        }

        const volunteerDoc = await db.collection("volunteers").doc(volunteerId).get();
        const volunteerName = volunteerDoc.exists
          ? volunteerDoc.data().name
          : "Tình nguyện viên";

        transaction.update(incidentRef, {
          status: "accepted",
          acceptedBy: volunteerId,
          acceptedAt: admin.firestore.Timestamp.now(),
          volunteerName: volunteerName,
        });

        return { success: true, patientId: data.patientId, volunteerName };
      });

      if (!result.success) {
        return res.status(409).json({ error: result.error });
      }

      // FIX 4: Fetch patient data server-side + normalize field names
      // Patient App lưu: fullName, dateOfBirth, phoneNumber, emergencyContact
      // Volunteer App map.tsx đọc: fullName, dateOfBirth, phoneNumber, emergencyContact
      // → field names đã khớp, trả về nguyên raw data
      const patientSnap = await db.collection("patients").doc(result.patientId).get();
      const rawPatient = patientSnap.exists ? patientSnap.data() : null;

      // Normalize để đảm bảo field names nhất quán
      const patientData = rawPatient ? {
        fullName:         rawPatient.fullName || rawPatient.name || "",
        dateOfBirth:      rawPatient.dateOfBirth || rawPatient.dob || "",
        gender:           rawPatient.gender || "",
        phoneNumber:      rawPatient.phoneNumber || rawPatient.phone || "",
        bloodType:        rawPatient.bloodType || "",
        allergies:        rawPatient.allergies || [],
        conditions:       rawPatient.conditions || [],
        medications:      rawPatient.medications || [],
        emergencyContact: rawPatient.emergencyContact || null,
      } : null;

      return res.status(200).json({
        success: true,
        patientId: result.patientId,
        volunteerName: result.volunteerName,
        patientData: patientData,
      });
    } catch (err) {
      console.error("acceptIncident error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  }
);

// ==========================================
// 4. expireIncidents (Scheduled — mỗi 1 phút)
// ==========================================
exports.expireIncidents = onSchedule(
  { schedule: "every 1 minutes", region: "asia-southeast1" },
  async () => {
    const now = admin.firestore.Timestamp.now();
    const snap = await db
      .collection("incidents")
      .where("status", "==", "pending")
      .where("expiresAt", "<=", now)
      .get();

    if (snap.empty) return null;

    const batch = db.batch();
    snap.docs.forEach((doc) => {
      batch.update(doc.ref, { status: "expired" });
    });

    await batch.commit();
    console.log(`Đã expire ${snap.docs.length} incidents`);
    return null;
  }
);
