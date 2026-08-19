# School Safety Web App (v1)

ระบบแจ้งเหตุความปลอดภัยภายในโรงเรียนแบบ Realtime — React + Vite + Firebase (Auth + Firestore)

## สิ่งที่ทำได้ในเวอร์ชันนี้
- นักเรียน/ครู/บุคลากร แจ้งเหตุผ่านฟอร์ม (`/report`)
- ทีมความปลอดภัย (`safety` / `commander` / `admin`) ดูรายการเหตุการณ์แบบ realtime และอัปเดตสถานะ (`/safety-dashboard`)
- แบ่งสิทธิ์ตาม Role: `student`, `teacher`, `safety`, `commander`, `admin`
- **นักเรียนแจ้งเหตุได้ แต่อ่านรายการเหตุการณ์ไม่ได้** — บังคับด้วย Firestore Security Rules ไม่ใช่แค่ที่หน้าเว็บ

## เริ่มต้นใช้งาน

```bash
npm install
cp .env.example .env   # แล้วกรอกค่าจริงจาก Firebase Console > Project settings > Web app
npm run dev
```

### ตั้งค่า Firebase
1. สร้างโปรเจกต์ใน [Firebase Console](https://console.firebase.google.com/)
2. เปิดใช้ **Authentication > Email/Password**
3. เปิดใช้ **Firestore Database**
4. คัดลอกค่า config มาใส่ใน `.env` (ห้าม commit ไฟล์นี้ — อยู่ใน `.gitignore` แล้ว)
5. Deploy security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # เลือกโปรเจกต์ที่สร้างไว้, ใช้ไฟล์ firestore.rules ที่มีอยู่แล้ว
   firebase deploy --only firestore:rules
   ```

### สร้างผู้ใช้แรก (admin) ด้วยตนเอง
เวอร์ชันนี้ยังไม่มีหน้า Admin สำหรับตั้ง Role ให้ผู้ใช้อื่น (อยู่ในแผนขั้นถัดไป) ดังนั้นสำหรับผู้ใช้ที่ไม่ใช่ `student` (เช่น teacher/safety/commander/admin คนแรก) ต้องสร้างเอกสารใน Firestore ด้วยมือ:

1. ไปที่ **Authentication** สร้างบัญชีอีเมล/รหัสผ่าน
2. คัดลอก UID ของผู้ใช้นั้น
3. ไปที่ **Firestore Database > users** สร้างเอกสารโดยใช้ UID เป็น Document ID เช่น:
   ```json
   {
     "displayName": "ครูสมชาย",
     "email": "teacher@school.ac.th",
     "role": "commander",
     "active": true
   }
   ```

นักเรียนสามารถสมัครเองผ่านฟอร์ม (ยังไม่ได้สร้างหน้า Register ใน v1 นี้ — เพิ่ม `role: "student"` ตอน `create` ได้ตาม pattern ที่ rules อนุญาตไว้แล้ว) หรือแอดมินสร้างให้ก็ได้เช่นกัน

## โครงสร้างสิทธิ์ (roles)
| Role | แจ้งเหตุ | เห็น Dashboard เหตุการณ์ |
|---|---|---|
| student | ✅ | ❌ |
| teacher | ✅ | ❌ |
| safety | ✅ | ✅ |
| commander | ✅ | ✅ |
| admin | ✅ | ✅ |

การควบคุมนี้บังคับ 2 ชั้น: ที่ UI (`ProtectedRoute`) และที่ระดับฐานข้อมูล (`firestore.rules`) — แม้ผู้ใช้จะพยายามเรียก API ตรง ๆ ก็ยังถูกปฏิเสธ

## ข้อควรทราบ / ข้อจำกัดที่ควรแก้ต่อ (ก่อนใช้งานจริง)
- **severity ถูกกำหนดฝั่ง client** — ผู้ใช้ที่ประสงค์ร้ายอาจส่งค่า severity ปลอมได้ แนะนำย้ายไปคำนวณด้วย Cloud Function เมื่อจะใช้งานจริง
- ยังไม่มีหน้า Admin สำหรับจัดการ Role ผู้ใช้ (ต้องทำผ่าน Firestore Console เอง)
- ยังไม่มี Silent Alert แยกจากการแจ้งเหตุทั่วไป, Web Push Notification, โหมด Lockdown/Evacuation/Shelter, Audit Log — ตามที่ระบุไว้ใน roadmap
- `.env` ต้องไม่ถูก commit ขึ้น GitHub เด็ดขาด (มีอยู่ใน `.gitignore` แล้ว) — ใช้ `.env.example` เป็นแม่แบบแทน

## Deploy ขึ้น GitHub

```bash
git init
git add .
git commit -m "Initial school safety web app"
git branch -M main
git remote add origin https://github.com/USERNAME/school-safety-web.git
git push -u origin main
```

## ขั้นต่อไปที่แนะนำ
1. หน้า Admin จัดการผู้ใช้และ Role
2. ระบบแบ่งโซน/อาคาร/ห้องเรียน
3. โหมด Silent Alert
4. หน้า Teacher Status Report
5. Web Push Notification
6. Dashboard พร้อมเสียงเตือน
7. PWA installable + Firebase Hosting
8. Export รายงานย้อนหลัง / Audit Log
