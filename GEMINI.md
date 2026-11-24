# 📜 WORKSPACE RULES: QUY TRÌNH QUẢN TRỊ 8 PHÒNG BAN BẮT BUỘC (ALWAYS-ON)
**Dự án:** Game Thế Giới Mở 2D "Đế Chế Cơm Nắm" (Onigiri Empire 2D)  
**Tiêu chuẩn chất lượng:** Cấp độ Principal Engineer / Tiến sĩ Công nghệ (Enterprise Standard)  
**Phạm vi áp dụng:** Áp dụng toàn cục (Always-On) cho 100% mọi yêu cầu liên quan đến lập trình, thêm tính năng, chỉnh sửa giao diện hay sửa lỗi.

---

## ⚡ 4 ĐIỀU LUẬT CỐT LÕI BẤT KHẢ XÂM PHẠM

### 1. LUẬT KÍCH HOẠT TỰ ĐỘNG (AUTOMATIC ACTIVATION LAW)
- Bất cứ khi nào Sếp (Người dùng) đưa ra một yêu cầu liên quan đến code (dù chỉ là 1 câu ngắn hay yêu cầu nhỏ nhất), Agent **BẮT BUỘC** phải đọc [`00_BO_MAY_QUAN_TRI/LUAT_PHONG_BAN.md`](file:///Users/4t/Desktop/de-che-com-nam/00_BO_MAY_QUAN_TRI/LUAT_PHONG_BAN.md) và thực thi tuần tự, đầy đủ cả 8 bộ phận từ **[1. PRINCIPAL DESIGNER]** đến **[8. RELEASE GATE]**.
- **CẤM LÀM TẮT, CẤM GỘP BƯỚC, CẤM BỎ QUA BẤT KỲ PHÒNG BAN NÀO.**

---

### 2. LUẬT CHẠY MÔ PHỎNG BẮT BUỘC (MANDATORY SIMULATION LAW)
- Ở bước **[6. SIMULATION DIRECTOR]**, Agent **CẤM CHỈ ĐỌC CODE BẰNG MẮT**.
- Bắt buộc phải mở Terminal khởi chạy kịch bản mô phỏng tự động:
  ```bash
  node 00_BO_MAY_QUAN_TRI/verify_system.mjs
  ```
- Nếu có tính năng mới được thêm vào, **BẮT BUỘC PHẢI CẬP NHẬT THÊM KỊCH BẢN TEST MỚI** vào [`00_BO_MAY_QUAN_TRI/verify_system.mjs`](file:///Users/4t/Desktop/de-che-com-nam/00_BO_MAY_QUAN_TRI/verify_system.mjs) trước khi chạy để kiểm thử bao phủ toàn diện.

---

### 3. LUẬT TỰ ĐỘNG SỬA LỖI (AUTO-FIX SELF-HEALING LOOP)
- Nếu `verify_system.mjs` hoặc kiểm tra tĩnh phát hiện dù chỉ **1 LỖI NHỎ**, **[3. VP OF ENGINEERING]** phải tự động kích hoạt vòng lặp tự sửa lỗi:
  1. Chuyển vé lỗi sang **[7. ROOT-CAUSE ENGINEERS]** phân tích nguyên nhân gốc rễ (RCA) và sửa mã nguồn triệt để.
  2. Bàn giao ngược lại cho **[6. SIMULATION DIRECTOR]** chạy lại toàn bộ quy trình mô phỏng từ đầu.
- Tuyệt đối **KHÔNG ĐƯỢC PHÉP** báo cáo hoàn thành cho Sếp nếu kết quả chạy chưa đạt **100% PASS (0 LỖI)**.

---

### 4. LUẬT DỪNG CHỜ DUYỆT (STOP & WAIT FOR APPROVAL LAW)
- Luôn luôn **DỪNG LẠI** ở **[8. RELEASE GATE]** sau khi đạt 100% PASS và xuất trình báo cáo súc tích.
- **TIÊN QUYẾT:** Bắt buộc chờ Sếp nhắn đúng khẩu lệnh **"SẾP DUYỆT"** thì mới được phép ghi nhận tính năng vào [`00_BO_MAY_QUAN_TRI/changelog.md`](file:///Users/4t/Desktop/de-che-com-nam/00_BO_MAY_QUAN_TRI/changelog.md).

---

## 🏛️ TỔNG QUAN 8 BỘ PHẬN BẮT BUỘC THỰC THI TUẦN TỰ

```
[BƯỚC 1: PRINCIPAL DESIGNER]
  ► Chuyển yêu cầu thành Finite State Machine, công thức toán và Edge Cases vào spec.md.
  ► 🚫 LỆNH CẤM: TUYỆT ĐỐI CẤM VIẾT CODE.
       │
       ▼
[BƯỚC 2: CHIEF ARCHITECT]
  ► Thẩm định spec.md. Bắt buộc tách bạch 100% Canvas 60fps & DOM (chỉ cập nhật textContent, cấm innerHTML trong nhịp game).
  ► Kiểm soát z-index, rò rỉ bộ nhớ và bảo mật quy tắc kinh doanh (chỉ hiển thị giá bán lẻ chuẩn 20k/22k/25k, cấm lộ giá gốc).
       │
       ▼
[BƯỚC 3: VP OF ENGINEERING]
  ► Điều phối toàn bộ quy trình. Nắm quyền kiểm soát vòng lặp tự sửa lỗi.
       │
       ▼
[BƯỚC 4: STAFF ENGINEERS]
  ► Viết code ES6+ phòng thủ (null/undefined safety, không gọi innerHTML trong game loop, type="button" cho 100% nút bấm).
       │
       ▼
[BƯỚC 5: STATIC AUDITOR]
  ► Chạy Terminal kiểm tra cú pháp toàn bộ JS (node --input-type=module --check), rà soát đồ thị import/export và cặp liên kết HTML-JS.
       │
       ▼
[BƯỚC 6: SIMULATION DIRECTOR]
  ► Chạy mô phỏng thực tế bằng Terminal: node 00_BO_MAY_QUAN_TRI/verify_system.mjs.
  ► Cập nhật kịch bản test mới nếu có tính năng mới. Tự động ghi simulation_report.md.
       │
       ├──► (Có lỗi) ──► [BƯỚC 7: ROOT-CAUSE ENGINEERS] Sửa tận gốc ──► Quay lại BƯỚC 6
       │
       ▼ (Khi 100% PASS - 0 LỖI)
[BƯỚC 8: RELEASE GATE]
  ► Trình bày báo cáo súc tích.
  ► 🛑 DỪNG LẠI CHỜ LỆNH "SẾP DUYỆT" ──► (Sau khi Sếp duyệt) Ghi changelog.md.
```
