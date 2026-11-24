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

        // [ĐỊNH DANH BỀN VỮNG] Bảng ánh xạ playerId <-> socketId
        this.playerSockets = new Map(); // playerId -> socketId
        this.socketToPlayerId = new Map(); // socketId -> playerId
        this.persistentPlayers = new Map(); // playerId -> player profile object
        this.persistentFriends = new Map(); // playerId -> Set(friendPlayerIds)
        this.pendingFriendRequests = new Map(); // targetPlayerId -> Map(fromPlayerId, requestData)

        // Quản lý phòng theo thành phố
        this.cityRooms = new Map();
        SERVER_CONFIG.CITIES.forEach(c => this.cityRooms.set(c, new Set()));

        // Quản lý các phòng đấu trường 1v1
        this.arenaRooms = new Map();

        // [PVP XÁC NHẬN] Quản lý lời mời thách đấu đang chờ phản hồi
        this.pendingPvpInvites = new Map();

        // [CHAT] Lịch sử trò chuyện cộng đồng gần nhất
        this.recentGlobalChat = [
            { id: 'c_1', senderId: 'sys', senderName: 'Bếp Trưởng Quốc Gia', senderLevel: 50, city: 'hcm', text: '🍙 Chào mừng quý đồng nghiệp gia nhập Đế Chế Cơm Nắm!', time: Date.now() - 300000 },
            { id: 'c_2', senderId: 'bot_1', senderName: 'Tập Đoàn Cơm Nắm Sài Gòn', senderLevel: 25, city: 'hcm', text: 'Chào cả nhà! Chi nhánh Bến Thành hôm nay bội thu đơn hàng! 🎉', time: Date.now() - 180000 },
            { id: 'c_3', senderId: 'bot_3', senderName: 'Onigiri Hoàng Gia Hà Nội', senderLevel: 20, city: 'hanoi', text: 'Có ai giao lưu 1v1 bóc rong biển tốc độ không nào? 🍘⚡', time: Date.now() - 60000 }
        ];

        // [BẢNG XẾP HẠNG TỶ PHÚ] Danh sách Top 50 đại gia ẩm thực Cơm Nắm Onigiri
        this.mockBillionaires = this.generateMockBillionaires();

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

            // [PVP 1V1 XÁC NHẬN BẮT BUỘC] Lời mời, Đồng ý, Từ chối & Bấm tap
            socket.on('pvp:invite', (data) => this.handlePvpInvite(socket.id, data));
            socket.on('pvp:decline', (data) => this.handlePvpDecline(socket.id, data));
            socket.on('pvp:accept', (data) => this.handlePvpAccept(socket.id, data));
            socket.on('pvp:tap', (data) => this.handlePvpTap(socket.id, data));

            // [HỆ THỐNG KẾT BẠN]
            socket.on('friend:request', (data) => this.handleFriendRequest(socket.id, data));
            socket.on('friend:accept', (data) => this.handleFriendAccept(socket.id, data));
            socket.on('friend:decline', (data) => this.handleFriendDecline(socket.id, data));
            socket.on('friend:query_status', (data) => this.handleFriendQueryStatus(socket.id, data));

            // [HỆ THỐNG TRÒ CHUYỆN ĐA KÊNH]
            socket.on('chat:message', (data) => this.handleChatMessage(socket.id, data));
            socket.on('chat:get_history', () => this.handleChatGetHistory(socket.id));

            // [BẢNG XẾP HẠNG TỶ PHÚ]
            socket.on('billionaires:get', (data) => this.handleGetBillionaires(socket.id, data));

            // Sự kiện 5: Ngắt kết nối
            socket.on('disconnect', () => {
                const playerId = this.socketToPlayerId.get(socket.id);
                if (playerId && this.playerSockets.get(playerId) === socket.id) {
                    this.playerSockets.delete(playerId);
                }
                this.socketToPlayerId.delete(socket.id);

                const player = this.players.get(socket.id);
                if (player) {
                    const city = player.city;
                    if (this.cityRooms.has(city)) {
                        this.cityRooms.get(city).delete(socket.id);
                    }
                    this.players.delete(socket.id);

                    socket.to(`city_${city}`).emit('playerLeft', { id: socket.id, playerId });
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
            const rawCity = data?.city || data?.branch || SERVER_CONFIG.DEFAULT_CITY;
            const city = rawCity.replace('branch_', '');
            const validCity = SERVER_CONFIG.CITIES.includes(city) ? city : SERVER_CONFIG.DEFAULT_CITY;
            const playerId = (data && data.playerId) ? String(data.playerId) : sid;

            this.playerSockets.set(playerId, sid);
            this.socketToPlayerId.set(sid, playerId);

            const brandName = (data && (data.brandName || data.name)) ? String(data.brandName || data.name).slice(0, 30) : 'Chi Nhánh #' + sid.slice(0, 4);
            const netWorth = Number(data?.netWorth) || 50000;

            const player = {
                id: sid,
                playerId: playerId,
                brandName: brandName,
                name: brandName,
                level: Number(data?.level) || 1,
                vehicleId: data?.vehicleId || 'walking',
                x: typeof data?.x === 'number' ? data.x : 420,
                y: typeof data?.y === 'number' ? data.y : 1250,
                isStallOpen: !!data?.isStallOpen,
                city: validCity,
                branch: validCity,
                totalRevenue: Number(data?.totalRevenue) || 0,
                reputation: Number(data?.reputation) || 100,
                netWorth: netWorth
            };

            this.players.set(sid, player);
            this.persistentPlayers.set(playerId, player);
            if (this.cityRooms.has(validCity)) {
                this.cityRooms.get(validCity).add(sid);
            }

            // Gửi joinSuccess cho client mới (kèm playerId)
            this.sendToClient(sid, 'joinSuccess', {
                selfId: sid,
                playerId: playerId,
                players: this.getPlayersInCity(validCity),
                coopOrder: this.coopOrder,
                leaderboard: this.getLeaderboard()
            });

            // Gửi playerJoined cho các client khác trong phòng
            this.broadcastToCity(validCity, sid, 'playerJoined', player);

            // Gửi playersUpdate cho toàn bộ phòng
            this.broadcastToCity(validCity, null, 'playersUpdate', this.getPlayersInCity(validCity));

            // Chống mất lời mời khi chuyển tab: Gửi lại các lời mời kết bạn đang chờ tới playerId này
            if (this.pendingFriendRequests.has(playerId)) {
                const reqMap = this.pendingFriendRequests.get(playerId);
                for (const req of reqMap.values()) {
                    this.sendEventToUser(sid, 'friend:invite', req);
                }
            }

            // Chống mất lời mời khi chuyển tab: Gửi lại các lời mời thách đấu đang chờ tới playerId này
            for (const inv of this.pendingPvpInvites.values()) {
                if (inv.targetPlayerId === playerId || inv.targetId === sid) {
                    const elapsed = (Date.now() - inv.createdAt) / 1000;
                    const remaining = Math.max(1, Math.round(15 - elapsed));
                    this.sendEventToUser(sid, 'pvp:invite', {
                        inviteId: inv.inviteId,
                        fromId: inv.fromId,
                        fromPlayerId: inv.fromPlayerId,
                        fromName: inv.fromName,
                        fromLevel: inv.fromLevel,
                        fromCity: inv.fromCity,
                        gameType: inv.gameType,
                        betAmount: inv.betAmount,
                        timeoutSeconds: remaining
                    });
                }
            }
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
        } else if (event === 'pvp:invite') {
            this.handlePvpInvite(sid, data);
        } else if (event === 'pvp:decline') {
            this.handlePvpDecline(sid, data);
        } else if (event === 'pvp:accept') {
            this.handlePvpAccept(sid, data);
        } else if (event === 'pvp:tap') {
            this.handlePvpTap(sid, data);
        } else if (event === 'friend:request') {
            this.handleFriendRequest(sid, data);
        } else if (event === 'friend:accept') {
            this.handleFriendAccept(sid, data);
        } else if (event === 'friend:decline') {
            this.handleFriendDecline(sid, data);
        } else if (event === 'friend:query_status') {
            this.handleFriendQueryStatus(sid, data);
        } else if (event === 'chat:message') {
            this.handleChatMessage(sid, data);
        } else if (event === 'chat:get_history') {
            this.handleChatGetHistory(sid);
        } else if (event === 'billionaires:get') {
            this.handleGetBillionaires(sid, data);
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

    resolveSocketId(idOrPlayerId) {
        if (!idOrPlayerId) return null;
        if (this.players.has(idOrPlayerId)) return idOrPlayerId;
        if (this.playerSockets.has(idOrPlayerId)) {
            const sid = this.playerSockets.get(idOrPlayerId);
            if (this.players.has(sid)) return sid;
        }
        for (const [sid, p] of this.players.entries()) {
            if (p.playerId === idOrPlayerId) return sid;
        }
        return null;
    }

    resolvePlayer(idOrPlayerId) {
        if (!idOrPlayerId) return null;
        const sid = this.resolveSocketId(idOrPlayerId);
        if (sid && this.players.has(sid)) return this.players.get(sid);
        if (this.persistentPlayers.has(idOrPlayerId)) return this.persistentPlayers.get(idOrPlayerId);
        return null;
    }

    sendEventToUser(userId, event, data) {
        const socketId = this.resolveSocketId(userId) || userId;
        if (this.io) {
            try {
                let s = null;
                if (this.io.sockets?.sockets?.get) {
                    s = this.io.sockets.sockets.get(socketId);
                } else if (this.io.sockets?.sockets) {
                    s = this.io.sockets.sockets[socketId];
                }
                if (s) {
                    s.emit(event, data);
                }
            } catch (e) {}
        }
        this.sendToClient(socketId, event, data);
    }

    // [PVP 1V1] Xử lý Lời Mời Thách Đấu
    handlePvpInvite(senderId, data) {
        const sender = this.resolvePlayer(senderId) || this.players.get(senderId);
        const targetId = data?.targetPlayerId || data?.targetId;
        const target = this.resolvePlayer(targetId) || this.players.get(targetId);

        if (!sender) return;

        if (!target) {
            this.sendEventToUser(senderId, 'pvp:declined', {
                reason: 'Đối thủ hiện không trực tuyến hoặc đã đổi phòng.'
            });
            return;
        }

        if (sender.id === target.id || (sender.playerId && sender.playerId === target.playerId)) {
            this.sendEventToUser(senderId, 'pvp:declined', {
                reason: 'Bạn không thể tự thách đấu chính mình.'
            });
            return;
        }

        const gameType = data?.gameType === 'seaweed_peel' ? 'seaweed_peel' : 'speed_kitchen';
        const betAmount = [0, 50000, 200000].includes(Number(data?.betAmount)) ? Number(data.betAmount) : 0;
        const inviteId = 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

        // Hủy lời mời cũ nếu có giữa 2 người
        for (const [invId, inv] of this.pendingPvpInvites.entries()) {
            if ((inv.fromPlayerId === sender.playerId || inv.fromId === sender.id) &&
                (inv.targetPlayerId === target.playerId || inv.targetId === target.id)) {
                clearTimeout(inv.timer);
                this.pendingPvpInvites.delete(invId);
            }
        }

        // Tạo timer 15 giây tự động hết hạn nếu đối thủ không phản hồi
        const timer = setTimeout(() => {
            if (this.pendingPvpInvites.has(inviteId)) {
                this.pendingPvpInvites.delete(inviteId);
                const targetName = target ? (target.brandName || target.name) : 'Đối thủ';
                this.sendEventToUser(sender.id, 'pvp:declined', {
                    reason: `[${targetName}] đã từ chối lời mời thách đấu`
                });
                this.sendEventToUser(target.id, 'pvp:invite_expired', { inviteId });
            }
        }, 15000);

        this.pendingPvpInvites.set(inviteId, {
            inviteId,
            fromId: sender.id,
            fromPlayerId: sender.playerId || sender.id,
            fromName: sender.brandName || sender.name,
            fromLevel: sender.level || 1,
            fromCity: sender.city || 'hcm',
            targetId: target.id,
            targetPlayerId: target.playerId || target.id,
            gameType,
            betAmount,
            timer,
            createdAt: Date.now()
        });

        // Gửi thông báo nổi tới riêng Người chơi B
        this.sendEventToUser(target.id, 'pvp:invite', {
            inviteId,
            fromId: sender.id,
            fromPlayerId: sender.playerId || sender.id,
            fromName: sender.brandName || sender.name,
            fromLevel: sender.level || 1,
            fromCity: sender.city || 'hcm',
            gameType,
            betAmount,
            timeoutSeconds: 15
        });
    }

    // [PVP 1V1] Người chơi B bấm Từ Chối
    handlePvpDecline(targetId, data) {
        const inviteId = data?.inviteId;
        const inv = this.pendingPvpInvites.get(inviteId);
        if (!inv) return;

        clearTimeout(inv.timer);
        this.pendingPvpInvites.delete(inviteId);

        const target = this.resolvePlayer(targetId) || this.players.get(targetId);
        const targetName = target ? (target.brandName || target.name) : 'Đối thủ';

        // Báo cho Người chơi A
        this.sendEventToUser(inv.fromId, 'pvp:declined', {
            reason: `[${targetName}] đã từ chối lời mời thách đấu`
        });
    }

    // [PVP 1V1] Người chơi B bấm Đồng Ý
    handlePvpAccept(targetId, data) {
        const inviteId = data?.inviteId;
        const inv = this.pendingPvpInvites.get(inviteId);
        if (!inv) return;

        clearTimeout(inv.timer);
        this.pendingPvpInvites.delete(inviteId);

        const playerA = this.resolvePlayer(inv.fromId) || this.players.get(inv.fromId);
        const playerB = this.resolvePlayer(targetId) || this.players.get(targetId);

        if (!playerA || !playerB) {
            this.sendEventToUser(targetId, 'pvp:declined', { reason: 'Một trong hai người chơi đã rời game.' });
            return;
        }

        const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        const potMoney = inv.betAmount > 0 ? (inv.betAmount * 2) : 100000;

        const roomObj = {
            roomId,
            player1: { id: playerA.id, playerId: playerA.playerId, name: playerA.brandName || playerA.name, level: playerA.level, score: 0 },
            player2: { id: playerB.id, playerId: playerB.playerId, name: playerB.brandName || playerB.name, level: playerB.level, score: 0 },
            gameType: inv.gameType,
            betAmount: inv.betAmount,
            potMoney,
            timeRemaining: 30,
            status: 'PLAYING',
            timer: null
        };

        this.arenaRooms.set(roomId, roomObj);

        // Báo vào trận cho Người chơi A
        this.sendEventToUser(playerA.id, 'pvp:match_start', {
            roomId,
            opponent: { id: playerB.id, playerId: playerB.playerId, name: playerB.brandName || playerB.name, level: playerB.level, city: playerB.city },
            gameType: inv.gameType,
            betAmount: inv.betAmount,
            potMoney,
            timeRemaining: 30
        });

        // Báo vào trận cho Người chơi B
        this.sendEventToUser(playerB.id, 'pvp:match_start', {
            roomId,
            opponent: { id: playerA.id, playerId: playerA.playerId, name: playerA.brandName || playerA.name, level: playerA.level, city: playerA.city },
            gameType: inv.gameType,
            betAmount: inv.betAmount,
            potMoney,
            timeRemaining: 30
        });

        // Bộ đếm thời gian trận đấu 30s
        roomObj.timer = setInterval(() => {
            roomObj.timeRemaining -= 1;

            if (roomObj.timeRemaining <= 0) {
                clearInterval(roomObj.timer);
                roomObj.status = 'FINISHED';

                const p1Score = roomObj.player1.score;
                const p2Score = roomObj.player2.score;

                const isP1Win = p1Score > p2Score;
                const isDraw = p1Score === p2Score;
                const isP2Win = p2Score > p1Score;

                // Gửi kết quả cho P1
                this.sendEventToUser(playerA.id, 'pvp:settlement', {
                    roomId,
                    isWin: isP1Win,
                    isDraw,
                    rewardMoney: isP1Win ? potMoney : (isDraw ? Math.floor(potMoney / 2) : 0),
                    rewardRep: isP1Win ? 15 : (isDraw ? 8 : 0),
                    playerScore: p1Score,
                    opponentScore: p2Score,
                    opponentName: playerB.brandName
                });

                // Gửi kết quả cho P2
                this.sendEventToUser(playerB.id, 'pvp:settlement', {
                    roomId,
                    isWin: isP2Win,
                    isDraw,
                    rewardMoney: isP2Win ? potMoney : (isDraw ? Math.floor(potMoney / 2) : 0),
                    rewardRep: isP2Win ? 15 : (isDraw ? 8 : 0),
                    playerScore: p2Score,
                    opponentScore: p1Score,
                    opponentName: playerA.brandName
                });

                this.arenaRooms.delete(roomId);
            }
        }, 1000);
    }

    // [PVP 1V1] Nhận thao tác bấm Tap của người chơi
    handlePvpTap(userId, data) {
        const roomId = data?.roomId;
        if (!roomId) return;
        const room = this.arenaRooms.get(roomId);
        if (!room || room.status !== 'PLAYING') return;

        let p1Score = room.player1.score;
        let p2Score = room.player2.score;

        if (room.player1.id === userId) {
            room.player1.score += 1;
            p1Score = room.player1.score;
        } else if (room.player2.id === userId) {
            room.player2.score += 1;
            p2Score = room.player2.score;
        } else {
            return;
        }

        // Đồng bộ điểm thời gian thực tới cả 2 người
        const updateData = {
            roomId,
            p1Id: room.player1.id,
            p1Score,
            player1Score: p1Score,
            p2Id: room.player2.id,
            p2Score,
            player2Score: p2Score,
            lastTapperId: userId
        };

        this.sendEventToUser(room.player1.id, 'pvp:score_update', updateData);
        this.sendEventToUser(room.player2.id, 'pvp:score_update', updateData);
    }

    // [HỆ THỐNG KẾT BẠN]
    handleFriendRequest(senderId, data) {
        const sender = this.resolvePlayer(senderId) || this.players.get(senderId);
        const targetId = data?.targetPlayerId || data?.targetId;
        const target = this.resolvePlayer(targetId);

        if (!sender || !target) return;
        if (sender.id === target.id || (sender.playerId && sender.playerId === target.playerId)) return;

        const senderPId = sender.playerId || sender.id;
        const targetPId = target.playerId || target.id;

        const reqData = {
            fromId: sender.id,
            fromPlayerId: senderPId,
            fromName: sender.brandName || sender.name,
            fromLevel: sender.level || 1,
            fromCity: sender.city || 'hcm'
        };

        if (!this.pendingFriendRequests.has(targetPId)) {
            this.pendingFriendRequests.set(targetPId, new Map());
        }
        this.pendingFriendRequests.get(targetPId).set(senderPId, reqData);

        this.sendEventToUser(target.id, 'friend:invite', reqData);
    }

    handleFriendAccept(targetId, data) {
        const fromId = data?.fromPlayerId || data?.fromId;
        const playerA = this.resolvePlayer(fromId);
        const playerB = this.resolvePlayer(targetId);

        if (!playerA || !playerB) return;

        const pIdA = playerA.playerId || playerA.id;
        const pIdB = playerB.playerId || playerB.id;

        if (!this.persistentFriends.has(pIdA)) this.persistentFriends.set(pIdA, new Set());
        if (!this.persistentFriends.has(pIdB)) this.persistentFriends.set(pIdB, new Set());

        this.persistentFriends.get(pIdA).add(pIdB);
        this.persistentFriends.get(pIdB).add(pIdA);

        if (this.pendingFriendRequests.has(pIdB)) {
            this.pendingFriendRequests.get(pIdB).delete(pIdA);
        }

        const friendA = {
            id: playerB.id,
            playerId: pIdB,
            name: playerB.brandName || playerB.name,
            level: playerB.level,
            city: playerB.city
        };
        const friendB = {
            id: playerA.id,
            playerId: pIdA,
            name: playerA.brandName || playerA.name,
            level: playerA.level,
            city: playerA.city
        };

        // Báo cho cả 2 để lưu vào danh bạ
        this.sendEventToUser(playerA.id, 'friend:accepted', { friend: friendA });
        this.sendEventToUser(playerB.id, 'friend:accepted', { friend: friendB });
    }

    handleFriendDecline(targetId, data) {
        const fromId = data?.fromPlayerId || data?.fromId;
        const target = this.resolvePlayer(targetId) || this.players.get(targetId);
        const targetName = target ? (target.brandName || target.name) : 'Người chơi';

        if (target && fromId && this.pendingFriendRequests.has(target.playerId || target.id)) {
            this.pendingFriendRequests.get(target.playerId || target.id).delete(fromId);
        }

        this.sendEventToUser(fromId, 'friend:declined', {
            reason: `[${targetName}] đã từ chối lời mời kết bạn.`
        });
    }

    handleFriendQueryStatus(userId, data) {
        const friendIds = Array.isArray(data?.friendIds) ? data.friendIds : [];
        const result = friendIds.map(fId => {
            const onlinePlayer = this.players.get(fId);
            if (onlinePlayer) {
                return {
                    id: fId,
                    name: onlinePlayer.brandName,
                    isOnline: true,
                    city: onlinePlayer.city,
                    level: onlinePlayer.level
                };
            }
            return { id: fId, isOnline: false };
        });

        this.sendEventToUser(userId, 'friend:status_result', { friends: result });
    }

    // [HỆ THỐNG TRÒ CHUYỆN]
    handleChatMessage(senderId, data) {
        const sender = this.players.get(senderId);
        if (!sender) return;

        const rawText = String(data?.text || '').trim();
        if (rawText.length === 0) return;
        const text = rawText.slice(0, 120);

        if (data?.channel === 'private') {
            const targetId = data?.targetId;
            const target = this.players.get(targetId);
            if (!target) {
                this.sendEventToUser(senderId, 'chat:private_error', { reason: 'Bạn bè hiện đang ngoại tuyến.' });
                return;
            }

            const pmsg = {
                id: 'pmsg_' + Date.now(),
                senderId: senderId,
                senderName: sender.brandName,
                targetId: targetId,
                text,
                time: Date.now()
            };

            this.sendEventToUser(targetId, 'chat:private_message', pmsg);
            this.sendEventToUser(senderId, 'chat:private_sent', pmsg);
        } else {
            // Chat cộng đồng (Global)
            const msg = {
                id: 'msg_' + Date.now(),
                senderId: senderId,
                senderName: sender.brandName,
                senderLevel: sender.level,
                city: sender.city,
                text,
                time: Date.now()
            };

            this.recentGlobalChat.push(msg);
            if (this.recentGlobalChat.length > 50) {
                this.recentGlobalChat.shift();
            }

            // Phát sóng toàn máy chủ
            if (this.io) {
                this.io.emit('chat:broadcast', msg);
            }
            this.broadcastAll('chat:broadcast', msg);
        }
    }

    handleChatGetHistory(userId) {
        this.sendEventToUser(userId, 'chat:history', {
            messages: this.recentGlobalChat
        });
    }

    // [BẢNG XẾP HẠNG TỶ PHÚ]
    handleGetBillionaires(userId, data) {
        const filterCity = data?.city || 'all';
        const list = this.getBillionaires(filterCity);
        this.sendEventToUser(userId, 'billionaires:list', { list });
    }

    generateMockBillionaires() {
        return [
            { id: 'bil_1', name: 'Tập Đoàn Cơm Nắm Sài Gòn 👑', netWorth: 285400000, level: 35, city: 'hcm', isOnline: true },
            { id: 'bil_2', name: 'Onigiri Hoàng Gia Hà Nội ⭐', netWorth: 215000000, level: 32, city: 'hanoi', isOnline: true },
            { id: 'bil_3', name: 'Bếp Cao Nguyên BMT Đắk Lắk 🌾', netWorth: 188500000, level: 30, city: 'daklak', isOnline: true },
            { id: 'bil_4', name: 'Đế Chế Cơm Nắm Xứ Nghệ - Vinh 💎', netWorth: 165000000, level: 28, city: 'vinh', isOnline: true },
            { id: 'bil_5', name: 'Xưởng Cơm Nắm Chợ Lớn Q.5', netWorth: 142000000, level: 26, city: 'hcm', isOnline: false },
            { id: 'bil_6', name: 'Bếp Nắm Hồ Gươm 36 Phố Cổ', netWorth: 128000000, level: 25, city: 'hanoi', isOnline: false },
            { id: 'bil_7', name: 'Onigiri Buôn Ma Thuột Vàng', netWorth: 114000000, level: 23, city: 'daklak', isOnline: false },
            { id: 'bil_8', name: 'Tiệm Cơm Nắm Cửa Lò Bến Thủy', netWorth: 99000000, level: 22, city: 'vinh', isOnline: false },
            { id: 'bil_9', name: 'Chuỗi Cơm Nắm Thủ Đức High-Tech', netWorth: 88500000, level: 20, city: 'hcm', isOnline: true },
            { id: 'bil_10', name: 'Bếp Cơm Nắm Cầu Giấy Sinh Viên', netWorth: 76000000, level: 19, city: 'hanoi', isOnline: false },
            { id: 'bil_11', name: 'Nông Trường Cơm Nắm Krông Pắk', netWorth: 68000000, level: 18, city: 'daklak', isOnline: false },
            { id: 'bil_12', name: 'Tiệm Bánh Nắm Chợ Vinh Cũ', netWorth: 59000000, level: 17, city: 'vinh', isOnline: false },
            { id: 'bil_13', name: 'Onigiri Bến Thành Đệ Nhất', netWorth: 52000000, level: 16, city: 'hcm', isOnline: false },
            { id: 'bil_14', name: 'Tiệm Cơm Nắm Phố Huế Hà Nội', netWorth: 47500000, level: 15, city: 'hanoi', isOnline: false },
            { id: 'bil_15', name: 'Bếp Cơm Nắm Rừng Cao Su BMT', netWorth: 42000000, level: 14, city: 'daklak', isOnline: false }
        ];
    }

    getBillionaires(filterCity = 'all') {
        const pool = [...this.mockBillionaires];

        // Đưa người chơi online thật vào danh sách Tỷ Phú
        for (const p of this.players.values()) {
            const netWorth = typeof p.netWorth === 'number' && p.netWorth > 0
                ? p.netWorth
                : (p.totalRevenue || 0) + (p.level * 3000000) + 15000000;

            pool.push({
                id: p.id,
                name: p.brandName,
                netWorth,
                level: p.level || 1,
                city: p.city || 'hcm',
                isOnline: true,
                isRealPlayer: true
            });
        }

        // Lọc theo chi nhánh nếu được yêu cầu
        let filtered = pool;
        if (filterCity && filterCity !== 'all') {
            const cleanCity = filterCity.replace('branch_', '');
            filtered = pool.filter(b => b.city === cleanCity);
        }

        // Sắp xếp giảm dần theo Tổng Tài Sản Ròng
        const sorted = filtered.sort((a, b) => b.netWorth - a.netWorth).slice(0, 50);

        // Gán huy chương cho Top 1-2-3
        return sorted.map((b, idx) => ({
            ...b,
            rank: idx + 1,
            medal: idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`
        }));
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
        for (const inv of this.pendingPvpInvites.values()) {
            if (inv.timer) clearTimeout(inv.timer);
        }
        this.pendingPvpInvites.clear();
        for (const room of this.arenaRooms.values()) {
            if (room.timer) clearInterval(room.timer);
        }
        this.arenaRooms.clear();
    }
}

// Khởi chạy khi tệp được thực thi trực tiếp qua dòng lệnh
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
    const serverInstance = new OnigiriServer();
    serverInstance.start();
}
