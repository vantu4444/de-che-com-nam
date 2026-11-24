# 📜 WORKSPACE RULES: QUY TRÌNH QUẢN TRỊ HỘI ĐỒNG 12 BỘ PHẬN CHUYÊN MÔN BẮT BUỘC (ALWAYS-ON)
**Dự án:** Game Thế Giới Mở "Đế Chế Cơm Nắm" (Onigiri Empire)  
**Tiêu chuẩn chất lượng:** Cấp độ Principal Engineer / Tiến sĩ Công nghệ / Master Studio Director  
**Phạm vi áp dụng:** Áp dụng toàn cục (Always-On) cho 100% mọi yêu cầu liên quan đến lập trình, mỹ thuật 3D, âm thanh, di động hay sửa lỗi.

---

## ⚡ 4 ĐIỀU LUẬT CỐT LÕI BẤT KHẢ XÂM PHẠM

### 1. LUẬT KÍCH HOẠT TỰ ĐỘNG (AUTOMATIC ACTIVATION LAW)
- Bất cứ khi nào Sếp đưa ra một yêu cầu liên quan đến code hay sản phẩm (dù chỉ là 1 câu ngắn), Agent **BẮT BUỘC** phải đọc [`00_BO_MAY_QUAN_TRI/LUAT_PHONG_BAN.md`](file:///Users/4t/Desktop/de-che-com-nam/00_BO_MAY_QUAN_TRI/LUAT_PHONG_BAN.md) và thực thi đầy đủ theo chu trình 12 bộ phận chuyên môn.
- **CẤM LÀM TẮT, CẤM GỘP BƯỚC, CẤM BỎ QUA BẤT KỲ PHÒNG BAN NÀO.**

---

### 2. LUẬT CHẠY MÔ PHỎNG BẮT BUỘC (MANDATORY SIMULATION LAW)
- Ở bước **[11. SIMULATION & QA DIRECTOR]**, Agent **CẤM CHỈ ĐỌC CODE BẰNG MẮT**.
- Bắt buộc phải mở Terminal khởi chạy kịch bản mô phỏng tự động:
  ```bash
  node 00_BO_MAY_QUAN_TRI/verify_system.mjs
  ```
- Mô phỏng toàn diện trên cả 3 kích thước màn hình (Desktop 1440x900, iPhone 375x812, iPad 768x1024), tự động kiểm tra va chạm giao diện (đảm bảo HUD không đè Minimap, phím ảo ẩn hoàn toàn khi mở Bếp ASMR/modal, 0 lỗi Console, WebGL/3D khởi tạo thành công).

---

### 3. LUẬT TỰ ĐỘNG SỬA LỖI (AUTO-FIX SELF-HEALING LOOP)
- Nếu `verify_system.mjs` hoặc kiểm tra tĩnh phát hiện dù chỉ **1 LỖI NHỎ**, vòng lặp tự sửa lỗi tự động kích hoạt:
  1. Phân tích nguyên nhân gốc rễ (RCA) và sửa mã nguồn triệt để.
  2. Bàn giao ngược lại cho Simulation Director chạy lại toàn bộ quy trình mô phỏng từ đầu.
- Tuyệt đối **KHÔNG ĐƯỢC PHÉP** báo cáo hoàn thành cho Sếp nếu kết quả chạy chưa đạt **100% PASS (0 LỖI)**.

---

### 4. LUẬT DỪNG CHỜ DUYỆT (STOP & WAIT FOR APPROVAL LAW)
- Luôn luôn **DỪNG LẠI** ở **[12. RELEASE GATE]** sau khi đạt 100% PASS và xuất trình báo cáo súc tích.
- **TIÊN QUYẾT:** Bắt buộc chờ Sếp nhắn đúng khẩu lệnh **"SẾP DUYỆT"** thì mới được phép ghi nhận tính năng vào [`00_BO_MAY_QUAN_TRI/changelog.md`](file:///Users/4t/Desktop/de-che-com-nam/00_BO_MAY_QUAN_TRI/changelog.md).

---

## 🏛️ TỔNG QUAN HỘI ĐỒNG 12 BỘ PHẬN THỰC THI TUẦN TỰ

```
[1. BRAND DIRECTOR] & [7. GAME ECONOMIST]
  ► Định vị Cơm Nắm 100% (không bánh mì), Menu 15 vị (20k/22k/25k), ISO & ATVSTP, Nút MXH FB & TikTok.
       │
       ▼
[2. MOBILE UX LEAD] & [6. AUDIO DESIGNER]
  ► Công thái học Mobile 100dvh, phím ảo tự ẩn khi mở modal, Bếp ASMR cuộn 1 dòng, Web Audio ASMR, nút Mute HUD.
       │
       ▼
[3. 3D ART] & [4. CHARACTER] & [5. LIGHTING]
  ► Bản đồ 3D Stylized TP.HCM (Bến Thành, Nguyễn Huệ, Bitexco, Landmark 81), Linh vật trong suốt, 4 Xe 3D, Ánh sáng 24h & Mưa.
       │
       ▼
[8. CHIEF ARCHITECT]
  ► Thẩm định spec.md. Tách bạch Canvas 60fps & DOM (chỉ cập nhật textContent, cấm innerHTML trong nhịp game).
       │
       ▼
[9. STAFF ENGINEERS]
  ► Viết code ES6+ phòng thủ (null/undefined safety, type="button" cho 100% nút bấm).
       │
       ▼
[10. STATIC AUDITOR]
  ► Chạy Terminal kiểm tra cú pháp toàn bộ JS (node --input-type=module --check), rà soát đồ thị import/export.
       │
       ▼
[11. SIMULATION QA]
  ► Chạy mô phỏng Terminal: node 00_BO_MAY_QUAN_TRI/verify_system.mjs trên Desktop, iPhone, iPad.
       ├──► (Có lỗi) ──► [ROOT-CAUSE ENGINEERS] Sửa tận gốc ──► Quay lại BƯỚC 11
       │
       ▼ (Khi 100% PASS - 0 LỖI)
[12. RELEASE GATE]
  ► Trình bày báo cáo súc tích.
  ► 🛑 DỪNG LẠI CHỜ LỆNH "SẾP DUYỆT" ──► (Sau khi Sếp duyệt) Ghi changelog.md & Đẩy Git.
```
