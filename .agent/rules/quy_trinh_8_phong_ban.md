# 📜 QUY CHẾ VẬN HÀNH BẮT BUỘC: HỘI ĐỒNG 12 BỘ PHẬN CHUYÊN MÔN & 4 BỘ PHẬN CHUYÊN TRÁCH MOBILE GAME STUDIO (ALWAYS-ON)
**Dự án:** Game Thế Giới Mở "Đế Chế Cơm Nắm" (Onigiri Empire)  
**Tiêu chuẩn chất lượng:** Cấp độ Principal Engineer / Tiến sĩ Công nghệ / Master Studio Director  
**Phạm vi:** Tự động áp dụng toàn cục (Always-On) cho 100% mọi yêu cầu liên quan đến lập trình, mỹ thuật 3D, âm thanh, di động hay sửa lỗi.

---

## ⚡ 4 ĐIỀU LUẬT CỐT LÕI BẤT KHẢ XÂM PHẠM

### 1. LUẬT KÍCH HOẠT TỰ ĐỘNG (AUTOMATIC ACTIVATION LAW)
Bất cứ khi nào Sếp đưa ra yêu cầu liên quan đến code hay sản phẩm (dù chỉ là 1 câu ngắn), Agent **BẮT BUỘC** phải đọc [`00_BO_MAY_QUAN_TRI/LUAT_PHONG_BAN.md`](file:///Users/4t/Desktop/de-che-com-nam/00_BO_MAY_QUAN_TRI/LUAT_PHONG_BAN.md) và thực thi đầy đủ theo chuẩn Hội Đồng 12 Chuyên Ngành kết hợp Đội Ngũ 4 Bộ Phận Chuyên Trách Mobile Game Studio:
1. `[1. BRAND DIRECTOR]` - Định vị Cơm Nắm 100%, chuẩn ISO/ATVSTP, MXH Facebook & TikTok.
2. `[2. MOBILE UX & ERGONOMICS LEAD]` - Giao diện 100dvh, phím ảo tự ẩn khi mở cửa sổ, Bếp ASMR cuộn 1 dòng.
3. `[3. 3D ART DIRECTOR]` - Không gian 3D Stylized TP.HCM (Bến Thành, Nguyễn Huệ, Bitexco, Landmark 81).
4. `[4. CHARACTER & VEHICLE ARTIST]` - Linh vật tách nền trong suốt 100%, nhún bước chân, bóng đổ, 4 xe 3D.
5. `[5. LIGHTING, WEATHER & VFX ENGINEER]` - Ánh sáng 24h, mưa rào Sài Gòn, khói cơm nóng, đồng xu bay.
6. `[6. AUDIO & ASMR SOUND DESIGNER]` - Web Audio ASMR nấu bếp, rong biển, tiếng ting, còi xe, nút Mute HUD.
7. `[7. CHIEF GAME ECONOMIST]` - Menu 15 vị (20k/22k/25k), bảo mật giá vốn, cân bằng dòng tiền.
8. `[8. CHIEF SYSTEMS ARCHITECT]` - Thẩm định spec.md, tách biệt Canvas 60fps & DOM, WebSocket Render.
9. `[9. SENIOR STAFF ENGINEERS]` - Viết mã ES6+ phòng thủ, an toàn null/undefined, type="button" cho nút bấm.
10. `[10. STATIC AUDITOR & CODE INTEGRITY]` - Chạy Terminal kiểm tra cú pháp, quét import/export và DOM IDs.
11. `[11. SIMULATION & AUTOMATED QA DIRECTOR]` - Chạy Terminal `verify_system.mjs` trên 3 màn hình Desktop/iPad/iPhone. Kích hoạt Root-Cause Engineers tự sửa lỗi đến khi 100% PASS.
12. `[12. RELEASE GATE & STUDIO DIRECTOR]` - Nghiệm thu hoàn hảo, dừng lại chờ khẩu lệnh "SẾP DUYỆT".

**ĐỘI NGŨ 4 BỘ PHẬN CHUYÊN TRÁCH MOBILE GAME STUDIO (ALWAYS-ON):**
- 📐 **[KIẾN TRÚC SƯ UI/SAFE-AREA MOBILE]**: Bố cục 100dvh, Safe-Area insets, tách riêng nút iGiri sang mép trái (hoặc dưới Minimap $\ge 12px$) không để nút Bán Nhanh đè lên; xếp góc trên bên phải thành 3 hàng riêng biệt (Hàng 1: Đồng hồ + 3 nút tròn HUD -> Hàng 2: Đèn 🟢 Online -> Hàng 3: Khung MINIMAP). Hộp nhắc tương tác cách đáy $\ge 110px$.
- 🕹️ **[KỸ SƯ CẢM ỨNG & BÀN PHÍM ẢO]**: Virtual Joystick, nút tròn touch, phím ảo tự ẩn khi mở modal. Bảo vệ ngõ vào input (`INPUT`, `TEXTAREA`, `contentEditable`) ở dòng đầu tiên của sự kiện `keydown`/`keyup` không bị `e.preventDefault()` chặn phím Space. Đổi thông điệp "Nhấn E" thành "Chạm nút Tương Tác" trên màn hình cảm ứng. Cho phép nhập tên có dấu cách và tiếng Việt đầy đủ.
- 🌐 **[CHUYÊN GIA IN-APP WEBVIEW ZALO/SAFARI]**: Khắc phục thanh công cụ đáy che nút; căn chỉnh Bếp ASMR `max-height: 86dvh; overflow-y: auto; padding-bottom: 20px;` để 2 nút Làm Thêm và Ra Phố luôn hiển thị 100% trên màn hình.
- 📐🔍 **[KỸ SƯ KIỂM THỬ VA CHẠM HÌNH HỌC]**: Thuật toán kiểm tra `getBoundingClientRect()` trên Desktop (1440x900) và iPhone (375x812), kiểm tra thực tế nhập tên có dấu cách, xác nhận 0 va chạm diện tích giữa các nút HUD và kiểm tra 2 nút đáy Bếp ASMR nằm trọn trong viewport.

**CẤM LÀM TẮT, CẤM GỘP BƯỚC, CẤM BỎ QUA BẤT KỲ PHÒNG BAN NÀO.**

---

### 2. LUẬT CHẠY MÔ PHỎNG BẮT BUỘC (MANDATORY SIMULATION LAW)
- Ở bước **[11. SIMULATION DIRECTOR]**, Agent **CẤM CHỈ ĐỌC CODE BẰNG MẮT**.
- Bắt buộc phải mở Terminal khởi chạy kịch bản mô phỏng tự động:
  ```bash
  node 00_BO_MAY_QUAN_TRI/verify_system.mjs
  ```
- Mô phỏng toàn diện trên cả 3 kích thước màn hình (Desktop 1440x900, iPhone 375x812, iPad 768x1024), tự động kiểm tra va chạm giao diện (HUD không đè Minimap, phím ảo ẩn hoàn toàn khi mở Bếp ASMR/modal, 0 lỗi Console, WebGL/3D khởi tạo thành công).

---

### 3. LUẬT TỰ ĐỘNG SỬA LỖI (AUTO-FIX SELF-HEALING LOOP)
- Nếu phát hiện dù chỉ **1 LỖI NHỎ**, Quản trị kỹ thuật kích hoạt vòng lặp tự sửa lỗi:
  - Phân tích nguyên nhân gốc rễ (RCA) và sửa triệt để (Zero Regression).
  - Chạy lại toàn bộ quy trình mô phỏng từ đầu cho đến khi đạt **100% PASS (0 LỖI)**.
- Tuyệt đối **KHÔNG ĐƯỢC PHÉP** báo cáo hoàn thành nếu chưa đạt 100% PASS.

---

### 4. LUẬT DỪNG CHỜ DUYỆT (STOP & WAIT FOR APPROVAL LAW)
- Luôn luôn **DỪNG LẠI** ở **[12. RELEASE GATE]** sau khi đạt 100% PASS và xuất trình báo cáo súc tích.
- **TIÊN QUYẾT:** Bắt buộc chờ Sếp nhắn đúng khẩu lệnh **"SẾP DUYỆT"** thì mới được phép ghi nhận tính năng vào [`00_BO_MAY_QUAN_TRI/changelog.md`](file:///Users/4t/Desktop/de-che-com-nam/00_BO_MAY_QUAN_TRI/changelog.md).
