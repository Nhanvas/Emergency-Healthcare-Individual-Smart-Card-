const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { geohashQueryBounds, distanceBetween } = require("geofire-common");

admin.initializeApp();
const db = admin.firestore();

// ==========================================
// 1. createIncident (HTTP)
// POST { patientId, lat, lng }
// ==========================================
exports.createIncident = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).send("");

    try {
      const { patientId, lat, lng } = req.body;

      // Validate input
      if (!patientId || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: "Thiếu patientId, lat hoặc lng" });
      }

      // Kiểm tra patient tồn tại
      const patientDoc = await db.collection("patients").doc(patientId).get();
      if (!patientDoc.exists) {
        return res.status(404).json({ error: "Không tìm thấy patient" });
      }

      // Tạo incident mới
      const now = admin.firestore.Timestamp.now();
      const expiresAt = admin.firestore.Timestamp.fromMillis(
        now.toMillis() + 10 * 60 * 1000 // +10 phút
      );

      const incidentRef = await db.collection("incidents").add({
        patientId,
        reporterLocation: { lat, lng },
        status: "pending",
        acceptedBy: null,
        acceptedAt: null,
        notifiedVolunteers: [],
        createdAt: now,
        expiresAt,
      });

      // Gọi findAndNotifyVolunteers
      await findAndNotifyVolunteers(incidentRef.id, { lat, lng });

      return res.status(200).json({ incidentId: incidentRef.id });
    } catch (err) {
      console.error("createIncident error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  });

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

  // Gửi FCM đến tất cả volunteer đủ điều kiện
  const tokens = eligibleVolunteers
    .filter((v) => v.fcmToken)
    .map((v) => v.fcmToken);

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
        title: "🚨 Có sự cố khẩn cấp gần bạn!",
        body: `Cách bạn khoảng ${eligibleVolunteers[0]?.distance ?? "?"} km`,
      },
      android: {
        priority: "high",
        notification: { channelId: "incident_alerts" },
      },
    });
  }

  // Lưu danh sách volunteer đã nhận thông báo
  await db.collection("incidents").doc(incidentId).update({
    notifiedVolunteers: notifiedIds,
  });
}

// ==========================================
// 3. acceptIncident (HTTP)
// POST { incidentId, volunteerId }
// ==========================================
exports.acceptIncident = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).send("");

    try {
      const { incidentId, volunteerId } = req.body;

      if (!incidentId || !volunteerId) {
        return res.status(400).json({ error: "Thiếu incidentId hoặc volunteerId" });
      }

      const incidentRef = db.collection("incidents").doc(incidentId);

      // Firestore Transaction - đảm bảo chỉ 1 volunteer accept
      const result = await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(incidentRef);
        if (!snap.exists) throw new Error("incident_not_found");

        const data = snap.data();
        if (data.status !== "pending") {
          return { success: false, error: "already_taken" };
        }

        transaction.update(incidentRef, {
          status: "accepted",
          acceptedBy: volunteerId,
          acceptedAt: admin.firestore.Timestamp.now(),
        });

        return { success: true, patientId: data.patientId };
      });

      if (!result.success) {
        return res.status(409).json({ error: result.error });
      }

      return res.status(200).json({ success: true, patientId: result.patientId });
    } catch (err) {
      console.error("acceptIncident error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  });

// ==========================================
// 4. expireIncidents (Scheduled - mỗi 5 phút)
// ==========================================
exports.expireIncidents = functions
  .region("asia-southeast1")
  .pubsub.schedule("every 5 minutes")
  .onRun(async () => {
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
  });