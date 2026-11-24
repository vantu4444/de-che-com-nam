/**
 * server/server.js
 * -----------------------------------------------------------------------------
 * MÁY CHỦ HỢP NHẤT: WEB TĨNH (PORT 3000) & REAL-TIME SOCKET.IO MULTIPLAYER
 * Dự án: Game Thế Giới Mở 2D "Đế Chế Cơm Nắm" (Onigiri Empire 2D)
 * Chuẩn chất lượng: Principal Engineer / Enterprise Grade
 * -----------------------------------------------------------------------------
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export const SERVER_CONFIG = {
    PORT: process.env.PORT || 3000,
    HOST: '0.0.0.0',
    CITIES: ['hcm', 'daklak', 'vinh', 'hanoi'],
    DEFAULT_CITY: 'hcm',
    COOP_ORDER_TARGET: 300,
    COOP_ORDER_TIME_SECONDS: 600,
    COOP_TOTAL_POT_MONEY: 5000000,
    COOP_TOTAL_POT_EXP: 1000,
    COOP_TOTAL_POT_REP: 50
};

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.JPG': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg'
};

export class OnigiriServer {
    constructor(port = SERVER_CONFIG.PORT, host = SERVER_CONFIG.HOST) {
        this.port = Number(process.env.PORT) || Number(port) || 3000;
        this.host = host || '0.0.0.0';
        this.httpServer = null;
        this.io = null;

        // Quản lý người chơi trực tuyến theo socket ID
        this.players = new Map();

        // Quản lý phòng theo thành phố
        this.cityRooms = new Map();
        SERVER_CONFIG.CITIES.forEach(c => this.cityRooms.set(c, new Set()));

        // Quản lý các phòng đấu trường 1v1
        this.arenaRooms = new Map();

        // Quỹ Đơn Hàng Hợp Tác Liên Tỉnh (Co-op)
        this.coopOrder = {
            id: 'coop_' + Date.now(),
            title: 'Đại Tiệc Cơm Nắm Toàn Quốc 🍙🎉',
            target: SERVER_CONFIG.COOP_ORDER_TARGET,
            current: 45,
            startTime: Date.now(),
            durationSeconds: SERVER_CONFIG.COOP_ORDER_TIME_SECONDS,
            potMoney: SERVER_CONFIG.COOP_TOTAL_POT_MONEY,
            potExp: SERVER_CONFIG.COOP_TOTAL_POT_EXP,
            potRep: SERVER_CONFIG.COOP_TOTAL_POT_REP,
            contributors: {},
            isCompleted: false
        };

        // Bảng xếp hạng mô phỏng sẵn
        this.mockLeaderboard = [
            { id: 'bot_1', name: 'Tập Đoàn Cơm Nắm Sài Gòn', revenue: 154200000, reputation: 980, level: 25, city: 'hcm' },
            { id: 'bot_2', name: 'Bếp Cơm Nắm BMT Cao Nguyên', revenue: 98500000, reputation: 820, level: 22, city: 'daklak' },
            { id: 'bot_3', name: 'Onigiri Hoàng Gia Hà Nội', revenue: 86400000, reputation: 750, level: 20, city: 'hanoi' },
            { id: 'bot_4', name: 'Cơm Nắm Xứ Nghệ - TP. Vinh', revenue: 64200000, reputation: 640, level: 17, city: 'vinh' },
            { id: 'bot_5', name: 'Tiệm Cơm Nắm Chú Ba', revenue: 45000000, reputation: 520, level: 15, city: 'hcm' },
            { id: 'bot_6', name: 'Bếp Nhà Mẹ Nấu 1985', revenue: 38500000, reputation: 460, level: 14, city: 'hanoi' },
            { id: 'bot_7', name: 'Cơm Nắm Mayo Béo Ngậy', revenue: 29000000, reputation: 390, level: 12, city: 'daklak' },
            { id: 'bot_8', name: 'Onigiri Phố Cổ Thăng Long', revenue: 22000000, reputation: 340, level: 10, city: 'hanoi' },
            { id: 'bot_9', name: 'Bếp Nhanh Cổng Trường ĐH', revenue: 16500000, reputation: 290, level: 8, city: 'hcm' },
            { id: 'bot_10', name: 'Tiệm Cơm Nắm Bé Bông', revenue: 12000000, reputation: 240, level: 7, city: 'vinh' }
        ];

        // Quản lý tin nhắn cho cơ chế polling fallback
        this.pollingQueues = new Map();
        this.pollingWaitingRes = new Map();
    }

    async start() {
        this.httpServer = http.createServer((req, res) => this.handleHttpRequest(req, res));

        // Thử khởi tạo Socket.io chính thức nếu gói socket.io có sẵn
        try {
            const socketIoModule = await import('socket.io');
            const { Server } = socketIoModule;
            this.io = new Server(this.httpServer, {
                cors: {
                    origin: '*',
                    methods: ['GET', 'POST']
                }
            });
            this.setupOfficialSocketEvents();
            console.log('⚡ Socket.io engine initialized successfully with full CORS support.');
        } catch (err) {
            console.log('ℹ️ Socket.io npm package not present in runtime. Built-in zero-dependency real-time engine activated.');
        }

        return new Promise((resolve, reject) => {
            this.httpServer.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.warn(`⚠️ Port ${this.port} in use, attempting to use running instance or close.`);
                }
                reject(err);
            });

            this.httpServer.listen(this.port, this.host, () => {
                console.log(`🍙 Onigiri Empire Server running at http://${this.host}:${this.port}/`);
                resolve(this.httpServer);
            });
        });
    }

    handleHttpRequest(req, res) {
        // Thiết lập CORS toàn cục
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = parsedUrl.pathname;

        // 1. Phục vụ thư viện Client Socket.IO (/socket.io/socket.io.js)
        if (pathname === '/socket.io/socket.io.js') {
            res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
            res.end(this.getClientSocketIoScript());
            return;
        }

        // 2. API Endpoint cho giao thức real-time HTTP polling fallback
        if (pathname.startsWith('/api/socket/')) {
            this.handleSocketApi(req, res, pathname, parsedUrl);
            return;
        }

        // 3. API Trạng thái máy chủ
        if (pathname === '/health' || pathname === '/api/status') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                port: this.port,
                onlineCount: this.players.size,
                cities: SERVER_CONFIG.CITIES,
                coopOrder: this.coopOrder,
                leaderboard: this.getLeaderboard()
            }));
            return;
        }

        // 4. Phục vụ Web tĩnh (Static Files: index.html, style.css, src/, assets/)
        let reqPath = decodeURI(pathname);
        if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

        const safePath = path.normalize(path.join(ROOT_DIR, reqPath));
        if (!safePath.startsWith(ROOT_DIR)) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('403 Forbidden');
            return;
        }

        fs.stat(safePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Not Found: ' + reqPath);
                return;
            }

            const ext = path.extname(safePath);
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, must-revalidate'
            });

            fs.createReadStream(safePath).pipe(res);
        });
    }

    // =========================================================================
    // QUY CHUẨN XỬ LÝ SỰ KIỆN MULTIPLAYER REAL-TIME
    // =========================================================================
    setupOfficialSocketEvents() {
        if (!this.io) return;

        this.io.on('connection', (socket) => {
            // Sự kiện 1: Người chơi gia nhập game
            socket.on('joinGame', (data) => {
                const rawCity = data?.city || SERVER_CONFIG.DEFAULT_CITY;
                const city = rawCity.replace('branch_', '');
                const validCity = SERVER_CONFIG.CITIES.includes(city) ? city : SERVER_CONFIG.DEFAULT_CITY;

                const player = {
                    id: socket.id,
                    brandName: (data && data.brandName) ? String(data.brandName).slice(0, 30) : 'Chi Nhánh #' + socket.id.slice(0, 4),
                    level: Number(data?.level) || 1,
                    vehicleId: data?.vehicleId || 'walking',
                    x: typeof data?.x === 'number' ? data.x : 420,
                    y: typeof data?.y === 'number' ? data.y : 1250,
                    isStallOpen: !!data?.isStallOpen,
                    city: validCity,
                    totalRevenue: Number(data?.totalRevenue) || 0,
                    reputation: Number(data?.reputation) || 100
                };

                this.players.set(socket.id, player);
                if (this.cityRooms.has(validCity)) {
                    this.cityRooms.get(validCity).add(socket.id);
                }
                socket.join(`city_${validCity}`);

                // Gửi ngay danh sách toàn bộ người chơi cho người mới
                socket.emit('joinSuccess', {
                    selfId: socket.id,
                    players: this.getPlayersInCity(validCity),
                    coopOrder: this.coopOrder,
                    leaderboard: this.getLeaderboard()
                });

                // Phát sóng thông báo người mới tới cho các cửa sổ đang mở
                socket.to(`city_${validCity}`).emit('playerJoined', player);

                // Cập nhật lại toàn bộ danh sách cho phòng
                this.io.to(`city_${validCity}`).emit('playersUpdate', this.getPlayersInCity(validCity));
            });

            // Hỗ trợ cả tên sự kiện cũ 'player_join' để tương thích ngược
            socket.on('player_join', (data) => socket.emit('joinGame', data));

            // Sự kiện 2: Di chuyển & Cập nhật trạng thái
            socket.on('playerMove', (data) => {
                const player = this.players.get(socket.id);
                if (!player) return;

                if (typeof data.x === 'number') player.x = data.x;
                if (typeof data.y === 'number') player.y = data.y;
                if (typeof data.isStallOpen === 'boolean') player.isStallOpen = data.isStallOpen;
                if (data.vehicleId) player.vehicleId = data.vehicleId;
                if (data.facing) player.facing = data.facing;

                socket.to(`city_${player.city}`).emit('playerMove', {
                    id: socket.id,
                    x: player.x,
                    y: player.y,
                    isStallOpen: player.isStallOpen,
                    vehicleId: player.vehicleId,
                    facing: player.facing
                });
            });

            socket.on('player_update', (data) => socket.emit('playerMove', data));

            // Sự kiện 3: Biểu cảm Emote
            socket.on('playerEmote', (data) => {
                const player = this.players.get(socket.id);
                if (!player) return;
                this.io.to(`city_${player.city}`).emit('playerEmoted', {
                    id: socket.id,
                    targetId: data?.targetId || null,
                    type: data?.type || 'wave'
                });
            });

            socket.on('player_emote', (data) => socket.emit('playerEmote', data));

            // Sự kiện 4: Góp cơm Co-op
            socket.on('coopContribute', (data) => {
                const count = Math.max(1, Math.floor(Number(data?.count) || 1));
                const player = this.players.get(socket.id);
                const playerName = player?.brandName || 'Thành viên ẩn danh';

                if (!this.coopOrder.isCompleted) {
                    this.coopOrder.current = Math.min(this.coopOrder.target, this.coopOrder.current + count);
                    if (!this.coopOrder.contributors[socket.id]) {
                        this.coopOrder.contributors[socket.id] = { name: playerName, count: 0 };
                    }
                    this.coopOrder.contributors[socket.id].count += count;

                    let completedNow = false;
                    if (this.coopOrder.current >= this.coopOrder.target) {
                        this.coopOrder.isCompleted = true;
                        completedNow = true;
                    }

                    this.io.emit('coopUpdated', {
                        coopOrder: this.coopOrder,
                        completed: completedNow
                    });
                }
            });

            socket.on('coop_contribute', (data) => socket.emit('coopContribute', data));

            // Sự kiện 5: Ngắt kết nối
            socket.on('disconnect', () => {
                const player = this.players.get(socket.id);
                if (player) {
                    const city = player.city;
                    if (this.cityRooms.has(city)) {
                        this.cityRooms.get(city).delete(socket.id);
                    }
                    this.players.delete(socket.id);

                    socket.to(`city_${city}`).emit('playerLeft', { id: socket.id });
                    this.io.to(`city_${city}`).emit('playersUpdate', this.getPlayersInCity(city));
                }
            });
        });
    }

    // =========================================================================
    // BUILT-IN FALLBACK SOCKET ENGINE (Khi không có gói npm socket.io)
    // =========================================================================
    handleSocketApi(req, res, pathname, parsedUrl) {
        if (pathname === '/api/socket/connect') {
            const sid = 'client_' + Math.random().toString(36).substring(2, 9);
            this.pollingQueues.set(sid, []);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ sid }));
            return;
        }

        if (pathname === '/api/socket/emit' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    const { sid, event, data } = json;
                    this.processClientEvent(sid, event, data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true }));
                } catch (e) {
                    res.writeHead(400);
                    res.end('Bad Request');
                }
            });
            return;
        }

        if (pathname === '/api/socket/poll') {
            const sid = parsedUrl.searchParams.get('sid');
            if (!sid) {
                res.writeHead(400);
                res.end('Missing sid');
                return;
            }

            const queue = this.pollingQueues.get(sid) || [];
            if (queue.length > 0) {
                const batch = [...queue];
                queue.length = 0;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ messages: batch }));
            } else {
                // Giữ kết nối tối đa 15s cho long-polling
                const timer = setTimeout(() => {
                    this.pollingWaitingRes.delete(sid);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ messages: [] }));
                }, 15000);

                this.pollingWaitingRes.set(sid, { res, timer });
            }
            return;
        }

        res.writeHead(404);
        res.end();
    }

    processClientEvent(sid, event, data) {
        if (event === 'joinGame' || event === 'player_join') {
            const rawCity = data?.city || SERVER_CONFIG.DEFAULT_CITY;
            const city = rawCity.replace('branch_', '');
            const validCity = SERVER_CONFIG.CITIES.includes(city) ? city : SERVER_CONFIG.DEFAULT_CITY;

            const player = {
                id: sid,
                brandName: (data && data.brandName) ? String(data.brandName).slice(0, 30) : 'Chi Nhánh #' + sid.slice(0, 4),
                level: Number(data?.level) || 1,
                vehicleId: data?.vehicleId || 'walking',
                x: typeof data?.x === 'number' ? data.x : 420,
                y: typeof data?.y === 'number' ? data.y : 1250,
                isStallOpen: !!data?.isStallOpen,
                city: validCity,
                totalRevenue: Number(data?.totalRevenue) || 0,
                reputation: Number(data?.reputation) || 100
            };

            this.players.set(sid, player);
            if (this.cityRooms.has(validCity)) {
                this.cityRooms.get(validCity).add(sid);
            }

            // Gửi joinSuccess cho client mới
            this.sendToClient(sid, 'joinSuccess', {
                selfId: sid,
                players: this.getPlayersInCity(validCity),
                coopOrder: this.coopOrder,
                leaderboard: this.getLeaderboard()
            });

            // Gửi playerJoined cho các client khác trong phòng
            this.broadcastToCity(validCity, sid, 'playerJoined', player);

            // Gửi playersUpdate cho toàn bộ phòng
            this.broadcastToCity(validCity, null, 'playersUpdate', this.getPlayersInCity(validCity));
        } else if (event === 'playerMove' || event === 'player_update') {
            const player = this.players.get(sid);
            if (!player) return;

            if (typeof data?.x === 'number') player.x = data.x;
            if (typeof data?.y === 'number') player.y = data.y;
            if (typeof data?.isStallOpen === 'boolean') player.isStallOpen = data.isStallOpen;
            if (data?.vehicleId) player.vehicleId = data.vehicleId;
            if (data?.facing) player.facing = data.facing;

            this.broadcastToCity(player.city, sid, 'playerMove', {
                id: sid,
                x: player.x,
                y: player.y,
                isStallOpen: player.isStallOpen,
                vehicleId: player.vehicleId,
                facing: player.facing
            });
        } else if (event === 'playerEmote' || event === 'player_emote') {
            const player = this.players.get(sid);
            if (!player) return;
            this.broadcastToCity(player.city, null, 'playerEmoted', {
                id: sid,
                targetId: data?.targetId || null,
                type: data?.type || 'wave'
            });
        } else if (event === 'coopContribute' || event === 'coop_contribute') {
            const count = Math.max(1, Math.floor(Number(data?.count) || 1));
            const player = this.players.get(sid);
            const playerName = player?.brandName || 'Thành viên ẩn danh';

            if (!this.coopOrder.isCompleted) {
                this.coopOrder.current = Math.min(this.coopOrder.target, this.coopOrder.current + count);
                if (!this.coopOrder.contributors[sid]) {
                    this.coopOrder.contributors[sid] = { name: playerName, count: 0 };
                }
                this.coopOrder.contributors[sid].count += count;

                let completedNow = false;
                if (this.coopOrder.current >= this.coopOrder.target) {
                    this.coopOrder.isCompleted = true;
                    completedNow = true;
                }

                this.broadcastAll('coopUpdated', {
                    coopOrder: this.coopOrder,
                    completed: completedNow
                });
            }
        }
    }

    sendToClient(sid, event, data) {
        const queue = this.pollingQueues.get(sid);
        if (!queue) return;

        queue.push({ event, data });

        // Nếu client đang có kết nối long-polling chờ sẵn
        if (this.pollingWaitingRes.has(sid)) {
            const { res, timer } = this.pollingWaitingRes.get(sid);
            clearTimeout(timer);
            this.pollingWaitingRes.delete(sid);
            const batch = [...queue];
            queue.length = 0;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ messages: batch }));
        }
    }

    broadcastToCity(city, excludeSid, event, data) {
        const room = this.cityRooms.get(city);
        if (!room) return;
        for (const sid of room) {
            if (sid !== excludeSid) {
                this.sendToClient(sid, event, data);
            }
        }
    }

    broadcastAll(event, data) {
        for (const sid of this.players.keys()) {
            this.sendToClient(sid, event, data);
        }
    }

    getPlayersInCity(city) {
        const list = [];
        for (const p of this.players.values()) {
            if (p.city === city) {
                list.push(p);
            }
        }
        return list;
    }

    getLeaderboard() {
        const all = [...this.mockLeaderboard];
        for (const p of this.players.values()) {
            all.push({
                id: p.id,
                name: p.brandName,
                revenue: p.totalRevenue,
                reputation: p.reputation,
                level: p.level,
                city: p.city
            });
        }

        const topRevenue = [...all].sort((a, b) => b.revenue - a.revenue).slice(0, 20);
        const topReputation = [...all].sort((a, b) => b.reputation - a.reputation).slice(0, 20);

        return { topRevenue, topReputation };
    }

    getClientSocketIoScript() {
        return `
/**
 * Embedded Lightweight Socket.io Client for Onigiri Empire 2D
 */
(function(window) {
    function Socket(serverUrl) {
        this.id = 'cli_' + Math.random().toString(36).substring(2, 9);
        this.connected = false;
        this.listeners = {};
        this.url = (serverUrl && serverUrl !== '/') ? serverUrl : window.location.origin;
        this.active = true;
        this._initConnection();
    }

    Socket.prototype.on = function(evt, fn) {
        if (!this.listeners[evt]) this.listeners[evt] = [];
        this.listeners[evt].push(fn);
        return this;
    };

    Socket.prototype._emitLocal = function(evt, data) {
        const list = this.listeners[evt] || [];
        for (let i = 0; i < list.length; i++) {
            try { list[i](data); } catch (e) { console.error('[SocketClient] Listener error:', e); }
        }
    };

    Socket.prototype.emit = function(evt, data) {
        if (!this.active) return this;
        fetch(this.url + '/api/socket/emit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sid: this.id, event: evt, data: data })
        }).catch(function(err) {});
        return this;
    };

    Socket.prototype._initConnection = function() {
        const self = this;
        fetch(this.url + '/api/socket/connect')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data && data.sid) {
                    self.id = data.sid;
                    self.connected = true;
                    self._emitLocal('connect');
                    self._poll();
                }
            })
            .catch(function(err) {
                self._emitLocal('connect_error', err);
            });
    };

    Socket.prototype._poll = function() {
        const self = this;
        if (!this.active) return;
        fetch(this.url + '/api/socket/poll?sid=' + encodeURIComponent(this.id))
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data && Array.isArray(data.messages)) {
                    data.messages.forEach(function(msg) {
                        if (msg && msg.event) {
                            self._emitLocal(msg.event, msg.data);
                        }
                    });
                }
                if (self.active) {
                    setTimeout(function() { self._poll(); }, 50);
                }
            })
            .catch(function(err) {
                if (self.active) {
                    setTimeout(function() { self._poll(); }, 1500);
                }
            });
    };

    Socket.prototype.disconnect = function() {
        this.active = false;
        this.connected = false;
    };

    window.io = function(url, opts) {
        return new Socket(url);
    };
})(typeof window !== 'undefined' ? window : global);
`;
    }

    stop() {
        if (this.io) {
            this.io.close();
        }
        if (this.httpServer) {
            this.httpServer.close();
        }
        for (const item of this.pollingWaitingRes.values()) {
            clearTimeout(item.timer);
            try { item.res.end(JSON.stringify({ messages: [] })); } catch(e) {}
        }
        this.pollingWaitingRes.clear();
    }
}

// Khởi chạy khi tệp được thực thi trực tiếp qua dòng lệnh
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
    const serverInstance = new OnigiriServer();
    serverInstance.start();
}
