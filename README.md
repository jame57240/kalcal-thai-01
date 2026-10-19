# KalCal Thai PWA — Starter MVP

เว็บแอปนับแคลอรีและโปรตีนภาษาไทย ออกแบบ mobile-first และติดตั้งเป็น PWA ได้

## ใช้งานได้ในต้นแบบนี้
- Dashboard สรุปแคลอรี/โปรตีน/คาร์บ/ไขมัน
- ค้นหาอาหารตัวอย่างภาษาไทยและบันทึก/ลบรายการ
- เพิ่มอาหารเองพร้อมสารอาหาร
- ตั้งเป้าหมายและน้ำหนัก
- เก็บข้อมูลใน localStorage ของเบราว์เซอร์
- ส่งออกข้อมูล JSON
- สแกนบาร์โค้ดเมื่อเบราว์เซอร์รองรับ BarcodeDetector หรือกรอกรหัสเอง
- ค้นหาสินค้าผ่าน Open Food Facts
- เลือก/ถ่ายรูปอาหารจากมือถือ
- PWA manifest และ service worker สำหรับติดตั้ง/แคชไฟล์หลัก

## ยังไม่ใช่บริการสาธารณะพร้อมใช้งาน
- ไม่มีระบบสมัครสมาชิก/ล็อกอินหรือฐานข้อมูลออนไลน์
- ข้อมูลอยู่เฉพาะเบราว์เซอร์/อุปกรณ์นั้น ไม่ซิงก์กับเพื่อน
- AI วิเคราะห์ภาพจริงยังไม่เชื่อมต่อ
- ข้อมูลอาหารเป็นชุดตัวอย่างและอาจคลาดเคลื่อน
- การสแกนกล้องต้องใช้ HTTPS และเบราว์เซอร์ที่รองรับ BarcodeDetector; iOS บางเวอร์ชันอาจต้องกรอกรหัสเอง

## ทดสอบในเครื่อง
เปิดผ่าน local server ไม่ควรเปิด index.html โดยตรง เพราะกล้องและ service worker ต้องใช้ secure context
ตัวอย่างเมื่อมี Python:
```bash
python -m http.server 8000
```
เปิด http://localhost:8000 ในเบราว์เซอร์คอมพิวเตอร์

## เผยแพร่ให้เปิดผ่านมือถือ
ตัวเลือกง่ายคือ GitHub Pages, Netlify หรือ Vercel:
1. สร้าง repository ใหม่ใน GitHub
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้
3. เปิด Settings → Pages → Deploy from a branch → เลือก `main` และ `/root`
4. รอให้ได้ URL แบบ HTTPS แล้วเปิดบนมือถือ
5. iPhone: เปิด URL ใน Safari → Share → Add to Home Screen
6. Android: เปิด URL ใน Chrome → Install app / Add to Home screen

## ก่อนเปิดใช้ระบบสมาชิกกับเพื่อน
แนะนำ Supabase Auth + Postgres พร้อม Row Level Security หรือ Firebase Authentication + Firestore Security Rules. ต้องทำ schema สำหรับ profiles, food_logs, goals และกำหนดให้สมาชิกอ่าน/แก้ไขเฉพาะข้อมูลของตน ห้ามใช้ localStorage เป็นระบบสมาชิก

## เชื่อม AI ให้ปลอดภัย
- สร้าง backend endpoint ที่ต้องยืนยันตัวตน
- เก็บ API key ใน environment variables ฝั่ง server เท่านั้น
- ส่งรูปไป backend ลดขนาดรูป และจำกัดจำนวน/ขนาดคำขอ
- ให้ AI ส่งชื่ออาหาร ปริมาณที่คาดการณ์ ช่วงแคลอรี โปรตีน คาร์บ ไขมัน และความไม่แน่นอน
- ให้ผู้ใช้ตรวจสอบ/แก้ไขก่อนบันทึก
- มี privacy policy, consent, retention/deletion policy และการป้องกันค่าใช้จ่ายเกิน

## หมายเหตุ
ค่าทางโภชนาการเป็นค่าประมาณ ไม่ใช่คำแนะนำทางการแพทย์ รายการอาหารและข้อมูลจาก Open Food Facts ควรตรวจสอบกับฉลากจริง
