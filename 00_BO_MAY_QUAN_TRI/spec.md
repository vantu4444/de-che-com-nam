# 📐 BẢN THIẾT KẾ ĐẶC TẢ KỸ THUẬT (SPECIFICATION)
## MASTER STUDIO EDITION V4.0: STYLIZED 3D SAIGON & NATIVE MOBILE UX
**Dự án:** Game Thế Giới Mở "Đế Chế Cơm Nắm" (Onigiri Empire)  
**Phân hệ:** Hội Đồng 12 Chuyên Ngành Chuẩn Studio  
**Cơ quan phê duyệt:** `[8. CHIEF ARCHITECT]` & `[1. BRAND DIRECTOR]` & `[7. GAME ECONOMIST]`  
**Tiêu chuẩn chất lượng:** Principal Engineer / Enterprise & Studio Grade  

---

## 1. ĐẶC TẢ THƯƠNG HIỆU & KINH TẾ (BRAND & ECONOMY)
- **Định vị 100% Cơm Nắm Onigiri:** Không có bất kỳ hình ảnh hay ngôn từ nào về bánh mì.
- **Menu 15 vị - 3 mức giá bán lẻ chuẩn niêm yết:**
  - Nhóm 20.000đ: 11 vị (Trứng Mayonnaise, Gà Xé Cay, Heo Quay Nori, Bò Băm Sốt Nhật, Cá Hồi Nướng Mè,...)
  - Nhóm 22.000đ: 3 vị (Thịt Nướng Kim Chi, Tôm Chiên Tempura, Thanh Cua Trứng Mayo)
  - Nhóm 25.000đ: 1 vị (Bò Wagyu Sốt Phô Mai)
  - **Bảo mật bí mật thương mại:** Tuyệt đối cấm hiển thị giá vốn, biên lợi nhuận gốc hoặc công thức chi tiết ở bất kỳ giao diện nào trước khách hàng.
- **Tiêu chuẩn ISO & ATVSTP:** Mọi sản phẩm gắn biểu tượng đạt chứng chỉ An Toàn Vệ Sinh Thực Phẩm và độ tươi nấu mới mỗi ngày.
- **Nút kết nối Mạng Xã Hội:**
  - Fanpage Facebook: `https://www.facebook.com/onigiriviet`
  - Kênh TikTok: `https://www.tiktok.com/@comnam_onigiriviet?_r=1&_t=ZS-9BdKFHssRQC`
  - Vị trí: Hiển thị tinh tế trên Màn hình Chào (Start Screen) và ứng dụng Điện Thoại iGiri.

---

## 2. ĐẶC TẢ MỸ THUẬT 3D, ÁNH SÁNG & NHÂN VẬT (3D ART & VFX)
- **Bản đồ 3D Phong Cách Hóa (Three.js Stylized 3D):**
  - Cảnh quan bản sắc TP. Hồ Chí Minh:
    1. Chợ Bến Thành: Mái ngói đỏ tam cấp, tháp đồng hồ 4 mặt vươn cao, cửa vòm nam truyền thống.
    2. Phố đi bộ Nguyễn Huệ: Trục đá hoa cương lát hoa văn, đài phun nước hoa sen phát sáng, hàng cây me & cây sao xanh mát.
    3. Đường chân trời Skyline: Tháp Bitexco (đài quan sát búp sen vươn ra) và Landmark 81 (khối kiến trúc 81 bậc vươn mây).
    4. Xưởng Bếp Trung Tâm: Chuẩn ISO & ATVSTP với ống khói bốc hơi nghi ngút.
    5. Dòng xe máy giao thông chạy theo làn với đèn xe lướt nhẹ.
    6. Các ô vạch xanh 3D phát sáng neon đánh dấu điểm đỗ bán hàng hợp lệ.
  - Kiến trúc Dual Renderer: Ưu tiên Three.js WebGL khi có hỗ trợ, tự động fallback mượt mà sang lớp Canvas 2D/2.5D Isometric chi tiết nếu chạy trong môi trường headless (Node.js test) hoặc thiết bị yếu.
- **Linh vật Cơm Nắm trong suốt 100%:**
  - Loại bỏ hoàn toàn nền đen của `linh_vat_1`, giữ trọn vẹn lá rong biển và hạt cơm.
  - Hiệu ứng nhún bước chân (bounce) theo hàm $\Delta y = |\sin(\omega t)| \cdot h_{\text{bounce}}$ và bóng đổ mềm mượt (radial gradient shadow) cố định dưới mặt đất.
  - Mô hình 4 cấp phương tiện: Đi bộ (thùng gỗ), Xe đạp có giỏ, Xe máy tay ga chở thùng giữ nhiệt ISO, Xe tải lạnh.
- **Ánh sáng Ngày/Đêm & Thời tiết Sài Gòn:**
  - Ánh sáng chuyển sắc 24h: Nắng trưa (vàng rực) $\rightarrow$ Hoàng hôn (cam tím) $\rightarrow$ Đêm sâu (xanh tím thẫm, bật đèn đường, LED biển hiệu, pha xe).
  - Cơn mưa rào Sài Gòn bất chợt: Hạt mưa nghiêng, mặt đường ướt loang bóng phản chiếu.
  - Kỹ xảo hạt (Particle VFX): Khói cơm nóng bốc lên từ bếp/thùng xe, đồng xu vàng 3D bay hút về phía ví HUD khi giao dịch thành công.

---

## 3. ĐẶC TẢ CÔNG THÁI HỌC MOBILE & ÂM THANH ASMR (UX & AUDIO)
- **Công thái học Mobile & iPad:**
  - Áp dụng `100dvh` (Dynamic Viewport Height) chuẩn xác.
  - Tự động ẩn hoàn toàn cụm phím điều khiển ảo (Joystick và cụm nút hành động) khi mở bất kỳ cửa sổ nào (`kitchenModal`, `marketModal`, `phoneModal`, `dailyBillModal`, `onlineQuickMenu`, `brandNameModal`), tự động phục hồi khi đóng modal.
  - Bếp ASMR: Chuyển danh sách 15 vị trên màn hình nhỏ thành thanh cuộn ngang 1 dòng gọn gàng để nhường 65% diện tích cho bàn chế biến; đổi hướng dẫn sang "CHẠM & GIỮ NGÓN TAY...", rung phản hồi `navigator.vibrate(50)` và đóng dấu vàng ISO & ATVSTP phát sáng khi hoàn thành mẻ cơm.
  - HUD & Minimap: Tách rời hoàn toàn đèn trạng thái kết nối Online khỏi khung Minimap; thu gọn cụm nút hành động góc dưới phải thành nút tròn công thái học dễ bấm bằng ngón cái.
- **Hệ thống Âm thanh Native Web Audio:**
  - Tiếng xèo xèo bếp nấu, tiếng nén khuôn, tiếng giòn bọc rong biển, tiếng ting nhận tiền, tiếng còi xe đô thị.
  - Nút Mute/Unmute tiện ích trên HUD (lưu vào localStorage).

---

## 4. MÁY TRẠNG THÁI HỮU HẠN GIAO DIỆN CẢM ỨNG (TOUCH UI FSM)

```
              ┌────────────────────────────────────────────────────────┐
              │                                                        │
              ▼                                                        │ (Đóng Modal)
   [TRẠNG THÁI: PHỐ PHƯỜNG]                                            │
   (HUD hiển thị, Minimap tách rời,                                    │
    Phím ảo Virtual Touch HIỆN nếu là Touch device)                    │
              │                                                        │
              │ (Mở Bếp ASMR / Chợ / Điện Thoại / Hóa Đơn / Dialog)     │
              ▼                                                        │
   [TRẠNG THÁI: CỬA SỔ PHÂN HỆ] ───────────────────────────────────────┘
   (Phím ảo TỰ ĐỘNG ẨN HOÀN TOÀN: virtualTouchControls.classList.add('hidden'),
    Tập trung 100% diện tích thao tác cảm ứng vào nội dung cửa sổ)
```

---

## 5. MA TRẬN TRƯỜNG HỢP BIÊN (EDGE CASES)
1. **Thiết bị không hỗ trợ WebGL hoặc Headless JSDOM:** Module 3D tự động kích hoạt chế độ Fallback Canvas 2D/2.5D Isometric, không bao giờ văng lỗi `getContext('webgl') is null`.
2. **Trình duyệt chặn rung hoặc Audio Autoplay:** Bao bọc bằng try-catch và kiểm tra `navigator.vibrate`, kích hoạt audio qua tương tác người dùng đầu tiên (click bắt đầu).
3. **Màn hình siêu nhỏ (iPhone SE 375px):** Thanh chọn 15 vị cuộn ngang 1 dòng mượt mà, không bị ngắt dòng làm che khuất bàn chế biến cơm.
4. **Mở đồng thời nhiều modal:** Cờ quản lý modal tập trung, đảm bảo phím ảo chỉ phục hồi khi tất cả modal đều đã đóng.

---
*Bản đặc tả đã được phê duyệt bởi Hội Đồng 12 Chuyên Ngành. Chuyển giao sang [9. SENIOR STAFF ENGINEERS] triển khai.*
