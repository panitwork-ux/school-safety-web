import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function SafetyDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "incidents"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setIncidents(list);
      },
      (err) => {
        console.error("Failed to subscribe to incidents:", err);
        setError(err.message);
      }
    );

    return () => unsub();
  }, []);

  async function updateStatus(id, status) {
    const ref = doc(db, "incidents", id);

    try {
      await updateDoc(ref, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      alert("อัปเดตสถานะไม่สำเร็จ: " + err.message);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Safety Dashboard</h2>

      {error && (
        <p style={{ color: "crimson" }}>
          เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}
        </p>
      )}

      {incidents.length === 0 && !error && <p>ยังไม่มีเหตุแจ้งเข้ามา</p>}

      {incidents.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
            borderLeft:
              item.severity === "high" ? "6px solid crimson" : "6px solid #ccc",
          }}
        >
          <h3>
            {item.type} | ระดับ: {item.severity}
          </h3>

          <p><b>ตำแหน่ง:</b> {item.location}</p>
          <p><b>รายละเอียด:</b> {item.detail || "-"}</p>
          <p><b>สถานะ:</b> {item.status}</p>

          <button onClick={() => updateStatus(item.id, "accepted")}>
            รับเรื่อง
          </button>

          <button
            style={{ marginLeft: 8 }}
            onClick={() => updateStatus(item.id, "checking")}
          >
            กำลังตรวจสอบ
          </button>

          <button
            style={{ marginLeft: 8 }}
            onClick={() => updateStatus(item.id, "closed")}
          >
            ปิดเหตุ
          </button>
        </div>
      ))}
    </div>
  );
}
