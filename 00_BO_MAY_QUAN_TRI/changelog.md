# 📜 NHẬT KÝ PHIÊN BẢN ĐÃ ĐƯỢC SẾP DUYỆT (CHANGELOG)
**Cơ quan kiểm duyệt cuối:** `[RELEASE GATE - Hội Đồng Nghiệm Thu]`  
**Cơ quan thẩm quyền tối cao:** `SẾP (Người dùng)` — Mọi mục chỉ được ghi vào đây sau khi có lệnh **"SẾP DUYỆT"**!

---

## 🏆 PHIÊN BẢN: v2.7.0-PROD (CHÍNH THỨC XUẤT XƯỞNG: HỆ THỐNG THÁCH ĐẤU 1V1 CÓ ĐỒNG THUẬN, KẾT BẠN, CHAT ĐA KÊNH, BẢNG XẾP HẠNG TỶ PHÚ & ĐỘI NGŨ CHUYÊN TRÁCH MOBILE STUDIO)
- **Ngày ghi nhận:** 24/11/2026
- **Trạng thái:** Nghiệm thu **100% PASS (115/115 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Hệ Thống Thách Đấu 1v1 Bắt Buộc Đồng Ý / Từ Chối (`server/server.js`, `src/network.js`, `src/onlineUI.js`):**
     - Hộp thoại chọn thể thức (*Gói Cơm ASMR Chuẩn ISO 30s* hoặc *Bóc Rong Biển Tốc Độ*) và mức cược (*0đ, 50.000đ, 200.000đ*).
     - Thẻ thông báo nổi trên màn hình đối thủ (`#pvpInviteNotification`) với thanh đếm lùi 15s tự đóng và 2 nút cảm ứng lớn: ✅ Đồng Ý và ❌ Từ Chối.
     - Cơ chế đồng thuận nghiêm ngặt: Từ chối hoặc hết giờ sẽ hủy phòng và gửi thông báo lịch sự `"[Tên] đang bận bán hàng, đã từ chối lời mời"`. Khi đồng ý, hệ thống trừ tiền cược của cả 2, đưa vào phòng `roomId`, đồng bộ tiến độ thời gian thực `pvp:score_update` và trao thưởng cho người thắng.
  2. **Hệ Thống Kết Bạn & Trò Chuyện Đa Kênh (`server/server.js`, `src/network.js`, `src/onlineUI.js`, `src/state.js`):**
     - Gửi/nhận lời mời kết bạn trực quan qua thẻ nổi `#friendInviteNotification` và lưu bền vững vào `state.friends`.
     - Tự động đối chiếu trạng thái trực tuyến với máy chủ (hiển thị nhãn 🟢 Online kèm chi nhánh hoặc ⚪ Ngoại tuyến), hỗ trợ nút nhắn tin và thách đấu nhanh.
     - Tích hợp 2 tab Chat trong iGiri OS: *Chat Cộng Đồng* và *Chat Riêng Bạn Bè* (kèm chấm đỏ tin chưa đọc), cùng *Widget Chat nổi 2 dòng* góc màn hình khi đi phố.
     - Tối ưu Mobile: Tự động ẩn phím ảo điều khiển khi mở chat hoặc focus input; hàng nút câu nhanh 1 chạm; phòng thủ phím Space cho phép gõ dấu cách và tiếng Việt trọn vẹn.
  3. **Bảng Xếp Hạng Tỷ Phú Top 50 Thời Gian Thực (`server/server.js`, `src/onlineUI.js`):**
     - Tính Tổng Tài Sản Ròng = Tiền mặt + Giá trị tài sản Xưởng ISO, Xe và các Chi nhánh.
     - Vinh danh Huy chương Vàng (🥇), Bạc (🥈), Đồng (🥉) cho Top 1–2–3, hiển thị Tên thương hiệu, Chi nhánh (TP.HCM, Đắk Lắk, TP. Vinh, Hà Nội), Cấp độ và Tổng Tài Sản.
     - Bộ lọc đa vùng miền Toàn Quốc / Theo Chi Nhánh và nút Kết Bạn / Thách Đấu trực tiếp với người chơi online.
  4. **Thành Lập Đội Ngũ 4 Chuyên Trách Mobile Game Studio & Sạch Bóng Lỗi Giao Diện:**
     - Tách rời hoàn toàn nút Điện thoại iGiri khỏi cụm nút hành động bên phải.
     - Bố cục góc trên bên phải chia làm 3 hàng độc lập (Hàng 1: Đồng hồ & 3 nút HUD -> Hàng 2: Đèn 🟢 Online -> Hàng 3: Khung MINIMAP). Zero Overlap.
     - Bếp ASMR cấu hình `max-height: 86dvh` chống cắt mất 2 nút đáy trên mọi WebView Zalo/Safari.
  5. **Kiểm Thử Kịch Bản 2 Client Socket.io Thật & Mô Phỏng Va Chạm Hình Học (`verify_system.mjs`):**
     - Tự động chạy `verify_system.mjs` mô phỏng 2 Client Socket.io thật: mời thách đấu -> từ chối, mời lại -> đồng ý vào cùng phòng 1v1, kết bạn -> chat có dấu cách, BXH Tỷ Phú sắp xếp giảm dần 100%.
     - Kiểm tra va chạm hình học `getBoundingClientRect()` trên Desktop (1440x900) và iPhone (375x812) đạt 100% PASS (0 lỗi).
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.6.0-PROD (CHÍNH THỨC XUẤT XƯỞNG: HỆ THỐNG ONLINE MULTIPLAYER REAL-TIME, MÁY CHỦ HỢP NHẤT CỔNG 3000, ĐỒNG BỘ 2 NGƯỜI CHƠI THẬT, ĐẤU TRƯỜNG 1V1, HỢP TÁC CO-OP & ĐÈN BÁO TRẠNG THÁI HUD)
- **Ngày ghi nhận:** 24/11/2026
- **Trạng thái:** Nghiệm thu **100% PASS (111/111 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Máy Chủ Thời Gian Thực Hợp Nhất Cổng 3000 (`server/server.js`, `server.js`):**
     - Hợp nhất dịch vụ Web tĩnh và Socket.io Real-time trên cùng cổng `3000`, kích hoạt đầy đủ CORS (`origin: "*"`).
     - Phục vụ trực tiếp thư viện `/socket.io/socket.io.js` (tự động nhận diện npm socket.io hoặc khởi chạy lightweight fallback engine).
     - Quản lý phân phòng độc lập theo từng thành phố (`hcm`, `daklak`, `vinh`, `hanoi`), tự động đồng bộ danh sách người chơi trực tuyến, Top Doanh Thu, Top Danh Vọng, phòng Đấu Trường 1v1 và Quỹ Đơn Hàng Đại Tiệc Co-op liên tỉnh.
  2. **Hiển Thị & Tương Tác Trực Quan Người Chơi Khác Trên Bản Đồ (`src/network.js`, `src/characterRenderer.js`, `src/main.js`):**
     - Đặt Tên Thương Hiệu / Chi Nhánh tự do khi vào game hoặc đổi tên trong ứng dụng Cộng Đồng.
     - Đồng bộ và vẽ Canvas toàn bộ người chơi khác theo tọa độ camera thế giới `(x - camera.x, y - camera.y)`: hiển thị linh vật Onigiri, phương tiện đang cưỡi (`vehicle: vehicleId`), hướng quay (`facing`), bảng tên nổi và bong bóng biểu cảm tương tác.
     - Menu tương tác nhanh trên phố: Bấm vào người chơi khác để gửi Emote (Vẫy tay 👋 / Tặng tim ❤️ / Cổ vũ 🎉), Ghé thăm xưởng hoặc Mời thách đấu 1v1.
  3. **Đèn Báo Trạng Thái Online Trực Quan Trên HUD (`index.html`, `style.css`, `src/network.js`):**
     - Hiển thị cố định tại thanh điều hướng trên cùng: `🟢 Online (X người chơi)` khi kết nối thành công với máy chủ Node.js và `⚪ Offline (Chế độ đơn)` khi mất kết nối.
     - Tự động chuyển đổi mượt mà sang chế độ giả lập Bot AI nếu máy chủ chưa bật hoặc mất mạng, đảm bảo trò chơi không bao giờ bị gián đoạn hay báo lỗi Console.
  4. **Ứng Dụng "Cộng Đồng Online" 3 Tab Trên Điện Thoại iGiri OS (`src/onlineUI.js`):**
     - **Tab 1 – Bảng Xếp Hạng Live:** Xếp hạng Top 20 đại gia cơm nắm giàu nhất và uy tín nhất server theo thời gian thực.
     - **Tab 2 – Đấu Trường 1v1 (Bếp Tốc Độ & Bóc Rong Biển):** Ghép cặp người chơi thi đấu gói cơm ASMR trong 30 giây, trao thưởng tiền mặt và điểm Danh Vọng cho người chiến thắng.
     - **Tab 3 – Hợp Tác Đơn Đại Tiệc (Co-op):** Mở đơn hàng sự kiện quy mô lớn (300 nắm cơm toàn server trong 10 phút), cho phép mọi người chơi online góp cơm từ thùng xe vào đơn chung và nhận thưởng chia theo tỷ lệ đóng góp khi hoàn thành 100%.
  5. **Mô Phỏng & Kiểm Thử Tự Động Toàn Diện Với 2 Người Chơi Thật (`verify_system.mjs`):**
     - Nâng cấp suite kiểm thử lên **111 bài test PASS tuyệt đối (100.0% PASS, 0 FAIL, 0 LỖI)**.
     - Bổ sung kịch bản 8.10: Khởi động 2 Client Socket.io đồng thời (`Player_1` và `Player_2`), cho `Player_1` di chuyển tọa độ và xác nhận `Player_2` nhận được đúng tên, xe và tọa độ mới của `Player_1` qua mạng thời gian thực.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.5.0-PROD (CHÍNH THỨC XUẤT XƯỞNG: TUYẾN 20 NHIỆM VỤ 4 GIAI ĐOẠN, HỢP ĐỒNG ĐẶT TIỆC ĐỘNG 3 PHÚT & BẢNG 12 THÀNH TỰU BUFF VĨNH VIỄN)
- **Ngày ghi nhận:** 24/11/2026
- **Trạng thái:** Nghiệm thu **100% PASS (98/98 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Chuỗi 20 Nhiệm Vụ Cốt Truyện Dài Hạn (4 Giai Đoạn Tuyến Tính):**
     - **Giai đoạn 1 – Khởi nghiệp vỉa hè (NV 1–5):** Nấu 5 nắm cơm tại Bếp ASMR, Nhập hàng Chợ Đầu Mối, Bán đủ 3 phân khúc giá (20k – 22k – 25k), Mua xe đạp lăn bánh và Vượt qua 1 ngày không bị phạt trật tự đô thị (Nhận danh hiệu *"Công Dân Gương Mẫu 🚴"*).
     - **Giai đoạn 2 – Làm chủ xưởng TP.HCM (NV 6–10):** Nâng cấp Xe máy thùng giữ nhiệt (Cấp 5), Duy trì Uy tín ISO $\ge 90\%$, Doanh thu tích lũy đạt 5.000.000đ, Mở khóa dây chuyền bọc màng tam giác tự động (Auto Level $\ge 2$), Nâng cấp Chi nhánh Trụ sở TP.HCM lên Cấp 3 (Nhận danh hiệu *"Ông Chủ Xưởng Sài Gòn 🏢"*).
     - **Giai đoạn 3 – Chinh phục chuỗi cung ứng (NV 11–15):** Hoàn thành chuỗi 5 đơn giao hàng hỏa tốc trong 60s, Sở hữu Xe tải lạnh bảo ôn (Cấp 8), Đạt 500 điểm Danh vọng thương hiệu, Ký hợp đồng tiệc lớn đầu tiên, Tích lũy 50.000.000đ tiền mặt (Nhận danh hiệu *"Vua Chuỗi Cung Ứng 🚚"*).
     - **Giai đoạn 4 – Tập đoàn toàn quốc (NV 16–20):** Mở khóa Chi nhánh Đắk Lắk (Buôn Ma Thuột), Nâng cấp Đắk Lắk Cấp 3, Mở khóa Chi nhánh Cửa ngõ Miền Trung TP. Vinh, Mở khóa Chi nhánh Thủ đô Hà Nội, Nâng cấp Chi nhánh Hà Nội lên Cấp 5 để hoàn thành Đại Đế Chế Cơm Nắm Toàn Quốc (Nhận danh hiệu *"Đại Đế Vương Ẩm Thực 🍙👑"*).
     - **Cơ chế Bảo vệ Chống Nhận Trùng Lặp (Zero Double-Claim):** Cờ khóa an toàn `isClaiming` 300ms kết hợp kiểm tra `completedIds.includes(qId)`, chuyển `activeId` tuần tự mượt mà.
  2. **Hệ Thống Hợp Đồng Đặt Tiệc & Nhiệm Vụ Động (Dynamic Party Contracts):**
     - Tab "Hợp Đồng" trên Smartphone iGiri OS, tự động làm mới sau mỗi 3 phút (180.000 ms) gồm 3 hợp đồng thuộc 3 độ khó: Dễ (Easy), Trung bình (Medium), Khó (Hard).
     - Yêu cầu giao tổ hợp nhiều vị cơm khác nhau cùng lúc với số lượng lớn (VD: 8 Gà Teriyaki 22k + 8 Cá hồi mayo 25k + 10 Thanh cua 20k + 6 Bò phô mai tan chảy 25k).
     - Cơ chế kiểm định ngặt nghèo về độ tươi trung bình ($\ge 85\%$ đối với tiệc VIP Khó), chỉ cho phép bàn giao khi thùng xe đáp ứng đồng thời cả số lượng và chuẩn tươi ISO.
     - Khấu trừ chính xác số lượng cơm trong kho xe khi bàn giao, cộng tiền mặt lớn, EXP và Danh vọng.
  3. **Bảng 12 Thành Tựu & Danh Hiệu Kèm Buff Vĩnh Viễn (Permanent Buffs):**
     - Tab "Thành Tựu" gồm 12 cột mốc danh giá: *Bàn Tay Vàng ASMR, Không Một Lỗi Phạt, Vua Giờ Cao Điểm, Ông Trùm 4 Tỉnh Thành, Bậc Thầy Đóng Gói, Thợ Săn Hợp Đồng, Vua Hỏa Tốc, Vua Doanh Thu, Tốc Độ Bàn Thờ, Uy Tín Đỉnh Cao, Nhà Đầu Tư Chợ Lớn, Đại Đế Chế Cơm Nắm*.
     - Kích hoạt các Buff Vĩnh Viễn cộng dồn trực tiếp vào hệ thống: $+5\%$ tốc độ làm cơm tại bếp, $-15\%$ tốc độ tăng cảnh báo đô thị, $+5\%$ tiền bán lẻ mọi phân khúc, $+10\%$ doanh thu thụ động toàn quốc, $+10\%$ tốc độ xưởng tự động, $+8\%$ tiền thưởng tiệc, $+10\text{s}$ gia hạn đơn hỏa tốc, $+5\%$ EXP toàn cục, $+10\%$ tốc độ di chuyển phương tiện, $+15\%$ thời gian giữ độ tươi cơm nắm, $-5\%$ giá nhập sỉ Chợ Đầu Mối, $+10\%$ toàn bộ chỉ số.
  4. **Kiểm Thử & Mô Phỏng Tự Động Toàn Diện:**
     - Nâng cấp `verify_system.mjs` đạt **98/98 bài kiểm thử PASS (100% PASS, 0 FAIL, 0 WARN)**.
     - Kiểm tra toàn diện FSM 4 giai đoạn nhiệm vụ, kiểm tra độ tươi hợp đồng khó, kiểm tra kích hoạt buff thành tựu và bảo lưu vị trí cuộn `scrollTop` khi re-render danh sách.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.4.0-PROD (TUYẾN 20 NHIỆM VỤ CỐT TRUYỆN 4 GIAI ĐOẠN, HỢP ĐỒNG ĐẶT TIỆC 3 PHÚT, 12 THÀNH TỰU BUFF VĨNH VIỄN & KHẮC PHỤC TRIỆT ĐỂ LỖI ĐƠ CẢNH BÁO TRẬT TỰ ĐÔ THỊ)
- **Ngày ghi nhận:** 24/11/2026
- **Trạng thái:** Nghiệm thu **100% PASS (92/92 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Khắc Phục Triệt Để Lỗi Đơ Vòng Lặp & Ngắt Chu Kỳ Phạt Vô Tận (One-Shot Trigger):**
     - **Dập Tắt Cảnh Báo Ngay Lập Tức:** Ngay tại thời điểm `urbanWarning >= 100` (hoặc `heatLevel >= 100`), dòng code đầu tiên bắt buộc phải thực thi ngay: đặt `urbanWarning = 0; heatLevel = 0; isSelling = false; isOpen = false; heatWarned = false; warningBeepTimer = 0;` và gọi `closeSelling()` trước khi chạy âm thanh hay tính phạt.
     - **Bảo Vệ Tự Do Di Chuyển (`player.canMove = true`):** Sau khi xử phạt và hiển thị banner thông báo trên màn hình, nhân vật và phương tiện tiếp tục di chuyển bình thường, không bị khóa cứng bàn phím hay joystick ảo.
     - **Bọc Try-Catch Toàn Diện:** Toàn bộ vòng lặp `GameApp.loop()` và logic tính giờ cao điểm, tính khoảng cách, phát Web Audio còi hụ cảnh sát và trừ tiền phạt trong `state.applyUrbanPenalty()` đều được bọc trong các khối `try ... catch` độc lập, bảo đảm không bao giờ làm gián đoạn nhịp 60fps của `requestAnimationFrame`. Tuyệt đối không dùng `window.alert()`.
     - **Bộ Lọc Chống Spam Âm Thanh:** Còi cảnh báo `playWarningBeep()` và còi hụ `playPoliceSiren()` (cùng các alias `playWarning()`, `playSiren()`, `playAlarm()`) trong `src/audio.js` tích hợp bộ đệm thời gian chống nghẽn audio buffer mỗi khung hình.
  2. **Chuỗi 20 Nhiệm Vụ Cốt Truyện Dài Hạn (4 Giai Đoạn Tuyến Tính):**
     - **Giai đoạn 1 – Khởi nghiệp vỉa hè (NV 1–5):** Bếp ASMR, Chợ đầu mối, 3 phân khúc giá (20k, 22k, 25k), sắm xe đạp và 1 ngày kinh doanh không bị phạt trật tự đô thị.
     - **Giai đoạn 2 – Làm chủ xưởng TP.HCM (NV 6–10):** Nâng cấp xe máy thùng giữ nhiệt, Uy tín ISO $\ge 90\%$, tích lũy doanh thu 5 triệu đồng, mở khóa dây chuyền bọc màng tam giác tự động, phát triển chi nhánh TP.HCM Cấp 3.
     - **Giai đoạn 3 – Chinh phục chuỗi cung ứng (NV 11–15):** Hoàn thành chuỗi 5 đơn giao hàng hỏa tốc, sở hữu xe tải lạnh bảo ôn, đạt 500 điểm Danh vọng, ký hợp đồng tiệc lớn đầu tiên, tích lũy 50 triệu đồng tài sản.
     - **Giai đoạn 4 – Tập đoàn toàn quốc (NV 16–20):** Mở khóa và nâng cấp lần lượt các chi nhánh Đắk Lắk (Cấp 3), TP. Vinh (Cấp 3) và Hà Nội (Cấp 5) để hoàn thành đại đế chế.
     - **Bảo vệ Zero Double-Claim:** Nhận thưởng an toàn (+tiền, +EXP, chuyển activeId kế tiếp), ngăn chặn tuyệt đối tình trạng spam click nhận thưởng nhiều lần.
  3. **Hệ Thống Hợp Đồng Đặt Tiệc & Nhiệm Vụ Động (Dynamic Party Contracts):**
     - Tab "Hợp Đồng" mới trên Smartphone iGiri OS, tự động làm mới mỗi 3 phút (180.000 ms) gồm 3 hợp đồng thuộc 3 phân hạng: Dễ, Trung bình, Khó.
     - Yêu cầu giao tổ hợp nhiều vị cơm khác nhau với số lượng lớn (VD: 8 Gà Teriyaki 22k + 8 Cá hồi mayo 25k + 10 Thanh cua 20k) kèm điều kiện độ tươi tối thiểu $\ge 85\%$.
     - Khấu trừ chính xác số lượng cơm đạt chuẩn trong kho xe khi bàn giao, thưởng lớn tiền mặt và EXP.
  4. **Bảng Thành Tựu & Danh Hiệu Kèm Buff Vĩnh Viễn (12 Cột Mốc Sự Nghiệp):**
     - Tab "Thành Tựu" gồm 12 cột mốc danh giá: *Bàn Tay Vàng ASMR, Không Một Lỗi Phạt, Vua Giờ Cao Điểm, Ông Trùm 4 Tỉnh Thành, Bậc Thầy Đóng Gói, Thầu Tiệc Chuyên Nghiệp, Vua Hỏa Tốc, Vua Doanh Thu, Tốc Độ Bàn Thờ, Uy Tín Đỉnh Cao, Nhà Đầu Tư Chợ Lớn, Đại Đế Chế Cơm Nắm*.
     - Kích hoạt cộng dồn các chỉ số nội tại vĩnh viễn (+5% tốc độ làm cơm, +15% thời gian giữ độ tươi cơm, -5% giá nhập chợ, +10% tốc độ xe...).
  5. **Mở Rộng Kịch Bản Kiểm Thử Tự Động verify_system.mjs:**
     - Tăng tổng số bài kiểm thử lên **92 bài** (100% PASS, 0 FAIL).
     - Kiểm thử chuyên sâu: Ép cảnh báo trật tự đô thị lên 100%, trừ tiền phạt duy nhất 1 lần, vòng lặp `GameApp.loop()` chạy liên tục không đơ, `player.canMove = true` và 0 lỗi Console.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.3.0-PROD (CÂN BẰNG ĐỘ KHÓ LEVEL 10, HÓA ĐƠN 23:55, ĐỘ TƯƠI ISO & KHẮC PHỤC TRIỆT ĐỂ LỖI CẢNH BÁO ĐÔ THỊ)
- **Ngày ghi nhận:** 23/11/2026
- **Trạng thái:** Nghiệm thu **100% PASS (74/74 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Khắc Phục Triệt Để Sự Cố Đơ Vòng Lặp Khi Bị Cảnh Báo Trật Tự Đô Thị (`src/selling.js`, `src/main.js`, `src/audio.js`):**
     - **Cơ chế Kích hoạt một lần (One-Shot Trigger):** Tại thời điểm `heatLevel >= 100`, biến cảnh báo lập tức được reset về `0` (`heatLevel = 0`, `heatWarned = false`, `warningBeepTimer = 0`) và đóng sạp (`closeSelling()`) ngay tại dòng lệnh đầu tiên trước khi xử lý âm thanh hay gọi trừ tiền phạt.
     - **Bảo Vệ Vòng Lặp Vĩnh Cửu (Loop Immortality):** Trong `GameApp.loop()`, bọc `sellingManager.update()` an toàn bằng `try/catch` và đưa lệnh `requestAnimationFrame(() => this.loop())` vào khối `finally` của `try ... catch ... finally`, triệt tiêu 100% rủi ro vòng lặp bị dừng do lỗi ngoại lệ.
     - **Bộ Lọc Chống Dồn Dập Âm Thanh (Audio Anti-Spam Throttling):** Còi cảnh báo và còi hụ cảnh sát trong `audio.js` được bổ sung timestamp cooldown (`lastWarningBeepTime`, `lastPoliceSirenTime`), chống nghẽn Web Audio buffer.
     - **Bảo Đảm Tự Do Di Chuyển:** Nhân vật và phương tiện tiếp tục di chuyển bình thường (`canMove = true`), không bị khóa cứng sau khi nhận thông báo phạt 150.000đ. Loại bỏ hoàn toàn `window.alert()`.
  2. **Biểu Giá Cấp Số Nhân & Mở Rộng Toàn Diện Level 1 → 10 (`src/state.js`, `src/quests.js`):**
     - Mở rộng toàn diện cấp độ nâng cấp Xưởng Bếp Thủ Công (1 $\rightarrow$ 10 nắm), Dây Chuyền Bếp Tự Động (1 $\rightarrow$ 10 nắm/15s) và 10 cấp Phương Tiện (+5% tốc độ, +5 sức chứa thùng xe mỗi cấp) với chi phí tăng theo cấp số nhân $C_n = C_1 \cdot r^{n-1}$.
     - Thiết lập ngưỡng mở chi nhánh tỉnh kèm điều kiện kép (Tiền + Level tối thiểu):
       - **Chi nhánh Đắk Lắk:** 15.000.000đ + Yêu cầu Level $\ge 8$.
       - **Chi nhánh TP. Vinh:** 40.000.000đ + Yêu cầu Level $\ge 15$.
       - **Chi nhánh Hà Nội:** 100.000.000đ + Yêu cầu Level $\ge 25$.
     - Nút mở khóa trên Smartphone iGiri hiển thị phản hồi trực quan điều kiện còn thiếu (thiếu Level hoặc thiếu tiền).
     - Điều chỉnh chu kỳ sinh tiền thụ động về chuẩn 15 giây/lần và phụ thuộc nguồn nguyên liệu trong kho.
  3. **Hóa Đơn Chi Phí Vận Hành Cuối Ngày 23:55 (Daily Operating Bill):**
     - Vào đúng 23:55 mỗi ngày trong game, hệ thống tự động tổng kết và trừ chi phí vận hành cố định (tính theo số nhân viên đang thuê + số chi nhánh đang mở + phí bảo dưỡng phương tiện).
     - Hiển thị bảng quyết toán thu/chi cuối ngày rõ ràng trên màn hình.
     - Bảo toàn tài chính: Trừ tối đa tiền mặt hiện có, **tuyệt đối không làm âm tiền** (`money >= 0`). Nếu thiếu tiền, chuyển phần còn thiếu vào `unpaidDebt` và tạm ngưng vận hành tự động (`isOperatingHalted = true`) cho đến khi người chơi kiếm đủ tiền trả hết nợ.
  4. **Cơ Chế Độ Tươi Cơm Nắm & Tiêu Chuẩn ISO / ATVSTP (`src/state.js`, `src/selling.js`):**
     - Mỗi nắm cơm xuất xưởng có chỉ số Độ Tươi (100%), suy giảm theo thời gian với tốc độ phụ thuộc loại phương tiện (đi bộ giảm nhanh nhất, xe tải lạnh bảo quản tối ưu).
     - Cơm $\ge 80\%$ độ tươi: Khách hàng thưởng thêm tiền Tip (+20% đến +40%).
     - Cơm $< 40\%$ độ tươi: Khách hàng từ chối mua và bị trừ 2 điểm Uy Tín ATVSTP.
     - Bổ sung nút "Thanh lý / Hủy hàng cũ" trong kho để loại bỏ toàn bộ cơm kém chất lượng giải phóng khoang chứa.
  5. **Đối Thủ Cạnh Tranh Ngoài Phố (AI Competitor Carts - `src/world.js`, `src/selling.js`):**
     - 1–2 xe hàng đối thủ AI tự động di chuyển và đỗ gần cổng trường / khu văn phòng vào giờ cao điểm để tranh giành khách hàng dựa trên Sức Hút (cấp xe, giá chuẩn 20k/22k/25k và độ tươi cơm).
  6. **Mở Rộng Kịch Bản Kiểm Thử Tự Động verify_system.mjs:**
     - Bổ sung kịch bản 5.5: Thử nghiệm ép cảnh báo trật tự đô thị 100%, xác nhận phạt One-Shot duy nhất 1 lần, vòng lặp tiếp diễn trơn tru và 0 lỗi Console.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.2.0-PROD (MỞ CHI NHÁNH 4 THÀNH PHỐ TOÀN QUỐC & NÂNG CẤP ĐÔ THỊ HÓA LEVEL 1 → 5)
- **Ngày ghi nhận:** 23/11/2026
- **Trạng thái:** Nghiệm thu **100% PASS (58/58 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh "SẾP DUYỆT".
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Hệ thống 4 Bản đồ Thành phố Độc Lập Toàn Quốc (`src/world.js`, `src/quests.js`, `src/state.js`):**
     - **TP. Hồ Chí Minh** (`branch_hcm` - Trụ sở mở sẵn): Chợ Đầu Mối, Cụm Trường Học, Khu Văn Phòng Q1, Phố Đi Bộ.
     - **TP. Buôn Ma Thuột - Đắk Lắk** (`branch_daklak` - 3.000.000đ): Đất đỏ bazan trứ danh, Tượng đài Ngã Sáu Ban Mê uy nghiêm trên vòng xoay trung tâm với ngôi sao vàng ⭐, bụi cây cà phê nở hoa trĩu quả đỏ chín mọng, Chợ Trung Tâm BMT và các trường học địa phương.
     - **TP. Vinh - Nghệ An** (`branch_vinh` - 5.000.000đ): Quảng Trường Hồ Chí Minh lát đá hoa cương đỏ rộng lớn, cột cờ đỏ sao vàng tung bay 🇻🇳, hai hồ sen hồng ngát hương 🪷, Đại Lộ Lê Nin rộng mở, Khu Đại Học Vinh và Chợ Vinh.
     - **TP. Hà Nội** (`branch_hanoi` - 8.000.000đ): Hồ Gươm nước xanh ngọc bích phẳng lặng, Tháp Rùa cổ kính rêu phong ở giữa hồ, Cầu Thê Húc đỏ son uốn cong nối Đền Ngọc Sơn, rặng liễu rủ xanh mát ven hồ, Khu Phố Cổ, Trường Chu Văn An và Khu Văn Phòng Cầu Giấy.
     - **Hạ tầng độc lập tại mỗi tỉnh:** Mỗi thành phố đều sở hữu đầy đủ Chợ Đầu Mối (nhập nguyên liệu) và Xưởng Bếp Chi Nhánh (sản xuất 15 vị cơm nắm chuẩn giá 20k/22k/25k) giúp người chơi hoạt động độc lập không phụ thuộc trụ sở.
  2. **Dịch Chuyển Tức Thời "✈️ Tới Thành Phố Này" (`src/main.js`, `src/quests.js`):**
     - Nút "✈️ Tới Thành Phố Này" trong Tab Đế Chế / Chi Nhánh trên Smartphone iGiri OS giúp người chơi dịch chuyển cùng xe cộ sang thành phố mới, xuất hiện an toàn trước Xưởng Bếp Chi Nhánh.
     - **Bảo toàn 100% tài sản:** Giữ nguyên tiền mặt, cấp độ RPG, kho 15 vị cơm nắm và tiến trình đồng hồ 24h.
  3. **Nâng Cấp Đô Thị Hóa (Level 1 → Level 5) & Mở Khóa Điểm Bán Hàng:**
     - **Level 1 (Hạ tầng cơ bản):** Đường nhựa 2 làn (110px), mở khóa 2 điểm bán đầu tiên. 4 điểm bán còn lại hiển thị biểu tượng ổ khóa `🔒 ĐIỂM BÁN KHÓA (Cần Chi Nhánh Cấp 2 / Cấp 4)`.
     - **Level 2–3 (Đô thị trung tâm):** Đường nhựa 4 làn (140px) có dải phân cách, mở khóa 4 điểm bán hàng.
     - **Level 4–5 (Đô thị hiện đại VIP):** Đại lộ hiện đại 6 làn xe (160px), mở khóa toàn bộ 6 điểm bán hàng (bao gồm các điểm bán VIP giá 25.000đ), dựng 4 biển quảng cáo LED neon khổ lớn phát sáng dọc đại lộ: `🍙 ONIGIRI EMPIRE 2D • CHI NHÁNH [TÊN TỈNH]`.
     - Điểm bán khóa được phòng thủ an toàn: `isInValidSellingSpot` tự động từ chối điểm bán đang khóa, người chơi không thể mở sạp tại điểm chưa mở khóa.
  4. **Cơ Chế Doanh Thu Thụ Động & Thưởng Chuỗi Chi Nhánh (Chain Synergy):**
     - Các chi nhánh không trực tiếp đứng bán vẫn tự động sinh dòng tiền thụ động mỗi 10 giây theo cấp độ.
     - Thưởng chuỗi liên kết: Mở thêm 1 chi nhánh phụ được $+10\%$, mở đủ 4 chi nhánh toàn quốc được $+30\%$ tổng doanh thu thụ động liên tỉnh.
  5. **Đồng Hồ 24h, Giờ Cao Điểm & Luật Phạt Trật Tự Đô Thị (`src/selling.js`, `src/world.js`, `src/state.js`):**
     - Đồng hồ game tỷ lệ $1\text{s}=5\text{min}$, HUD hiển thị khung giờ (`07:15 - Giờ Vàng Cổng Trường`).
     - Lớp phủ hoàng hôn/đêm sâu (18:00 - 05:30) và hệ thống đèn đường tự động bật sáng.
     - Giờ cao điểm phân theo địa bàn: Cổng trường (06:30-08:00 & 16:30-18:00), Văn phòng (11:30-13:30), Phố đi bộ (18:30-22:00 tăng khách VIP).
     - Vẽ Ô Vạch Xanh Lá hợp lệ; bán sai vị trí/sai giờ phạt trực tiếp 150.000đ (không để âm tiền, trừ danh vọng nếu thiếu tiền) và thanh Cảnh Báo Trật Tự Đô Thị tự giảm về 0% khi rời đi.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.0.0-PROD (ĐẠI TÁI CẤU TRÚC TẬP ĐOÀN KỸ THUẬT & MÔ PHỎNG TỰ ĐỘNG PRINCIPAL/TIẾN SĨ)
- **Ngày ghi nhận:** 23/11/2026
- **Trạng thái:** Nghiệm thu **100% PASS (40/40 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Nâng cấp Hệ Thống Quản Trị 8 Vai Trò Chuyên Gia Đầu Ngành (`LUAT_PHONG_BAN.md`):**
     - Nâng tầm toàn bộ quy chế lên chuẩn Tập đoàn Công nghệ lớn (Silicon Valley Enterprise Tier).
     - Bổ sung đầy đủ 8 vai trò độc lập: *Principal Designer, Chief Architect, VP of Engineering, Staff Engineers, Static Auditor, Simulation Director, Root-Cause Engineers, Release Gate*.
     - Thiết lập Ma trận phân định trách nhiệm RACI chi tiết, loại bỏ hoàn toàn cách kiểm tra qua loa bằng mắt.
  2. **Công cụ Mô Phỏng & Kiểm Thử Tự Động Tối Tân (`verify_system.mjs`):**
     - Xây dựng Headless Browser & DOM Sandbox hoàn chỉnh trên nền tảng Node.js ESM.
     - **Static Audit:** Kiểm toán cú pháp 13 tệp mã nguồn (`node --input-type=module --check`), 100% đồ thị import/export tồn tại, bảo đảm 14 ID HTML-JS cốt lõi và 100% thẻ `<button>` sở hữu `type="button"`.
     - **Server & Security Audit:** Kiểm tra máy chủ HTTP tĩnh, phân giải MIME types chính xác và ngăn chặn 100% tấn công Directory Traversal (`/../etc/passwd` ➔ 403 Forbidden).
     - **E2E Simulation:** Mô phỏng tự động luồng khởi động game, chuyển cảnh fade-out, mở Smartphone iGiri OS, chuyển 4 Tab (*Nhiệm Vụ, Hỏa Tốc, Xe & Thùng, Đế Chế*), kiểm tra cuộn dọc `overflow-y: auto`, mở Chợ Đầu Mối mua nguyên liệu trừ tiền/cộng kho và bắt toàn bộ lỗi Console.
  3. **Tối Ưu Hóa & Phòng Thủ Kiến Trúc Triệt Để (`src/main.js`):**
     - Khắc phục tận gốc hiện tượng layout thrashing DOM trong vòng lặp game 60fps tại hàm `updatePrompt()` bằng giải pháp cache `this.lastPromptKey`.
     - Bảo đảm tách bạch 100% giữa vòng lặp Canvas 60fps và cập nhật DOM/UI.
     - Bảo mật quy tắc kinh doanh: Giá bán lẻ chuẩn (20k, 22k, 25k) niêm yết minh bạch, chi phí nội bộ được cô lập an toàn.
  4. **Báo cáo Kỹ thuật Tự động Hóa (`simulation_report.md`):**
     - Tự động sinh báo cáo kết quả chi tiết từng bài test, tỷ lệ vượt qua đạt 100.0% với 0 lỗi mở và 0 ngoại lệ.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v1.3.0-PROD (BƯỚC 4: HỆ THỐNG ĐIỆN THOẠI NHIỆM VỤ GTA & NÂNG CẤP ĐẾ CHẾ TYCOON)
- **Ngày ghi nhận:** 23/11/2026
- **Trạng thái:** Nghiệm thu 0 lỗi mở từ [QA] & Sếp đã trực tiếp kiểm tra, duyệt chính thức.
- **Tính năng cốt lõi đã hoàn thiện:**
  1. **Smartphone iGiri OS 15 Pro (GTA Style) (`quests.js`, `main.js`, `style.css`):**
     - Nút biểu tượng 📱 Điện Thoại nổi bật cố định ở góc dưới bên phải màn hình kèm **chấm đỏ thông báo** khi có nhiệm vụ hoàn thành hoặc tài khoản đủ tiền mua nâng cấp tiếp theo.
     - Phím tắt `P` hoặc click để bật/tắt nhanh giao diện điện thoại; **tự động tạm khóa di chuyển nhân vật** khi điện thoại đang mở để người chơi tập trung điều hành.
     - Thiết kế giao diện Dynamic Island, notch, status bar, 3 tab điều hướng hiện đại, mượt mà trên cả PC và Mobile.
  2. **Tab 1 – Tuyến Nhiệm Vụ Cốt Truyện Theo Tiến Trình (Quests):**
     - **NV 1:** Làm 5 nắm cơm đầu tiên tại Xưởng Bếp (Thưởng: 100.000đ + 30 EXP).
     - **NV 2:** Bán thành công 5 nắm cơm tại Cổng Trường Học (Thưởng: 200.000đ + 50 EXP).
     - **NV 3:** Giao gấp 5 nắm cơm cho Khu Văn Phòng trong vòng 90 giây kể từ lúc nhận nhiệm vụ (Thưởng: 350.000đ + 80 EXP + Danh hiệu *"Vua Giao Hàng 🛵"*).
        - Có đồng hồ đếm ngược thời gian thực dạng `⏱️ mm:ss`.
        - Hết 90s chưa giao xong tự động báo thất bại và cung cấp nút *"🔄 Nhận lại"* sạch sẽ, không sinh lỗi timer chạy ngầm chồng chéo.
     - **NV 4:** Tích lũy đủ 500.000đ để mua chiếc xe đầu tiên (Thưởng: 200.000đ + 100 EXP).
     - Cơ chế chống spam click nhận thưởng tuyệt đối (Idempotency Guard) với cờ `isClaiming`.
  3. **Tab 2 – Nâng Cấp Phương Tiện & Kỹ Năng RPG (`player.js`, `characterRenderer.js`):**
     - Nâng cấp tuần tự 4 bậc: Đi bộ $\rightarrow$ Xe đạp ($300.000\text{đ}$, $+30\%$ tốc độ) $\rightarrow$ Xe máy thùng giữ nhiệt nóng ($1.000.000\text{đ}$, $+60\%$ tốc độ) $\rightarrow$ Xe tải lạnh bảo ôn ($3.000.000\text{đ}$, $+100\%$ tốc độ).
     - **Cập nhật trực quan 100% lên linh vật Onigiri:** Vẽ chi tiết xe đạp (khung thể thao, giỏ chở cơm), xe máy (yếm trắng, đèn pha, thùng giữ nhiệt cam/đỏ sau lưng), xe tải lạnh (cabin kính trong, thùng bảo ôn đông lạnh có logo bông tuyết).
     - Tự động lật gương đối xứng đúng chiều di chuyển (`facing = 1` và `-1`), đầu xe luôn hướng về phía trước theo chiều nhìn của nhân vật.
     - Thuật toán trừ tiền an toàn `deductMoney()`, tuyệt đối không bao giờ trừ tiền âm.
  4. **Tab 3 – Đế Chế Tycoon (Xưởng Bếp & Nhân Viên Tự Động):**
     - **Nâng cấp Xưởng Bếp (`kitchenASMR.js`):** Cấp 1 (Nồi cơm điện: 1 nắm/lần) $\rightarrow$ Cấp 2 (Tủ hấp khay lớn: 3 nắm/lần) $\rightarrow$ Cấp 3 (Dây chuyền tự động: 6 nắm/lần), tăng vọt công suất chế biến.
     - **Thuê Nhân Viên AI Tự Động Bán Hàng (`selling.js`):** Sinh nhân viên đội mũ bảo hiểm và tạp dề cam đứng bán tại Cổng Trường Học và Khu Văn Phòng.
     - **Dòng tiền thụ động định kỳ:** Cứ mỗi 5 giây ($5.000\text{ms}$), mỗi nhân viên tự động mang về $+15.000\text{đ}$ kèm hiệu ứng chữ bay màu xanh lá trên đầu nhân viên, duy trì ổn định $60\text{ FPS}$ (Zero Memory Leak).
  5. **Hạ Tầng & Vòng Đời Ứng Dụng (`main.js`, `state.js`, `style.css`):**
     - Khởi tạo an toàn không phụ thuộc `DOMContentLoaded` khi chạy ES Modules.
     - Hàm `ensureIntegrity()` tự động tương thích và vá dữ liệu cũ từ các phiên bản trước khi nạp LocalStorage.
     - Quy tắc `.hidden` toàn cục và phân tầng `z-index` tối ưu, loại bỏ triệt để hiện tượng che khuất nút Bắt đầu.
     - Tích hợp Local Web Server `server.js` chuẩn MIME types cho trải nghiệm mượt mà trên trình duyệt.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v1.2.0-PROD (BƯỚC 3: HỆ THỐNG ĐI BÁN HÀNG, KHÁCH HÀNG NPC & LÊN CẤP RPG)
- **Ngày ghi nhận:** 23/11/2026
- **Trạng thái:** Nghiệm thu 0 lỗi mở từ [QA] & Đã kiểm tra thực tế thành công.
- **Tính năng cốt lõi đã hoàn thiện:**
  1. **Chế độ Mở Sạp Bán Hàng Đường Phố (`selling.js`, `main.js`):**
     - Đứng tại Cổng Trường Học hoặc Khu Văn Phòng nhấn `E` để bật/tắt sạp hàng.
     - Vòng hào quang bán hàng phát sáng lan tỏa, thảm sạp caro và biển hiệu nổi.
     - Tự động đóng sạp an toàn và dọn dẹp sạch NPC khi nhân vật di chuyển xa (> 140px), chống rò rỉ bộ nhớ (Zero Memory Leak).
  2. **Khách hàng NPC Thông Minh Theo Địa Bàn (`characterRenderer.js`, `selling.js`):**
     - Cổng Trường Học: Chủ yếu sinh NPC học sinh `student` (thích Thanh Cua Mayo & Gà Teriyaki).
     - Khu Văn Phòng: Chủ yếu sinh NPC văn phòng `office` (thích Bò Phô Mai & Gà Teriyaki).
     - Tỷ lệ 15% khách tài phiệt `vip` (kính râm, hào quang vàng) ở cả 2 khu vực, trả tiền tip gấp đôi ($x2$ Tip).
     - Thuật toán xếp hàng trật tự (Anti-Stacking Queue) cách nhau $\ge 45\text{px}$, hiển thị bong bóng gọi món kèm thanh kiên nhẫn đếm ngược.
  3. **Cơ Chế Bán Hàng & Tính Tiền Đa Nền Tảng:**
     - Hỗ trợ phím `Space` (Bán nhanh), nút bấm và chạm cảm ứng trực tiếp trên NPC (PC & Touch Mobile).
     - Cơm 5 sao thưởng thêm $+30\%$ tiền Tip; khách VIP thưởng gấp đôi Tip.
     - Hiệu ứng chữ số bay lơ lửng (`+28.600đ  +15 EXP`) và tiếng chuông "Keng!" vui tai từ `audio.js`.
     - Cơ chế bảo vệ kho hàng: Hết vị trong kho hiện thông báo nhẹ, tuyệt đối không trừ kho âm.
  4. **Hệ Thống Lên Cấp RPG Hoàn Chỉnh (`state.js`, `player.js`):**
     - Tích lũy EXP và bảo lưu chính xác $100\%$ số EXP dư khi vượt ngưỡng cấp (Overflow Retention).
     - Mỗi cấp tăng vĩnh viễn $+10\%$ giá bán cơm và $+5\%$ tốc độ di chuyển của nhân vật.
     - Phát âm thanh chúc mừng `audio.playLevelUp()` và hiển thị Banner chúc mừng cùng thông số trên thanh HUD.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v1.1.0-PROD (HỆ THỐNG HÓA TRANG NHÂN VẬT & PHỤ KIỆN VECTOR)
- **Ngày ghi nhận:** 23/11/2026
- **Trạng thái:** Nghiệm thu 0 lỗi mở từ [QA] & Đã kiểm tra thực tế thành công.
- **Tính năng cốt lõi đã hoàn thiện:**
  1. **Module chuyên biệt `characterRenderer.js`:**
     - Nạp ảnh gốc linh vật thương hiệu `linh_vat_1.JPG`, giữ nguyên tỷ lệ $1811:2560$.
     - Cơ chế Override Engine: Tự động kiểm tra và ưu tiên dùng ảnh riêng nếu có trong `assets/`, nếu không có thì mặc định dùng ảnh gốc kèm phụ kiện vector vẽ bằng code.
  2. **Hỗ trợ 6 biến thể nhân vật chuẩn chỉ:**
     - `player`: Nhân vật chính, tự động đội mũ đầu bếp xếp nếp viền vàng khi ở gần Xưởng Bếp.
     - `student`: Thu nhỏ $20\%$ (scale 0.8), mũ lưỡi trai xanh thể thao + khăn quàng đỏ Đội viên.
     - `office`: Kính cận trí thức tròng phản quang + cà vạt công sở sọc xanh navy.
     - `market`: Nón lá truyền thống vàng rơm có vân nan tre và quai nón hồng đào ôm cằm.
     - `vip`: Kính râm đen bóng phong cách tài phiệt có gọng mạ vàng + hào quang vàng kim dưới chân.
     - `staff`: Mũ bảo hiểm giao hàng có kính chắn gió + tạp dề cam thương hiệu.
  3. **Đồng bộ chuyển động ma trận biến đổi:**
     - Phụ kiện lật gương đối xứng $100\%$ khi quay trái/phải (`facing = -1 / 1`), nhún nhảy đồng bộ theo bước chân, bóng đổ cố định trên mặt đất.
  4. **Hiệu năng siêu tốc:** Stress test 20 nhân vật đồng thời chỉ tốn $0.0799\text{ ms / khung hình}$ ($> 12.000\text{ FPS}$), $0$ lỗi Console.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v1.0.0-PROD (BẢN KHỞI TẠO HỆ THỐNG ĐẦY ĐỦ)
- **Ngày ghi nhận:** 23/11/2026
- **Trạng thái:** Đã nghiệm thu 0 lỗi mở từ [QA] & sẵn sàng phục vụ.
- **Tính năng cốt lõi đã hoàn thiện:**
  1. **Thế giới mở GTA 2D (`world.js`):** Bản đồ 2400x1800, giao thông xe hơi & người đi bộ AI, chu kỳ thời gian & giờ cao điểm.
  2. **Bếp ASMR cận cảnh 5 bước (`kitchenASMR.js`):** Vo gạo ST25, rắc mè giấm, nhồi 5 loại nhân, ép khuôn căn nhịp, bọc lá rong biển Nori.
  3. **Hệ thống phương tiện & nâng cấp (`state.js`, `player.js`):** Đi bộ ➔ Xe đạp ➔ Xe đẩy inox ➔ Honda Cub ➔ Food Truck VIP.
  4. **Smartphone iGiri OS 15 (`quests.js`):** Tuyến nhiệm vụ cốt truyện 5 chương, lưu danh hiệu đầu bếp.
  5. **Bộ âm thanh thủ tục (`audio.js`):** 100% Web Audio API, hiệu ứng ASMR thư giãn và nhạc nền Lo-Fi chiptune.
  6. **Bộ Máy Quản Trị 6 Phòng Ban (`00_BO_MAY_QUAN_TRI/`):** Hoàn thiện quy chế vận hành kỷ luật thép.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## ⏳ CÁC TÍNH NĂNG ĐANG CHỜ PHÊ DUYỆT CHO PHIÊN BẢN TIẾP THEO
*(Chỉ được đưa vào danh sách chính thức sau khi chạy qua đủ 6 phòng ban và nhận lệnh "SẾP DUYỆT")*
- `[Dự kiến v2.7.0]`: Hệ thống thời tiết mưa ngâu Sài Gòn & hiệu ứng trơn trượt đường phố, mở ô che mưa Onigiri.
- `[Dự kiến v2.8.0]`: Chợ Đầu Mối: Nhập sỉ nguyên liệu giá rẻ & đàm phán giá với thương lái.
