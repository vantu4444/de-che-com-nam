/**
 * src/network.js
 * -----------------------------------------------------------------------------
 * HỆ THỐNG MẠNG ĐỒNG BỘ THỜI GIAN THỰC & GIẢ LẬP BOT THÔNG MINH
 * Dự án: Game Thế Giới Mở 2D "Đế Chế Cơm Nắm" (Onigiri Empire 2D)
 * Chuẩn chất lượng: Principal Engineer / Enterprise Defensive Programming
 * -----------------------------------------------------------------------------
 */

import { state } from './state.js';

export const BOT_PRESETS = {
    hcm: [
        { id: 'bot_hcm_1', name: 'Cơm Nắm Bến Thành Q.1', level: 12, vehicleId: 'delivery_bike', x: 260, y: 340, revenue: 34500000, rep: 480 },
        { id: 'bot_hcm_2', name: 'Tiệm Bếp Bà Năm Sài Gòn', level: 8, vehicleId: 'bike', x: 420, y: 220, revenue: 18200000, rep: 320 },
        { id: 'bot_hcm_3', name: 'Onigiri Gen Z Thủ Đức', level: 15, vehicleId: 'electric_scooter', x: 680, y: 480, revenue: 49000000, rep: 610 },
        { id: 'bot_hcm_4', name: 'Xưởng Cơm Nắm Chợ Lớn', level: 20, vehicleId: 'truck', x: 820, y: 310, revenue: 88000000, rep: 840 }
    ],
    daklak: [
        { id: 'bot_daklak_1', name: 'Cơm Nắm Buôn Ma Thuột', level: 14, vehicleId: 'delivery_bike', x: 300, y: 280, revenue: 39000000, rep: 530 },
        { id: 'bot_daklak_2', name: 'Bếp Cơm Nắm Đắk Lắk', level: 10, vehicleId: 'electric_scooter', x: 520, y: 360, revenue: 24500000, rep: 390 },
        { id: 'bot_daklak_3', name: 'Onigiri Cao Nguyên Xanh', level: 18, vehicleId: 'truck', x: 740, y: 250, revenue: 76000000, rep: 720 }
    ],
    vinh: [
        { id: 'bot_vinh_1', name: 'Cơm Nắm Xứ Nghệ - Vinh', level: 16, vehicleId: 'delivery_bike', x: 350, y: 300, revenue: 52000000, rep: 590 },
        { id: 'bot_vinh_2', name: 'Tiệm Onigiri Cửa Lò', level: 11, vehicleId: 'bike', x: 600, y: 220, revenue: 27000000, rep: 410 }
    ],
    hanoi: [
        { id: 'bot_hanoi_1', name: 'Onigiri Phố Cổ Hà Nội', level: 22, vehicleId: 'truck', x: 280, y: 320, revenue: 105000000, rep: 910 },
        { id: 'bot_hanoi_2', name: 'Bếp Nắm Hồ Gươm 36 Phố', level: 19, vehicleId: 'electric_scooter', x: 500, y: 260, revenue: 84000000, rep: 780 },
        { id: 'bot_hanoi_3', name: 'Cơm Nắm Cầu Giấy Sinh Viên', level: 13, vehicleId: 'delivery_bike', x: 720, y: 400, revenue: 36000000, rep: 460 }
    ]
};

export class NetworkManager {
    constructor() {
        this.status = 'CONNECTING'; // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'OFFLINE_BOT_FALLBACK'
        this.isOnline = false;
        
        // Tự động nhận diện URL máy chủ Node.js (Origin trình duyệt hoặc để Socket.io tự phát hiện)
        const isBrowser = typeof window !== 'undefined' && window.location;
        const isFileProtocol = isBrowser && window.location.protocol === 'file:';
        const detectedOrigin = (isBrowser && !isFileProtocol && window.location.origin && window.location.origin !== 'null') 
            ? window.location.origin 
            : '';
        this.serverUrl = detectedOrigin;
        this.socket = null;
        this.coldStartTimer = null;
        this.selfId = 'player_' + Math.random().toString(36).substring(2, 8);

        // Danh sách người chơi xung quanh (map id -> player object)
        this.otherPlayers = new Map();

        // Quỹ Đơn Hàng Hợp Tác Liên Tỉnh (Co-op)
        this.coopOrder = {
            id: 'coop_order_national',
            title: 'Đại Tiệc Cơm Nắm Toàn Quốc 🍙🎉',
            target: 300,
            current: 45,
            startTime: Date.now(),
            durationSeconds: 600,
            potMoney: 5000000,
            potExp: 1000,
            potRep: 50,
            contributors: {
                'bot_hcm_1': { name: 'Cơm Nắm Bến Thành Q.1', count: 25 },
                'bot_hanoi_1': { name: 'Onigiri Phố Cổ Hà Nội', count: 20 }
            },
            isCompleted: false
        };

        // Bảng xếp hạng Top 20 toàn server
        this.leaderboard = {
            topRevenue: [],
            topReputation: []
        };

        // Quản lý Đấu Trường 1v1 hiện tại
        this.activeArena = null;

        // Bộ lắng nghe sự kiện UI
        this.listeners = {
            onPlayersChange: [],
            onEmoteReceived: [],
            onCoopChange: [],
            onArenaEvent: [],
            onStatusChange: []
        };

        // Thời gian kiểm tra đồng bộ vị trí (15–20 lần/giây = chu kỳ ~50ms)
        this.lastSyncTime = 0;
        this.syncIntervalMs = 50;
    }

    init() {
        this.status = 'CONNECTING';
        this.notifyStatus();
        this.updateHudOnlineStatus();

        // Thử kết nối Socket.io nếu môi trường hỗ trợ
        const hasSocketIoScript = typeof window !== 'undefined' && typeof window.io === 'function';

        if (hasSocketIoScript) {
            try {
                // Tự động kết nối tới origin hiện tại (không hardcode IP/localhost)
                const targetUrl = this.serverUrl || undefined;
                this.socket = window.io(targetUrl, {
                    timeout: 30000,
                    reconnection: true,
                    reconnectionAttempts: 20,
                    reconnectionDelay: 2000,
                    transports: ['websocket', 'polling']
                });

                // Đặt bộ đếm thời gian bù đắp cho Cold Start của Render (server ngủ cần 20–30s)
                if (this.coldStartTimer) clearTimeout(this.coldStartTimer);
                this.coldStartTimer = setTimeout(() => {
                    if (this.status === 'CONNECTING') {
                        this.fallbackToBots();
                    }
                }, 35000);

                this.socket.on('connect', () => {
                    if (this.coldStartTimer) {
                        clearTimeout(this.coldStartTimer);
                        this.coldStartTimer = null;
                    }
                    this.status = 'CONNECTED';
                    this.isOnline = true;
                    this.selfId = this.socket.id;
                    this.selfPlayerId = state.getPlayerId();
                    this.notifyStatus();
                    this.updateHudOnlineStatus();

                    // Đăng ký thông tin người chơi ngay khi kết nối (kèm định danh bền vững playerId)
                    const rawCity = state.currentCity || 'hcm';
                    const city = rawCity.replace('branch_', '');
                    this.socket.emit('joinGame', {
                        playerId: state.getPlayerId(),
                        name: state.brandName || 'Tiệm Cơm Nắm Sài Gòn',
                        brandName: state.brandName || 'Tiệm Cơm Nắm Sài Gòn',
                        branch: city,
                        city: city,
                        level: state.level || 1,
                        vehicleId: state.currentVehicle || 'walking',
                        x: 420,
                        y: 1250,
                        isStallOpen: false,
                        totalRevenue: state.stats?.totalRevenue || 0,
                        reputation: state.reputation || 100,
                        netWorth: typeof state.getNetWorth === 'function' ? state.getNetWorth() : (state.money || 50000)
                    });
                });

                this.setupSocketListeners();

                this.socket.on('connect_error', () => {
                    // Khi server Render đang khởi động, các lần thử kết nối lại vẫn tiếp diễn.
                    // Chỉ khi đã ở trạng thái bot offline thì không đổi trạng thái
                });

                this.socket.on('disconnect', () => {
                    this.fallbackToBots();
                });
            } catch (err) {
                this.fallbackToBots();
            }
        } else {
            // Không có thư viện socket.io client -> chuyển sang chế độ giả lập Bot AI mượt mà ngay
            this.fallbackToBots();
        }

        this.refreshLeaderboard();
    }

    fallbackToBots() {
        if (this.coldStartTimer) {
            clearTimeout(this.coldStartTimer);
            this.coldStartTimer = null;
        }
        if (this.status === 'OFFLINE_BOT_FALLBACK') return;
        this.status = 'OFFLINE_BOT_FALLBACK';
        this.isOnline = false;
        this.notifyStatus();
        this.updateHudOnlineStatus();
        this.spawnBotsForCity(state.currentCity);
    }

    setupSocketListeners() {
        if (!this.socket) return;

        // Người chơi mới nhận danh sách phòng và dữ liệu thế giới
        this.socket.on('joinSuccess', (data) => {
            if (data?.selfId) this.selfId = data.selfId;
            if (data?.players && Array.isArray(data.players)) {
                this.otherPlayers.clear();
                data.players.forEach(p => {
                    if (p.id !== this.selfId) {
                        this.otherPlayers.set(p.id, p);
                    }
                });
                this.notifyPlayers();
                this.updateHudOnlineStatus();
            }
            if (data?.coopOrder) {
                this.coopOrder = data.coopOrder;
                this.notifyCoop();
            }
            if (data?.leaderboard) {
                this.leaderboard = data.leaderboard;
            }
        });

        // Tương thích ngược sự kiện init_state
        this.socket.on('init_state', (data) => {
            if (data?.players) this.socket.emit('joinSuccess', data);
        });

        // Người chơi mới gia nhập phòng
        this.socket.on('playerJoined', (player) => {
            if (player && player.id !== this.selfId) {
                this.otherPlayers.set(player.id, player);
                this.notifyPlayers();
                this.updateHudOnlineStatus();
            }
        });

        // Cập nhật tọa độ người chơi khác (15–20 lần/giây)
        this.socket.on('playerMove', (data) => {
            if (!data || data.id === this.selfId) return;
            let p = this.otherPlayers.get(data.id);
            if (!p) {
                p = { id: data.id, brandName: data.brandName || 'Người chơi', level: 1, x: data.x, y: data.y };
                this.otherPlayers.set(data.id, p);
            }
            p.x = data.x;
            p.y = data.y;
            if (typeof data.isStallOpen === 'boolean') p.isStallOpen = data.isStallOpen;
            if (data.vehicleId) p.vehicleId = data.vehicleId;
            if (data.facing) p.facing = data.facing;
            this.notifyPlayers();
        });

        // Cập nhật toàn bộ danh sách phòng
        this.socket.on('playersUpdate', (playersList) => {
            if (Array.isArray(playersList)) {
                this.otherPlayers.clear();
                playersList.forEach(p => {
                    if (p.id !== this.selfId) {
                        this.otherPlayers.set(p.id, p);
                    }
                });
                this.notifyPlayers();
                this.updateHudOnlineStatus();
            }
        });

        // Người chơi rời phòng
        this.socket.on('playerLeft', (data) => {
            if (data?.id) {
                this.otherPlayers.delete(data.id);
                this.notifyPlayers();
                this.updateHudOnlineStatus();
            }
        });

        // Biểu cảm Emote
        this.socket.on('playerEmoted', (data) => {
            const p = this.otherPlayers.get(data.id);
            if (p) {
                p.emote = { type: data.type, time: Date.now() };
            }
            this.emitEvent('onEmoteReceived', data);
        });

        // Co-op cập nhật
        this.socket.on('coopUpdated', (data) => {
            if (data?.coopOrder) {
                this.coopOrder = data.coopOrder;
                this.notifyCoop();
            }
        });

        // [PVP 1V1 XÁC NHẬN BẮT BUỘC] Lắng nghe sự kiện từ Server
        this.socket.on('pvp:invite', (data) => {
            this.emitEvent('onPvpInvite', data);
        });

        this.socket.on('pvp:declined', (data) => {
            this.emitEvent('onPvpDeclined', data);
        });

        this.socket.on('pvp:invite_expired', (data) => {
            this.emitEvent('onPvpInviteExpired', data);
        });

        this.socket.on('pvp:match_start', (data) => {
            this.activeArena = {
                id: data.roomId,
                gameType: data.gameType,
                opponentId: data.opponent?.id,
                opponentPlayerId: data.opponent?.playerId,
                opponentName: data.opponent?.name || 'Đối thủ',
                status: 'PLAYING',
                timeRemaining: data.timeRemaining || 30,
                playerScore: 0,
                opponentScore: 0,
                betAmount: data.betAmount || 0,
                potMoney: data.potMoney || 0,
                result: null
            };

            // Trừ tiền cược khi bước vào trận đấu chính thức
            if (data.betAmount > 0) {
                state.money = Math.max(0, (state.money || 0) - Number(data.betAmount));
                state.notify();
            }

            this.emitEvent('onArenaEvent', { type: 'MATCH_STARTED', arena: this.activeArena });
        });

        this.socket.on('pvp:score_update', (data) => {
            if (this.activeArena && this.activeArena.id === data.roomId) {
                const myPlayerId = this.playerId || (typeof localStorage !== 'undefined' ? localStorage.getItem('onigiri_player_id') : null);
                const isP1 = (data.p1Id === this.selfId) || (data.p1PlayerId && data.p1PlayerId === myPlayerId);
                if (isP1) {
                    this.activeArena.playerScore = data.p1Score;
                    this.activeArena.opponentScore = data.p2Score;
                } else {
                    this.activeArena.playerScore = data.p2Score;
                    this.activeArena.opponentScore = data.p1Score;
                }
                this.emitEvent('onArenaEvent', { type: 'SCORE_UPDATE', arena: this.activeArena });
            }
        });

        this.socket.on('pvp:settlement', (data) => {
            if (this.activeArena && this.activeArena.id === data.roomId) {
                this.activeArena.status = 'FINISHED';
                this.activeArena.result = {
                    isWin: data.isWin,
                    isDraw: data.isDraw,
                    rewardMoney: data.rewardMoney,
                    rewardRep: data.rewardRep
                };

                if (data.isWin) {
                    state.record1v1Win();
                } else if (!data.isDraw) {
                    state.record1v1Loss();
                }

                if (data.rewardMoney > 0) {
                    state.money += data.rewardMoney;
                }
                if (data.rewardRep > 0) {
                    state.reputation = Math.min(1000, (state.reputation || 100) + data.rewardRep);
                }
                state.notify();

                this.emitEvent('onArenaEvent', { type: 'MATCH_FINISHED', arena: this.activeArena });
            }
        });

        // [HỆ THỐNG KẾT BẠN]
        this.socket.on('friend:invite', (data) => {
            this.emitEvent('onFriendInvite', data);
        });

        this.socket.on('friend:accepted', (data) => {
            if (data?.friend) {
                state.addFriend(data.friend);
            }
            this.emitEvent('onFriendAccepted', data);
        });

        this.socket.on('friend:declined', (data) => {
            this.emitEvent('onFriendDeclined', data);
        });

        this.socket.on('friend:status_result', (data) => {
            this.emitEvent('onFriendsStatus', data?.friends || []);
        });

        // [HỆ THỐNG TRÒ CHUYỆN]
        this.socket.on('chat:broadcast', (data) => {
            this.emitEvent('onChatBroadcast', data);
        });

        this.socket.on('chat:private_message', (data) => {
            if (data) {
                state.addPrivateMessage(data.senderId, {
                    from: 'friend',
                    senderName: data.senderName,
                    text: data.text,
                    time: data.time || Date.now(),
                    unread: true
                });
            }
            this.emitEvent('onPrivateMessage', data);
        });

        this.socket.on('chat:history', (data) => {
            this.emitEvent('onChatHistory', data?.messages || []);
        });

        // [BẢNG XẾP HẠNG TỶ PHÚ]
        this.socket.on('billionaires:list', (data) => {
            this.emitEvent('onBillionairesList', data?.list || []);
        });
    }

    // Cập nhật đèn báo trạng thái kết nối trên thanh HUD
    updateHudOnlineStatus() {
        if (typeof document === 'undefined') return;
        const statusEl = document.getElementById('hudOnlineStatus');
        if (!statusEl) return;

        if (this.status === 'CONNECTING') {
            statusEl.textContent = '🟡 Đang kết nối máy chủ...';
            statusEl.className = 'hud-online-status is-connecting';
        } else if (this.isOnline) {
            const totalCount = this.otherPlayers.size + 1; // Bao gồm cả chính mình
            statusEl.textContent = `🟢 Online (${totalCount} người chơi)`;
            statusEl.className = 'hud-online-status is-online';
        } else {
            statusEl.textContent = '⚪ Offline (Chế độ đơn)';
            statusEl.className = 'hud-online-status is-offline';
        }
    }

    // Sinh dàn Bot AI mô phỏng theo thành phố khi chạy offline
    spawnBotsForCity(cityBranchId) {
        const rawCity = cityBranchId ? cityBranchId.replace('branch_', '') : 'hcm';
        const list = BOT_PRESETS[rawCity] || BOT_PRESETS.hcm;

        this.otherPlayers.clear();
        list.forEach(bot => {
            this.otherPlayers.set(bot.id, {
                id: bot.id,
                brandName: bot.name,
                level: bot.level,
                vehicleId: bot.vehicleId,
                x: bot.x,
                y: bot.y,
                vx: (Math.random() - 0.5) * 1.2,
                vy: (Math.random() - 0.5) * 1.2,
                targetX: bot.x,
                targetY: bot.y,
                isStallOpen: Math.random() > 0.5,
                city: rawCity,
                totalRevenue: bot.revenue,
                reputation: bot.rep,
                isBot: true,
                emote: null
            });
        });

        this.notifyPlayers();
        this.refreshLeaderboard();
    }

    // Cập nhật tọa độ và trạng thái của người chơi chính phát sóng tới server (15–20 lần/giây)
    updatePlayerState(x, y, isStallOpen, currentVehicle, cityId, facing = 1) {
        const now = Date.now();
        if (now - this.lastSyncTime < this.syncIntervalMs) return;
        this.lastSyncTime = now;

        const rawCity = cityId ? cityId.replace('branch_', '') : 'hcm';

        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('playerMove', {
                x: Math.round(x),
                y: Math.round(y),
                isStallOpen: !!isStallOpen,
                vehicleId: currentVehicle,
                facing: facing,
                city: rawCity,
                level: state.level,
                brandName: state.brandName,
                totalRevenue: state.stats?.totalRevenue || 0,
                reputation: state.reputation || 100
            });
        }
    }

    // Gửi biểu cảm tương tác (Vẫy tay 👋, Tặng tim ❤️, Cổ vũ 🍙)
    sendEmote(type, targetPlayerId = null) {
        const validTypes = ['wave', 'heart', 'cheer'];
        const emoteType = validTypes.includes(type) ? type : 'wave';

        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('playerEmote', { type: emoteType, targetId: targetPlayerId });
        } else {
            // Chế độ Bot: Tạo phản hồi mô phỏng tự nhiên từ Bot
            this.emitEvent('onEmoteReceived', {
                id: this.selfId,
                targetId: targetPlayerId,
                type: emoteType
            });

            if (targetPlayerId && this.otherPlayers.has(targetPlayerId)) {
                const targetBot = this.otherPlayers.get(targetPlayerId);
                targetBot.emote = { type: emoteType, time: Date.now() };

                // Bot phản hồi lại sau 800ms
                setTimeout(() => {
                    const replyTypes = ['heart', 'cheer', 'wave'];
                    const replyType = replyTypes[Math.floor(Math.random() * replyTypes.length)];
                    targetBot.emote = { type: replyType, time: Date.now() };
                    this.emitEvent('onEmoteReceived', {
                        id: targetBot.id,
                        targetId: this.selfId,
                        type: replyType
                    });
                }, 800);
            }
        }
    }

    // Góp cơm vào Đơn Hàng Hợp Tác (Co-op)
    contributeCoopRice(count) {
        const actualCount = Math.max(1, Math.min(count, state.inventory.length));
        if (actualCount <= 0) return { success: false, message: 'Bạn không có cơm nắm trong kho để góp!' };

        // Loại bỏ cơm khỏi kho
        for (let i = 0; i < actualCount; i++) {
            state.inventory.pop();
        }
        state.recordCoopContributed(actualCount);

        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('coop_contribute', { count: actualCount });
        } else {
            // Mô phỏng góp cơm offline
            this.coopOrder.current = Math.min(this.coopOrder.target, this.coopOrder.current + actualCount);
            if (!this.coopOrder.contributors[this.selfId]) {
                this.coopOrder.contributors[this.selfId] = { name: state.brandName, count: 0 };
            }
            this.coopOrder.contributors[this.selfId].count += actualCount;

            let completed = false;
            if (this.coopOrder.current >= this.coopOrder.target && !this.coopOrder.isCompleted) {
                this.coopOrder.isCompleted = true;
                completed = true;
                this.settleCoopRewards();
            }

            this.notifyCoop();
        }

        return { success: true, count: actualCount };
    }

    // Trao thưởng khi hoàn thành đơn Co-op theo tỷ lệ đóng góp
    settleCoopRewards() {
        const myContrib = this.coopOrder.contributors[this.selfId]?.count || 0;
        if (myContrib <= 0) return null;

        const ratio = myContrib / this.coopOrder.target;
        const rewardMoney = Math.floor(this.coopOrder.potMoney * ratio);
        const rewardExp = Math.floor(this.coopOrder.potExp * ratio);
        const rewardRep = Math.max(5, Math.floor(this.coopOrder.potRep * ratio));

        state.money += rewardMoney;
        state.addExp(rewardExp);
        state.reputation = Math.min(1000, state.reputation + rewardRep);
        state.notify();

        return { rewardMoney, rewardExp, rewardRep, ratio: Math.round(ratio * 100) };
    }

    // Lấy danh sách người chơi quanh đây sắp xếp theo khoảng cách mét
    getNearbyPlayers(localX = 420, localY = 1250) {
        const list = [];
        for (const p of this.otherPlayers.values()) {
            const px = typeof p.x === 'number' ? p.x : 420;
            const py = typeof p.y === 'number' ? p.y : 1250;
            const distPx = Math.hypot(px - localX, py - localY);
            const distMeters = Math.max(1, Math.round(distPx / 10));
            list.push({
                ...p,
                distPx,
                distMeters
            });
        }
        return list.sort((a, b) => a.distPx - b.distPx);
    }

    // [PVP 1V1 XÁC NHẬN BẮT BUỘC] Gửi Lời Mời Thách Đấu
    sendPvpInvite(targetIdOrPlayer, gameType = 'speed_kitchen', betAmount = 0) {
        const targetId = typeof targetIdOrPlayer === 'object' ? targetIdOrPlayer.id : targetIdOrPlayer;
        const targetPlayerId = typeof targetIdOrPlayer === 'object' ? (targetIdOrPlayer.playerId || targetIdOrPlayer.id) : targetId;
        const targetName = typeof targetIdOrPlayer === 'object' ? (targetIdOrPlayer.brandName || targetIdOrPlayer.name) : targetId;
        const bet = [0, 50000, 200000].includes(Number(betAmount)) ? Number(betAmount) : 0;
        const gType = gameType === 'seaweed_peel' ? 'seaweed_peel' : 'speed_kitchen';

        if (bet > 0 && (state.money || 0) < bet) {
            return { success: false, reason: 'not_enough_money', message: `Bạn không đủ ${bet.toLocaleString('vi-VN')}đ để đặt cược!` };
        }

        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('pvp:invite', {
                targetId,
                targetPlayerId,
                gameType: gType,
                betAmount: bet
            });
            return { success: true, message: `Đã gửi lời mời thách đấu tới [${targetName}]! Vui lòng chờ xác nhận...` };
        } else {
            // Chế độ Giả lập Offline Bot
            const opponent = typeof targetIdOrPlayer === 'object' ? targetIdOrPlayer : this.otherPlayers.get(targetId);
            const opponentName = opponent ? (opponent.brandName || opponent.name) : targetName;

            // Mô phỏng đối thủ suy nghĩ trong 1.2s rồi đồng ý
            setTimeout(() => {
                this.start1v1Match(targetId, gType, bet);
            }, 1200);

            return { success: true, message: `Đang gửi lời mời tới ${opponentName}...` };
        }
    }

    // [PVP 1V1] Phản hồi Lời mời: Đồng Ý
    acceptPvpInvite(inviteId) {
        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('pvp:accept', { inviteId });
        }
    }

    // [PVP 1V1] Phản hồi Lời mời: Từ Chối
    declinePvpInvite(inviteId) {
        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('pvp:decline', { inviteId });
        }
    }

    // [PVP 1V1] Gửi thao tác bấm Tap trong trận đấu
    sendPvpTap(roomId) {
        if (this.activeArena && this.activeArena.status === 'PLAYING') {
            this.activeArena.playerScore += 1;
            this.emitEvent('onArenaEvent', { type: 'SCORE_UPDATE', arena: this.activeArena });
        }

        if (this.isOnline && this.socket && this.socket.connected && roomId) {
            this.socket.emit('pvp:tap', { roomId });
        }
    }

    // [HỆ THỐNG KẾT BẠN]
    sendFriendRequest(targetIdOrPlayer) {
        const targetId = typeof targetIdOrPlayer === 'object' ? targetIdOrPlayer.id : targetIdOrPlayer;
        const targetPlayerId = typeof targetIdOrPlayer === 'object' ? (targetIdOrPlayer.playerId || targetIdOrPlayer.id) : targetId;
        const targetName = typeof targetIdOrPlayer === 'object' ? (targetIdOrPlayer.brandName || targetIdOrPlayer.name) : targetId;

        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('friend:request', {
                targetId,
                targetPlayerId,
                fromPlayerId: state.getPlayerId()
            });
            return { success: true, message: `Đã gửi lời mời kết bạn tới [${targetName}]!` };
        } else {
            // Chế độ Bot: Tự động đồng ý sau 800ms
            const target = typeof targetIdOrPlayer === 'object' ? targetIdOrPlayer : this.otherPlayers.get(targetId);
            if (target) {
                setTimeout(() => {
                    state.addFriend({
                        id: target.id,
                        playerId: target.playerId || target.id,
                        name: target.brandName || target.name,
                        level: target.level || 1,
                        city: target.city || target.branch || 'hcm'
                    });
                    this.emitEvent('onFriendAccepted', { friend: target });
                }, 800);
            }
            return { success: true, message: `Đã gửi lời mời kết bạn tới [${targetName}]!` };
        }
    }

    acceptFriendRequest(fromId) {
        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('friend:accept', {
                fromId,
                fromPlayerId: fromId,
                toPlayerId: state.getPlayerId()
            });
        }
    }

    declineFriendRequest(fromId) {
        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('friend:decline', {
                fromId,
                fromPlayerId: fromId,
                toPlayerId: state.getPlayerId()
            });
        }
    }

    queryFriendsStatus(friendIds) {
        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('friend:query_status', { friendIds });
        } else {
            // Offline fallback
            const res = (friendIds || []).map(fId => {
                const p = this.otherPlayers.get(fId);
                return { id: fId, isOnline: Boolean(p), city: p?.city || 'hcm', level: p?.level || 1 };
            });
            this.emitEvent('onFriendsStatus', res);
        }
    }

    // [HỆ THỐNG TRÒ CHUYỆN]
    sendChatMessage(text, channel = 'global', targetId = null) {
        const clean = String(text || '').trim();
        if (!clean) return;

        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('chat:message', {
                channel,
                targetId,
                text: clean,
                senderName: state.brandName || 'Bạn',
                senderLevel: state.level || 1,
                city: state.currentCity || 'hcm'
            });
        } else {
            // Mô phỏng trò chuyện Offline
            const msg = {
                id: 'msg_' + Date.now(),
                senderId: this.selfId,
                senderName: state.brandName || 'Bạn',
                senderLevel: state.level || 1,
                city: state.currentCity ? state.currentCity.replace('branch_', '') : 'hcm',
                text: clean,
                time: Date.now()
            };

            if (channel === 'private' && targetId) {
                state.addPrivateMessage(targetId, {
                    from: 'self',
                    senderName: state.brandName,
                    text: clean,
                    time: Date.now(),
                    unread: false
                });
                this.emitEvent('onPrivateMessage', msg);
            } else {
                this.emitEvent('onChatBroadcast', msg);

                // Bot phản hồi vui nhộn ngẫu nhiên sau 1.5s
                if (Math.random() < 0.6) {
                    setTimeout(() => {
                        const botReplies = [
                            '🍙 Chúc bạn buôn may bán đắt!',
                            'Chuẩn vị ISO luôn nhé người anh em! ✨',
                            'Có cơm nắm mới ra lò thơm phức đây! 🎉',
                            'Làm ván 1v1 bóc rong biển không bạn ơi? 🍘'
                        ];
                        const botMsg = {
                            id: 'msg_bot_' + Date.now(),
                            senderId: 'bot_' + Math.floor(Math.random() * 5 + 1),
                            senderName: 'Tiệm Cơm Nắm Chú Ba',
                            senderLevel: 15,
                            city: 'hcm',
                            text: botReplies[Math.floor(Math.random() * botReplies.length)],
                            time: Date.now()
                        };
                        this.emitEvent('onChatBroadcast', botMsg);
                    }, 1500);
                }
            }
        }
    }

    getChatHistory() {
        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('chat:get_history');
        }
    }

    // [BẢNG XẾP HẠNG TỶ PHÚ]
    getBillionaires(filterCity = 'all') {
        if (this.isOnline && this.socket && this.socket.connected) {
            this.socket.emit('billionaires:get', { city: filterCity });
        } else {
            // Offline fallback
            const mockList = [
                { id: 'bil_1', name: 'Tập Đoàn Cơm Nắm Sài Gòn 👑', netWorth: 285400000, level: 35, city: 'hcm', isOnline: true },
                { id: 'bil_2', name: 'Onigiri Hoàng Gia Hà Nội ⭐', netWorth: 215000000, level: 32, city: 'hanoi', isOnline: true },
                { id: 'bil_3', name: 'Bếp Cao Nguyên BMT Đắk Lắk 🌾', netWorth: 188500000, level: 30, city: 'daklak', isOnline: true },
                { id: 'bil_4', name: 'Đế Chế Cơm Nắm Xứ Nghệ - Vinh 💎', netWorth: 165000000, level: 28, city: 'vinh', isOnline: true },
                { id: 'bil_5', name: 'Xưởng Cơm Nắm Chợ Lớn Q.5', netWorth: 142000000, level: 26, city: 'hcm', isOnline: false },
                { id: 'bil_6', name: 'Bếp Nắm Hồ Gươm 36 Phố Cổ', netWorth: 128000000, level: 25, city: 'hanoi', isOnline: false },
                { id: 'bil_7', name: 'Onigiri Buôn Ma Thuột Vàng', netWorth: 114000000, level: 23, city: 'daklak', isOnline: false },
                { id: 'bil_8', name: 'Tiệm Cơm Nắm Cửa Lò Bến Thủy', netWorth: 99000000, level: 22, city: 'vinh', isOnline: false }
            ];

            // Thêm người chơi
            const myNetWorth = typeof state.getNetWorth === 'function' ? state.getNetWorth() : (state.money || 50000);
            mockList.push({
                id: this.selfId,
                name: (state.brandName || 'Bạn') + ' (Bạn)',
                netWorth: myNetWorth,
                level: state.level || 1,
                city: state.currentCity ? state.currentCity.replace('branch_', '') : 'hcm',
                isOnline: true,
                isSelf: true
            });

            let filtered = mockList;
            if (filterCity && filterCity !== 'all') {
                const c = filterCity.replace('branch_', '');
                filtered = mockList.filter(b => b.city === c);
            }
            const sorted = filtered.sort((a, b) => b.netWorth - a.netWorth).slice(0, 50);
            const res = sorted.map((b, idx) => ({
                ...b,
                rank: idx + 1,
                medal: idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`
            }));

            this.emitEvent('onBillionairesList', res);
        }
    }

    // Khởi tạo hoặc mời thách đấu 1v1 (Hỗ trợ gọi trực tiếp)
    start1v1Match(opponentId, gameType = 'speed_kitchen', betAmount = 0) {
        const opponent = this.otherPlayers.get(opponentId);
        const opponentName = opponent ? opponent.brandName : 'Đối thủ bí ẩn';
        const potMoney = betAmount > 0 ? betAmount * 2 : 100000;

        this.activeArena = {
            id: 'arena_' + Date.now(),
            gameType: gameType === 'seaweed_peel' ? 'seaweed_peel' : 'speed_kitchen',
            opponentId,
            opponentName,
            status: 'COUNTDOWN', // 'COUNTDOWN' | 'PLAYING' | 'FINISHED'
            countdown: 3,
            timeRemaining: 30,
            playerScore: 0,
            opponentScore: 0,
            betAmount,
            potMoney,
            result: null
        };

        this.emitEvent('onArenaEvent', { type: 'MATCH_STARTED', arena: this.activeArena });
        return this.activeArena;
    }

    // Bảng xếp hạng Top 20 Doanh thu & Danh vọng
    refreshLeaderboard() {
        const pool = [
            { id: 'p_self', name: state.brandName + ' (Bạn)', revenue: state.stats?.totalRevenue || 0, reputation: state.reputation || 100, level: state.level, city: state.currentCity ? state.currentCity.replace('branch_', '') : 'hcm', isSelf: true },
            { id: 'b_1', name: 'Tập Đoàn Cơm Nắm Sài Gòn', revenue: 154200000, reputation: 980, level: 25, city: 'hcm' },
            { id: 'b_2', name: 'Onigiri Phố Cổ Hà Nội', revenue: 105000000, reputation: 910, level: 22, city: 'hanoi' },
            { id: 'b_3', name: 'Bếp Cơm Nắm BMT Cao Nguyên', revenue: 98500000, reputation: 820, level: 22, city: 'daklak' },
            { id: 'b_4', name: 'Xưởng Cơm Nắm Chợ Lớn', revenue: 88000000, reputation: 840, level: 20, city: 'hcm' },
            { id: 'b_5', name: 'Bếp Nắm Hồ Gươm 36 Phố', revenue: 84000000, reputation: 780, level: 19, city: 'hanoi' },
            { id: 'b_6', name: 'Onigiri Cao Nguyên Xanh', revenue: 76000000, reputation: 720, level: 18, city: 'daklak' },
            { id: 'b_7', name: 'Cơm Nắm Xứ Nghệ - Vinh', revenue: 64200000, reputation: 640, level: 17, city: 'vinh' },
            { id: 'b_8', name: 'Onigiri Gen Z Thủ Đức', revenue: 49000000, reputation: 610, level: 15, city: 'hcm' },
            { id: 'b_9', name: 'Tiệm Cơm Nắm Chú Ba', revenue: 45000000, reputation: 520, level: 15, city: 'hcm' },
            { id: 'b_10', name: 'Cơm Nắm Buôn Ma Thuột', revenue: 39000000, reputation: 530, level: 14, city: 'daklak' },
            { id: 'b_11', name: 'Bếp Nhà Mẹ Nấu 1985', revenue: 38500000, reputation: 460, level: 14, city: 'hanoi' },
            { id: 'b_12', name: 'Cơm Nắm Cầu Giấy Sinh Viên', revenue: 36000000, reputation: 460, level: 13, city: 'hanoi' },
            { id: 'b_13', name: 'Cơm Nắm Bến Thành Q.1', revenue: 34500000, reputation: 480, level: 12, city: 'hcm' },
            { id: 'b_14', name: 'Cơm Nắm Mayo Béo Ngậy', revenue: 29000000, reputation: 390, level: 12, city: 'daklak' },
            { id: 'b_15', name: 'Tiệm Onigiri Cửa Lò', revenue: 27000000, reputation: 410, level: 11, city: 'vinh' },
            { id: 'b_16', name: 'Bếp Cơm Nắm Đắk Lắk', revenue: 24500000, reputation: 390, level: 10, city: 'daklak' },
            { id: 'b_17', name: 'Tiệm Bếp Bà Năm Sài Gòn', revenue: 18200000, reputation: 320, level: 8, city: 'hcm' },
            { id: 'b_18', name: 'Bếp Nhanh Cổng Trường ĐH', revenue: 16500000, reputation: 290, level: 8, city: 'hcm' },
            { id: 'b_19', name: 'Tiệm Cơm Nắm Bé Bông', revenue: 12000000, reputation: 240, level: 7, city: 'vinh' },
            { id: 'b_20', name: 'Onigiri Xe Đẩy Vỉa Hè', revenue: 8500000, reputation: 210, level: 5, city: 'hcm' }
        ];

        this.leaderboard.topRevenue = [...pool].sort((a, b) => b.revenue - a.revenue).slice(0, 20);
        this.leaderboard.topReputation = [...pool].sort((a, b) => b.reputation - a.reputation).slice(0, 20);

        return this.leaderboard;
    }

    // Cập nhật vòng lặp Game Loop (di chuyển Bot & countdown đấu trường)
    update(dt = 0.016) {
        // Cập nhật hành vi di chuyển mượt mà của Bot khi ở chế độ offline
        if (this.status === 'OFFLINE_BOT_FALLBACK') {
            for (const bot of this.otherPlayers.values()) {
                if (bot.isBot) {
                    // Nếu đang mở sạp thì đứng yên bán hàng
                    if (bot.isStallOpen) {
                        // Thỉnh thoảng đóng sạp để đi tiếp
                        if (Math.random() < 0.002) {
                            bot.isStallOpen = false;
                        }
                        continue;
                    }

                    // Di chuyển ngẫu nhiên chậm rãi
                    bot.x += bot.vx * 30 * dt;
                    bot.y += bot.vy * 30 * dt;

                    // Giữ bot trong phạm vi đường phố bản đồ (100 -> 900)
                    if (bot.x < 120 || bot.x > 880) {
                        bot.vx = -bot.vx;
                        bot.x = Math.max(120, Math.min(880, bot.x));
                    }
                    if (bot.y < 120 || bot.y > 600) {
                        bot.vy = -bot.vy;
                        bot.y = Math.max(120, Math.min(600, bot.y));
                    }

                    // Xác suất đổi hướng hoặc mở sạp
                    if (Math.random() < 0.005) {
                        bot.vx = (Math.random() - 0.5) * 1.5;
                        bot.vy = (Math.random() - 0.5) * 1.5;
                    }
                    if (Math.random() < 0.002) {
                        bot.isStallOpen = true;
                    }
                }
            }
        }

        // Cập nhật Đấu Trường 1v1 nếu đang diễn ra
        if (this.activeArena && this.activeArena.status !== 'FINISHED') {
            if (this.activeArena.status === 'COUNTDOWN') {
                this.activeArena.countdown -= dt;
                if (this.activeArena.countdown <= 0) {
                    this.activeArena.status = 'PLAYING';
                    this.emitEvent('onArenaEvent', { type: 'COUNTDOWN_DONE', arena: this.activeArena });
                }
            } else if (this.activeArena.status === 'PLAYING') {
                this.activeArena.timeRemaining -= dt;

                // Tự động sinh điểm cho bot đối thủ một cách tự nhiên
                if (Math.random() < 0.04) {
                    this.activeArena.opponentScore += 1;
                    this.emitEvent('onArenaEvent', { type: 'SCORE_UPDATE', arena: this.activeArena });
                }

                if (this.activeArena.timeRemaining <= 0) {
                    this.activeArena.timeRemaining = 0;
                    this.activeArena.status = 'FINISHED';

                    const isWin = this.activeArena.playerScore > this.activeArena.opponentScore;
                    const isDraw = this.activeArena.playerScore === this.activeArena.opponentScore;

                    let rewardMoney = 50000;
                    let rewardRep = 5;

                    if (isWin) {
                        rewardMoney = 200000 + (this.activeArena.playerScore * 20000);
                        rewardRep = 15;
                        state.record1v1Win();
                    } else if (isDraw) {
                        rewardMoney = 100000;
                        rewardRep = 8;
                    } else {
                        state.record1v1Loss();
                    }

                    state.money += rewardMoney;
                    state.reputation = Math.min(1000, state.reputation + rewardRep);
                    state.notify();

                    this.activeArena.result = {
                        isWin,
                        isDraw,
                        rewardMoney,
                        rewardRep
                    };

                    this.emitEvent('onArenaEvent', { type: 'MATCH_FINISHED', arena: this.activeArena });
                }
            }
        }
    }

    // Đăng ký sự kiện (tự động khởi tạo mảng nếu chưa có)
    on(event, fn) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(fn);
    }

    emitEvent(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(fn => {
                try {
                    fn(data);
                } catch (e) {
                    console.error('[NetworkManager] Error in listener:', e);
                }
            });
        }
    }

    notifyStatus() {
        this.emitEvent('onStatusChange', { status: this.status, isOnline: this.isOnline });
    }

    notifyPlayers() {
        this.emitEvent('onPlayersChange', Array.from(this.otherPlayers.values()));
    }

    notifyCoop() {
        this.emitEvent('onCoopChange', this.coopOrder);
    }
}

export const network = new NetworkManager();
