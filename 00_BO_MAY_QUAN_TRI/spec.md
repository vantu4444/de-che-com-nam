# 📐 BẢN THIẾT KẾ ĐẶC TẢ KỸ THUẬT (SPECIFICATION)
## CHUẨN HÓA MÁY CHỦ TRỰC TUYẾN RENDER (NODE.JS WEB SERVICE) & CLIENT AUTO-DETECTION
**Dự án:** Game Thế Giới Mở 2D "Đế Chế Cơm Nắm" (Onigiri Empire 2D)  
**Phân hệ:** Cloud Deployment (Render), Express/Socket.io Server, Static Asset Serving, Client Auto-Origin & HUD Lifecycle FSM  
**Phòng ban phụ trách:** `[1. PRINCIPAL DESIGNER]`  
**Cơ quan kiểm duyệt:** `[2. CHIEF ARCHITECT]` & `[3. VP OF ENGINEERING]`  
**Tiêu chuẩn chất lượng:** Principal Engineer / Enterprise Grade  

---

## 1. MỤC TIÊU VÀ ĐẶC TẢ KỸ THUẬT TRIỂN KHAI CLOUD (RENDER COMPLIANT)

### 1.1. Cấu hình Máy Chủ Hợp Nhất (`server/server.js` & `server/package.json`)
- **Cổng Lắng Nghe & Địa Chỉ Host Động:**
  - Cổng: `const PORT = process.env.PORT || 3000;`
  - Địa chỉ Host: Bắt buộc lắng nghe trên `'0.0.0.0'` (thay vì `localhost` hoặc `127.0.0.1`) để Container/PaaS của Render có thể chuyển tiếp lưu lượng (reverse proxy routing) từ Internet vào tiến trình Node.js:
    $$\text{Host} = \text{'0.0.0.0'}, \quad \text{Port} = \text{process.env.PORT} \parallel 3000$$
- **Phục Vụ Toàn Bộ Tài Nguyên Tĩnh (Single-Port Static File Server):**
  - Máy chủ phục vụ toàn bộ ứng dụng từ thư mục gốc (`ROOT_DIR`):
    - Tệp HTML chính: `index.html` (khi truy cập `/` hoặc `/index.html`).
    - Bảng mã định kiểu: `style.css`.
    - Toàn bộ thư mục mã nguồn ES Modules: `/src/*.js`.
    - Toàn bộ tài nguyên hình ảnh/âm thanh: `/assets/*` (hỗ trợ đầy đủ định dạng: `.JPG`, `.jpg`, `.png`, `.webp`, `.svg`, `.ico`, `.mp3`, `.wav`).
  - Đảm bảo cơ chế bảo mật thư mục: Chặn tấn công Directory Traversal (`..` vượt ra ngoài thư mục gốc), trả về `403 Forbidden` hoặc `404 Not Found`.
- **Khai Báo Thư Viện (`server/package.json`) & Start Script:**
  - Khai báo đầy đủ các gói:
    - `"socket.io"`: Thư viện real-time WebSocket cho multiplayer.
    - `"express"`: Framework web tiêu chuẩn công nghiệp (Node.js).
    - `"cors"`: Middleware phân quyền truy cập Cross-Origin Resource Sharing.
  - Script khởi chạy chuẩn Render: `"start": "node server.js"`.
  - Khai báo `"type": "module"` cho ES6 Modules.
- **Tập tin Quản Trị Git (`.gitignore`):**
  - Bắt buộc tạo `.gitignore` ở thư mục gốc: Bỏ qua `node_modules/`, `package-lock.json` nếu cần, và `.DS_Store`.

---

### 1.2. Nhận Diện Máy Chủ Động & Quản Lý Vòng Đời Kết Nối Client (`src/network.js`, `index.html`)
- **Tự Động Nhận Diện Nguồn Máy Chủ (Dynamic Origin Detection):**
  - Client không ghi cứng địa chỉ `localhost:3000` hay IP nội bộ.
  - Sử dụng tên miền máy chủ hiện tại: `window.location.origin` hoặc khởi tạo Socket.io với `io()` không tham số để tự động kết nối về Host đang phục vụ trang:
    $$\text{Socket Target} = (window.location.origin \ne \text{'file://'}) \ ? \ window.location.origin : \text{'http://localhost:3000'}$$
- **Vòng Đời Trạng Thái Kết Nối HUD (Connection Status FSM):**
  - Trạng thái 1: `CONNECTING`
    - Kích hoạt ngay khi mở web hoặc nạp Game.
    - HUD hiển thị: `🟡 Đang kết nối máy chủ...` (Class CSS: `hud-online-status is-connecting`).
    - Cơ chế bù đắp độ trễ khởi động của Render Free Tier (Cold Start 20–30s): Cấu hình Socket.io với `timeout: 30000`, `reconnection: true`, `reconnectionAttempts: Infinity`, `reconnectionDelay: 2000`. Duy trì trạng thái chờ để khi server thức dậy sẽ lập tức bắt tay thành công.
  - Trạng thái 2: `CONNECTED`
    - Kích hoạt ngay khi sự kiện socket `connect` kích hoạt.
    - HUD hiển thị: `🟢 Online (X người chơi)` (Class CSS: `hud-online-status is-online`).
    - $X = \text{otherPlayers.size} + 1$ (Bao gồm chính người chơi).
  - Trạng thái 3: `OFFLINE_BOT_FALLBACK`
    - Kích hoạt khi người chơi chạy file cục bộ không qua server (`file://`), hoặc khi người dùng cố ý ngắt mạng, hoặc vượt quá ngưỡng timeout dự phòng mà không thể kết nối.
    - HUD hiển thị: `⚪ Offline (Chế độ đơn)` (Class CSS: `hud-online-status is-offline`).
    - Tự động sinh dàn Bot AI địa phương đi tuần tra và bán hàng mô phỏng.

---

## 2. MÁY TRẠNG THÁI HỮU HẠN MẠNG (NETWORK CONNECTION FSM)

```
[INIT / PAGE_LOAD]
       │
       ▼
[STATE: CONNECTING] ──► HUD: "🟡 Đang kết nối máy chủ..." (is-connecting)
       │
       ├── (Socket event: 'connect') ────────────────────────────────┐
       │                                                             ▼
       │                                                    [STATE: CONNECTED]
       │                                                             │
       │                                                             ▼
       │                                                    HUD: "🟢 Online (X người chơi)"
       │                                                             │
       │                                                             │ (Socket event: 'disconnect')
       │                                                             ▼
       ├── (Quá 35s không phản hồi / môi trường file://) ──► [STATE: OFFLINE_BOT_FALLBACK]
       │                                                             │
       ▼                                                             ▼
[OFFLINE_BOT_FALLBACK] ◄─────────────────────────────────────────────┘
       │
       ▼
HUD: "⚪ Offline (Chế độ đơn)" (is-offline) & Kích hoạt Bot AI tuần tra
```

---

## 3. CÔNG THỨC TOÁN HỌC & ĐẶC TẢ DỮ LIỆU

### 3.1. Tính Toán Số Lượng Người Chơi Trực Tuyến
$$N_{\text{online}} = |P_{\text{city}}| = 1 + \sum_{p \in \text{otherPlayers}} 1$$
Trong đó:
- $1$: Đại diện cho chính người chơi hiện tại.
- $\sum 1$: Số lượng người chơi khác nhận được qua sự kiện `joinSuccess`, `playersUpdate`, `playerJoined`, `playerLeft`.

### 3.2. Cấu Hình Thời Gian Bù Trễ Khởi Động (Render Cold Start Mitigation)
$$T_{\text{timeout}} = 30000\text{ ms} \quad (30\text{ giây})$$
$$T_{\text{reconnect\_delay}} = 2000\text{ ms} \quad (2\text{ giây})$$
$$K_{\text{attempts}} = \infty \quad (\text{Tự động thử lại liên tục đến khi Server phản hồi})$$

---

## 4. MA TRẬN TRƯỜNG HỢP BIÊN (EDGE CASES MATRIX)

| Mã STT | Tình Huống Biên | Rủi Ro Tiềm Ẩn | Giải Pháp Thiết Kế Phòng Thủ |
| :--- | :--- | :--- | :--- |
| **EC-01** | Máy chủ Render ở trạng thái ngủ (Cold Start 20-30s) | Client timeout quá sớm (ví dụ 2.5s) khiến rơi vào Offline Bot | Tăng socket timeout lên 30s, bật `reconnection: true`, giữ HUD ở trạng thái `🟡 Đang kết nối máy chủ...` cho đến khi server thức dậy. |
| **EC-02** | Chạy trực tiếp `file:///` trên máy lập trình | Gây lỗi CORS hoặc crash socket io | Kiểm tra `window.location.protocol === 'file:'` để chuyển sang Bot mượt mà không văng lỗi Console. |
| **EC-03** | Khởi chạy máy chủ trên cổng môi trường `PORT=10000` | Render không thể truy cập nếu hardcode cổng 3000 | Sử dụng `process.env.PORT || 3000` và lắng nghe trên IP toàn cục `'0.0.0.0'`. |
| **EC-04** | Người chơi truy cập tệp lạ hoặc cố vượt cấp thư mục (`/../../etc/passwd`) | Rò rỉ hệ điều hành server | Chặn với `path.normalize`, kiểm tra `startsWith(ROOT_DIR)`, trả về `403 Forbidden`. |
| **EC-05** | Render nhận diện gói dependencies | Render báo lỗi thiếu express hoặc cors | Khai báo rõ `express`, `cors`, `socket.io` trong `server/package.json`. |
| **EC-06** | Mở nhiều tab cùng lúc trên trình duyệt | Xung đột Socket ID và làm loạn HUD | Mỗi socket ID quản lý độc lập trong `this.players` Map, phát sóng cập nhật danh sách chính xác. |
