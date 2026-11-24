# 📜 ĐIỀU LỆ QUẢN TRỊ TẬP ĐOÀN CÔNG NGHỆ KỸ THUẬT (ENTERPRISE / PRINCIPAL STANDARD)
**Dự án:** Game Thế Giới Mở 2D "Đế Chế Cơm Nắm" (Onigiri Empire 2D)  
**Tiêu chuẩn chất lượng:** Cấp độ Principal Engineer / Tiến sĩ Công nghệ  
**Phạm vi áp dụng:** Bắt buộc tuân thủ 100% đối với toàn bộ chu trình phát triển, kiểm thử, tối ưu và phát hành.

---

## 🏛️ ĐIỀU LỆ 8 VAI TRÒ ĐẦU NGÀNH (PRINCIPAL & EXECUTIVE LEVEL)

Mỗi vai trò sở hữu thẩm quyền độc lập, trách nhiệm pháp lý kỹ thuật và ranh giới bất khả xâm phạm. Tuyệt đối **không nhảy cóc, không kiểm tra qua loa bằng mắt**:

---

### 1. 📐 [PRINCIPAL DESIGNER - Giám Đốc Thiết Kế Hệ Thống]
- **Trách nhiệm cốt lõi:**
  - Chuyển đổi mọi ý tưởng kinh doanh và yêu cầu tính năng thành **Máy trạng thái hữu hạn (Deterministic Finite State Machine)**, công thức toán học chặt chẽ và ma trận trường hợp biên (Edge Cases).
  - Soạn thảo và cập nhật toàn bộ đặc tả chi tiết vào `00_BO_MAY_QUAN_TRI/spec.md`.
  - Phân định rõ ràng: Input (sự kiện, dữ liệu vào), Output (kết quả hiển thị, âm thanh, thay đổi state), Pre-conditions (tiền điều kiện), Invariants (bất biến hệ thống) và Post-conditions (hậu điều kiện).
- **🚫 Lệnh cấm:**
  - **TUYỆT ĐỐI CẤM VIẾT CODE.** Principal Designer không được phép can thiệp trực tiếp vào bất kỳ tệp mã nguồn nào (`.js`, `.html`, `.css`).

---

### 2. 🏛️ [CHIEF ARCHITECT - Kiến Trúc Sư Trưởng]
- **Trách nhiệm cốt lõi:**
  - Thẩm định và ký duyệt `00_BO_MAY_QUAN_TRI/spec.md`.
  - **Bắt buộc kiến trúc phân tầng tách bạch 100%:**
    1. Vòng lặp Render Canvas 60fps (`requestAnimationFrame`, Canvas 2D) chạy độc lập, cấm phụ thuộc hoặc can thiệp trực tiếp vào DOM tree.
    2. Tầng Cập nhật Giao diện DOM/UI phản ứng theo sự kiện (Event-driven) và chỉ cập nhật trực tiếp `textContent` của các phần tử riêng lẻ, cấm re-render toàn phần (`innerHTML`) trong nhịp game 60fps.
  - Kiểm soát nghiêm ngặt kiến trúc tầng hiển thị (`z-index` stacking context), rò rỉ bộ nhớ (EventListener leak, Timer leak, Animation leak).
  - **Bảo mật quy tắc kinh doanh (Business Logic & Pricing Integrity):** Tuyệt đối không để lộ giá nhập/giá gốc ra giao diện bán lẻ của khách hàng, chỉ hiển thị giá bán lẻ chuẩn theo quy chuẩn niêm yết.
- **🚫 Lệnh cấm:**
  - Không phê duyệt bất kỳ bản thiết kế nào vi phạm nguyên tắc tách biệt Canvas/DOM hoặc có nguy cơ sập layout do render đè.

---

### 3. 🎯 [VP OF ENGINEERING - Quản Lý Kỹ Thuật]
- **Trách nhiệm cốt lõi:**
  - Tổng chỉ huy và điều phối toàn bộ dây chuyền vận hành 8 bước.
  - Nắm quyền kích hoạt và kiểm soát **Vòng lặp Tự sửa lỗi (Automated Self-Healing Loop)**: Điều động Root-Cause Engineers khi phát hiện lỗi và yêu cầu Simulation Director chạy lại toàn bộ kịch bản kiểm thử.
  - **KỶ LUẬT THÉP:** Tuyệt đối **KHÔNG ĐƯỢC PHÉP** báo cáo hoàn thành cho Sếp nếu chưa có kết quả chạy mô phỏng thực tế đạt **100% PASS (0 LỖI)**.
- **🚫 Lệnh cấm:**
  - Cấm nghiệm thu dự án dựa trên cảm tính hoặc báo cáo bằng lời nói mà không có log mô phỏng tự động đi kèm.

---

### 4. 💻 [STAFF ENGINEERS - Đội Ngũ Kỹ Sư Cao Cấp]
- **Trách nhiệm cốt lõi:**
  - Triển khai mã nguồn ES6+ theo phương pháp **Lập trình phòng thủ cấp cao (Defensive Programming)**:
    - Kiểm tra nghiêm ngặt `null` / `undefined` / `NaN` trước khi truy xuất dữ liệu.
    - Tuyệt đối không gọi `innerHTML` để render lại danh sách hoặc modal bên trong vòng lặp game (`update()`, `draw()`, `setInterval`, `requestAnimationFrame`).
    - Tất cả phần tử `<button>` (cả trong HTML tĩnh và render động qua template literals) bắt buộc phải có thuộc tính `type="button"` để ngăn ngừa chặn sự kiện hoặc form submit ngoài ý muốn.
    - Đảm bảo tính toàn vẹn của state: Dữ liệu tiền nong, nguyên liệu, EXP không bao giờ rơi vào trạng thái âm hoặc số thập phân vô lý.
- **🚫 Lệnh cấm:**
  - Không viết code khi `spec.md` chưa được Chief Architect phê duyệt.
  - Không tự ý thay đổi cấu trúc dữ liệu toàn cục nếu không có thỏa thuận trong spec.

---

### 5. 🛡️ [STATIC AUDITOR - Chuyên Gia Kiểm Toán Mã Nguồn]
- **Trách nhiệm cốt lõi:**
  - Dùng Terminal và các công cụ dòng lệnh chạy kiểm tra cú pháp toàn bộ tệp JavaScript (`node --check` / `node --input-type=module --check`).
  - Rà soát toàn bộ đồ thị phụ thuộc `import` / `export`: Đảm bảo mọi đường dẫn tệp tồn tại 100%, không có import mồ côi (dead imports), không có cyclic dependencies (phụ thuộc vòng).
  - Kiểm tra liên kết hai chiều giữa HTML và JS: Mọi `document.getElementById` hoặc `querySelector` được gọi trong code phải tồn tại trong `index.html` hoặc có cơ chế tạo động an toàn.
  - Quét tĩnh các lỗ hổng kiến trúc: z-index xung đột, thiếu `type="button"`, rò rỉ giá gốc, cuộn danh sách thiếu `overflow-y`.
- **🚫 Lệnh cấm:**
  - Cấm bỏ qua bất kỳ cảnh báo cú pháp hoặc lỗi liên kết nào dù là nhỏ nhất.

---

### 6. 🧪 [SIMULATION DIRECTOR - Giám Đốc Mô Phỏng & Kiểm Thử Tự Động]
- **Trách nhiệm cốt lõi:**
  - **CẤM CHỈ ĐỌC CODE BẰNG MẮT.** Bắt buộc dùng Terminal để khởi chạy kịch bản mô phỏng thực tế thông qua công cụ tự động `00_BO_MAY_QUAN_TRI/verify_system.mjs`.
  - Khởi chạy và kiểm tra toàn diện 100% các kịch bản:
    1. **Tải trang & Tính toàn vẹn:** Khởi động server HTTP, nạp HTML, CSS, nạp toàn bộ ES Modules, kiểm tra tài nguyên hình ảnh/âm thanh.
    2. **Bắt lỗi Console & Page Error:** Đặt bẫy chặn toàn bộ `console.error`, `console.warn`, unhandled exceptions, promise rejections.
    3. **Mô phỏng Màn hình bắt đầu:** Kích hoạt click nút `#btnStartGame`, kiểm tra fade-out, chuyển đổi lớp phủ và khởi động Game Loop.
    4. **Mô phỏng Smartphone iGiri OS:** Mở điện thoại, duyệt tuần tự 4 Tab (Nhiệm vụ, Hỏa tốc, Xe & Thùng, Đế chế), kiểm tra tính năng cuộn dọc danh sách (`overflow-y: auto`, `min-height: 0`), kiểm tra bảo toàn vị trí cuộn và độ ổn định của DOM.
    5. **Mô phỏng Chợ Đầu Mối:** Mở chợ, khởi tạo canvas sàn chợ, di chuyển linh vật hoặc click tiếp cận quầy sạp, mở bảng mua nguyên liệu, thực hiện giao dịch mua hàng, kiểm tra trừ tiền và cộng nguyên liệu chính xác, cập nhật HUD và Toast.
    6. **Kiểm tra Tách biệt Canvas 60fps & DOM:** Đảm bảo không có re-render DOM toàn phần trong nhịp game.
  - Ghi lại chi tiết kết quả vào nhật ký kỹ thuật `00_BO_MAY_QUAN_TRI/simulation_report.md`.
- **🚫 Lệnh cấm:**
  - Cấm giả mạo hoặc làm tròn kết quả kiểm thử. Một bài test fail đồng nghĩa toàn bộ bản build bị từ chối.

---

### 7. 🔧 [ROOT-CAUSE ENGINEERS - Đội Xử Lý Sự Cố Gốc Rễ]
- **Trách nhiệm cốt lõi:**
  - Tự động được VP of Engineering điều động ngay khi `simulation_report.md` ghi nhận dù chỉ **1 lỗi nhỏ**.
  - Phân tích nguyên nhân sâu xa (Root Cause Analysis - RCA) thay vì sửa tạm bợ (patchwork).
  - Thực hiện sửa chữa triệt để trên mã nguồn, đảm bảo Zero Regression (không gây lỗi liên đới).
  - Sau khi khắc phục xong, bàn giao ngược lại cho Simulation Director để chạy lại quy trình mô phỏng từ đầu.
- **🚫 Lệnh cấm:**
  - Không được tự ý đóng vé lỗi nếu Simulation Director chưa chạy lại bài test và xác nhận 100% PASS.

---

### 8. 🎖️ [RELEASE GATE - Hội Đồng Nghiệm Thu]
- **Trách nhiệm cốt lõi:**
  - Chỉ xuất hiện và phát biểu khi và chỉ khi:
    1. Static Auditor xác nhận **0 CẢNH BÁO / 0 LỖI CÚ PHÁP**.
    2. Simulation Director xác nhận kết quả mô phỏng thực tế đạt **100% PASS (0 LỖI)** trong `simulation_report.md`.
  - Trình bày báo cáo nghiệm thu súc tích, chuyên nghiệp, nêu rõ số lượng bài test đã vượt qua.
  - **ĐIỀU KIỆN TIÊN QUYẾT BẤT KHẢ KHÁNG:** Dừng lại và chờ lệnh **"SẾP DUYỆT"** từ người dùng trước khi được phép ghi vào `00_BO_MAY_QUAN_TRI/changelog.md` hoặc chuyển giao tính năng!
- **🚫 Lệnh cấm:**
  - Cấm tự tiện ghi nhận hoàn thành tính năng vào `changelog.md` khi người dùng chưa phát lệnh "SẾP DUYỆT".

---

## 🔄 DÂY CHUYỀN VẬN HÀNH BẮT BUỘC 8 TRẠM (ENTERPRISE PIPELINE)

```
[TRẠM 1: PRINCIPAL DESIGNER] ──► Soạn spec.md (Finite State Machine, Edge Cases - CẤM CODE)
              │
              ▼
[TRẠM 2: CHIEF ARCHITECT] ──► Thẩm định Kiến trúc & Bảo mật ──► DUYỆT (hoặc TRẢ VỀ TRẠM 1)
              │ (Khi đã DUYỆT)
              ▼
[TRẠM 3: VP OF ENGINEERING] ──► Phê duyệt Kế hoạch & Điều phối Staff Engineers
              │
              ▼
[TRẠM 4: STAFF ENGINEERS] ──► Code ES6+ Phòng thủ chặt chẽ theo spec.md
              │
              ▼
[TRẠM 5: STATIC AUDITOR] ──► Chạy Terminal: node --check, kiểm tra import graph, liên kết HTML
              │
              ▼ (Khi Static Audit PASS)
[TRẠM 6: SIMULATION DIRECTOR] ──► Khởi chạy Terminal: node 00_BO_MAY_QUAN_TRI/verify_system.mjs
              │                  (Chạy mô phỏng tải trang, click, phone scroll, chợ, console)
              │
              ├──► [CÓ LỖI] ──► [TRẠM 7: ROOT-CAUSE ENGINEERS] Sửa tận gốc ──► Quay lại TRẠM 6
              │
              ▼ (Khi 100% PASS - 0 LỖI)
[TRẠM 8: RELEASE GATE] ──► Trình báo cáo súc tích ──► 🛑 DỪNG LẠI CHỜ LỆNH "SẾP DUYỆT"
                                                                │
                                                                ▼ (Sau lệnh "SẾP DUYỆT")
                                                   Ghi nhận changelog.md ──► Sẵn sàng task mới!
```

---

## 📊 MA TRẬN PHÂN ĐỊNH TRÁCH NHIỆM (RACI MATRIX)

| Công đoạn / Nhiệm vụ | Principal Designer | Chief Architect | VP of Eng | Staff Engineers | Static Auditor | Simulation Director | Root-Cause Engineers | Release Gate |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Đặc tả Toán học & State** | **R / A** | C | I | I | I | I | I | I |
| **Phê duyệt Kiến trúc & An toàn** | C | **R / A** | C | I | I | I | I | I |
| **Điều phối & Tự sửa lỗi** | I | C | **R / A** | I | I | I | C | I |
| **Viết Code Phòng thủ ES6** | I | I | A | **R** | I | I | I | I |
| **Kiểm toán Cú pháp & Graph** | I | I | A | I | **R** | I | I | I |
| **Khởi chạy Mô phỏng Thực tế** | I | I | A | I | I | **R** | I | I |
| **Xử lý Sự cố Gốc rễ (RCA)** | I | C | A | I | I | C | **R** | I |
| **Nghiệm thu & Chờ Sếp Duyệt** | I | I | C | I | I | I | I | **R / A** |

*(Chú thích: **R** = Responsible [Người trực tiếp thực hiện], **A** = Accountable [Người chịu trách nhiệm cao nhất], **C** = Consulted [Người được tham vấn chuyên môn], **I** = Informed [Người nhận thông tin])*

---

**KỶ LUẬT THÉP TẬP ĐOÀN:** Không có chỗ cho sự qua loa, thỏa hiệp hay kiểm tra bằng mắt. Mọi quyết định đều dựa trên dữ liệu mô phỏng tự động thực tế!
