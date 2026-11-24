# 🍙 ĐẾ CHẾ CƠM NẮM (Onigiri Empire 2D)

Game web 2D phong cách kết hợp giữa **Thế giới mở GTA 2D**, **Nấu ăn Bếp ASMR cận cảnh**, **Bán hàng đường phố Sài Gòn** và **Hành trình khởi nghiệp xây dựng chuỗi Food Truck**.

---

## 🎮 Cách Khởi Chạy Game

Bạn có thể mở trực tiếp tệp `index.html` trên bất kỳ trình duyệt nào hỗ trợ HTML5 & Web Audio API (Chrome, Safari, Edge, Firefox), hoặc chạy qua máy chủ cục bộ:

```bash
# Sử dụng Python HTTP server
python3 -m http.server 8000

# Hoặc dùng npx serve
npx serve .
```

Sau đó truy cập: `http://localhost:8000` (hoặc cổng được hiển thị).

---

## 🕹️ Điều Khiển (Controls)

| Phím / Thao tác | Chức năng |
| :--- | :--- |
| **W, A, S, D** hoặc **Mũi tên** | Di chuyển nhân vật / điều khiển xe |
| **Phím Cách (Space)** hoặc **E** | Tương tác địa điểm (Bếp, Bán hàng, Chợ) |
| **Phím H** | Bấm còi xe / chuông xe đạp |
| **Phím P** hoặc **Q** | Mở điện thoại "iGiri OS" xem nhiệm vụ |
| **Virtual D-Pad & Nút cảm ứng** | Hỗ trợ 100% màn hình cảm ứng & điện thoại |

---

## 🌟 Tính Năng Nổi Bật

### 1. 🗺️ Bản Đồ Thế Giới Mở Kiểu GTA 2D (`world.js`)
- Bản đồ đô thị rộng lớn: Đường phố lát nhựa, vạch kẻ qua đường, công viên bờ sông, hàng cây xanh và xe cộ/người đi bộ AI di chuyển liên tục.
- Hệ thống chu kỳ Ngày & Đêm với ánh sáng hoàng hôn và giờ cao điểm:
  - **6h - 8h**: Giờ học sinh tấp nập tới trường.
  - **11h - 13h**: Giờ nghỉ trưa dân công sở tại các tòa cao ốc.
  - **17h - 19h**: Giờ tan tầm ăn vặt tại công viên & bờ kè.

### 2. 🍳 Bếp Cận Cảnh ASMR Thư Giãn (`kitchenASMR.js`)
- **Bước 1**: Vo gạo ST25 trong thau nước sạch (hiệu ứng nước sóng sánh, tiếng xào xạc).
- **Bước 2**: Xới cơm nóng bốc khói & rắc mè rang thơm lừng.
- **Bước 3**: Nhồi các loại nhân thượng hạng (Cá hồi mayo, Trứng muối chà bông, Xá xíu phô mai, Lươn nướng teriyaki).
- **Bước 4**: Ép nén khuôn tam giác với thanh nhịp điệu (Timing bar).
- **Bước 5**: Gập 2 mép lá rong biển Nori giòn rụm với âm thanh ASMR chân thực.

### 3. 🛵 Phương Tiện & Nâng Cấp (`state.js`, `player.js`)
- **Đi bộ bưng mẹt** (Khởi đầu)
- **Xe đạp giỏ trước cà tàng** (Tăng tốc độ, chở 35 cái)
- **Xe đẩy Inox vỉa hè** (Có tủ kính giữ nhiệt, chở 70 cái)
- **Xe Honda Cub 50cc** (Tốc độ thần tốc, chở 120 cái)
- **Food Truck Siêu Cơm Nắm VIP** (Sức chứa 300 cái, tự động tăng tiền Tip)
- Thiết bị phụ trợ: Nồi cơm cao tần, Thùng giữ nhiệt chân không, Đèn LED neon, Loa kẹp nách "Cơm nắm nóng đây!".

### 4. 💰 Bán Hàng & Thực Khách AI (`selling.js`)
- Khách hàng xuất hiện theo từng khu vực (Học sinh, Dân văn phòng, Du khách, Cặp đôi).
- Thanh độ kiên nhẫn: Phục vụ nhanh nhận **Chuỗi Combo Streak** và **Tiền Tip** hậu hĩnh.

### 5. 📱 Điện Thoại "iGiri OS 15" & Cốt Truyện (`quests.js`)
- Giao diện mô phỏng smartphone với Dynamic Island.
- Cốt truyện 5 chương khởi nghiệp từ góc phố đến chuỗi ẩm thực danh tiếng.
- Hệ thống danh hiệu và thống kê chi tiết.

### 6. 🔊 Âm Thanh Thủ Tục 100% Web Audio API (`audio.js`)
- Toàn bộ âm thanh vo gạo, rắc mè, bóp sốt, ép khuôn, gập rong biển, leng keng tiền và bản nhạc Lo-Fi chiptune nền đều được tổng hợp toán học trực tiếp qua **Web Audio API** — hoạt động ngoại tuyến mượt mà, không phụ thuộc tài nguyên bên ngoài.
