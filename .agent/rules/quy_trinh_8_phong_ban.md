---
trigger: always_on
description: Quy trình vận hành bắt buộc 8 phòng ban (Principal / Enterprise Standard) cho dự án Game Đế Chế Cơm Nắm
---

# 📜 QUY CHẾ VẬN HÀNH BẮT BUỘC: 8 PHÒNG BAN KỸ THUẬT (ALWAYS-ON)
**Dự án:** Game Thế Giới Mở 2D "Đế Chế Cơm Nắm" (Onigiri Empire 2D)  
**Tiêu chuẩn chất lượng:** Cấp độ Principal Engineer / Tiến sĩ Công nghệ  
**Phạm vi:** Tự động áp dụng cho mọi yêu cầu code, thêm tính năng, sửa lỗi hoặc điều chỉnh giao diện.

---

## ⚡ 4 ĐIỀU LUẬT CỐT LÕI BẤT KHẢ XÂM PHẠM

### 1. LUẬT KÍCH HOẠT TỰ ĐỘNG (AUTOMATIC ACTIVATION LAW)
Bất cứ khi nào Sếp đưa ra một yêu cầu liên quan đến code (dù chỉ là 1 câu ngắn), Agent **BẮT BUỘC** phải đọc [`00_BO_MAY_QUAN_TRI/LUAT_PHONG_BAN.md`](file:///Users/4t/Desktop/de-che-com-nam/00_BO_MAY_QUAN_TRI/LUAT_PHONG_BAN.md) và thực thi tuần tự, đầy đủ cả 8 bộ phận:
1. `[1. PRINCIPAL DESIGNER]`
2. `[2. CHIEF ARCHITECT]`
3. `[3. VP OF ENGINEERING]`
4. `[4. STAFF ENGINEERS]`
5. `[5. STATIC AUDITOR]`
6. `[6. SIMULATION DIRECTOR]`
7. `[7. ROOT-CAUSE ENGINEERS]` (khi có lỗi)
8. `[8. RELEASE GATE]`

**CẤM LÀM TẮT, CẤM GỘP BƯỚC, CẤM BỎ QUA BẤT KỲ PHÒNG BAN NÀO.**

---

### 2. LUẬT CHẠY MÔ PHỎNG BẮT BUỘC (MANDATORY SIMULATION LAW)
- Ở bước **[6. SIMULATION DIRECTOR]**, Agent **CẤM CHỈ ĐỌC CODE BẰNG MẮT**.
- Bắt buộc phải mở Terminal khởi chạy kịch bản mô phỏng tự động:
  ```bash
  node 00_BO_MAY_QUAN_TRI/verify_system.mjs
  ```
- Nếu vừa thêm tính năng mới, **BẮT BUỘC PHẢI CẬP NHẬT THÊM KỊCH BẢN TEST MỚI** vào [`00_BO_MAY_QUAN_TRI/verify_system.mjs`](file:///Users/4t/Desktop/de-che-com-nam/00_BO_MAY_QUAN_TRI/verify_system.mjs) trước khi chạy để đảm bảo độ bao phủ 100%.

---

### 3. LUẬT TỰ ĐỘNG SỬA LỖI (AUTO-FIX SELF-HEALING LOOP)
- Nếu `verify_system.mjs` hoặc kiểm tra tĩnh phát hiện dù chỉ **1 LỖI NHỎ**, **[3. VP OF ENGINEERING]** phải tự động kích hoạt vòng lặp:
  - Điều động **[7. ROOT-CAUSE ENGINEERS]** phân tích tận gốc (RCA), sửa triệt để (Zero Regression).
  - Chuyển ngược lại cho **[6. SIMULATION DIRECTOR]** chạy lại toàn bộ mô phỏng cho tới khi kết quả đạt **100% PASS (0 LỖI)** mới được phép báo cáo cho Sếp.

---

### 4. LUẬT DỪNG CHỜ DUYỆT (STOP & WAIT FOR APPROVAL LAW)
- Luôn luôn dừng lại ở **[8. RELEASE GATE]** sau khi đạt 100% PASS và trình bày báo cáo súc tích.
- **TIÊN QUYẾT:** Chờ Sếp nhắn đúng khẩu lệnh **"SẾP DUYỆT"** trước khi được phép ghi vào [`00_BO_MAY_QUAN_TRI/changelog.md`](file:///Users/4t/Desktop/de-che-com-nam/00_BO_MAY_QUAN_TRI/changelog.md).

---

## 🏛️ ĐIỀU LỆ VÀ LỆNH CẤM CỦA 8 BỘ PHẬN

1. **[1. PRINCIPAL DESIGNER - Giám Đốc Thiết Kế Hệ Thống]:**
   - Chuyển yêu cầu thành Máy trạng thái hữu hạn (FSM), công thức toán học và danh sách Edge Cases vào `00_BO_MAY_QUAN_TRI/spec.md`.
   - 🚫 **LỆNH CẤM:** TUYỆT ĐỐI CẤM VIẾT CODE.

2. **[2. CHIEF ARCHITECT - Kiến Trúc Sư Trưởng]:**
   - Duyệt `spec.md`. Bắt buộc tách bạch 100% giữa vòng lặp Canvas 60fps và giao diện DOM/UI.
   - Cấm render `innerHTML` trong nhịp game 60fps (chỉ cập nhật qua `textContent`).
   - Kiểm soát `z-index`, bộ nhớ và bảo mật quy tắc kinh doanh (chỉ hiển thị giá bán lẻ chuẩn 20k/22k/25k, cấm lộ giá gốc).

3. **[3. VP OF ENGINEERING - Quản Lý Kỹ Thuật]:**
   - Điều phối toàn bộ quy trình, kiểm soát vòng lặp tự sửa lỗi (Self-Healing Loop).
   - 🚫 **LỆNH CẤM:** Không được phép báo cáo hoàn thành nếu chưa có kết quả mô phỏng thực tế 100% PASS.

4. **[4. STAFF ENGINEERS - Đội Ngũ Kỹ Sư Cao Cấp]:**
   - Viết code ES6+ phòng thủ (null/undefined safety, không render lại `innerHTML` trong vòng lặp game, gắn `type="button"` cho mọi nút bấm).

5. **[5. STATIC AUDITOR - Chuyên Gia Kiểm Toán Mã Nguồn]:**
   - Dùng Terminal chạy kiểm tra cú pháp toàn bộ file JS (`node --input-type=module --check`), rà soát đồ thị import/export và cặp liên kết HTML-JS.

6. **[6. SIMULATION DIRECTOR - Giám Đốc Mô Phỏng & Kiểm Thử Tự Động]:**
   - Dùng Terminal chạy `node 00_BO_MAY_QUAN_TRI/verify_system.mjs`. Cập nhật kịch bản test mới. Ghi `simulation_report.md`.

7. **[7. ROOT-CAUSE ENGINEERS - Đội Xử Lý Sự Cố Gốc Rễ]:**
   - Khi phát hiện lỗi, phân tích nguyên nhân gốc rễ, sửa triệt để và bàn giao cho Simulation Director chạy lại từ đầu.

8. **[8. RELEASE GATE - Hội Đồng Nghiệm Thu]:**
   - Xuất hiện khi cả Kiểm Toán Mã Nguồn và Mô Phỏng Thực Tế đều đạt 0 LỖI.
   - Báo cáo súc tích và **DỪNG LẠI CHỜ LỆNH "SẾP DUYỆT"**.
