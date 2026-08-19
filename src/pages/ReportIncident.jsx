import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

export default function ReportIncident() {
  const { user, role, profile } = useAuth();

  const [type, setType] = useState("medical");
  const [location, setLocation] = useState("");
  const [detail, setDetail] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!location.trim()) {
      alert("กรุณาระบุตำแหน่ง");
      return;
    }

    setSending(true);

    try {
      await addDoc(collection(db, "incidents"), {
        type,
        location,
        detail,
        // NOTE: severity is set client-side for now, so a malicious client
        // could send an arbitrary value. That's an acceptable trade-off for
        // a v1 prototype since only safety/commander/admin roles can ever
        // read incidents, but for production this should be recomputed
        // server-side (Cloud Function) rather than trusted from the client.
        severity: type === "weapon" || type === "fire" ? "high" : "normal",
        status: "new",
        reportedBy: user.uid,
        reporterRole: role,
        reporterName: profile?.displayName || "",
        createdAt: serverTimestamp(),
        visibility: "safety_only",
      });

      alert("ส่งแจ้งเหตุเรียบร้อยแล้ว");
      setLocation("");
      setDetail("");
      setType("medical");
    } catch (err) {
      alert("ส่งแจ้งเหตุไม่สำเร็จ: " + err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>แจ้งเหตุภายในโรงเรียน</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>ประเภทเหตุ</label><br />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="medical">เจ็บป่วย / บาดเจ็บ</option>
            <option value="fight">ทะเลาะวิวาท</option>
            <option value="stranger">บุคคลน่าสงสัย</option>
            <option value="fire">ไฟไหม้ / ควัน</option>
            <option value="weapon">เหตุรุนแรง / พบอาวุธ</option>
            <option value="other">อื่น ๆ</option>
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>ตำแหน่ง</label><br />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="เช่น อาคาร 3 ชั้น 2 หน้าห้องน้ำ"
            required
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>รายละเอียดเพิ่มเติม</label><br />
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="อธิบายสั้น ๆ เท่าที่ปลอดภัย"
            rows="4"
          />
        </div>

        <button style={{ marginTop: 16 }} disabled={sending}>
          {sending ? "กำลังส่ง..." : "ส่งแจ้งเหตุ"}
        </button>
      </form>
    </div>
  );
}
