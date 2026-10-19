# วิธีเผยแพร่ KalCal Thai PWA

## GitHub Pages (ฟรีสำหรับโปรเจกต์สาธารณะ)
1. สร้าง repository ใหม่ เช่น `kalcal-thai`
2. อัปโหลดไฟล์ `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `icon.svg`
3. ไปที่ Settings → Pages
4. เลือก Deploy from a branch → branch `main` → folder `/ (root)` → Save
5. รอให้ GitHub แสดง URL แล้วเปิดบนมือถือผ่าน HTTPS

ถ้า URL ของโปรเจกต์เป็น `https://username.github.io/kalcal-thai/` แอปนี้ใช้ relative paths เพื่อรองรับ subfolder

## เพิ่มลงหน้าจอหลักบน iPhone
1. เปิดลิงก์ใน Safari (ไม่ใช่เบราว์เซอร์ในแอปแชต)
2. กดปุ่ม Share
3. เลือก Add to Home Screen
4. กด Add

## ข้อจำกัดก่อนแชร์ให้เพื่อน
ตอนนี้แต่ละคนที่เปิดเว็บจะมีข้อมูลอยู่ในเบราว์เซอร์ของตัวเองเท่านั้น ไม่ใช่ระบบสมาชิกออนไลน์ ห้ามใช้เก็บข้อมูลส่วนบุคคลที่ต้องการความปลอดภัยหรือคาดหวังว่าจะซิงก์ข้ามเครื่อง จนกว่าจะเพิ่ม backend และ authentication

## ขั้นพัฒนาต่อ
- ระบบสมาชิก: Supabase Auth หรือ Firebase Auth
- ฐานข้อมูล: ตาราง profiles, goals, food_logs และ food database
- AI: backend endpoint + API key ฝั่ง server
- ความเป็นส่วนตัว: privacy policy, delete account/data, export data
- Monitoring และ rate limiting
