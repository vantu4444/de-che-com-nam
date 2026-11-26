# 📜 NHẬT KÝ PHIÊN BẢN ĐÃ ĐƯỢC SẾP DUYỆT (CHANGELOG)
**Cơ quan kiểm duyệt cuối:** `[RELEASE GATE - Hội Đồng Nghiệm Thu]`  
**Cơ quan thẩm quyền tối cao:** `SẾP (Người dùng)` — Mọi mục chỉ được ghi vào đây sau khi có lệnh **"SẾP DUYỆT"**!

---

## 🏆 PHIÊN BẢN: v2.9.3-PROD (CHÍNH THỨC XUẤT XƯỞNG: ĐIỀU HƯỚNG XE CAROUSEL DESKTOP & MOBILE, TỰ ĐỘNG CHẠY AUTOPILOT GIAO HÀNG & SỬA LỖI HƯỚNG DẪN CHE NÚT)
- **Ngày ghi nhận:** 26/11/2026
- **Thông điệp phát hành:** Fix vehicle horizontal navigation on desktop/mobile, add delivery quest auto-pilot and resolve tutorial spotlight overlap
- **Trạng thái:** Nghiệm thu **100% PASS (96/96 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Điều Hướng Danh Sách Nâng Cấp Xe Toàn Diện Desktop & Mobile (`src/quests.js`, `style.css`):**
     - **Hai nút điều hướng lớn ◀ và ▶:** Bổ sung `#btnVehiclePrev` và `#btnVehicleNext` ở hai bên khung danh sách xe, hiệu ứng viền neon `#38bdf8`, click chuột trượt mượt mà từng nhóm xe qua `scrollBy({ left: ..., behavior: 'smooth' })`, tự động disabled khi chạm đầu/cuối danh sách.
     - **Lăn con lăn chuột (Mouse Wheel deltaY):** Tự động chuyển đổi thao tác lăn chuột dọc thành cuộn ngang mượt mà (`scrollLeft += e.deltaY`) khi đặt chuột vào danh sách xe.
     - **Nhấn giữ chuột kéo ngang (Drag-to-Scroll):** Hỗ trợ `mousedown` / `mousemove` / `mouseup` kéo trượt xe tự nhiên như vuốt cảm ứng trên di động.
     - **Cơ chế chống kích hoạt nhầm (Anti-Misclick):** Tự động chặn click kích hoạt nhầm nút Mua/Chọn xe khi kết thúc thao tác kéo rê chuột.
     - **Thanh cuộn Desktop cao cấp (`style.css`):** Tùy biến thanh cuộn ngang `overflow-x: auto` hiển thị rõ nét trên màn hình Desktop (`@media (min-width: 769px)`), kèm mẹo gợi ý tương tác và đảm bảo giữ trọn vẹn bố cục vuốt mượt mà trên Mobile (`375x812`).
     - Bao quát trọn bộ 10 cấp xe từ *Đi bộ $\rightarrow$ Xe đạp $\rightarrow$ Xe đạp điện $\rightarrow$ Xe Cub 50cc $\rightarrow$ Xe máy thùng giữ nhiệt ISO $\rightarrow$ Xe ba gác $\rightarrow$ Xe bán tải $\rightarrow$ Xe tải $\rightarrow$ Xe tải lạnh B2B $\rightarrow$ Xe công nghệ Cyber Food-Pod*.
  2. **Tự Động Dẫn Đường & Tự Chạy Tới Điểm Giao Hàng AutoPilot (`src/player.js`, `src/city3D.js`, `src/quests.js`, `src/main.js`, `index.html`):**
     - Bổ sung khung theo dõi nhiệm vụ `#hudQuestTracker` trên HUD ngoài màn hình chính và các thẻ giao hàng / điểm bán trong `iGiri` với nút **`🏃 Chạm để tự chạy tới`**.
     - Nhân vật/xe tự động quay hướng và di chuyển chuẩn xác tới tọa độ đích.
     - Hiệu ứng 3D Isometric mặt đất: Dải Laser Neon xanh ngọc chuyển động nhấp nháy dẫn đường kèm vòng cờ đích phát quang 🏁.
     - Thanh trạng thái trực quan: **`🧭 Đang tự chạy tới... (Chạm cần lái để hủy)`**, người chơi chỉ cần chạm Joystick ảo hoặc phím di chuyển là lập tức hủy tự chạy, trả lại toàn quyền điều khiển tay; tự động dừng và hoàn tất giao hàng khi tới cách đích $\le 35\text{px}$.
  3. **Khắc Phục Triệt Để Lỗi Hướng Dẫn Spotlight Che Nút Bấm (`src/tutorial.js`, `style.css`):**
     - Lớp màn tối/khung đèn rọi cấu hình `pointer-events: none !important;` giúp thao tác chạm xuyên qua mượt mà xuống nút mục tiêu.
     - Nút mục tiêu tự động nâng lên `z-index: 99996 !important; pointer-events: auto !important;`.
     - Thẻ chữ hướng dẫn `#spotlightChatBubble` & `#tutorialCard` tự động né nút: Nếu nút ở nửa dưới màn hình (Mở Sạp, Bán Cho Khách, Joystick, iGiri), thẻ chữ tự động nhảy lên sát mép trên màn hình (`top: calc(16px + env(safe-area-inset-top, 0px))`); nút ở nửa trên thì đặt thẻ chữ ở mép dưới, tuyệt đối không bao giờ đè lên nút đang chỉ.
  4. **Nghiệm Thu Toàn Diện 96/96 Test (100% PASS) (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - Vượt qua 100% các bài kiểm thử tĩnh & tương tác E2E trên 3 độ phân giải (Desktop 1440x900, iPhone 375x812, iPad 768x1024), 0 Console Errors.
     - Chuẩn thương hiệu: 100% Cơm Nắm Onigiri, chuẩn ISO 22000 & ATVSTP, không bánh mì, không lộ giá vốn/công thức.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.9.2-PROD (CHÍNH THỨC XUẤT XƯỞNG: LIÊN MINH 4 KHU VỰC, ĐỘI XE LẠNH B2B & CẦU NỐI ĐỔI QUÀ THỰC TẾ O2O)
- **Ngày ghi nhận:** 26/11/2026
- **Thông điệp phát hành:** Add 4-region guilds, B2B cold-chain fleet and O2O real-world voucher system
- **Trạng thái:** Nghiệm thu **100% PASS (95/95 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Liên Minh 4 Khu Vực & Đại Chiến Chi Nhánh (`src/state.js`, `server/server.js`, `src/quests.js`, `style.css`):**
     - Bổ sung Tab **`🛡️ Liên Minh`** trong Điện Thoại `iGiri`: Cho phép người chơi gia nhập 1 trong 4 tập đoàn đại diện cho 4 chi nhánh toàn quốc (**TP. Hồ Chí Minh, Đắk Lắk, TP. Vinh, Hà Nội**).
     - **Đơn Xuất Khẩu & Đại Tiệc Liên Minh (450 Nắm):** Gom cơm nắm chuẩn ISO thuộc đủ 3 nhóm giá bán lẻ (`20.000đ`, `22.000đ`, `25.000đ` — giữ kín công thức và giá vốn). Thành viên đóng góp cơm vào tiệc để nhận **Rương Thưởng Uy Tín** (`+500.000đ`, `+100 Uy Tín`, `+1000 EXP`) và kích hoạt buff **giảm 25% thời gian nấu của Bếp toàn hội trong 24h**.
     - Bảng xếp hạng doanh số đại chiến giữa 4 khu vực cập nhật thời gian thực.
  2. **Hệ Thống Hậu Cần B2B & Đội Xe Tải Lạnh Tự Động Chuẩn ISO (`src/state.js`, `src/city3D.js`, `src/quests.js`, `src/main.js`, `style.css`):**
     - Mở khóa khi đạt **Cấp Xưởng 3 trở lên** (`kitchenTier >= 3`).
     - Cho phép đầu tư thêm Xe Tải Lạnh Composite bảo ôn âm độ (tối đa 3 xe, `500.000đ/xe`). Xe tự động nhận cơm từ kho xưởng và xuất bến giao sỉ hợp đồng tới Căn-tin Trường Học, Chuỗi Siêu Thị Tiện Lợi & Khu Văn Phòng.
     - Mô phỏng 3D Isometric độc quyền: Xe tải lạnh composite màu trắng tuyết chuẩn ISO 22000, đèn LED gầm xanh cyan làm mát âm độ, biển hiệu mang thương hiệu người chơi chạy trên đường phố 3D (`src/city3D.js`), tự sinh doanh thu B2B định kỳ (`+15%` tip hợp đồng chuỗi).
     - Công tắc Auto-Dispatch: Tự động xếp cơm từ kho xưởng và xuất bến khi xe sẵn sàng.
  3. **Cầu Nối Đổi Quà Thực Tế (O2O) & Nâng Cấp Trang Quản Trị `/admin` (`src/state.js`, `src/quests.js`, `server/server.js`, `style.css`):**
     - Bổ sung Tab **`🎁 Đổi Quà O2O`** trong `iGiri`: Dùng Điểm Uy Tín đổi 4 gói quà thực tế áp dụng tại 4 chi nhánh (Voucher 10k, Voucher Mua 1 Tặng 1, Combo VIP 4 Vị 100k, Thẻ Vàng 15%).
     - Tự động sinh mã định danh độc nhất dạng `ONIGIRI-{BRANCH}-{RANDOM}` (VD: `ONIGIRI-HCM-8823`).
     - Trang Quản Trị `/admin` bảo mật PIN `202688`: Bổ sung Tab `[🎟️ Mã Ưu Đãi O2O]`, nút "Duyệt Dùng Tại Quầy" (`POST /api/o2o/use`), và nút **`📥 Xuất File Excel O2O (.CSV)`** với mã **UTF-8 BOM (`\uFEFF`)** không bao giờ lỗi font tiếng Việt trên Microsoft Excel.
  4. **Nghiệm Thu Toàn Diện 95/95 Test (100% PASS) (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - Toàn bộ kịch bản kiểm thử BƯỚC 6.998 đạt 100% PASS, 0 Console Errors, WebGL & 2D Canvas hoạt động hoàn hảo trên Desktop (1440x900), iPhone (375x812) và iPad (768x1024).
     - Cam kết 100% Cơm Nắm Onigiri, 15 vị, 3 mức giá (20k/22k/25k), chuẩn ISO 22000 & ATVSTP.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.9.1-PROD (CHÍNH THỨC XUẤT XƯỞNG: HƯỚNG DẪN TÂN THỦ "CẦM TAY CHỈ VIỆC" 60 GIÂY ĐẦU TIÊN – SPOTLIGHT, BÀN TAY CHỈ ĐIỂM & DẪN ĐƯỜNG VẠCH XANH)
- **Ngày ghi nhận:** 26/11/2026
- **Thông điệp phát hành:** Add 60-second interactive spotlight tutorial, hand pointer and neon wayfinding
- **Trạng thái:** Nghiệm thu **100% PASS (94/94 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Cơ Chế Đèn Rọi Spotlight & Bàn Tay Chỉ Điểm (`👆`) Trực Quan (`src/tutorial.js`, `style.css`):**
     - Kích hoạt lớp phủ tối mờ 80% `#tutorialSpotlightOverlay` khóa tạm thời tương tác ngoài luồng (`pointer-events: none`).
     - Tự động khoét khung sáng viền neon phát quang `#spotlightBorderBox` ôm sát nút mục tiêu duy nhất (`z-index: 100005`), kèm biểu tượng bàn tay `#spotlightHandPointer` (`👆`) nhấp nháy chỉ thẳng vào tâm nút và bong bóng hướng dẫn `#spotlightChatBubble`.
     - Loại bỏ nút "Tiếp theo": Hệ thống chỉ tự động chuyển bước ngay khoảnh khắc người chơi thực hiện thao tác thật trên màn hình.
     - Khi đang ở chế độ tân thủ (`body.tutorial-active`), tự động ẩn các thanh tính năng nâng cao (Radar Đua Cấp, Hợp Đồng Độc Quyền, Thông Báo Soán Ngôi) để giữ màn hình iPhone (`375x812`) cực kỳ thoáng đãng, dễ tập trung.
  2. **Kịch Bản 6 Bước "Cầm Tay Chỉ Việc" Hoàn Tất Trong 60 Giây (`src/tutorial.js`, `src/state.js`, `src/selling.js`):**
     - **Bước 1 (Thu hoạch nguyên liệu đầu tiên):** Đèn rọi nút mở Bếp $\rightarrow$ chỉ vào Ruộng Lúa Nhật chín sẵn $\rightarrow$ chạm thu hoạch lúa sạch chuẩn ISO vào kho.
     - **Bước 2 (Nấu mẻ cơm chuẩn ISO siêu tốc 3 giây):** Rút ngắn thời gian nấu còn 3 giây cho mẻ cơm đầu tiên $\rightarrow$ thu hoạch nắm cơm nóng hổi 100% tươi vào thùng xe.
     - **Bước 3 (Dải dẫn đường xanh ngọc ra Ô Vạch Xanh):** Vẽ dải mũi tên hạt phát sáng xanh ngọc trên mặt đất từ chân nhân vật nối thẳng tới Cổng trường THPT Trưng Vương (`790, 625`) kèm vòng hào quang nhấp nháy $\rightarrow$ chạm vạch xanh tự chuyển bước.
     - **Bước 4 (Bấm Mở Sạp):** Đèn rọi nút Mở Sạp $\rightarrow$ bấm mở sạp lập tức gọi 2 học sinh chạy tới xếp hàng trước quầy.
     - **Bước 5 (Chạm nút Bán Cho Khách):** Đèn rọi nút `🍙 Bán Cho Khách` $\rightarrow$ bấm bán thành công nhận `+20.000đ` bay lên kèm hiệu ứng âm thanh ting ting.
     - **Bước 6 (Hoàn tất & Mở khóa toàn bộ Đế Chế):** Bật thẻ chúc mừng `#tutorialCelebrationCard`, tặng ngay `+100.000đ Vốn Khởi Nghiệp`, mở khóa toàn diện thanh Đua Cấp, 4 Chi Nhánh, Robot 4.0 và Tủ Đồ.
     - Nút `Bỏ qua ✕` góc trên và nút `📖 Hướng Dẫn` trên thanh HUD giúp mở lại Cẩm Nang Khởi Nghiệp 6 bước bất kỳ lúc nào.
  3. **Nghiệm Thu Toàn Diện 94/94 Test (100% PASS) (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - Mô phỏng Spotlight khóa đúng mục tiêu, dải dẫn đường Canvas mượt mà, gặt lúa, nấu 3s, mở sạp có 2 học sinh xếp hàng, bán thành công cộng tiền và mở khóa đầy đủ giao diện.
     - 0 Console Error, WebGL & 2D Canvas hoạt động hoàn hảo trên Desktop (1440x900), iPhone (375x812) và iPad (768x1024).
     - Giữ vững chuẩn thương hiệu: 100% Cơm Nắm Onigiri, 15 vị, 3 mức giá (20k/22k/25k), cam kết ISO 22000 & ATVSTP.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.9.0-PROD (CHÍNH THỨC XUẤT XƯỞNG: VÁ DỨT ĐIỂM SAU TỔNG KIỂM TOÁN – BẢO MẬT MÃ PIN 202688, XUẤT FILE EXCEL CSV UTF-8 BOM & KHỞI CHẠY MÁY CHỦ CHUẨN RENDER)
- **Ngày ghi nhận:** 26/11/2026
- **Thông điệp phát hành:** Secure /admin with PIN 202688, add UTF-8 BOM CSV export and fix root start script
- **Trạng thái:** Nghiệm thu **100% PASS (92/92 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Khóa Bảo Mật Mã PIN `202688` Cho Trang Quản Trị `/admin` (`server/server.js`):**
     - Mặc định khi truy cập `/admin`, toàn bộ dữ liệu bảng khách hàng bị ẩn (`display: none`), hiển thị giao diện khóa `#pinLockView` sang trọng yêu cầu nhập đúng **Mã PIN Quản Trị (`202688`)**.
     - Nhập đúng PIN sẽ mở khóa `#dashboardView` và lưu trạng thái vào `sessionStorage`. Nhập sai báo lỗi đỏ, khóa chặt truy cập.
     - Endpoint API `GET /api/leads` và `GET /admin/export-csv` tự động xác thực `pin=202688`, trả về mã lỗi `401 Unauthorized` nếu không có hoặc sai PIN.
     - Bổ sung nút **`🔒 Khóa`** trên thanh tiêu đề để đăng xuất / khóa lại màn hình dashboard ngay lập tức.
  2. **Bộ Lọc 4 Chi Nhánh & Xuất File Excel (.CSV) UTF-8 BOM Chuẩn Tiếng Việt (`server/server.js`):**
     - Thống kê thời gian thực số lượng khách đăng ký nhận vốn +200k theo 4 chi nhánh: TP.HCM, Đắk Lắk, TP. Vinh, Hà Nội.
     - Thanh bộ lọc nhanh cho phép lọc bảng dữ liệu theo từng chi nhánh.
     - Nút **`📥 Xuất File Excel (.CSV)`** xuất toàn bộ danh sách hoặc theo chi nhánh đang chọn.
     - Tích hợp mã **UTF-8 BOM (`\uFEFF`)** ở đầu tệp CSV, đảm bảo mở trực tiếp trên Microsoft Excel (Windows/Mac) hiển thị 100% tiếng Việt có dấu hoàn hảo, không bao giờ bị vỡ font hay lỗi ký tự.
  3. **Đồng Bộ Script Khởi Chạy `package.json` Thư Mục Gốc (`package.json`):**
     - Cập nhật script `"start"` từ `"npx serve -l 3000 ."` thành **`"node server.js"`**.
     - Đảm bảo khi triển khai trên Cloud/Render dù từ Root hay thư mục con đều khởi động máy chủ hợp nhất: Express, WebSocket Socket.io, `/api/leads` và `/admin`.
  4. **Tối Ưu Hàm Nhận Trạng Thái Kết Nối Client-Server (`src/network.js`):**
     - Tại sự kiện `init_state`, loại bỏ hoàn toàn việc phát ngược tín hiệu `joinSuccess` lên server.
     - Đóng gói logic đồng bộ dữ liệu vào phương thức nội bộ **`this.handleJoinSuccess(data)`**, đảm bảo luồng Socket.io sạch bóng lỗi phát sinh.
  5. **Nghiệm Thu Toàn Diện 92/92 Test (100% PASS) (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - 0 Console Error, 0 va chạm hình học giao diện trên Desktop (1440x900) và Mobile (375x812).
     - Giữ vững thương hiệu: 100% Cơm Nắm Onigiri, 15 vị, 3 mức giá bán lẻ (20k/22k/25k), chứng chỉ ISO 22000 & ATVSTP.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.8.9-PROD (CHÍNH THỨC XUẤT XƯỞNG: TIẾN HÓA NHÂN VẬT 4 BẬC SỰ NGHIỆP, TỦ ĐỒ BIẾN HÓA LINH VẬT ONIGIRI & MỞ TÚI MÙ BLIND BOX)
- **Ngày ghi nhận:** 26/11/2026
- **Thông điệp phát hành:** Add 4-tier character evolution, skin wardrobe and Onigiri blind box
- **Trạng thái:** Nghiệm thu **100% PASS (90/90 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Hệ Thống Tiến Hóa Sự Nghiệp 4 Bậc Kèm Buff Chỉ Số Thực Tế (`src/state.js`, `src/characterRenderer.js`, `src/player.js`):**
     - Dựng trực tiếp các chi tiết ngoại hình 2D/3D lên linh vật Onigiri gốc `linh_vat_1`, mở khóa tự động theo Cấp độ và Cấp Xưởng Bếp:
       + **Bậc 1 – Tân Binh Khởi Nghiệp (Cấp 1):** Băng rôn trắng quấn đầu, tạp dề mộc, túi đeo chéo bán hàng *(Chỉ số cơ bản khởi nghiệp)*.
       + **Bậc 2 – Bếp Trưởng Chuẩn ISO & ATVSTP (Cấp 3+ & Xưởng Bếp 2+):** Mũ đầu bếp cao phồng trắng, áo bếp viền vàng, huy hiệu khiên bảo chứng **ISO & ATVSTP 🛡️** phát sáng trên ngực kèm hiệu ứng làn khói ấm nóng hổi *(**-15%** thời gian nấu & giữ độ tươi 100% lâu hơn)*.
       + **Bậc 3 – Tổng Giám Đốc Chuỗi Toàn Quốc (Cấp 6+ & Xưởng Bếp 3+):** Áo vest blazer doanh nhân sang trọng, kính râm thời trang, máy tính bảng điều hành *(**+20%** tỷ lệ gặp khách VIP tại sạp & **+10%** doanh thu thụ động chuỗi 4 chi nhánh)*.
       + **Bậc 4 – Vua Cơm Nắm Cyber Food-Tech (Cấp 10+ & Xưởng Bếp 4+):** Giáp công nghệ tương lai trắng-xanh ngọc neon, kính quét laser, ba lô phản lực jetpack lướt bay nhẹ kèm dải hào quang vàng danh giá *(**+25%** tốc độ di chuyển & tự động hút khách vào sạp nhanh hơn 20%)*.
  2. **Giao Diện Điện Thoại iGiri: Tab `🎭 Biến Hóa Nhân Vật` & Mở Túi Mù Linh Vật Onigiri (`src/quests.js`, `style.css`):**
     - Tích hợp mục **`🎭 Biến Hóa`** trong thanh Tab Bar của điện thoại `iGiri`, công thái học Mobile 100dvh, tự động ẩn phím ảo khi mở và phục hồi an toàn khi đóng.
     - **Thẻ Live Preview 2.2x trên Canvas:** Phóng to nhân vật linh vật `linh_vat_1` hiển thị đầy đủ phụ kiện theo Bậc tiến hóa và trang phục đang mặc, nhãn Bậc hiện tại, Skin đang mặc, thanh tiến trình thăng bậc sự nghiệp và 4 ô buff chỉ số thời gian thực.
     - **Bộ Sưu Tập 6 Trang Phục Linh Vật Độc Quyền:**
       1. *Bản Gốc Tiến Hóa* (Phổ Thông)
       2. *Chiến Binh Samurai Onigiri* (Hiếm - Khăn quấn trán đỏ, kiếm trúc katana sau lưng)
       3. *Thần Tài Cơm Nắm* (Sử Thi - Mũ quan cánh chuồn đỏ thêu chỉ vàng, nén vàng thỏi trên tay)
       4. *Phi Hành Gia Vũ Trụ* (Huyền Thoại - Mũ bảo hiểm kính vàng phản quang, ba lô dưỡng khí)
       5. *Robot Mecha Bạc* (Huyền Thoại - Khung giáp kim loại titan sáng bóng, mắt LED xanh dương)
       6. *DJ Neon Cyberpunk* (Thần Thoại - Tai nghe headphone phát quang, kính led cyberpunk đa sắc)
     - **🎁 Mở Túi Mù Linh Vật Onigiri (Blind Box):** Người chơi có thể dùng `50.000đ` tiền mặt hoặc `20 Uy Tín ⭐` để mở túi mù. Cơ chế chống trùng lặp thông minh: nếu trúng trang phục đã sở hữu, tự động quy đổi thành **`+15 Uy Tín ⭐ & +150 EXP`**.
  3. **Đồng Bộ Ngoại Hình Đa Người Chơi & Tượng Hologram (`server/server.js`, `src/network.js`, `src/characterRenderer.js`):**
     - Gói tin Socket.io (`joinGame`, `playerMove`, `playersUpdate`) tự động truyền nhận `evolutionTier` và `equippedSkin`.
     - Toàn bộ người chơi khác trong thế giới online nhìn thấy chuẩn xác phụ kiện tiến hóa và bộ trang phục độc quyền của nhau.
     - Giữ vững chuẩn thương hiệu: **100% Cơm Nắm**, chứng chỉ ISO & ATVSTP, không bánh mì, không lộ giá vốn/công thức.
  4. **Nghiệm Thu Toàn Diện 90/90 Test (100% PASS) (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - Giữ nguyên 100% tính năng Chat, Kết bạn, Thách đấu 1v1, Vườn nguyên liệu, Bếp hàng đợi, Robot tự động, 4 Chi nhánh toàn quốc, Tự động bán sạp, Hướng dẫn tân thủ 5 bước, Cyber Food-Tech và Tranh đoạt địa bàn vàng.
     - 0 Console Error, 0 va chạm hình học giao diện trên Desktop (1440x900) và iPhone (375x812).
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.8.8-PROD (CHÍNH THỨC XUẤT XƯỞNG: NÂNG CẤP TẦM CAO – ĐỢT 2: TRANH ĐOẠT ĐỊA BÀN VÀNG, TƯỢNG LINH VẬT 3D HOLOGRAM & ĐẤU THẦU HỢP ĐỒNG ĐỘC QUYỀN)
- **Ngày ghi nhận:** 26/11/2026
- **Thông điệp phát hành:** Add golden territory domination, 3D hologram mascot statues, exclusive supply contract bidding and royalty fee rewards
- **Trạng thái:** Nghiệm thu **100% PASS (89/89 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Hệ Thống Tranh Đoạt Địa Bàn Vàng & Tượng Linh Vật 3D Hologram (`server/server.js`, `src/city3D.js`, `src/world.js`, `src/selling.js`):**
     - Tại 4 khu vực trọng điểm (**Trường Học, Công Viên, Chợ Bến Thành, Phố Đi Bộ**) thuộc cả 4 chi nhánh (**TP.HCM, Đắk Lắk, TP. Vinh, Hà Nội**), hệ thống tự động ghi nhận sản lượng bán cơm nắm chuẩn **ISO 22000 & ATVSTP** (mỗi nắm cơm bán ra tích lũy `+10 điểm thống trị`).
     - Tự động dựng **Tượng Linh Vật Cơm Nắm 3D Hologram Vàng Kim (`linh_vat_1`)** ngay cạnh Ô Vạch Xanh: Bệ đá bát giác Hologram xoay liên tục, thân linh vật Onigiri vàng óng ánh với dải rong biển Nori vàng đồng đậm và **Vương Miện Vàng 👑 3 chóp** gắn ngọc ruby đỏ biểu trưng cho **👑 Chủ Tịch Khu Vực**.
     - **Bảng tên thương hiệu Hologram 3D lơ lửng:** Hiển thị danh xưng Chủ Tịch, điểm thống trị hiện tại (`⭐ XXXđ • +15% Vàng • +5k Tip`).
     - **Đặc Quyền Chủ Tịch Khu Vực:**
       + Hưởng đặc quyền **`+15% Doanh Thu Vàng`** khi bán tại địa bàn mình thống trị (có chữ bay vàng kim ăn mừng).
       + Nhận **`+5.000đ Tiền Bản Quyền Thương Hiệu`** mỗi khi bất kỳ người chơi nào khác mở sạp bán cơm tại khu vực của mình.
     - **Cơ Chế Soán Ngôi & Báo Thù:**
       + Khi một người chơi vượt điểm thống trị của Chủ Tịch hiện tại: Tượng Hologram lập tức đổi tên và vương miện sang tân Chủ Tịch.
       + Phát loa thông báo toàn server: **`👑 SOÁN NGÔI ĐỊA BÀN! [Tên người mới] đã chiếm lĩnh [Tên khu vực]!`**
       + Cựu chủ tịch nhận cảnh báo báo động đỏ kèm nút **`🔥 Giành Lại Địa Bàn`** (bấm vào mở ngay thách đấu 1v1 hoặc hướng dẫn đến sạp mở bán giành lại địa bàn).
  2. **Đấu Thầu Hợp Đồng Cung Ứng Độc Quyền Theo Giờ (`server/server.js`, `src/network.js`, `src/onlineUI.js`, `index.html`, `style.css`):**
     - Hệ thống tự động phát hợp đồng: *"Cung ứng 30 nắm cơm chuẩn ISO cho Trường Quốc Tế trong 5 phút"*.
     - Thẻ giao diện `#exclusiveContractWidget` hiển thị thời gian đếm ngược `⏳ 04:59`, tiến trình giao `X / 30 nắm` và nút **`🚚 Giao Cơm Thầu (Giao 5 nắm)`**.
     - Người chơi đầu tiên giao đủ 30 nắm ôm trọn **Giải Thưởng Độc Quyền (+300.000đ tiền mặt + 50 Uy Tín ⭐ + 500 EXP)**, các vị trí sau nhận thưởng khuyến khích.
     - Đảm bảo chuẩn Mobile Safe Area (375x812), chế độ thu gọn `−` / `+`, **Zero-Overlap** với Minimap, Joystick hay nút Chat.
  3. **Nghiệm Thu Toàn Diện 89/89 Test (100% PASS) (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - Giữ nguyên 100% tính năng Chat, Kết bạn, Thách đấu 1v1, Vườn nguyên liệu, Bếp hàng đợi, Robot tự động, 4 Chi nhánh toàn quốc, Tự động bán sạp, Hướng dẫn tân thủ 5 bước và Cyber Food-Tech.
     - 0 Console Error, 0 va chạm hình học giao diện trên Desktop (1440x900) và iPhone (375x812).
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.8.7-PROD (CHÍNH THỨC XUẤT XƯỞNG: NÂNG CẤP TẦM CAO – ĐỢT 1: PHONG CÁCH CYBER FOOD-TECH TƯƠNG LAI & THANH ĐUA CẤP ĐỘ SÁT SƯỜN THỜI GIAN THỰC)
- **Ngày ghi nhận:** 26/11/2026
- **Thông điệp phát hành:** Add cyber food-tech hologram zones, futuristic food pods, live rival radar bar and real-time overtake alerts
- **Trạng thái:** Nghiệm thu **100% PASS (88/88 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Nâng Cấp Thị Giác Đô Thị Cyber Food-Tech Tương Lai (`src/city3D.js`, `src/world.js`, `src/main.js`, `style.css`):**
     - Nâng cấp các **Ô Vạch Xanh Hợp Pháp** trên bản đồ 3D thành **Vùng Chiếu Hologram Công Nghệ Xanh Ngọc** (`#00f0ff` Cyan & `#10b981` Emerald), hiệu ứng quét tia sáng đa tầng chuyển động liên tục, 4 góc viền HUD công nghệ sắc sảo, biển báo phát quang chuẩn **ISO 22000** và biểu tượng khiên bảo chứng **ISO & ATVSTP 🛡️** xoay lơ lửng 3D.
     - Tích hợp mô hình **Cyber Food-Pod & Drone Giao Hàng**: Dải đèn LED neon phát quang gầm xe và Drone mini lơ lửng mang hộp cơm nắm Onigiri phát sáng phía trên nóc xe khi xưởng đạt cấp cao hoặc sở hữu xe nâng cấp.
     - Giữ vững chuẩn thương hiệu: **100% Cơm Nắm**, Menu 15 vị với 3 mức giá bán lẻ niêm yết (`20.000đ`, `22.000đ`, `25.000đ`), tuyệt đối không có bánh mì và không lộ giá vốn hay công thức.
  2. **Thanh Đua Cấp Độ Sát Sườn Thời Gian Thực (`server/server.js`, `server.js`, `src/network.js`, `src/onlineUI.js`, `index.html`, `style.css`):**
     - Thuật toán thời gian thực trên máy chủ tự động tính điểm người chơi (`score = level * 100000 + exp + round(totalRevenue / 1000)`) và gửi về Client cặp đối thủ sát sườn: **`rivalAbove`** (đối thủ xếp ngay trên 1 bậc) và **`rivalBelow`** (đối thủ bám đuổi ngay sau 1 bậc).
     - Hiển thị **Thanh Radar Đua Cấp Sát Sườn (`#rivalRadarBar`)** gọn đẹp, công thái học, nút thu gọn `−` / `+`, nút **`⚔️`** khiêu chiến trực tiếp đối thủ xếp trên mở ngay Đấu Trường 1v1.
     - Vị trí hình học an toàn chuẩn Mobile 375x812: `top: 215px; right: 10px; width: 165px;` (cách Minimap 26px $>12px$), không đè Joystick, nút `iGiri` hay nút `💬 Chat` (**Zero-Overlap**).
     - **Hiệu Ứng Vượt Mặt (Overtake Alert Banner):** Ngay khoảnh khắc người chơi vượt điểm `rivalAbove`, phát âm thanh chiến thắng `audio.playLevelUp()`, bật thông báo sang trọng `#overtakeAlertBanner`: *"🚀 VƯỢT MẶT THÀNH CÔNG! Bạn đã vượt qua [Tên đối thủ]! Vươn lên Hạng #X"*, đồng thời **thưởng nóng ngay +25.000đ tiền mặt và +10 Điểm Uy Tín ⭐** và gửi cảnh báo nhẹ nhàng tới đối thủ bị vượt mặt.
  3. **Nghiệm Thu Toàn Diện 88/88 Test (100% PASS) (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - Giữ nguyên 100% tính năng Chat, Kết bạn, Thách đấu 1v1, Vườn nguyên liệu, Bếp hàng đợi, Robot tự động, 4 Chi nhánh toàn quốc, Tự động bán sạp và Hướng dẫn tân thủ 5 bước.
     - 0 Console Error, 0 va chạm hình học giao diện trên Desktop (1440x900) và iPhone (375x812).
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.8.6-PROD (CHÍNH THỨC XUẤT XƯỞNG: TỰ ĐỘNG PHỤC VỤ TẠI SẠP, NÚT BÁN CHO KHÁCH TRỰC TIẾP & HỆ THỐNG HƯỚNG DẪN TÂN THỦ 5 BƯỚC KÈM CẨM NANG KHỞI NGHIỆP CƠM NẮM)
- **Ngày ghi nhận:** 26/11/2026
- **Thông điệp phát hành:** Add 5-step interactive tutorial system, entrepreneurship guide handbook, smart auto-serving and quick sell button
- **Trạng thái:** Nghiệm thu **100% PASS (153/153 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Đồng Bộ Kho Cơm Nắm & Tự Động Bán Thông Minh (`src/state.js`, `src/selling.js`):**
     - Bổ sung `removeRiceBallAny()` trong `src/state.js` để đọc tồn kho chính xác từ Bếp thủ công, Bếp hàng đợi thời gian và Dây chuyền Robot.
     - Cơ chế Tự Động Phục Vụ mỗi 1.5 giây (90 frames) cho khách đầu hàng, cộng tiền bán lẻ niêm yết (`20.000đ` / `22.000đ` / `25.000đ`), tiền tip độ tươi ISO ($\ge 80\%$) và tip sao.
     - Tự động mời khách đổi sang vị có sẵn trong thùng xe với lời thoại vui vẻ *"Đổi sang vị này cũng ngon chuẩn ISO! ❤️"* để giải quyết triệt để tình trạng kẹt hàng.
     - Tích hợp chuỗi Combo (x2 đến x5) khi bán liên tục trong vòng 4 giây, cộng thưởng Tip combo và hiệu ứng chữ bay rực rỡ `🔥 Combo x3! +26.000đ`.
  2. **Nút Bán Cho Khách Trực Tiếp Trên Màn Hình Khi Mở Sạp (`index.html`, `style.css`, `src/main.js`):**
     - Thêm nút `#btnQuickSellStall` nổi bật ở chính giữa màn hình đáy (`z-index: 120`), công thái học an toàn, không đè lên Joystick (góc dưới trái) hay nút `iGiri` (mép trái) trên iPhone 375x812.
     - Cập nhật trạng thái thời gian thực: Khi có khách chờ hiển thị `🍙 Bán Cho Khách (X chờ) 🔥xCombo`; khi hết sạch cơm hiển thị cảnh báo đỏ `⚠️ Hết Cơm! Vào Bếp Nấu Thêm`, chạm vào tự động mở ngay Bếp ASMR.
  3. **Hệ Thống Hướng Dẫn Tân Thủ 5 Bước Trực Quan (`src/tutorial.js`, `src/state.js`, `style.css`):**
     - Thẻ hướng dẫn nổi ở góc trên màn hình (`#tutorialCardContainer`), không che khuất nhân vật hay nút điều khiển.
     - Tích hợp nút **`Bỏ qua ✕`** để người chơi đã thành thạo có thể bỏ qua nhanh chóng (`state.skipTutorial()`).
     - Hiệu ứng viền phát sáng nhấp nháy 3 lớp (`.tutorial-pulse-target`) hướng dẫn đúng nút cần chạm.
     - Trình tự 5 bước khép kín:
       + **Bước 1 – Thu Hoạch & Gieo Trồng:** Chỉ vào Xưởng Bếp → Vườn Nguyên Liệu thu hoạch lúa Nhật/rong biển sạch đầu tiên.
       + **Bước 2 – Nấu Mẻ Cơm Nắm Chuẩn ISO:** Chọn Menu 15 vị niêm yết (20k/22k/25k), nấu chín nóng hổi chuẩn ISO và thu vào xe.
       + **Bước 3 – Tìm Ô Vạch Xanh Hợp Pháp:** Kích hoạt **Mũi tên dẫn đường phát sáng trên mặt đất (Wayfinding Arrow)** kèm khoảng cách thời gian thực (`🟢 Vạch Xanh: XXm`) dẫn thẳng tới Cổng Trường Tiểu Học Hoa Mai, giải thích luật an toàn đô thị không bị phạt.
       + **Bước 4 – Mở Sạp & Bán Cho Khách:** Hướng dẫn mở sạp tự động phục vụ hoặc bấm `🍙 Bán Cho Khách` thu tiền nhanh.
       + **Bước 5 – Khởi Đầu Đế Chế Tự Động:** Trao thưởng nóng **`+100.000đ Vốn Khởi Nghiệp Tân Thủ`** trực tiếp vào ví, giới thiệu mục tiêu nâng cấp Robot, mở chuỗi 4 chi nhánh toàn quốc và thách đấu 1v1.
  4. **Nút Mở Lại Cẩm Nang & Hướng Dẫn Bất Cứ Lúc Nào (`index.html`, `style.css`, `src/main.js`):**
     - Thêm nút **`📖 Hướng Dẫn`** (`#btnOpenTutorialGuide`) trên thanh HUD (tự co thành icon tròn trên Mobile 375x812, zero overlap).
     - Modal **Cẩm Nang Khởi Nghiệp Cơm Nắm** (`#tutorialGuideModal`): Tóm tắt trực quan 5 bước, khẳng định bản sắc 100% Cơm Nắm Onigiri, cam kết ISO 22000 & ATVSTP, tuyệt đối bảo mật giá vốn/công thức.
     - Tích hợp nút **`🔄 Chạy Lại Hướng Dẫn Từng Bước`** (`#btnRestartTutorialSteps`) cho phép người chơi xem lại từ đầu bất cứ lúc nào.
  5. **Nghiệm Thu Toàn Diện 153/153 Test (100% PASS) (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - Giữ nguyên 100% toàn bộ hệ thống Chat, Kết bạn, Thách đấu 1v1, Vườn nguyên liệu, Bếp hàng đợi và 4 Chi nhánh.
     - 0 Console Error, 0 va chạm hình học giao diện trên Desktop (1440x900), iPhone (375x812) và iPad (768x1024).
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.8.5-PROD (CHÍNH THỨC XUẤT XƯỞNG: NÂNG CẤP ĐẾ CHẾ – BƯỚC 2B: CHUỖI 4 CHI NHÁNH TỰ ĐỘNG, THU NHẬP OFFLINE 8 TIẾNG, THĂM XƯỞNG BẠN BÈ, ĐIỂM DANH 7 NGÀY & SỔ TAY TINH THÔNG 15 VỊ)
- **Ngày ghi nhận:** 26/11/2026
- **Thông điệp phát hành:** Add 4-branch automated franchise empire, offline earnings and friend workshop visits
- **Trạng thái:** Nghiệm thu **100% PASS (151/151 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Hệ Thống Mở Chuỗi 4 Chi Nhánh Tự Động & Địa Chỉ Chính Thức Chuẩn ISO (`src/state.js`, `src/quests.js`):**
     - Cập nhật địa chỉ thực tế và chứng chỉ ISO 22000 & ATVSTP cho toàn bộ 4 chi nhánh:
       + **Chi nhánh TP.HCM**: *Số 6i Đường 3B, Tân Tạo, Bình Tân* (Trụ sở chính)
       + **Chi nhánh Đắk Lắk**: *02 Nguyễn Trác, Buôn Ma Thuột* (Thủ phủ Tây Nguyên)
       + **Chi nhánh TP. Vinh**: *57 Lê Ninh, Vinh Hưng, Nghệ An* (Cửa ngõ Miền Trung)
       + **Chi nhánh Hà Nội**: *Yên Nghĩa, Hà Đông, Hà Nội* (Thủ đô Nghìn Năm Văn Hiến)
     - Mỗi chi nhánh tự động vận hành, sinh doanh thu mỗi phút theo cấp độ (Cấp 1 -> Cấp 5 hoặc 10), hiển thị trực quan cả doanh thu theo phút và theo chu kỳ 15 giây.
  2. **Cơ Chế Thu Nhập Offline Bền Vững (Tối Đa 8 Tiếng) (`src/state.js`, `src/main.js`, `style.css`):**
     - Lưu mốc `lastActiveTimestamp` tự động vào `localStorage`. Khi người chơi tắt trình duyệt hoặc đổi tab và mở lại game, hàm `calculateOfflineIncome()` tự động tính chính xác doanh thu tích lũy từ các chi nhánh đã mở trong thời gian vắng mặt (giới hạn an toàn tối đa 8 tiếng = 480 phút).
     - Bật Modal sang trọng chào đón: *"Chào Mừng Vua Cơm Nắm Trở Lại! Trong lúc bạn vắng mặt, chuỗi chi nhánh tự động đã mang về +XXX.000đ"* kèm nút nhận doanh thu to rõ chuẩn ngón cái Mobile Safe Area.
  3. **Tính Năng Thăm Xưởng Bạn Bè, Tiếp Lửa Dây Chuyền & Quầy Ký Gửi Hỗ Trợ (`src/onlineUI.js`, `server/server.js`, `src/network.js`):**
     - Thêm nút **`🏭 Thăm Xưởng`** tiện ích trên cả **Thẻ Hồ Sơ Người Chơi** và trong **Danh Bạ Bạn Bè**.
     - **`🔥 Tiếp Lửa Dây Chuyền (Giúp Bạn)`**: Cooldown 2 giờ, khi bấm giúp bạn mình rút ngắn ngay **20% thời gian chờ** của mẻ cơm đang nấu trên dây chuyền, người đi giúp nhận ngay **+15.000đ tiền mặt** và **+10 Điểm Uy Tín**.
     - Đồng bộ tín hiệu thời gian thực hai chiều giữa Client và Server qua Socket.io: `friend:boost_factory` -> `friend:boost_received`.
     - **`🛒 Quầy Ký Gửi Bạn Bè`**: Cho phép mua bán nguyên liệu sạch thừa (Gạo Koshihikari, Rong biển Nori, Thịt sạch đạt chuẩn ATVSTP) với mức giá hữu nghị niêm yết chuẩn.
  4. **Quà Điểm Danh 7 Ngày Nhận Thưởng (`src/state.js`, `src/quests.js`):**
     - Hệ thống 7 ngày điểm danh với phần thưởng giá trị tăng dần: Vốn khởi nghiệp, Nguyên liệu sạch, Quỹ đầu tư và Thẻ Tăng Tốc Dây Chuyền 1h (giảm 50% thời gian nấu).
     - Tự động mở popup mời nhận thưởng khi vào game.
  5. **Sổ Tay Tinh Thông 15 Vị Cơm Nắm (`src/state.js`, `src/quests.js`):**
     - Theo dõi số lượng đã nấu và đã bán của trọn bộ 15 vị (chuẩn 3 mức giá bán lẻ 20.000đ, 22.000đ, 25.000đ chuẩn ISO & ATVSTP, tuyệt đối không lộ giá vốn hay công thức).
     - Tự động mở khóa các cấp độ **Sao Tinh Thông (1 - 3 sao)**: Mốc 10 nắm (1★: -5% thời gian nấu), Mốc 50 nắm (2★: -5% thời gian nấu, +10% tip VIP), Mốc 200 nắm (3★: -10% thời gian nấu, +20% tip VIP).
  6. **Nghiệm Thu Toàn Diện 151/151 Test (100% PASS) (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - Bảo toàn 100% Chat, Kết bạn, Thách đấu 1v1, Vườn nguyên liệu Bước 1 và Bếp nấu hàng đợi.
     - 0 Console Error, 0 va chạm giao diện trên Desktop (1440x900), iPhone (375x812) và iPad (768x1024).
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.8.4-PROD (CHÍNH THỨC XUẤT XƯỞNG: NÂNG CẤP ĐẾ CHẾ – BƯỚC 1: KHỞI NGHIỆP TỪ NHỎ NHẶT, VƯỜN NGUYÊN LIỆU ĐẾM NGƯỢC & DÂY CHUYỀN BẾP HÀNG ĐỢI NÓNG HỔI CHUẨN ISO)
- **Ngày ghi nhận:** 26/11/2026
- **Thông điệp phát hành:** Add 4-tier factory evolution and automated farming/cooking robots
- **Trạng thái:** Nghiệm thu **100% PASS (144/144 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Khởi Nghiệp Khiêm Tốn & Tiến Trình Mở Khóa 15 Vị (`src/state.js`, `src/kitchenASMR.js`):**
     - Thiết lập cơ ngơi khởi nghiệp Cấp 1 ban đầu: **1 ô Ruộng lúa Nhật**, **1 giàn Rong biển Nori**, **1 ô Bếp thủ công** và túi giữ nhiệt ban đầu chở **`6 nắm cơm`** (`VEHICLES.walk.capacity = 6`).
     - Menu 15 vị mở khóa chuẩn mực: mở sẵn **3 vị cơ bản 20.000đ** (`Thanh cua trứng mayo`, `Chả cá`, `Trứng xúc xích mayo`).
     - Khóa **12 vị còn lại** kèm điều kiện mở khóa minh bạch theo **Cấp độ Xưởng & Điểm Uy Tín** (nhóm 20k mở rộng, 22k yêu cầu Xưởng 4, VIP 25k Bò Phô Mai Tan Chảy yêu cầu Xưởng 5 & Uy Tín 350 ⭐), tạo động lực phấn đấu rõ rệt, tuyệt đối không lộ giá vốn hay công thức.
  2. **Khu Vườn Nguyên Liệu Sạch Có Thời Gian Chờ & Tự Cung Tự Cấp (`src/kitchenASMR.js`, `src/state.js`):**
     - Tích hợp Tab **`🌱 Vườn Nguyên Liệu`** ngay trong Xưởng Bếp.
     - Cho phép gieo trồng **Lúa Nhật (45 giây)**, **Rong Biển (60 giây)**, và mở khóa **Trại Gà Sạch (3 phút)**, **Trại Bò Sữa Mayo (2 phút)**, **Trại Bò Úc (4 phút)**, **Cá Hồi Na Uy (5 phút)** khi nâng cấp Xưởng.
     - Hiển thị thanh tiến trình và thời gian đếm ngược thời gian thực trên từng ô; khi chín kích hoạt hiệu ứng viền vàng phát sáng lấp lánh (`@keyframes pulseGlow`) kèm nút **`✨ THU HOẠCH (+10 KHO BẾP)`**.
     - Cho phép dùng tiền lãi mở rộng tối đa **6 ô đất** và nâng cấp **Hệ Thống Tưới Tự Động** (giảm 30% thời gian sinh trưởng). Vẫn giữ Chợ Đầu Mối làm kênh mua nhanh bổ sung.
  3. **Dây Chuyền Bếp Nấu Hàng Đợi (Queue) & Huy Hiệu Nóng Hổi Chuẩn ISO (`src/kitchenASMR.js`, `src/state.js`, `src/main.js`):**
     - Nấu cơm theo hàng đợi thời gian thực: **20s cho vị 20k**, **45s cho vị 22k**, **90s cho vị VIP 25k**.
     - Cho phép xếp nhiều mẻ vào bếp, thoải mái rời bếp ra phố bán hàng, giao đơn hỏa tốc, chat hay kết bạn trong lúc chờ nấu.
     - Khi cơm chín: Có tiếng chuông báo `Ting!`, hiển thị huy hiệu đỏ nổi bật **`♨️ Nóng Hổi Chuẩn ISO & ATVSTP`** và nút **`✨ Thu Hoạch Vào Xe`** với độ tươi đạt chuẩn 100%.
     - Mở rộng thêm ô bếp (tối đa **4 ô bếp**) và nâng cấp **Máy Ép Khuôn Bán Tự Động** (giảm **40% thời gian nấu**).
  4. **Tính Bền Vững Thời Gian (Timestamp Persistence) & Đồng Bộ Thời Gian Thực (`src/state.js`, `src/main.js`):**
     - Lưu trữ tiến trình gieo trồng và nấu nướng theo mốc `Date.now()` vào `localStorage`. Khi nạp lại trang hoặc chuyển tab, thời gian trôi qua vẫn được tính toán chính xác, không mất tiến trình.
     - Trong vòng lặp `loop()` của game, cập nhật `state.updateFarm()` và `state.updateKitchenSlots()` liên tục.
  5. **Bảo Toàn Công Thái Học Mobile & Nghiệm Thu 144/144 Test (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - Bảo toàn 100% hệ thống Chat, Kết bạn, Thách đấu 1v1.
     - Tự động ẩn phím ảo điều khiển ngoài phố khi mở Xưởng Bếp / Vườn và tự động phục hồi khi rời bếp.
     - Toàn bộ giao diện khóa trong `max-height: 90dvh`, không cắt nút trên iPhone (375x812) và Desktop (1440x900).
     - Đạt 144/144 bài kiểm thử 100% PASS, tuyệt đối 0 Console Errors.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.8.3-PROD (CHÍNH THỨC XUẤT XƯỞNG: KHÔI PHỤC HÌNH ẢNH KHÁCH HÀNG NPC TỚI SẠP 3D & 2D, BONG BÓNG GỌI MÓN 15 VỊ NIÊM YẾT GIÁ BÁN LẺ & CẦM CƠM RỜI ĐI)
- **Ngày ghi nhận:** 26/11/2026
- **Trạng thái:** Nghiệm thu **100% PASS (139/139 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Khôi Phục Luồng Sinh Khách Tức Thì & Di Chuyển Xếp Hàng Sát Sạp (`src/selling.js`):**
     - Sinh ngay lập tức khách hàng đầu tiên ngay khi bấm nút **"Mở Sạp"** hoặc nhấn phím `E`.
     - Điều chỉnh nhịp độ sinh khách mới liên tục, nườm nượp: **45 - 65 frames** (~0.8s - 1.1s), sức chứa hàng 4 - 5 khách (xóa bỏ hoàn toàn mức nghẽn 1000 frames / 17s cũ).
     - Khách hàng số 0 đứng mua hàng cách sạp chỉ **`50px`** ($< 80\text{px}$), các khách sau nối đuôi cách nhau 40px, bước đi nhịp nhàng từ vỉa hè tiến thẳng vào sạp và quay mặt về phía người bán (`facing = -1`).
     - Tự động nhận diện chuẩn xác đối tượng khách theo từng chi nhánh & spot: Học sinh tại trường học/công viên, dân công sở tại khu văn phòng/chợ Bến Thành, khách VIP tại Phố Đi Bộ.
  2. **Hiển Thị Hình Ảnh Khách Hàng Sống Động Trên Cả 3D và 2D (`src/city3D.js`, `src/characterRenderer.js`):**
     - Đồng bộ danh sách khách hàng lên cảnh 3D Stylized Saigon (`city3D.js`) qua hàm `renderCustomer3D` và `renderSellingCustomers`: phép chiếu tọa độ 3D `projectToScreen`, bóng đổ mềm mại dưới chân, bước chân nảy 3D Isometric sống động (`bounce = Math.abs(Math.sin(stepCycle)) * 4`).
     - Đa dạng màu sắc trang phục (`characterRenderer.js`): Bổ sung `colorVariation` giúp học sinh đổi màu mũ thể thao (xanh dương, cam, xanh lá, tím), dân công sở luân phiên màu áo và cà vạt (đỏ đô, xanh navy, xanh mint, hổ phách), mang lại không khí đường phố rực rỡ, đông vui.
  3. **Bong Bóng Gọi Món Chuẩn Thương Hiệu 100% Cơm Nắm & Biểu Cảm Hài Lòng (`src/selling.js`):**
     - Bong bóng gọi món nổi bật **`114px x 34px`** viền cam sang trọng: Dòng 1 hiển thị Icon `🍙` + Tên vị viết hoa chuẩn mực trong Menu 15 vị; Dòng 2 niêm yết rõ ràng giá bán lẻ **`20.000đ`** / **`22.000đ`** / **`25.000đ`** kèm chứng nhận `• ISO 22000` (tuyệt đối không lộ giá vốn/công thức, không có chữ bánh mì).
     - Hiệu ứng sau giao dịch thành công: Khách cầm trên tay nắm cơm tam giác Onigiri nhỏ xinh `🍙` (`isHoldingOnigiri = true`), bong bóng biểu cảm hài lòng màu xanh mint phát sáng (*"Ngon chuẩn ISO! ❤️"*, *"Tươi nóng hổi! 🍙"*, *"Tuyệt vời! ⭐"*), chữ bay **`+20.000đ`** / **`+22.000đ`** / **`+25.000đ`** và âm thanh nhận tiền leng keng vui tai.
  4. **Nhận Diện Mở Sạp Thông Minh Trên 100% Mọi Ô Vạch Xanh (`src/main.js`):**
     - Cả nút cảm ứng `btnTouchStall` và phím tắt `E` đều kiểm tra liên thông `getNearbyRegion`, `isInValidSellingSpot` và `isInsideLegalZone`, đảm bảo đứng trong bất kỳ Ô Vạch Xanh nào trên cả 4 chi nhánh (TP.HCM, Đắk Lắk, Vinh, Hà Nội) đều mở sạp thành công 100%.
  5. **Kiểm Toán Kịch Bản E2E 5 Giây Thực Tế (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - Bổ sung kịch bản 5.8: Mở sạp 5s tại Ô Vạch Xanh Trường Học Hoa Mai có $\ge 2$ khách xuất hiện, khách tới sát sạp ($50.35\text{px} < 80\text{px}$), bán hàng giảm kho đúng 1 nắm và tăng tiền chuẩn xác, **`100% PASS`**, **`0 Console Errors`**.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.8.2-PROD (CHÍNH THỨC XUẤT XƯỞNG: BỘ BA TƯƠNG TÁC ONLINE TOÀN DIỆN – CHAT 1 CHẠM, KẾT BẠN XÁC NHẬN & THÁCH ĐẤU 1V1 REAL-TIME)
- **Ngày ghi nhận:** 24/11/2026
- **Trạng thái:** Nghiệm thu **100% PASS (138/138 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Lệnh Sửa Số 1 – Hệ Thống Chat Trực Tiếp 1 Chạm & Đa Kênh (`index.html`, `style.css`, `src/onlineUI.js`, `src/main.js`):**
     - Đặt nút **`💬 Chat`** trực tiếp trên thanh HUD với huy hiệu chấm đỏ thông báo tin mới, bấm vào là mở thẳng khung Chat đầy đủ ngay lập tức (không qua nhiều lớp menu).
     - Cho phép chạm nhanh vào thanh xem trước `#floatingChatWidget` để mở giao diện Chat.
     - Tự động ẩn toàn bộ cụm phím ảo điều khiển xe khi khung Chat mở trên Mobile để bàn phím ảo hiển thị thoáng đãng.
     - Xử lý cô lập sự kiện `keydown` trên các thẻ `INPUT`/`TEXTAREA`: cho phép gõ đầy đủ **dấu cách (`Space`)** và tiếng Việt có dấu trọn vẹn, không bị bộ điều khiển xe chặn phím.
     - Phân định rõ ràng 2 tab **Chat Toàn Quốc** (cộng đồng) và **Bạn Bè** (trò chuyện riêng tư 1-1).
  2. **Lệnh Sửa Số 2 – Hệ Thống Kết Bạn Bền Vững & Hộp Thoại Xác Nhận (`server/server.js`, `src/network.js`, `src/onlineUI.js`, `src/world.js`):**
     - Mở rộng vùng nhận diện chạm quanh nhân vật người chơi khác trên bản đồ lên bán kính tối thiểu **`56px`** theo tọa độ màn hình (hỗ trợ cả 2D và 3D).
     - Hỗ trợ bấm vào tên người chơi trong khung Chat hoặc danh sách Online để mở **Thẻ Hồ Sơ Người Chơi** (`z-index: 99990`, tự ẩn phím ảo Mobile), hiển thị tên, chi nhánh, nút **`➕ Thêm Bạn`** (chuyển thành `⏳ Đã gửi lời mời` sau khi bấm, hoặc `💬 Nhắn tin` nếu đã là bạn).
     - Định tuyến máy chủ 2 chiều bền vững qua cả `playerId` và `socketId`: lưu trữ lời mời và danh sách bạn bè vào `persistentFriends` và `pendingFriendRequests` theo `playerId`, chống mất dữ liệu khi đổi mạng hoặc tải lại trang.
     - Hộp thoại Xác Nhận Kết Bạn trung tâm (`#friendInviteNotification`, `z-index: 99999`) với 2 nút lớn: **`✅ Đồng Ý`** và **`❌ Từ Chối`**, kèm âm thanh Web Audio an toàn.
  3. **Lệnh Sửa Số 3 – Hệ Thống Thách Đấu 1v1 Có Xác Nhận & Đấu Trường Real-Time (`server/server.js`, `src/network.js`, `src/onlineUI.js`):**
     - Nút **`⚔️ Thách Đấu 1v1`** (`#btnProfileChallenge`) nổi bật trên Thẻ Hồ Sơ và Danh Sách Bạn Bè, cho phép chọn nhanh mức cược: **Giao Hữu (0đ)**, **50.000đ**, **200.000đ** cùng thể thức **Gói Cơm ASMR 30s** hoặc **Bóc Rong Biển Tốc Độ**.
     - Máy chủ định tuyến sự kiện thách đấu (`pvp:invite`, `pvp:accept`, `pvp:decline`, `pvp:tap`, `pvp:score_update`, `pvp:settlement`) song song qua cả `socketId` và `playerId`.
     - Kiểm tra điều kiện đủ tiền cược: chỉ trừ tiền cược khi đối thủ bấm **Đồng Ý**, tự động cộng toàn bộ tiền hũ thưởng + 15 điểm Uy tín cho người chiến thắng khi kết thúc trận.
     - Hộp thoại Xác Nhận Thách Đấu trung tâm (`#pvpInviteNotification`, `z-index: 99999`, `backdrop-filter: blur(10px)`) tự ẩn phím ảo Mobile, đếm ngược 15 giây cùng 2 nút lớn nằm ngang: **`✅ ĐỒNG Ý`** (`#btnPvpAccept`) và **`❌ TỪ CHỐI`** (`#btnPvpDecline`).
     - Bấm **`❌ Từ Chối`** hoặc hết 15s: Đóng hộp thoại và gửi thông báo lịch sự `❌ [Tên đối thủ] đã từ chối lời mời thách đấu` về người mời.
     - Bấm **`✅ Đồng Ý`**: Tự động đưa **cả 2 người chơi** vào giao diện Đấu Trường 1v1 (`#btnArenaActionTap`), đồng bộ thanh tiến độ và số lần chạm tap thời gian thực, hiển thị bảng tổng kết thắng/thua rõ ràng.
  4. **Kiểm Toán & Nghiệm Thu Toàn Diện (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - 100% PASS (138/138 Bài kiểm thử), tuyệt đối **0 Console Errors**, bảo đảm công thái học không chồng lấn trên Desktop (1440x900), iPhone (375x812) và iPad (768x1024).
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.8.1-PROD (CHÍNH THỨC XUẤT XƯỞNG: ĐỒNG BỘ TỌA ĐỘ Ô VẠCH XANH TRƯỜNG HỌC & MIỄN TRỪ TRẬT TỰ ĐÔ THỊ 100%)
- **Ngày ghi nhận:** 24/11/2026
- **Trạng thái:** Nghiệm thu **100% PASS (138/138 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Nguồn Tọa Độ Ô Vạch Xanh Duy Nhất (Single Source of Truth - `src/world.js`, `src/selling.js`):**
     - Thiết lập hằng số `LEGAL_SELLING_ZONES` chứa đầy đủ 24 ô vạch xanh chuẩn hóa trên toàn bộ 4 chi nhánh (TP.HCM, Đắk Lắk, TP. Vinh, Hà Nội), bao gồm các cụm Trường Tiểu học, THCS, THPT, Công Viên / Làng Đại Học, Chợ Bến Thành / Văn Phòng và Phố Đi Bộ.
     - Hàm kiểm tra `isInsideLegalZone(x, y, cityId)` mở rộng biên độ an toàn thêm **`+20px`** tính từ tâm nhân vật/xe, đảm bảo người chơi chỉ cần đỗ xe chạm mép vạch xanh là được nhận diện hợp lệ 100%.
     - Đồng bộ dùng chung một nguồn tọa độ cho cả Canvas 2D, 3D Scene, Minimap và logic bán hàng của `SellingManager`.
  2. **Vùng An Toàn Tuyệt Đối – Miễn Trừ Trật Tự Đô Thị 100% Trong Ô Vạch Xanh (`src/selling.js`):**
     - Khắc phục triệt để lỗi phạt `isSchoolOvertime`: khi người chơi đứng trong Ô Vạch Xanh Trường Học, hệ thống tuyệt đối không tính vi phạm dù ngoài giờ cao điểm hay bất kỳ thời điểm nào trong ngày.
     - Khi `inGreenSpot === true`: cấm tuyệt đối cảnh báo, cấm tăng mức nhiệt (`heatLevel`), cấm phạt tiền 150.000đ và cấm trừ danh vọng.
     - Cơ chế Hủy Truy Đuổi Tự Động: Người chơi đang bị truy đuổi từ ngoài đường nếu chạy lọt vào Ô Vạch Xanh sẽ được xóa sạch cảnh báo ngay lập tức (`heatLevel = 0`, `urbanWarning = 0`).
  3. **Huy Hiệu Trực Quan & Trải Nghiệm Mở Sạp Thông Minh (`index.html`, `style.css`, `src/main.js`):**
     - Thẻ huy hiệu `#stallLegalTag` phát sáng nhẹ nhàng `🟢 Điểm Bán Hợp Pháp (An toàn 100%)` định vị ngay trên nút Mở Sạp `#btnTouchStall` và bảng tương tác `#proximityPrompt`.
     - Nhận diện mở sạp thông minh: chỉ cần người chơi đứng trong vạch xanh, bấm nút Mở Sạp hoặc nhấn phím E sẽ tự động nhận diện và mở sạp trơn tru không cần căn đúng tâm khu vực.
  4. **Kiểm Thử Thực Tế Tự Động 10 Giây E2E (`00_BO_MAY_QUAN_TRI/verify_system.mjs`):**
     - Bổ sung kịch bản kiểm thử 5.7: Đặt nhân vật tại tâm Ô Vạch Xanh Trường Học Hoa Mai (`x: 790, y: 625`), mở sạp và bán nhanh liên tục trong 600 frames (10 giây thực tế ở 60fps).
     - Kết quả kiểm chứng: Huy hiệu xanh hiển thị chuẩn, tiền bán hàng tăng chuẩn xác theo giá niêm yết (20k/22k/25k), **0 lần bị phạt**, **0 lỗi console**, đạt 100% PASS.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT`

---

## 🏆 PHIÊN BẢN: v2.8.0-PROD (CHÍNH THỨC XUẤT XƯỞNG: ĐỊNH DANH NGƯỜI CHƠI BỀN VỮNG, CHẠM NHÂN VẬT HITBOX 56PX, NÚT QUANH ĐÂY, KHO BẾP 4 TẦNG STUDIO NẤU NHANH & NẤU ĐẦY THÙNG, CỔNG DATA LEADS & TRANG QUẢN TRỊ /admin)
- **Ngày ghi nhận:** 24/11/2026
- **Trạng thái:** Nghiệm thu **100% PASS (137/137 Bài kiểm thử)** từ [SIMULATION DIRECTOR], [STATIC AUDITOR], [CHIEF ARCHITECT] & Đích thân Sếp phát lệnh duyệt chính thức: **"SẾP DUYỆT TOÀN BỘ"**.
- **Tính năng & Kiến trúc đột phá đã hoàn thiện:**
  1. **Định Danh Người Chơi Bền Vững (`src/state.js`, `server/server.js`, `src/network.js`):**
     - Tạo và lưu trữ vĩnh viễn chuỗi `playerId` duy nhất trong `localStorage`, gửi kèm khi kết nối Socket.io / `joinGame`.
     - Quản lý bảng ánh xạ 2 chiều `playerId <-> socketId` trên máy chủ, lưu danh sách bạn bè (`persistentFriends`) và các lời mời đang chờ theo `playerId`, bảo vệ toàn vẹn dữ liệu khi đổi mạng Wi-Fi/4G hay tải lại trang trên Mobile.
  2. **Bắt Chạm Nhân Vật Chuẩn Xác (Hitbox $\ge 56\text{px}$) & Nút HUD "👥 Quanh Đây" (`src/main.js`, `src/city3D.js`, `src/onlineUI.js`, `index.html`):**
     - Mở rộng vùng nhận diện chạm bán kính tối thiểu $56\text{px}$ trên Canvas (hỗ trợ cả 2D camera offset và 3D camera projection), ưu tiên chọn người chơi trước khi di chuyển bản đồ hay bán hàng.
     - Nút HUD `👥 Quanh Đây (X)` nằm gọn gàng tại `hud-right-row-2`, tách biệt hoàn toàn khỏi khung Minimap, mở modal danh sách người chơi online hiển thị khoảng cách tính theo mét ($m$), cấp độ và chi nhánh.
     - Mở Thẻ Hồ Sơ Người Chơi (`#playerProfileModal`, `z-index: 99990`, tự ẩn phím ảo Mobile) gồm chip chọn nhanh mức cược (0đ, 50k, 200k) và 3 nút lớn: `➕ Thêm Bạn`, `⚔️ Thách Đấu 1v1`, `✕ Đóng`.
  3. **Hộp Thoại Xác Nhận Thách Đấu & Kết Bạn Bắt Buộc Có Chuông Báo (`src/onlineUI.js`, `src/audio.js`, `style.css`):**
     - Modal trung tâm toàn màn hình (`z-index: 99999`, `backdrop-filter: blur(10px)`), phát chuông nhẹ Web Audio API, đếm lùi 15s và 2 nút bấm cảm ứng lớn $\ge 48\text{px}$: `✅ ĐỒNG Ý` và `❌ TỪ CHỐI`.
     - Luật xác nhận nghiêm ngặt: Tuyệt đối không tự ép vào trận; nếu từ chối hoặc hết giờ gửi lý do lịch sự về cho người gửi.
  4. **Tái Thiết Kế Kho Bếp 4 Tầng Chuẩn Studio (`src/kitchenASMR.js`, `style.css`):**
     - Khóa khung giao diện trong `max-height: 90dvh`, tự động ẩn hoàn toàn phím ảo ngoài phố khi mở bếp và phục hồi khi rời bếp:
       + **Tầng 1 (Cao ~48px):** Tiêu đề `[🍙 KHO BẾP ISO]`, `[🎒 Thùng: X/Y]`, `[🌾 Gạo | 🥩 Nhân | 🥫 Sốt]` và nút `[✕ Rời Bếp]`.
       + **Tầng 2 (Cao ~95px):** Bộ lọc giá (`Tất cả`, `20.000đ`, `22.000đ`, `25.000đ`) cùng dải thẻ 15 vị trượt ngang (`overflow-x: auto`), bỏ mô tả dài dòng, chỉ hiển thị Icon/Tên/Giá bán lẻ chuẩn ISO & ATVSTP.
       + **Tầng 3 (Bàn Chế Biến Trung Tâm):** Trực quan nắm cơm tam giác, huy hiệu ISO vàng kim, thanh lực và câu lệnh cảm ứng thân thiện (*"Chạm & giữ để múc cơm"*, *"Chạm 3 lần để ép khuôn"*, *"Vuốt nhẹ để bọc rong biển"*).
       + **Tầng 4 (Thanh Hành Động Đáy Cố Định):** 3 nút bấm lớn: `⚡ Nấu Nhanh (+1)` (trừ 1 Gạo + 1 Nhân + 1 Sốt, không cần chơi mini-game), `📦 Nấu Đầy Thùng` (lấp đầy sức chứa xe 1 chạm), `🛵 Ra Phố Bán Hàng`.
  5. **Cổng Thu Thập Data Khởi Nghiệp & Trang Quản Trị `/admin` (`index.html`, `src/main.js`, `server/server.js`):**
     - Màn hình chào tích hợp Chọn 4 Chi Nhánh (TP.HCM, Đắk Lắk, TP. Vinh, Hà Nội) & Ô nhập Số Điện Thoại nhận quà +200.000đ vốn khởi nghiệp.
     - Backend hỗ trợ API `POST/GET /api/leads` và trang quản trị trực quan `/admin` hiển thị danh sách khách hàng đăng ký.
  6. **Kiểm Thử Đo Đạc Hình Học Tự Động (`verify_system.mjs`):**
     - Xác nhận 3 nút đáy Kho Bếp nằm trọn 100% trong viewport iPhone (375x812) và Desktop (1440x900) (`bottom <= window.innerHeight`), Zero Cutoff, 0 lỗi Console.
- **Phê duyệt:** `👑 ĐÃ CÓ LỆNH SẾP DUYỆT TOÀN BỘ`

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
