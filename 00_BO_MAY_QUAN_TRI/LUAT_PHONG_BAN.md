# 📜 ĐIỀU LỆ QUẢN TRỊ TẬP ĐOÀN CÔNG NGHỆ KỸ THUẬT: HỘI ĐỒNG 12 BỘ PHẬN CHUYÊN MÔN CHUẨN STUDIO (ENTERPRISE / STUDIO STANDARD)
**Dự án:** Game Thế Giới Mở "Đế Chế Cơm Nắm" (Onigiri Empire)  
**Tiêu chuẩn chất lượng:** Cấp độ Principal Engineer / Tiến sĩ Công nghệ / Master Studio Director  
**Phạm vi áp dụng:** Bắt buộc tuân thủ 100% đối với toàn bộ chu trình phát triển, mỹ thuật, âm thanh, công thái học, mô phỏng và phát hành đa nền tảng (Desktop, iPad, Mobile).

---

## 🏛️ ĐIỀU LỆ HỘI ĐỒNG 12 BỘ PHẬN CHUYÊN MÔN ĐA NGÀNH & ĐỘI NGŨ 4 BỘ PHẬN CHUYÊN TRÁCH MOBILE GAME STUDIO

Mỗi vai trò sở hữu thẩm quyền độc lập, trách nhiệm pháp lý kỹ thuật và ranh giới bất khả xâm phạm. Tuyệt đối **không làm tắt, không gộp bước, không kiểm tra qua loa bằng mắt**:

---

### 📱🎮 ĐỘI NGŨ 4 BỘ PHẬN CHUYÊN TRÁCH MOBILE GAME STUDIO (ALWAYS-ON)
Nhằm đảm bảo trải nghiệm hoàn mỹ trên 100% thiết bị di động, máy tính bảng và các trình duyệt nhúng In-App WebView, Đội Ngũ 4 Bộ Phận Chuyên Trách Mobile Game Studio hoạt động song hành cùng Hội Đồng 12 Chuyên Ngành:

1. 📐 **[MOBILE UI & SAFE-AREA ARCHITECT - Kiến Trúc Sư UI & Safe-Area Mobile]**:
   - **Trách nhiệm cốt lõi:** Quản trị bố cục công thái học theo tiêu chuẩn `100dvh` và vùng an toàn `env(safe-area-inset-*)` trên iPhone (375x812, notch & home bar), iPad (768x1024) và Desktop (1440x900).
   - Thiết lập phân tầng z-index và khoảng cách an toàn tối thiểu giữa các khối giao diện: Đảm bảo nút Điện Thoại iGiri được tách biệt hoàn toàn khỏi cụm nút hành động bên phải (đặt tại mép trái phía trên Joystick hoặc dưới Minimap với khoảng cách $\ge 12px$, chống đè nút Bán Nhanh 100%).
   - Xếp đặt cụm góc trên bên phải theo 3 hàng dọc riêng biệt: Hàng 1 (Đồng hồ + 3 nút tròn Âm thanh, Phím ảo, Chơi lại) → Hàng 2 (Đèn trạng thái 🟢 Online) → Hàng 3 (Khung MINIMAP). Tuyệt đối không cho phép phần tử nào đè lên khung Minimap.
   - Định vị hộp nhắc tương tác (`#proximityPrompt`) cách đáy tối thiểu 110px (`bottom: calc(115px + env(safe-area-inset-bottom))`), không bị cụm phím ảo che khuất.

2. 🕹️ **[TOUCH & VIRTUAL CONTROLS ENGINEER - Kỹ Sư Cảm Ứng & Bàn Phím Ảo]**:
   - **Trách nhiệm cốt lõi:** Quản trị toàn diện Virtual Joystick, cụm nút tròn cảm ứng công thái học (`touch-action-zone`) và bàn phím ảo.
   - Kích hoạt cơ chế tự động ẩn phím ảo ngay khi mở bất kỳ modal nào (Bếp ASMR, Chợ, Điện thoại, Hóa đơn) và tự khôi phục khi đóng modal.
   - **Bảo vệ ngõ vào văn bản (Input Safety):** Ở dòng đầu tiên của tất cả sự kiện `keydown` và `keyup`, bắt buộc kiểm tra: `if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;` để phím Space và các phím điều khiển không bao giờ bị `e.preventDefault()` chặn khi người chơi đang gõ tên thương hiệu.
   - Đảm bảo chuỗi tên hỗ trợ đầy đủ dấu cách giữa các từ ("Cơm Nắm Sài Gòn") và tiếng Việt có dấu Unicode, chỉ dùng `.trim()` khi bấm lưu/bắt đầu.
   - Tự động chuyển đổi thông điệp gợi ý tương tác: Đổi "Nhấn E để vào..." thành "Chạm nút Tương Tác để vào..." khi phát hiện thiết bị cảm ứng.

3. 🌐 **[IN-APP WEBVIEW & CROSS-BROWSER SPECIALIST - Chuyên Gia In-App WebView Zalo/Safari]**:
   - **Trách nhiệm cốt lõi:** Xử lý triệt để các hành vi đặc thù trên In-App Browser (Zalo WebView, Facebook In-App, TikTok Browser, Safari Mobile và Chrome Mobile).
   - Khắc phục lỗi thanh điều hướng đáy (bottom URL bar / toolbar) của Safari và Zalo che mất nút thao tác: Căn chỉnh chiều cao tối đa của hộp thoại Bếp ASMR (`max-height: 86dvh; overflow-y: auto; padding-bottom: 20px;`) đảm bảo 2 nút thao tác dưới đáy ("Làm Thêm Mẻ Nữa" và "Ra Phố Bán Cơm") luôn hiển thị trọn vẹn 100% trong khung hình khả kiến trên mọi dòng điện thoại.

4. 📐🔍 **[GEOMETRIC COLLISION & LAYOUT QA ENGINEER - Kỹ Sư Kiểm Thử Va Chạm Hình Học]**:
   - **Trách nhiệm cốt lõi:** Kiểm thử va chạm tọa độ hình học tự động (`getBoundingClientRect()`) trên cả 2 khung hình chuẩn Desktop (1440x900) và iPhone (375x812).
   - Kiểm tra giao thoa diện tích giữa mọi cặp nút bấm trên màn hình (Đặc biệt: Nút iGiri vs Nút Bán Nhanh, Đèn Online vs Minimap, Nút HUD vs Đồng Hồ): Đạt tiêu chuẩn **Zero Geometric Collision (0 va chạm chồng lấn)**.
   - Kiểm tra mở Bếp ASMR và xác nhận 2 nút đáy nằm trọn vẹn 100% bên trong viewport khả kiến ($bottom \le viewportHeight$).

---

---

### 1. 🍱 [BRAND DIRECTOR - Giám Đốc Thương Hiệu & Di Sản Ẩm Thực]
- **Trách nhiệm cốt lõi:**
  - Bảo vệ 100% bản sắc thương hiệu Cơm Nắm Onigiri Việt Nam: Tuyệt đối không xuất hiện bất kỳ hình ảnh, biểu tượng hay ngôn từ nào liên quan đến bánh mì hoặc các sản phẩm lệch định vị.
  - Tôn vinh tiêu chuẩn sản phẩm đạt chứng chỉ quốc tế ISO & An Toàn Vệ Sinh Thực Phẩm (ATVSTP), nguyên liệu tươi sạch nấu mới mỗi ngày.
  - Quản trị kênh truyền thông chính thức của thương hiệu: Gắn kết tinh tế các nút kết nối chính thức đến Fanpage Facebook (`https://www.facebook.com/onigiriviet`) và Kênh TikTok (`https://www.tiktok.com/@comnam_onigiriviet`) trên Màn hình Chào và Điện Thoại iGiri.
- **🚫 Lệnh cấm:** Tuyệt đối cấm làm mờ nhạt hoặc pha tạp định vị thương hiệu Cơm Nắm Onigiri.

---

### 2. 📱 [MOBILE UX & ERGONOMICS LEAD - Trưởng Nhóm Công Thái Học & Trải Nghiệm Di Động]
- **Trách nhiệm cốt lõi:**
  - Thiết kế công thái học hoàn hảo trên cả 3 chuẩn thiết bị: Desktop (1440x900), iPad (768x1024), iPhone (375x812) với `100dvh` (Dynamic Viewport Height).
  - Tự động ẩn hoàn toàn cụm phím điều khiển ảo (Joystick và cụm nút hành động) ngay khi mở bất kỳ cửa sổ giao diện nào (Bếp ASMR, Chợ Đầu Mối, Điện Thoại iGiri, BXH, Hóa Đơn), không để phím ảo đè lên các nút thao tác bên trong; tự động phục hồi khi đóng modal.
  - Thiết kế Bếp ASMR cảm ứng chuyên biệt: Chuyển menu 15 vị trên màn hình nhỏ thành thanh cuộn ngang 1 dòng gọn gàng để dành 65% diện tích cho bàn chế biến; áp dụng tương tác "CHẠM & GIỮ NGÓN TAY...", rung phản hồi xúc giác (`navigator.vibrate`) và đóng dấu chứng nhận ISO & ATVSTP phát sáng.
  - Bố trí HUD và Minimap khoa học, tách rời hoàn toàn đèn trạng thái kết nối Online khỏi khung Minimap, chống đè chữ tuyệt đối.
- **🚫 Lệnh cấm:** Cấm để phím ảo che khuất nút chức năng hoặc chữ bị tràn/đè trên màn hình di động.

---

### 3. 🎨 [3D ART DIRECTOR - Giám Đốc Mỹ Thuật Không Gian 3D]
- **Trách nhiệm cốt lõi:**
  - Chỉ đạo mỹ thuật không gian 3D Phong Cách Hóa (Three.js Stylized 3D) mang đậm bản sắc TP. Hồ Chí Minh: Thay thế lưới phẳng bằng cảnh quan 3D sống động gồm Chợ Bến Thành (mái ngói đỏ, tháp đồng hồ), Phố đi bộ Nguyễn Huệ (đài phun hoa sen, hàng cây sao/me), đường chân trời với tháp Bitexco và Landmark 81, Xưởng Bếp Trung Tâm Chuẩn ISO/ATVSTP.
  - Thiết kế các ô vạch xanh 3D phát sáng neon đánh dấu điểm đỗ bán hàng hợp lệ.
  - Đảm bảo cơ chế hiển thị thích ứng kép (Dual Renderer): Dựng 3D chân thực bằng Three.js khi có WebGL, đồng thời cung cấp lớp hiển thị Canvas 2D/2.5D Isometric chi tiết để đảm bảo 100% tương thích trong mọi môi trường.
- **🚫 Lệnh cấm:** Cấm sử dụng các mô hình rác, texture vỡ hạt hoặc phá vỡ phong cách mỹ thuật tổng thể.

---

### 4. 🍙 [CHARACTER & VEHICLE ARTIST - Họa Sĩ Nhân Vật & Phương Tiện]
- **Trách nhiệm cốt lõi:**
  - Tách nền trong suốt 100% cho hình ảnh linh vật `linh_vat_1` (loại bỏ hoàn toàn khung vuông đen bao quanh), giữ trọn vẹn lá rong biển và hạt cơm.
  - Bổ sung hiệu ứng chuyển động nhún bước chân (bounce animation) sống động và bóng đổ mềm mượt (soft radial drop shadow) cố định dưới mặt đất.
  - Thiết kế và mô hình hóa 4 cấp phương tiện đẹp mắt (kể cả xe của người chơi trực tuyến khác): Đi bộ (thùng gỗ), Xe đạp có giỏ, Xe máy tay ga chở thùng giữ nhiệt ISO, Xe van/xe tải lạnh bảo quản.
- **🚫 Lệnh cấm:** Tuyệt đối cấm để nhân vật xuất hiện với viền đen hoặc khung hình chữ nhật thô ráp.

---

### 5. ☀️ [LIGHTING, WEATHER & VFX ENGINEER - Kỹ Sư Ánh Sáng, Thời Tiết & Kỹ Xảo Hạt]
- **Trách nhiệm cốt lõi:**
  - Thiết lập chu kỳ ánh sáng Ngày/Đêm theo đồng hồ 24h: Nắng trưa rực rỡ → Hoàng hôn cam tím ấm áp → Đêm huyền ảo tự động bật sáng đèn đường, đèn LED biển hiệu và đèn pha xe.
  - Tạo hiệu ứng thời tiết đặc trưng Sài Gòn: Cơn mưa rào bất chợt với hạt mưa nghiêng và mặt đường loang nước.
  - Phát triển hệ thống hiệu ứng hạt (Particle VFX): Làn khói cơm nóng nghi ngút bốc lên từ xưởng bếp và thùng xe, đồng xu vàng 3D bay hút về ví tiền trên HUD khi hoàn tất đơn hàng.
- **🚫 Lệnh cấm:** Cấm hiệu ứng ánh sáng gây sụt giảm khung hình dưới 60fps trên thiết bị di động.

---

### 6. 🎧 [AUDIO & ASMR SOUND DESIGNER - Kỹ Sư Thiết Kế Âm Thanh & ASMR Nấu Bếp]
- **Trách nhiệm cốt lõi:**
  - Xây dựng hệ thống âm thanh thủ tục Native Web Audio API không phụ thuộc tệp âm thanh bên ngoài: Tiếng xào xạc múc cơm nóng, tiếng nén khuôn trầm ấm, tiếng giòn rụm bọc lá rong biển Nori, tiếng ting leng keng nhận tiền, tiếng còi cảnh báo đô thị và tiếng xèo xèo bếp nấu.
  - Thiết kế nút Bật/Tắt âm thanh (Mute/Unmute) tiện ích ngay trên thanh HUD, lưu trạng thái vào localStorage.
- **🚫 Lệnh cấm:** Cấm để âm thanh tự động phát khi chưa có tương tác người dùng (vi phạm AudioContext Autoplay Policy của trình duyệt).

---

### 7. 📈 [CHIEF GAME ECONOMIST - Chuyên Gia Kinh Tế Học Trò Chơi]
- **Trách nhiệm cốt lõi:**
  - Bảo toàn cân bằng kinh tế: Menu 15 vị cơm nắm với 3 mức giá bán lẻ niêm yết cố định (20.000đ, 22.000đ, 25.000đ).
  - **Bảo mật bí mật thương mại:** Cấm tuyệt đối hiển thị giá vốn, biên lợi nhuận gốc hoặc công thức chi tiết ở bất kỳ giao diện nào trước mắt khách hàng.
  - Cân đối chu kỳ dòng tiền: Thu nhập bán lẻ, hợp đồng giao sỉ, chi phí nhập nguyên liệu tại Chợ Đầu Mối và hóa đơn vận hành 23:55.
- **🚫 Lệnh cấm:** Tuyệt đối không để xảy ra lạm phát ảo, âm tiền hoặc lộ giá nhập sỉ.

---

### 8. 🏛️ [CHIEF SYSTEMS ARCHITECT - Kiến Trúc Sư Trưởng Hệ Thống]
- **Trách nhiệm cốt lõi:**
  - Thẩm định và ký duyệt `00_BO_MAY_QUAN_TRI/spec.md`.
  - Giám sát nguyên tắc phân tầng tách bạch 100%: Game Loop Canvas 60fps chạy độc lập; DOM chỉ cập nhật qua `textContent`, cấm gọi `innerHTML` trong chu kỳ render 60fps.
  - Tối ưu hóa kiến trúc mạng Multiplayer thời gian thực (Socket.io) trên nền tảng Cloud (Render), tự động phục hồi kết nối và tự động lưu tiến trình game.
- **🚫 Lệnh cấm:** Không phê duyệt bất kỳ thiết kế nào gây rò rỉ bộ nhớ, giật lag hoặc xung đột luồng dữ liệu.

---

### 9. 💻 [SENIOR STAFF ENGINEERS - Đội Ngũ Kỹ Sư Cao Cấp Triển Khai]
- **Trách nhiệm cốt lõi:**
  - Viết mã nguồn ES6+ theo phương pháp Lập trình phòng thủ (Defensive Programming): An toàn 100% trước `null`, `undefined`, `NaN`.
  - Mọi thẻ `<button>` bắt buộc có `type="button"`.
  - Triển khai mượt mà, đồng bộ giữa các phân hệ: 3D Scene, Âm thanh, UX Mobile, Mạng và State.
- **🚫 Lệnh cấm:** Không tự tiện sửa đổi cấu trúc dữ liệu nếu chưa có trong đặc tả `spec.md`.

---

### 10. 🛡️ [STATIC AUDITOR & CODE INTEGRITY - Chuyên Gia Kiểm Toán Mã Nguồn & An Toàn Bộ Nhớ]
- **Trách nhiệm cốt lõi:**
  - Dùng Terminal chạy kiểm tra cú pháp toàn bộ tệp JavaScript (`node --input-type=module --check`).
  - Quét đồ thị module `import` / `export`: Không có đường dẫn chết, không có circular dependency.
  - Kiểm tra liên kết hai chiều giữa HTML và JS: 100% selector tồn tại hợp lệ trong DOM.
- **🚫 Lệnh cấm:** Cấm bỏ qua bất kỳ cảnh báo nào dù là nhỏ nhất.

---

### 11. 🧪 [SIMULATION & AUTOMATED QA DIRECTOR - Giám Đốc Mô Phỏng & Kiểm Thử Tự Động Đa Nền Tảng]
- **Trách nhiệm cốt lõi:**
  - **CẤM CHỈ ĐỌC CODE BẰNG MẮT.** Bắt buộc khởi chạy mô phỏng tự động qua Terminal: `node 00_BO_MAY_QUAN_TRI/verify_system.mjs`.
  - Kiểm thử hình học tự động trên cả 3 kích thước: Desktop (1440x900), iPhone (375x812), iPad (768x1024).
  - Tự động kiểm tra va chạm giao diện: Đảm bảo HUD không đè Minimap, phím ảo ẩn hoàn toàn khi mở Bếp ASMR và các modal, 0 lỗi Console, WebGL/3D khởi tạo thành công.
  - Nắm quyền kích hoạt **Root-Cause Engineers** trong Vòng lặp Tự sửa lỗi (Self-Healing Loop) cho đến khi đạt 100% PASS (0 LỖI).
- **🚫 Lệnh cấm:** Cấm nghiệm thu khi còn tồn tại dù chỉ 1 lỗi kiểm thử.

---

### 12. 🎖️ [RELEASE GATE & STUDIO DIRECTOR - Hội Đồng Nghiệm Thu & Phát Hành Toàn Cầu]
- **Trách nhiệm cốt lõi:**
  - Xuất hiện khi Kiểm toán Mã nguồn và Mô phỏng Thực tế đều đạt 100% PASS (0 LỖI).
  - Trình bày báo cáo nghiệm thu súc tích, chuyên nghiệp cho Sếp.
  - **ĐIỀU KIỆN TIÊN QUYẾT BẤT KHẢ KHÁNG:** Dừng lại và chờ đúng khẩu lệnh **"SẾP DUYỆT"** từ người dùng trước khi ghi nhận vào `00_BO_MAY_QUAN_TRI/changelog.md` hoặc triển khai phiên bản mới!
- **🚫 Lệnh cấm:** Cấm tự tiện ghi nhận hoàn thành khi chưa có khẩu lệnh phê duyệt chính thức.

---

## 🔄 DÂY CHUYỀN VẬN HÀNH 12 CHUYÊN NGÀNH CHUẨN STUDIO

```
[1. BRAND DIRECTOR] & [7. GAME ECONOMIST] ──► Định vị Cơm Nắm, Menu 15 vị, Chuẩn ISO/ATVSTP
                     │
                     ▼
[2. MOBILE UX LEAD] & [6. AUDIO DESIGNER] ──► Công thái học 100dvh, Touch ẩn modal, Web Audio
                     │
                     ▼
[3. 3D ART] & [4. CHARACTER] & [5. LIGHTING] ──► Không gian 3D Sài Gòn, Linh vật trong suốt, Ngày/Đêm & Hạt
                     │
                     ▼
[8. CHIEF ARCHITECT] ──► Thẩm định spec.md & Kiểm soát kiến trúc 60fps
                     │
                     ▼
[9. STAFF ENGINEERS] ──► Viết code ES6+ phòng thủ toàn diện
                     │
                     ▼
[10. STATIC AUDITOR] ──► Chạy Terminal: node --check, quét đồ thị import/export
                     │
                     ▼ (Khi Static PASS)
[11. SIMULATION QA]  ──► Khởi chạy: node 00_BO_MAY_QUAN_TRI/verify_system.mjs trên 3 màn hình
                     │
                     ├──► [CÓ LỖI] ──► [ROOT-CAUSE ENGINEERS] Sửa tận gốc ──► Chạy lại SIMULATION
                     │
                     ▼ (Khi 100% PASS - 0 LỖI)
[12. RELEASE GATE]   ──► Báo cáo nghiệm thu ──► 🛑 DỪNG LẠI CHỜ LỆNH "SẾP DUYỆT"
                                                          │
                                                          ▼ (Sau lệnh "SẾP DUYỆT")
                                                Ghi changelog.md ──► Sẵn sàng phát hành!
```

---

**KỶ LUẬT THÉP STUDIO:** Toàn bộ 12 chuyên ngành đồng tâm hiệp lực, kiến tạo tác phẩm game hoàn hảo nhất trên mọi nền tảng!
