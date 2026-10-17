# แผนแก้ข้อผิดพลาด mangoSelect 10 ข้อ

**เป้าหมาย:** แก้ข้อผิดพลาดที่ตรวจพบและผู้ใช้อนุมัติ แยกหนึ่ง commit ต่อข้อ เพิ่ม patch version จาก 1.0.0 เป็น 1.0.10

**แนวทาง:** แก้ภายในโครงสร้างเดิม รักษา public API และพฤติกรรม placeholder เริ่มต้น เพิ่ม regression test ด้วยเบราว์เซอร์จริง ไม่เพิ่ม dependency ของไลบรารี ผู้ใช้อนุมัติให้แก้และ commit ต่อเนื่องแล้ว จึงดำเนินการตามลำดับใน checkout ปัจจุบัน

**เทคโนโลยี:** Vanilla JavaScript, Node.js, esbuild, Playwright ที่ติดตั้งไว้นอกโปรเจกต์

**ข้อกำหนดอ้างอิง:** ผลตรวจ 10 ข้อในบทสนทนาและคำอนุมัติของผู้ใช้วันที่ 17 ตุลาคม 2026

## ขั้นตอนประจำแต่ละข้อ

1. เพิ่ม test ของข้อนั้นใน `tests/cases/` และรันให้เห็นความผิดพลาดตามสาเหตุที่ตรวจพบ
2. แก้ source เฉพาะสาเหตุ รวมเส้นทางที่ใช้พฤติกรรมร่วมกัน
3. รัน test ทั้งหมดที่เพิ่มมาแล้วบน source
4. เพิ่มเลข version ใน bootstrap, package.json และ metadata ของ root package ใน package-lock.json พร้อมบันทึก CHANGELOG
5. รัน `npm run build`, test บน dist ทั้งปกติและ minified, syntax check และ `git diff --check`
6. ตรวจ diff และ commit เฉพาะข้อนั้น รวม test, เอกสารและ dist ที่เกี่ยวข้อง

## งานตามลำดับ

- [x] 1 — 1.0.1: รักษาค่า single select เมื่อ init ซ้ำ, rebuild และรับ native change (`10-core`, `50-selection`, `80-instance`); ทดสอบค่าเริ่มต้น, ค่าเปลี่ยนแล้ว, ค่าว่าง และ form reset
- [x] 2 — 1.0.2: ส่ง Content-Type เพียงค่าเดียว โดยเคารพ custom header แบบไม่สนตัวพิมพ์ (`60-remote-data`); จับ request จริงทั้ง JSON และ form
- [x] 3 — 1.0.3: เคารพ disabled ของ optgroup ใน UI, API, bulk และ draft (`10-core`, `50-selection`, `70-render`); ทดสอบกลุ่มปิด/เปิดและค่าเดิมที่เลือกไว้
- [x] 4 — 1.0.4: ป้องกันการเลือกผ่าน UI เมื่อ select ปิดใช้งาน โดยเฉพาะ inline (`50-selection`, `70-render`); ทดสอบเมาส์และคีย์บอร์ด รวมเปิดกลับมาใช้งาน
- [x] 5 — 1.0.5: เริ่ม draft ใน inline และเริ่มรอบใหม่หลัง OK/Cancel (`10-core`, `50-selection`, `80-instance`); ทดสอบหลายรอบ, bulk, reset และ native change
- [x] 6 — 1.0.6: โหลด Ajax เริ่มต้นใน inline (`80-instance`); ทดสอบ request จริง, search_length และ disabled โดยไม่โหลดซ้ำจาก refresh
- [ ] 7 — 1.0.7: ใช้ lookup ที่ไม่มี prototype สำหรับ option values (`10-core`, `50-selection`); ทดสอบ toString, constructor, __proto__ ทั้ง API และ draft
- [ ] 8 — 1.0.8: รักษา min_selected เมื่อแทนค่าผ่าน API (`50-selection`); ทดสอบล้างทั้งหมด, เปลี่ยนค่าเมื่อ min=max และค่า disabled
- [ ] 9 — 1.0.9: แปลง inline attribute เป็น boolean (`00-bootstrap`); ทดสอบ false, 0, true, empty และ JS override
- [ ] 10 — 1.0.10: ส่งสถานะ multiple ให้การสร้าง progress bar (`80-instance`); ทดสอบจำนวน, เปอร์เซ็นต์, เต็มโควตา และกรณีไม่กำหนด max

## จุดทบทวนร่วม

- ค่า single ที่ไม่มี selected attribute ต้องยังเริ่มจาก placeholder แต่ค่าเลือกภายหลังต้องไม่หาย
- กลุ่ม disabled และจำนวนขั้นต่ำต้องไม่ทำให้ค่าที่เลือกไว้หายโดยเงียบ
- Inline draft ต้องรักษาพฤติกรรม dropdown ปกติ และทำงานหลัง reset/OK/Cancel หลายรอบ
- Ajax ต้องยังส่ง canonical params และ default form content type ได้ตามเดิม
- เวอร์ชันและ source/dist ต้องตรงกันทุก commit; ไม่ push หรือเปลี่ยนประวัติ Git

## บันทึกผล

แต่ละ release บันทึกผลแก้ใน CHANGELOG.md และมี regression test ประจำข้อ ประวัติ commit เป็นหลักฐานลำดับการดำเนินงาน
