/**
 * src/onlineUI.js
 * -----------------------------------------------------------------------------
 * GIAO DIỆN CỘNG ĐỒNG ONLINE, BẢNG XẾP HẠNG TỶ PHÚ, ĐẤU TRƯỜNG 1V1 XÁC NHẬN,
 * HỆ THỐNG KẾT BẠN & TRÒ CHUYỆN ĐA KÊNH THỜI GIAN THỰC
 * Dự án: Game Thế Giới Mở 2D "Đế Chế Cơm Nắm" (Onigiri Empire 2D)
 * Chuẩn chất lượng: Principal Engineer / Enterprise Defensive Programming
 * -----------------------------------------------------------------------------
 */

import { state } from './state.js';
import { audio } from './audio.js';
import { network } from './network.js';

export class OnlineUIManager {
    constructor() {
        this.activeSubTab = 'billionaires'; // 'billionaires' | 'arena' | 'chat' | 'coop'
        this.billionaireCityFilter = 'all';  // 'all' | 'hcm' | 'daklak' | 'vinh' | 'hanoi'
        this.arenaMode = 'speed_kitchen';    // 'speed_kitchen' | 'seaweed_peel'
        this.arenaBet = 0;                  // 0 | 50000 | 200000
        this.chatChannel = 'global';         // 'global' | 'friends'
        this.selectedFriendId = null;
        this.globalMessages = [];
        this.billionairesList = [];

        this.quickMenuTarget = null;
        this.quickMenuElement = null;
        this.playerProfileElement = null;
        this.nearbyPlayersElement = null;
        this.btnNearbyPlayers = null;
        this.btnOpenDirectChat = null;
        this.unreadChatCount = 0;
        this.sentFriendRequests = new Set();
        this.brandModalElement = null;
        this.pvpInviteElement = null;
        this.friendInviteElement = null;
        this.challengeDialogElement = null;
        this.floatingChatElement = null;

        // Thanh radar đua cấp sát sườn thời gian thực
        this.rivalRadarBar = null;
        this.btnToggleRadar = null;
        this.btnChallengeAbove = null;
        this.overtakeAlertBanner = null;
        this.currentRivalAbove = null;

        // Tranh đoạt địa bàn vàng & Đấu thầu hợp đồng độc quyền
        this.territoryOverthrownBanner = null;
        this.btnReclaimTerritory = null;
        this.exclusiveContractWidget = null;
        this.btnToggleContract = null;
        this.btnDeliverContractRice = null;

        this.initDomElements();
        this.initRivalRadarDom();
        this.initTerritoryAndContractDom();
        this.bindNetworkEvents();
    }

    initDomElements() {
        if (typeof document === 'undefined') return;

        const getOrCreate = (id, className) => {
            let el = document.getElementById(id);
            if (!el) {
                el = document.createElement('div');
                el.id = id;
                el.className = className;
                const container = document.getElementById('gameContainer') || document.body;
                container.appendChild(el);
            }
            return el;
        };

        this.playerProfileElement = getOrCreate('playerProfileModal', 'player-profile-modal-layer hidden');
        this.nearbyPlayersElement = getOrCreate('nearbyPlayersModal', 'nearby-players-modal-layer hidden');
        this.quickMenuElement = getOrCreate('onlineQuickMenu', 'online-quick-menu-layer hidden');
        this.brandModalElement = getOrCreate('brandNameModal', 'brand-name-modal-layer hidden');
        this.pvpInviteElement = getOrCreate('pvpInviteNotification', 'pvp-invite-card hidden');
        this.friendInviteElement = getOrCreate('friendInviteNotification', 'friend-invite-card hidden');
        this.challengeDialogElement = getOrCreate('pvpChallengeDialog', 'pvp-challenge-dialog-layer hidden');
        this.floatingChatElement = getOrCreate('floatingChatWidget', 'floating-chat-preview');

        this.btnNearbyPlayers = document.getElementById('btnNearbyPlayers');
        if (this.btnNearbyPlayers) {
            this.btnNearbyPlayers.onclick = () => {
                audio.playClick();
                this.openNearbyModal();
            };
        }

        this.btnOpenDirectChat = document.getElementById('btnOpenDirectChat');
        if (this.btnOpenDirectChat) {
            this.btnOpenDirectChat.onclick = () => {
                audio.playClick();
                this.openDirectChat('global');
            };
        }

        this.renderFloatingChatWidget();
    }

    bindNetworkEvents() {
        // Đấu trường 1v1
        network.on('onArenaEvent', (event) => {
            if (event.type === 'MATCH_STARTED') {
                // Tự động ẩn phím ảo Mobile
                const virt = document.getElementById('virtualTouchControls');
                if (virt) virt.classList.add('hidden');
                // Tự động đóng modal hồ sơ nếu đang mở
                this.closePlayerProfile();
                // Đưa cả 2 người chơi vào màn hình Đấu trường 1v1
                if (window.game?.questManager) {
                    window.game.questManager.open('online');
                    this.activeSubTab = 'arena';
                    window.game.questManager.render();
                }
                this.updateArenaUI();
            } else if (['SCORE_UPDATE', 'COUNTDOWN_DONE', 'MATCH_FINISHED'].includes(event.type)) {
                this.updateArenaUI();
            }
        });

        // Nhận lời mời thách đấu 1v1 từ người khác (Yêu cầu xác nhận)
        network.on('onPvpInvite', (data) => {
            this.showPvpInviteNotification(data);
        });

        // Bị từ chối lời mời thách đấu
        network.on('onPvpDeclined', (data) => {
            const reason = data?.reason || 'Đối thủ đã từ chối lời mời thách đấu.';
            this.showToastNotification(`❌ ${reason}`);
        });

        network.on('onPvpInviteExpired', () => {
            this.hidePvpInviteNotification();
        });

        // Hệ thống kết bạn
        network.on('onFriendInvite', (data) => {
            this.showFriendInviteNotification(data);
        });

        network.on('onFriendAccepted', (data) => {
            const fName = data?.friend?.name || 'Người bạn mới';
            this.showToastNotification(`🎉 Bạn và ${fName} đã trở thành bạn bè!`);
            this.refreshCurrentSubTab();
        });

        network.on('onFriendDeclined', (data) => {
            const reason = data?.reason || 'Lời mời kết bạn đã bị từ chối.';
            this.showToastNotification(`ℹ️ ${reason}`);
        });

        network.on('onFriendsStatus', () => {
            this.refreshCurrentSubTab();
        });

        // Hệ thống trò chuyện
        network.on('onChatBroadcast', (msg) => {
            this.globalMessages.push(msg);
            if (this.globalMessages.length > 60) this.globalMessages.shift();
            this.updateFloatingChat(msg);
            this.updateChatContainer();

            const phoneModal = document.getElementById('phoneModal');
            const isChatOpen = phoneModal && !phoneModal.classList.contains('hidden') && this.activeSubTab === 'chat';
            if (!isChatOpen) {
                this.unreadChatCount = (this.unreadChatCount || 0) + 1;
                this.updateChatBadge(this.unreadChatCount);
            }
        });

        network.on('onPrivateMessage', () => {
            this.updateChatContainer();
            this.showToastNotification('💬 Có tin nhắn riêng mới từ bạn bè!');

            const phoneModal = document.getElementById('phoneModal');
            const isChatOpen = phoneModal && !phoneModal.classList.contains('hidden') && this.activeSubTab === 'chat';
            if (!isChatOpen) {
                this.unreadChatCount = (this.unreadChatCount || 0) + 1;
                this.updateChatBadge(this.unreadChatCount);
            }
        });

        network.on('onChatHistory', (messages) => {
            if (Array.isArray(messages)) {
                this.globalMessages = messages;
                this.updateChatContainer();
            }
        });

        // Bảng xếp hạng Tỷ Phú
        network.on('onBillionairesList', (list) => {
            if (Array.isArray(list)) {
                this.billionairesList = list;
                this.refreshCurrentSubTab();
            }
        });

        // Co-op
        network.on('onCoopChange', () => {
            this.updateCoopUI();
        });

        // Emotes
        network.on('onEmoteReceived', (data) => {
            if (data?.type) {
                try { audio.playClick(); } catch (e) {}
            }
        });
    }

    // =========================================================================
    // 1. GIAO DIỆN TAB "CỘNG ĐỒNG" TRÊN SMARTPHONE IGIRI OS
    // =========================================================================
    renderOnlineTab() {
        const isOnline = network.isOnline;
        const statusBadge = isOnline ?
            '<span class="online-status-pill pill-online">🟢 Máy Chủ Online (Realtime)</span>' :
            '<span class="online-status-pill pill-offline">🤖 Giả Lập Trực Tuyến (Bot AI)</span>';

        const myNetWorth = typeof state.getNetWorth === 'function' ? state.getNetWorth() : (state.money || 0);

        return `
            <div class="tab-content online-view">
                <!-- Header thông tin thương hiệu & Tài sản ròng -->
                <div class="online-profile-bar">
                    <div class="opb-brand">
                        <span class="opb-avatar">🍙</span>
                        <div class="opb-info">
                            <h3 class="opb-name" id="onlineProfileBrandName">${state.brandName}</h3>
                            <div class="opb-tags">
                                <span class="opb-tag-lvl">Cấp ${state.level}</span>
                                <span class="opb-tag-rep">⭐ ${state.reputation || 100} Uy Tín</span>
                                <span class="opb-tag-wealth">💎 ${myNetWorth.toLocaleString('vi-VN')}đ Tài Sản</span>
                                <button type="button" class="btn-change-brand" id="btnOpenChangeBrand">✏️ Đổi Tên</button>
                            </div>
                        </div>
                    </div>
                    <div class="opb-status">${statusBadge}</div>
                </div>

                <!-- Thanh chuyển 4 Tab Con Chuyên Biệt -->
                <div class="online-subtab-bar">
                    <button type="button" class="online-subtab-btn ${this.activeSubTab === 'billionaires' ? 'active' : ''}" data-subtab="billionaires">
                        💎 BXH Tỷ Phú
                    </button>
                    <button type="button" class="online-subtab-btn ${this.activeSubTab === 'arena' ? 'active' : ''}" data-subtab="arena">
                        ⚔️ Đấu Trường 1v1
                    </button>
                    <button type="button" class="online-subtab-btn ${this.activeSubTab === 'chat' ? 'active' : ''}" data-subtab="chat">
                        💬 Trò Chuyện & Bạn Bè
                        ${(state.unreadMessagesCount || 0) > 0 ? `<span class="chat-unread-badge">${state.unreadMessagesCount}</span>` : ''}
                    </button>
                    <button type="button" class="online-subtab-btn ${this.activeSubTab === 'coop' ? 'active' : ''}" data-subtab="coop">
                        🤝 Hợp Tác Đại Tiệc
                    </button>
                </div>

                <!-- Vùng nội dung subtab -->
                <div class="online-subtab-container" id="onlineSubtabContent">
                    ${this.renderSubTabContent()}
                </div>
            </div>
        `;
    }

    renderSubTabContent() {
        switch (this.activeSubTab) {
            case 'billionaires':
                return this.renderBillionairesSubTab();
            case 'arena':
                return this.renderArenaSubTab();
            case 'chat':
                return this.renderChatSubTab();
            case 'coop':
                return this.renderCoopSubTab();
            default:
                return this.renderBillionairesSubTab();
        }
    }

    // -------------------------------------------------------------------------
    // Sub-Tab 1: BẢNG XẾP HẠNG TỶ PHÚ (Top 50 Tổng Tài Sản Ròng)
    // -------------------------------------------------------------------------
    renderBillionairesSubTab() {
        const cityNames = { all: 'Toàn Quốc', hcm: 'TP.HCM', daklak: 'Đắk Lắk', vinh: 'TP. Vinh', hanoi: 'Hà Nội' };
        let list = this.billionairesList;
        if (!list || list.length === 0) {
            network.getBillionaires(this.billionaireCityFilter);
            list = [];
        }

        return `
            <div class="billionaires-view animate-fade">
                <div class="bil-header-row">
                    <div class="bil-filter-tabs">
                        ${['all', 'hcm', 'daklak', 'vinh', 'hanoi'].map(c => `
                            <button type="button" class="btn-bil-filter ${this.billionaireCityFilter === c ? 'active' : ''}" data-city="${c}">
                                ${cityNames[c]}
                            </button>
                        `).join('')}
                    </div>
                    <button type="button" class="btn-bil-refresh" id="btnRefreshBillionaires">🔄 Cập Nhật</button>
                </div>

                <div class="bil-table-wrapper">
                    <table class="bil-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Thương Hiệu & Cấp Độ</th>
                                <th>Chi Nhánh</th>
                                <th>Tổng Tài Sản Ròng</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${list.length === 0 ? `
                                <tr>
                                    <td colspan="5" class="bil-loading">Đang tải danh sách Tỷ Phú Cơm Nắm...</td>
                                </tr>
                            ` : list.map(item => {
                                const rankClass = item.rank === 1 ? 'rank-gold' : item.rank === 2 ? 'rank-silver' : item.rank === 3 ? 'rank-bronze' : '';
                                const isSelf = item.isSelf || item.id === network.selfId || item.name.includes(state.brandName);
                                const isFriend = state.isFriend ? state.isFriend(item.id || item.name) : false;
                                const cityName = cityNames[item.city] || 'TP.HCM';

                                return `
                                    <tr class="${isSelf ? 'bil-self-row' : ''} ${rankClass}">
                                        <td class="bil-rank">${item.medal || `#${item.rank}`}</td>
                                        <td class="bil-brand-cell">
                                            <div class="bil-brand-name">
                                                <strong>${item.name}</strong>
                                                ${item.isOnline ? '<span class="bil-online-dot" title="Đang online">🟢</span>' : '<span class="bil-offline-dot" title="Ngoại tuyến">⚪</span>'}
                                            </div>
                                            <span class="bil-lvl">Cấp ${item.level}</span>
                                        </td>
                                        <td class="bil-city">${cityName}</td>
                                        <td class="bil-wealth">💎 ${Number(item.netWorth || 0).toLocaleString('vi-VN')}đ</td>
                                        <td class="bil-actions-cell">
                                            ${isSelf ? `
                                                <span class="badge-self">👤 Bạn</span>
                                            ` : `
                                                <button type="button" class="btn-action-sm btn-challenge-player" data-targetid="${item.id}" data-targetname="${item.name}" title="Thách đấu 1v1">
                                                    ⚔️ Đấu
                                                </button>
                                                ${isFriend ? `
                                                    <span class="badge-friend">🤝 Bạn bè</span>
                                                ` : `
                                                    <button type="button" class="btn-action-sm btn-friend-player" data-targetid="${item.id}" data-targetname="${item.name}" title="Gửi lời mời kết bạn">
                                                        ➕ Bạn
                                                    </button>
                                                `}
                                            `}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------------------
    // Sub-Tab 2: ĐẤU TRƯỜNG 1V1 (Có Xác Nhận & Cược Tiền)
    // -------------------------------------------------------------------------
    renderArenaSubTab() {
        const arena = network.activeArena;
        if (arena) {
            return this.renderActiveArenaScreen(arena);
        }

        const otherPlayersList = Array.from(network.otherPlayers.values());

        return `
            <div class="arena-lobby-view animate-fade">
                <div class="arena-intro-banner">
                    <h4>⚔️ ĐẤU TRƯỜNG TỐC ĐỘ 1V1 (CÓ XÁC NHẬN)</h4>
                    <p>Luật thi đấu: Gửi lời mời tới đối thủ và chờ xác nhận. Cả hai cùng thi tài 30 giây để giành trọn tiền cược!</p>
                </div>

                <!-- Chọn thể thức thi đấu -->
                <div class="arena-mode-selector">
                    <label class="arena-mode-card ${this.arenaMode === 'speed_kitchen' ? 'selected' : ''}">
                        <input type="radio" name="arenaModeRadio" value="speed_kitchen" ${this.arenaMode === 'speed_kitchen' ? 'checked' : ''}>
                        <div class="amc-content">
                            <span class="amc-icon">🍙</span>
                            <div class="amc-text">
                                <strong>Gói Cơm ASMR 30s</strong>
                                <small>Nắn ép cơm tam giác chuẩn ISO nhanh nhất</small>
                            </div>
                        </div>
                    </label>

                    <label class="arena-mode-card ${this.arenaMode === 'seaweed_peel' ? 'selected' : ''}">
                        <input type="radio" name="arenaModeRadio" value="seaweed_peel" ${this.arenaMode === 'seaweed_peel' ? 'checked' : ''}>
                        <div class="amc-content">
                            <span class="amc-icon">🍘</span>
                            <div class="amc-text">
                                <strong>Bóc Rong Biển Tốc Độ</strong>
                                <small>Giật dải băng 1-2-3 bọc giòn rụm</small>
                            </div>
                        </div>
                    </label>
                </div>

                <!-- Chọn mức cược -->
                <div class="arena-bet-selector">
                    <span class="bet-label">Mức cược thi đấu:</span>
                    <div class="bet-options">
                        <button type="button" class="btn-bet-opt ${this.arenaBet === 0 ? 'active' : ''}" data-bet="0">
                            Giao Hữu (0đ)
                        </button>
                        <button type="button" class="btn-bet-opt ${this.arenaBet === 50000 ? 'active' : ''}" data-bet="50000">
                            50.000đ
                        </button>
                        <button type="button" class="btn-bet-opt ${this.arenaBet === 200000 ? 'active' : ''}" data-bet="200000">
                            200.000đ
                        </button>
                    </div>
                </div>

                <div class="arena-quick-match-box">
                    <button type="button" class="btn-quick-match" id="btnQuickMatch1v1">
                        ⚡ Ghép Cặp Tự Động Toàn Server
                    </button>
                </div>

                <h5 class="arena-list-title">Danh Sách Đối Thủ Đang Trực Tuyến:</h5>
                <div class="arena-opponent-list">
                    ${otherPlayersList.length === 0 ? `
                        <div class="arena-empty">Chưa có người chơi nào quanh đây. Hãy bấm Ghép Cặp Tự Động!</div>
                    ` : otherPlayersList.map(opp => `
                        <div class="arena-opponent-card">
                            <div class="aoc-avatar">🍙</div>
                            <div class="aoc-info">
                                <strong>${opp.brandName}</strong>
                                <span>Cấp ${opp.level || 1} • Chi nhánh ${(opp.city || 'hcm').toUpperCase()}</span>
                            </div>
                            <button type="button" class="btn-challenge-opp" data-targetid="${opp.id}" data-targetname="${opp.brandName}">
                                ⚔️ Thách Đấu
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderActiveArenaScreen(arena) {
        if (arena.status === 'FINISHED') {
            const res = arena.result || {};
            const title = res.isWin ? '🏆 CHIẾN THẮNG HUY HOÀNG!' : (res.isDraw ? '🤝 TRẬN ĐẤU BẤT PHÂN THẮNG BẠI!' : '😢 BẠN ĐÃ THUA TRẬN!');
            const colorClass = res.isWin ? 'res-win' : (res.isDraw ? 'res-draw' : 'res-loss');

            return `
                <div class="arena-match-container animate-fade">
                    <div class="arena-settlement-card animate-pop ${colorClass}">
                        <h3>${title}</h3>
                        <div class="arena-score-comparison">
                            <div class="asc-col">
                                <span class="asc-label">${state.brandName}</span>
                                <span class="asc-num">${arena.playerScore}</span>
                            </div>
                            <div class="asc-vs">VS</div>
                            <div class="asc-col">
                                <span class="asc-label">${arena.opponentName}</span>
                                <span class="asc-num">${arena.opponentScore}</span>
                            </div>
                        </div>
                        <div class="arena-rewards-row">
                            <span class="reward-pill">+${(res.rewardMoney || 0).toLocaleString('vi-VN')}đ Tiền Hũ</span>
                            <span class="reward-pill">+${res.rewardRep || 0} Uy Tín</span>
                        </div>
                        <button type="button" class="btn-arena-finish" id="btnArenaExit">
                            Rời Đấu Trường
                        </button>
                    </div>
                </div>
            `;
        }

        const timeLeft = Math.max(0, Math.ceil(arena.timeRemaining));
        const actionLabel = arena.gameType === 'speed_kitchen' ? '🍙 ÉP KHUÔN NẮM CƠM (+1)' : '🍘 BÓC MÀNG 1-2-3 (+1)';
        const potLabel = arena.potMoney > 0 ? `Hũ Thưởng: ${arena.potMoney.toLocaleString('vi-VN')}đ` : 'Trận Đấu Giao Hữu';

        return `
            <div class="arena-match-container animate-fade">
                <div class="arena-battle-header">
                    <div class="abh-player">
                        <span class="abh-name">${state.brandName} (Bạn)</span>
                        <span class="abh-score" id="arenaPlayerScore">${arena.playerScore}</span>
                    </div>
                    <div class="abh-timer">
                        <span class="timer-pot">${potLabel}</span>
                        <span class="timer-sec" id="arenaTimerSec">${timeLeft}s</span>
                    </div>
                    <div class="abh-opponent">
                        <span class="abh-name">${arena.opponentName}</span>
                        <span class="abh-score" id="arenaOpponentScore">${arena.opponentScore}</span>
                    </div>
                </div>

                <!-- Thanh tiến độ trực quan đối đầu -->
                <div class="arena-progress-bar-wrapper">
                    <div class="arena-progress-p1" style="width: ${Math.min(100, arena.playerScore * 3)}%;"></div>
                    <div class="arena-progress-p2" style="width: ${Math.min(100, arena.opponentScore * 3)}%;"></div>
                </div>

                <div class="arena-battle-arena">
                    <button type="button" class="btn-arena-action-tap" id="btnArenaActionTap">
                        <span class="action-tap-icon">${arena.gameType === 'speed_kitchen' ? '🍙' : '🍘'}</span>
                        <span class="action-tap-text">${actionLabel}</span>
                    </button>
                    <p class="arena-tap-tip">Chạm liên tục vào nút to để gia tăng điểm số bứt phá!</p>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------------------
    // Sub-Tab 3: TRÒ CHUYỆN ĐA KÊNH & BẠN BÈ
    // -------------------------------------------------------------------------
    renderChatSubTab() {
        const friends = Array.isArray(state.friends) ? state.friends : [];
        if (this.chatChannel === 'friends' && !this.selectedFriendId && friends.length > 0) {
            this.selectedFriendId = friends[0].id;
        }

        return `
            <div class="chat-tab-view animate-fade">
                <!-- Thanh chuyển kênh Chat -->
                <div class="chat-channel-tabs">
                    <button type="button" class="btn-chat-chan ${this.chatChannel === 'global' ? 'active' : ''}" data-chan="global">
                        🌐 Kênh Cộng Đồng Toàn Quốc
                    </button>
                    <button type="button" class="btn-chat-chan ${this.chatChannel === 'friends' ? 'active' : ''}" data-chan="friends">
                        👥 Bạn Bè (${friends.length})
                    </button>
                </div>

                ${this.chatChannel === 'global' ? this.renderGlobalChatView() : this.renderFriendsChatView(friends)}
            </div>
        `;
    }

    renderGlobalChatView() {
        const quickPhrases = [
            '🍙 Chào cả nhà!',
            '🚚 Góp đơn đại tiệc nào!',
            '⚔️ Làm ván 1v1 không?',
            '✨ Chúc buôn may bán đắt!'
        ];

        return `
            <div class="global-chat-container">
                <!-- Vùng hiển thị tin nhắn -->
                <div class="chat-messages-box" id="globalChatBox">
                    ${this.globalMessages.length === 0 ? `
                        <div class="chat-empty">Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!</div>
                    ` : this.globalMessages.map(m => `
                        <div class="chat-msg-row ${m.senderId === network.selfId ? 'is-self' : ''}">
                            <div class="cmr-meta">
                                <strong class="cmr-sender ${m.senderId !== network.selfId ? 'cmr-sender-btn' : ''}" 
                                        data-sender-id="${m.senderId}" 
                                        data-sender-name="${m.senderName}" 
                                        data-sender-level="${m.senderLevel || 1}" 
                                        data-sender-city="${m.city || 'hcm'}" 
                                        title="${m.senderId !== network.selfId ? 'Bấm để xem hồ sơ và kết bạn' : 'Bạn'}">
                                    ${m.senderName} ${m.senderId !== network.selfId ? '<span class="cmr-inspect-icon">👤</span>' : ''}
                                </strong>
                                <span class="cmr-lvl">Cấp ${m.senderLevel || 1}</span>
                                <span class="cmr-time">${new Date(m.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div class="cmr-bubble">${m.text}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Hàng nút gửi câu nhanh 1 chạm công thái học Mobile -->
                <div class="chat-quick-phrases">
                    ${quickPhrases.map(p => `
                        <button type="button" class="btn-quick-phrase" data-phrase="${p}">${p}</button>
                    `).join('')}
                </div>

                <!-- Ô nhập tin nhắn cho phép gõ dấu cách & tiếng Việt -->
                <div class="chat-input-row">
                    <input type="text" id="inputChatGlobal" class="chat-text-input" maxlength="120" placeholder="Nhập tin nhắn (hỗ trợ tiếng Việt và dấu cách)...">
                    <button type="button" class="btn-chat-send" id="btnSendChatGlobal">Gửi 🚀</button>
                </div>
            </div>
        `;
    }

    renderFriendsChatView(friends) {
        if (friends.length === 0) {
            return `
                <div class="friends-empty-box">
                    <span class="feb-icon">👥</span>
                    <h4>Bạn chưa có người bạn nào</h4>
                    <p>Hãy ra phố bấm vào các chủ xe khác hoặc vào BXH Tỷ Phú để gửi lời mời kết bạn!</p>
                </div>
            `;
        }

        const selectedFriend = friends.find(f => f.id === this.selectedFriendId) || friends[0];
        const pMessages = (state.privateMessages && state.privateMessages[selectedFriend.id]) || [];

        return `
            <div class="friends-chat-container">
                <!-- Danh sách bạn bè bên trái -->
                <div class="friends-roster-col">
                    <h5 class="frc-title">Danh Bạ Bạn Bè:</h5>
                    <div class="friends-list-items">
                        ${friends.map(f => {
                            const isOnline = Boolean(network.otherPlayers.get(f.id));
                            const unread = (state.privateMessages?.[f.id] || []).filter(m => m.unread).length;
                            return `
                                <div class="friend-item-card ${f.id === selectedFriend.id ? 'active' : ''}" data-fid="${f.id}">
                                    <span class="fic-status">${isOnline ? '🟢' : '⚪'}</span>
                                    <div class="fic-info">
                                        <strong>${f.name}</strong>
                                        <small>Cấp ${f.level || 1} • ${(f.city || 'hcm').toUpperCase()}</small>
                                    </div>
                                    ${unread > 0 ? `<span class="fic-badge">${unread}</span>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Khung chat riêng với bạn bên phải -->
                <div class="friends-chat-col">
                    <div class="fcc-header">
                        <div class="fcc-header-info">
                            <strong>${selectedFriend.name}</strong>
                            <small>${network.otherPlayers.has(selectedFriend.id) ? '🟢 Đang trực tuyến' : '⚪ Ngoại tuyến'}</small>
                        </div>
                        <div class="fcc-header-actions">
                            <button type="button" class="btn-visit-friend-factory" data-fid="${selectedFriend.id}" data-fname="${selectedFriend.name}">
                                🏭 Thăm Xưởng
                            </button>
                            <button type="button" class="btn-challenge-friend" data-fid="${selectedFriend.id}" data-fname="${selectedFriend.name}">
                                ⚔️ Thách Đấu
                            </button>
                        </div>
                    </div>

                    <div class="chat-messages-box" id="privateChatBox">
                        ${pMessages.length === 0 ? `
                            <div class="chat-empty">Chưa có tin nhắn riêng. Hãy gửi lời chào đầu tiên!</div>
                        ` : pMessages.map(m => `
                            <div class="chat-msg-row ${m.from === 'self' ? 'is-self' : ''}">
                                <div class="cmr-meta">
                                    <strong class="cmr-sender">${m.from === 'self' ? 'Bạn' : selectedFriend.name}</strong>
                                    <span class="cmr-time">${new Date(m.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div class="cmr-bubble">${m.text}</div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Hàng nút gửi câu nhanh 1 chạm công thái học Mobile -->
                    <div class="chat-quick-phrases">
                        <button type="button" class="btn-quick-phrase" data-phrase="🍙 Chào cả nhà!">🍙 Chào bạn!</button>
                        <button type="button" class="btn-quick-phrase" data-phrase="🚚 Góp đơn đại tiệc nào!">🚚 Góp đơn tiệc nhé!</button>
                        <button type="button" class="btn-quick-phrase" data-phrase="⚔️ Làm ván 1v1 không?">⚔️ Làm ván 1v1 không?</button>
                        <button type="button" class="btn-quick-phrase" data-phrase="✨ Chúc buôn may bán đắt!">✨ Buôn may bán đắt!</button>
                    </div>

                    <div class="chat-input-row">
                        <input type="text" id="inputChatPrivate" class="chat-text-input" maxlength="120" placeholder="Nhắn tin riêng cho ${selectedFriend.name}...">
                        <button type="button" class="btn-chat-send" id="btnSendChatPrivate">Gửi 🚀</button>
                    </div>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------------------
    // Sub-Tab 4: HỢP TÁC ĐẠI TIỆC (Co-op)
    // -------------------------------------------------------------------------
    renderCoopSubTab() {
        const coop = network.coopOrder;
        const progressPct = Math.min(100, Math.round((coop.current / coop.target) * 100));
        const myContrib = coop.contributors[network.selfId]?.count || 0;
        const inventoryRiceCount = state.inventory.length;

        return `
            <div class="coop-view animate-fade">
                <div class="coop-card">
                    <div class="coop-badge-row">
                        <span class="coop-tag">ĐƠN HÀNG LIÊN TỈNH</span>
                        <span class="coop-status-tag ${coop.isCompleted ? 'done' : 'running'}">
                            ${coop.isCompleted ? '🎉 ĐÃ HOÀN THÀNH' : '⏳ ĐANG NHẬN GÓP CƠM'}
                        </span>
                    </div>

                    <h3 class="coop-title">${coop.title}</h3>
                    <p class="coop-desc">Cùng toàn bộ đầu bếp trên cả nước góp cơm nắm để hoàn tất đại tiệc khổng lồ!</p>

                    <div class="coop-pot-grid">
                        <div class="pot-item">
                            <span class="pot-icon">💰</span>
                            <strong>${coop.potMoney.toLocaleString('vi-VN')}đ</strong>
                            <small>Tổng Hũ Tiền Thưởng</small>
                        </div>
                        <div class="pot-item">
                            <span class="pot-icon">⭐</span>
                            <strong>+${coop.potRep} Điểm</strong>
                            <small>Uy Tín Toàn Quốc</small>
                        </div>
                    </div>

                    <!-- Thanh tiến độ -->
                    <div class="coop-progress-section">
                        <div class="coop-progress-info">
                            <span>Tiến độ góp cơm:</span>
                            <strong>${coop.current} / ${coop.target} nắm (${progressPct}%)</strong>
                        </div>
                        <div class="coop-progress-track">
                            <div class="coop-progress-fill" style="width: ${progressPct}%;"></div>
                        </div>
                    </div>

                    <!-- Đóng góp của bản thân -->
                    <div class="coop-my-contrib">
                        <span>Đóng góp của bạn: <strong>${myContrib} nắm</strong> (${Math.round((myContrib / coop.target) * 100)}% quỹ thưởng)</span>
                        <span>Cơm sẵn sàng trong kho: <strong>${inventoryRiceCount} nắm</strong></span>
                    </div>

                    <!-- Nút hành động góp cơm -->
                    <div class="coop-actions-row">
                        <button type="button" class="btn-coop-contrib" data-count="1" ${inventoryRiceCount < 1 || coop.isCompleted ? 'disabled' : ''}>
                            🍙 Góp 1 Nắm
                        </button>
                        <button type="button" class="btn-coop-contrib" data-count="5" ${inventoryRiceCount < 5 || coop.isCompleted ? 'disabled' : ''}>
                            🍱 Góp 5 Nắm
                        </button>
                        <button type="button" class="btn-coop-contrib btn-coop-all" data-count="${inventoryRiceCount}" ${inventoryRiceCount < 1 || coop.isCompleted ? 'disabled' : ''}>
                            ⚡ Góp Tất Cả (${inventoryRiceCount})
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // 2. CÁC HỘP THOẠI & THẺ THÔNG BÁO NỔI (NOTIFICATIONS & POPUPS)
    // =========================================================================

    isAnyModalOpen() {
        const modals = [
            this.playerProfileElement,
            this.nearbyPlayersElement,
            this.pvpInviteElement,
            this.friendInviteElement,
            this.challengeDialogElement,
            document.getElementById('phoneModal'),
            document.getElementById('kitchenModal'),
            document.getElementById('marketModal')
        ];
        return modals.some(m => m && !m.classList.contains('hidden'));
    }

    // THẺ HỒ SƠ NGƯỜI CHƠI (Player Profile Card - z-index: 99990)
    openPlayerProfile(player) {
        if (!this.playerProfileElement || !player) return;

        this.profileTarget = player;
        const brandName = player.brandName || player.name || 'Chi Nhánh Đối Tác';
        const level = player.level || 1;
        const reputation = player.reputation || 100;
        const rawCity = player.city || player.branch || 'hcm';
        const cityNames = { hcm: 'TP.HCM', daklak: 'Đắk Lắk', vinh: 'TP. Vinh', hanoi: 'Hà Nội' };
        const cityName = cityNames[rawCity.replace('branch_', '')] || 'TP.HCM';
        const netWorth = Number(player.netWorth) || ((player.totalRevenue || 0) + (level * 3000000) + 15000000);
        const targetId = player.id;
        const targetPlayerId = player.playerId || player.id;

        const isFriend = state.isFriend ? state.isFriend(targetPlayerId || targetId || brandName) : false;
        const isRequestSent = this.sentFriendRequests.has(targetPlayerId) || this.sentFriendRequests.has(targetId);

        let selectedBet = 0;
        let selectedGameType = 'speed_kitchen';

        // Ẩn phím ảo điều khiển Mobile khi mở hồ sơ
        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls) virtualControls.classList.add('hidden');

        this.playerProfileElement.innerHTML = `
            <div class="profile-card-modal">
                <div class="pcm-header">
                    <div class="pcm-avatar-box">🍙</div>
                    <div class="pcm-info">
                        <h3 class="pcm-brand-name">${brandName}</h3>
                        <span class="pcm-branch-badge">📍 Chi Nhánh ${cityName}</span>
                    </div>
                </div>

                <div class="pcm-stats-grid">
                    <div class="pcm-stat-item">
                        <span class="pcm-stat-label">Cấp Độ Bếp</span>
                        <span class="pcm-stat-value">Cấp ${level}</span>
                    </div>
                    <div class="pcm-stat-item">
                        <span class="pcm-stat-label">Uy Tín ISO</span>
                        <span class="pcm-stat-value">⭐ ${reputation}</span>
                    </div>
                    <div class="pcm-stat-item" style="grid-column: span 2;">
                        <span class="pcm-stat-label">Tổng Tài Sản Ròng</span>
                        <span class="pcm-stat-value pcm-stat-gold">💰 ${netWorth.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>

                <div class="pcm-bet-selector">
                    <div class="pcm-bet-selector-title">⚔️ Mức Cược Thách Đấu 1v1:</div>
                    <div class="pcm-bet-chips">
                        <button type="button" class="pcm-bet-chip active" data-bet="0">Giao hữu 0đ</button>
                        <button type="button" class="pcm-bet-chip" data-bet="50000">50.000đ</button>
                        <button type="button" class="pcm-bet-chip" data-bet="200000">200.000đ</button>
                    </div>
                </div>

                <div class="pcm-actions">
                    ${isFriend ? `
                        <button type="button" class="btn-profile-action btn-profile-friend" id="btnProfileChat">
                            💬 Nhắn tin
                        </button>
                    ` : `
                        <button type="button" class="btn-profile-action btn-profile-friend ${isRequestSent ? 'is-sent' : ''}" id="btnProfileAddFriend" ${isRequestSent ? 'disabled' : ''}>
                            ${isRequestSent ? '⏳ Đã gửi lời mời' : '➕ Thêm Bạn'}
                        </button>
                    `}
                    <button type="button" class="btn-profile-action btn-profile-visit" id="btnProfileVisitFactory">
                        🏭 Thăm Xưởng
                    </button>
                    <button type="button" class="btn-profile-action btn-profile-challenge" id="btnProfileChallenge">
                        ⚔️ Thách Đấu 1v1
                    </button>
                    <button type="button" class="btn-profile-action btn-profile-close" id="btnProfileClose">
                        ✕ Đóng
                    </button>
                </div>
            </div>
        `;

        this.playerProfileElement.classList.remove('hidden');

        // Gắn sự kiện chọn mức cược
        const betChips = this.playerProfileElement.querySelectorAll('.pcm-bet-chip');
        betChips.forEach(chip => {
            chip.onclick = () => {
                audio.playClick();
                betChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                selectedBet = Number(chip.dataset.bet) || 0;
            };
        });

        // Nút Thêm Bạn / Nhắn Tin
        const btnFriend = this.playerProfileElement.querySelector('#btnProfileAddFriend');
        if (btnFriend) {
            btnFriend.onclick = () => {
                audio.playClick();
                this.sentFriendRequests.add(targetPlayerId);
                this.sentFriendRequests.add(targetId);
                const res = network.sendFriendRequest(player);
                btnFriend.textContent = '⏳ Đã gửi lời mời';
                btnFriend.classList.add('is-sent');
                btnFriend.disabled = true;
                this.showToastNotification(res.message);
            };
        }
        const btnChat = this.playerProfileElement.querySelector('#btnProfileChat');
        if (btnChat) {
            btnChat.onclick = () => {
                audio.playClick();
                this.closePlayerProfile();
                if (window.game?.questManager) {
                    window.game.questManager.open('online');
                    this.activeSubTab = 'chat';
                    this.selectedFriendId = targetId;
                    this.chatChannel = 'private';
                    window.game.questManager.render();
                }
            };
        }

        const btnVisitFactory = this.playerProfileElement.querySelector('#btnProfileVisitFactory');
        if (btnVisitFactory) {
            btnVisitFactory.onclick = () => {
                audio.playClick();
                this.closePlayerProfile();
                this.openFriendFactoryModal(targetPlayerId, playerName);
            };
        }

        // Nút Thách Đấu
        const btnChallenge = this.playerProfileElement.querySelector('#btnProfileChallenge');
        if (btnChallenge) {
            btnChallenge.onclick = () => {
                audio.playClick();
                this.closePlayerProfile();
                const res = network.sendPvpInvite(player, selectedGameType, selectedBet);
                this.showToastNotification(res.message);
            };
        }

        // Nút Đóng
        const btnClose = this.playerProfileElement.querySelector('#btnProfileClose');
        if (btnClose) {
            btnClose.onclick = () => {
                audio.playClick();
                this.closePlayerProfile();
            };
        }
    }

    closePlayerProfile() {
        if (this.playerProfileElement) {
            this.playerProfileElement.classList.add('hidden');
        }
        this.profileTarget = null;
        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls && !this.isAnyModalOpen()) {
            virtualControls.classList.remove('hidden');
        }
    }

    // MODAL DANH SÁCH NGƯỜI CHƠI QUANH ĐÂY (Nearby Modal - z-index: 99980)
    openNearbyModal() {
        if (!this.nearbyPlayersElement) return;

        const pX = window.game?.player?.x || 420;
        const pY = window.game?.player?.y || 1250;
        const nearbyList = network.getNearbyPlayers(pX, pY);
        const cityNames = { hcm: 'TP.HCM', daklak: 'Đắk Lắk', vinh: 'TP. Vinh', hanoi: 'Hà Nội' };

        // Ẩn phím ảo
        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls) virtualControls.classList.add('hidden');

        this.nearbyPlayersElement.innerHTML = `
            <div class="nearby-modal-card">
                <div class="npm-header">
                    <h3>👥 Người Chơi Quanh Đây (${nearbyList.length})</h3>
                    <button type="button" class="npm-close-btn" id="btnNearbyClose">✕</button>
                </div>
                <div class="npm-list">
                    ${nearbyList.length === 0 ? `
                        <div style="text-align: center; color: #94a3b8; padding: 30px;">
                            Hiện chưa có người chơi nào khác ở gần bạn...
                        </div>
                    ` : nearbyList.map(p => {
                        const bName = p.brandName || p.name || 'Chi Nhánh Đối Tác';
                        const lvl = p.level || 1;
                        const cName = cityNames[(p.city || 'hcm').replace('branch_', '')] || 'TP.HCM';
                        const dist = p.distMeters || 10;
                        const isFr = state.isFriend ? state.isFriend(p.playerId || p.id || bName) : false;

                        return `
                            <div class="npm-item-row" data-pid="${p.id}">
                                <div class="npm-item-info">
                                    <span class="npm-item-avatar">🍙</span>
                                    <div>
                                        <div class="npm-item-name">${bName}</div>
                                        <div class="npm-item-sub">Cấp ${lvl} • ${cName} • Cách ${dist}m</div>
                                    </div>
                                </div>
                                <div class="npm-item-actions">
                                    <button type="button" class="btn-npm-action btn-npm-profile" data-action="profile">Hồ Sơ</button>
                                    <button type="button" class="btn-npm-action btn-npm-challenge" data-action="challenge">⚔️ Đấu</button>
                                    ${!isFr ? `<button type="button" class="btn-npm-action btn-npm-friend" data-action="friend">➕ Bạn</button>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this.nearbyPlayersElement.classList.remove('hidden');

        const btnClose = this.nearbyPlayersElement.querySelector('#btnNearbyClose');
        if (btnClose) {
            btnClose.onclick = () => {
                audio.playClick();
                this.closeNearbyModal();
            };
        }

        const rows = this.nearbyPlayersElement.querySelectorAll('.npm-item-row');
        rows.forEach(row => {
            const pid = row.dataset.pid;
            const target = network.otherPlayers.get(pid);
            if (!target) return;

            const infoBox = row.querySelector('.npm-item-info');
            if (infoBox) {
                infoBox.style.cursor = 'pointer';
                infoBox.title = 'Bấm để xem hồ sơ và kết bạn';
                infoBox.onclick = () => {
                    audio.playClick();
                    this.closeNearbyModal();
                    this.openPlayerProfile(target);
                };
            }

            const btnProfile = row.querySelector('[data-action="profile"]');
            if (btnProfile) {
                btnProfile.onclick = () => {
                    audio.playClick();
                    this.closeNearbyModal();
                    this.openPlayerProfile(target);
                };
            }

            const btnChallenge = row.querySelector('[data-action="challenge"]');
            if (btnChallenge) {
                btnChallenge.onclick = () => {
                    audio.playClick();
                    this.closeNearbyModal();
                    this.openPlayerProfile(target);
                };
            }

            const btnFriend = row.querySelector('[data-action="friend"]');
            if (btnFriend) {
                btnFriend.onclick = () => {
                    audio.playClick();
                    this.sentFriendRequests.add(target.playerId || target.id);
                    const res = network.sendFriendRequest(target);
                    btnFriend.style.display = 'none';
                    this.showToastNotification(res.message);
                };
            }
        });
    }

    closeNearbyModal() {
        if (this.nearbyPlayersElement) {
            this.nearbyPlayersElement.classList.add('hidden');
        }
        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls && !this.isAnyModalOpen()) {
            virtualControls.classList.remove('hidden');
        }
    }

    updateNearbyCount() {
        const btnNearbyText = document.getElementById('hudNearbyText');
        if (btnNearbyText) {
            const count = network.otherPlayers ? network.otherPlayers.size : 0;
            btnNearbyText.textContent = `Quanh Đây (${count})`;
        }
    }

    // HỘP THOẠI XÁC NHẬN MỜI THÁCH ĐẤU TRUNG TÂM (z-index: 99999)
    showPvpInviteNotification(data) {
        if (!this.pvpInviteElement) return;

        try {
            if (typeof audio.playBellNotification === 'function') {
                audio.playBellNotification();
            } else if (typeof audio.playClick === 'function') {
                audio.playClick();
            }
        } catch(e) {}

        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls) virtualControls.classList.add('hidden');

        const modeLabel = data.gameType === 'seaweed_peel' ? 'Bóc Rong Biển Tốc Độ' : 'Gói Cơm ASMR Chuẩn ISO 30s';
        const betLabel = data.betAmount > 0 ? `${Number(data.betAmount).toLocaleString('vi-VN')}đ` : 'Giao hữu 0đ';
        const cityNames = { hcm: 'TP.HCM', daklak: 'Đắk Lắk', vinh: 'TP. Vinh', hanoi: 'Hà Nội' };
        const cityName = cityNames[String(data.fromCity || 'hcm').replace('branch_', '')] || 'TP.HCM';

        this.pvpInviteElement.innerHTML = `
            <div class="pip-inner animate-pop">
                <div class="pip-header">
                    <span class="pip-icon" style="font-size: 26px;">⚔️</span>
                    <h4 style="font-size: 18px;">LỜI MỜI THÁCH ĐẤU 1V1!</h4>
                </div>
                <p class="pip-from" style="font-size: 15px; margin: 8px 0 12px 0;">
                    <strong>${data.fromName}</strong> (Cấp ${data.fromLevel || 1} • Chi Nhánh ${cityName}) thách thức bạn!
                </p>
                <div class="pip-details">
                    <span>Thể thức: <strong>${modeLabel}</strong></span>
                    <span>Mức cược: <strong class="pip-bet">${betLabel}</strong></span>
                </div>
                <div class="pip-countdown-track">
                    <div class="pip-countdown-bar" id="pipCountdownBar"></div>
                </div>
                <div class="pip-actions">
                    <button type="button" class="btn-pip-accept" id="btnPvpAccept">
                        ✅ ĐỒNG Ý
                    </button>
                    <button type="button" class="btn-pip-decline" id="btnPvpDecline">
                        ❌ TỪ CHỐI
                    </button>
                </div>
            </div>
        `;

        this.pvpInviteElement.classList.remove('hidden');

        // Bắt đầu đếm ngược 15 giây
        let secondsLeft = data.timeoutSeconds || 15;
        const bar = this.pvpInviteElement.querySelector('#pipCountdownBar');
        const interval = setInterval(() => {
            secondsLeft -= 0.1;
            if (bar) {
                bar.style.width = `${Math.max(0, (secondsLeft / 15) * 100)}%`;
            }
            if (secondsLeft <= 0) {
                clearInterval(interval);
                this.hidePvpInviteNotification();
            }
        }, 100);

        const btnAccept = this.pvpInviteElement.querySelector('#btnPvpAccept');
        if (btnAccept) {
            btnAccept.onclick = () => {
                clearInterval(interval);
                try {
                    if (typeof audio.playCoin === 'function') audio.playCoin();
                    else if (typeof audio.playCoinKeng === 'function') audio.playCoinKeng();
                } catch(e) {}
                this.hidePvpInviteNotification();
                network.acceptPvpInvite(data.inviteId);
                // Mở điện thoại tab Đấu trường
                if (window.game?.questManager) {
                    window.game.questManager.open('online');
                    this.activeSubTab = 'arena';
                    window.game.questManager.render();
                }
            };
        }

        const btnDecline = this.pvpInviteElement.querySelector('#btnPvpDecline');
        if (btnDecline) {
            btnDecline.onclick = () => {
                clearInterval(interval);
                try {
                    if (typeof audio.playClick === 'function') audio.playClick();
                } catch(e) {}
                this.hidePvpInviteNotification();
                network.declinePvpInvite(data.inviteId);
            };
        }
    }

    hidePvpInviteNotification() {
        if (this.pvpInviteElement) {
            this.pvpInviteElement.classList.add('hidden');
        }
        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls && !this.isAnyModalOpen()) {
            virtualControls.classList.remove('hidden');
        }
    }

    // HỘP THOẠI XÁC NHẬN KẾT BẠN TRUNG TÂM (z-index: 99999)
    showFriendInviteNotification(data) {
        if (!this.friendInviteElement) return;

        try {
            if (typeof audio.playBellNotification === 'function') {
                audio.playBellNotification();
            } else if (typeof audio.playClick === 'function') {
                audio.playClick();
            }
        } catch(e) {}

        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls) virtualControls.classList.add('hidden');

        const cityNames = { hcm: 'TP.HCM', daklak: 'Đắk Lắk', vinh: 'TP. Vinh', hanoi: 'Hà Nội' };
        const cityName = cityNames[String(data.fromCity || 'hcm').replace('branch_', '')] || 'TP.HCM';

        this.friendInviteElement.innerHTML = `
            <div class="fip-inner animate-pop">
                <div class="fip-header">
                    <span class="fip-icon" style="font-size: 24px;">🤝</span>
                    <h4 style="font-size: 18px;">LỜI MỜI KẾT BẠN!</h4>
                </div>
                <p class="fip-from" style="font-size: 15px; margin: 10px 0 14px 0;">
                    <strong>${data.fromName}</strong> (Cấp ${data.fromLevel || 1} • Chi Nhánh ${cityName}) muốn kết bạn với bạn!
                </p>
                <div class="pip-actions" style="margin-top: 14px;">
                    <button type="button" class="btn-pip-accept" id="btnFriendAccept">
                        ✅ Đồng Ý
                    </button>
                    <button type="button" class="btn-pip-decline" id="btnFriendDecline">
                        ❌ Từ Chối
                    </button>
                </div>
            </div>
        `;

        this.friendInviteElement.classList.remove('hidden');

        const btnAccept = this.friendInviteElement.querySelector('#btnFriendAccept');
        if (btnAccept) {
            btnAccept.onclick = () => {
                try { audio.playCoin(); } catch (e) {}
                this.hideFriendInviteNotification();
                network.acceptFriendRequest(data.fromPlayerId || data.fromId);
                state.addFriend({
                    id: data.fromId,
                    playerId: data.fromPlayerId || data.fromId,
                    name: data.fromName,
                    level: data.fromLevel || 1,
                    city: data.fromCity || 'hcm'
                });
                this.showToastNotification(`Bạn và [${data.fromName}] đã trở thành bạn bè!`);
            };
        }

        const btnDecline = this.friendInviteElement.querySelector('#btnFriendDecline');
        if (btnDecline) {
            btnDecline.onclick = () => {
                audio.playClick();
                this.hideFriendInviteNotification();
                network.declineFriendRequest(data.fromPlayerId || data.fromId);
            };
        }
    }

    hideFriendInviteNotification() {
        if (this.friendInviteElement) {
            this.friendInviteElement.classList.add('hidden');
        }
        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls && !this.isAnyModalOpen()) {
            virtualControls.classList.remove('hidden');
        }
    }

    // Hộp thoại chọn thể thức & cược khi bấm Thách Đấu
    showChallengeDialog(player) {
        if (!this.challengeDialogElement || !player) return;

        let selectedGameType = 'speed_kitchen';
        let selectedBet = 0;

        this.challengeDialogElement.innerHTML = `
            <div class="pcd-card animate-pop">
                <div class="pcd-header">
                    <h3>⚔️ THÁCH ĐẤU: ${player.name || player.brandName}</h3>
                    <button type="button" class="btn-pcd-close" id="btnPcdClose">✕</button>
                </div>

                <div class="pcd-section">
                    <label class="pcd-label">Chọn thể thức thi tài:</label>
                    <div class="pcd-mode-row">
                        <button type="button" class="btn-pcd-mode active" data-mode="speed_kitchen">
                            🍙 Gói Cơm ASMR 30s
                        </button>
                        <button type="button" class="btn-pcd-mode" data-mode="seaweed_peel">
                            🍘 Bóc Rong Biển Tốc Độ
                        </button>
                    </div>
                </div>

                <div class="pcd-section">
                    <label class="pcd-label">Chọn mức cược:</label>
                    <div class="pcd-bet-row">
                        <button type="button" class="btn-pcd-bet active" data-bet="0">Giao Hữu (0đ)</button>
                        <button type="button" class="btn-pcd-bet" data-bet="50000">50.000đ</button>
                        <button type="button" class="btn-pcd-bet" data-bet="200000">200.000đ</button>
                    </div>
                </div>

                <div class="pcd-actions">
                    <button type="button" class="btn-pcd-send" id="btnSendChallenge">⚔️ Gửi Lời Thách Đấu</button>
                    <button type="button" class="btn-pcd-cancel" id="btnCancelChallenge">Hủy</button>
                </div>
            </div>
        `;

        this.challengeDialogElement.classList.remove('hidden');

        // Bắt sự kiện chọn Mode
        const modeBtns = this.challengeDialogElement.querySelectorAll('.btn-pcd-mode');
        modeBtns.forEach(b => {
            b.onclick = () => {
                modeBtns.forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                selectedGameType = b.dataset.mode;
            };
        });

        // Bắt sự kiện chọn Bet
        const betBtns = this.challengeDialogElement.querySelectorAll('.btn-pcd-bet');
        betBtns.forEach(b => {
            b.onclick = () => {
                betBtns.forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                selectedBet = Number(b.dataset.bet) || 0;
            };
        });

        const closeDialog = () => {
            this.challengeDialogElement.classList.add('hidden');
        };

        const btnClose = this.challengeDialogElement.querySelector('#btnPcdClose');
        const btnCancel = this.challengeDialogElement.querySelector('#btnCancelChallenge');
        if (btnClose) btnClose.onclick = closeDialog;
        if (btnCancel) btnCancel.onclick = closeDialog;

        const btnSend = this.challengeDialogElement.querySelector('#btnSendChallenge');
        if (btnSend) {
            btnSend.onclick = () => {
                closeDialog();
                const res = network.sendPvpInvite(player.id, selectedGameType, selectedBet);
                this.showToastNotification(res.message);
            };
        }
    }

    // Widget tin nhắn nổi 2 dòng thu gọn góc màn hình khi đi phố
    renderFloatingChatWidget() {
        if (!this.floatingChatElement) return;

        this.floatingChatElement.innerHTML = `
            <div class="fcw-container" id="fcwContainer">
                <div class="fcw-header">
                    <span class="fcw-title">💬 Trò Chuyện Trực Tuyến</span>
                    <button type="button" class="btn-fcw-toggle" id="btnToggleFcw" title="Thu nhỏ / Phóng to">−</button>
                </div>
                <div class="fcw-messages" id="fcwMessages">
                    <div class="fcw-line">🍙 Chào mừng đến với Đế Chế Cơm Nắm!</div>
                </div>
            </div>
        `;

        const container = this.floatingChatElement.querySelector('#fcwContainer');
        const btnToggle = this.floatingChatElement.querySelector('#btnToggleFcw');
        if (btnToggle && container) {
            btnToggle.onclick = (e) => {
                e.stopPropagation();
                container.classList.toggle('collapsed');
                btnToggle.textContent = container.classList.contains('collapsed') ? '+' : '−';
            };
        }

        if (container) {
            container.onclick = (e) => {
                e.stopPropagation();
                this.openDirectChat('global');
            };
        }
    }

    // Mở thẳng giao diện Chat đầy đủ 1 chạm không qua nhiều tầng menu
    openDirectChat(channel = 'global') {
        this.chatChannel = channel;
        this.activeSubTab = 'chat';
        this.unreadChatCount = 0;
        this.updateChatBadge(0);

        // [KỸ SƯ CẢM ỨNG & BÀN PHÍM ẢO] Tự động ẩn cụm phím ảo điều khiển xe để bàn phím ảo hiển thị thoáng đãng
        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls) virtualControls.classList.add('hidden');

        // Mở thẳng tab Online và render ngay khung Chat
        if (window.game && window.game.questManager) {
            window.game.questManager.activeTab = 'online';
            window.game.questManager.open('online');
            this.activeSubTab = 'chat';
            window.game.questManager.render();
        }

        setTimeout(() => {
            const chatBox = document.getElementById('globalChatBox') || document.getElementById('privateChatBox');
            if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
            const inputChat = document.getElementById('inputChatGlobal') || document.getElementById('inputChatPrivate');
            if (inputChat) {
                inputChat.focus();
            }
        }, 120);
    }

    // Cập nhật huy hiệu chấm đỏ số tin nhắn mới trên nút Chat HUD
    updateChatBadge(count) {
        const badge = document.getElementById('hudChatBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 9 ? '9+' : count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    updateFloatingChat(msg) {
        if (!this.floatingChatElement) return;
        const msgBox = this.floatingChatElement.querySelector('#fcwMessages');
        if (!msgBox) return;

        const line = document.createElement('div');
        line.className = 'fcw-line animate-fade';
        const isSelf = msg.senderId === network.selfId;
        line.innerHTML = `<strong class="fcw-sender-link" data-sid="${msg.senderId}" data-sname="${msg.senderName}" data-slvl="${msg.senderLevel || 1}" data-scity="${msg.city || 'hcm'}" style="${isSelf ? '' : 'cursor: pointer; text-decoration: underline; color: #38bdf8;'}" title="${isSelf ? 'Bạn' : 'Bấm để xem hồ sơ và kết bạn'}">${msg.senderName}:</strong> ${msg.text}`;

        if (!isSelf) {
            const senderLink = line.querySelector('.fcw-sender-link');
            if (senderLink) {
                senderLink.onclick = (e) => {
                    e.stopPropagation();
                    audio.playClick();
                    const player = network.otherPlayers.get(msg.senderId) || {
                        id: msg.senderId,
                        playerId: msg.senderId,
                        brandName: msg.senderName,
                        name: msg.senderName,
                        level: Number(msg.senderLevel) || 1,
                        city: msg.city || 'hcm'
                    };
                    this.openPlayerProfile(player);
                };
            }
        }

        msgBox.appendChild(line);

        while (msgBox.children.length > 2) {
            msgBox.removeChild(msgBox.firstChild);
        }
    }

    showToastNotification(msg) {
        let toast = document.getElementById('onlineToastNotification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'onlineToastNotification';
            toast.className = 'online-toast-notification';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }

    // =========================================================================
    // 3. GẮN SỰ KIỆN CHO TAB CỘNG ĐỒNG TRONG ĐIỆN THOẠI
    // =========================================================================
    bindTabEvents(container) {
        return this.bindEvents(container);
    }

    bindEvents(container) {
        if (!container) return;

        // Chuyển 4 Tab con
        const subTabBtns = container.querySelectorAll('.online-subtab-btn');
        subTabBtns.forEach(btn => {
            btn.onclick = () => {
                audio.playClick();
                this.activeSubTab = btn.dataset.subtab;
                this.refreshSubTabInContainer(container);
            };
        });

        // Nút đổi tên thương hiệu
        const btnChangeBrand = container.querySelector('#btnOpenChangeBrand');
        if (btnChangeBrand) {
            btnChangeBrand.onclick = () => {
                audio.playClick();
                this.showBrandNameDialog();
            };
        }

        // Subtab 1: Tỷ Phú
        const filterBtns = container.querySelectorAll('.btn-bil-filter');
        filterBtns.forEach(btn => {
            btn.onclick = () => {
                audio.playClick();
                this.billionaireCityFilter = btn.dataset.city;
                network.getBillionaires(this.billionaireCityFilter);
                this.refreshSubTabInContainer(container);
            };
        });

        const btnRefreshBil = container.querySelector('#btnRefreshBillionaires');
        if (btnRefreshBil) {
            btnRefreshBil.onclick = () => {
                audio.playClick();
                network.getBillionaires(this.billionaireCityFilter);
            };
        }

        const btnChallengePlayers = container.querySelectorAll('.btn-challenge-player, .btn-challenge-opp');
        btnChallengePlayers.forEach(btn => {
            btn.onclick = () => {
                audio.playClick();
                const oppId = btn.dataset.targetid;
                const oppName = btn.dataset.targetname;
                this.showChallengeDialog({ id: oppId, name: oppName });
            };
        });

        const btnFriendPlayers = container.querySelectorAll('.btn-friend-player');
        btnFriendPlayers.forEach(btn => {
            btn.onclick = () => {
                audio.playClick();
                const oppId = btn.dataset.targetid;
                const res = network.sendFriendRequest(oppId);
                this.showToastNotification(res.message);
                btn.textContent = 'Đã gửi ✓';
                btn.disabled = true;
            };
        });

        // Subtab 2: Đấu trường 1v1
        const betBtns = container.querySelectorAll('.btn-bet-opt');
        betBtns.forEach(btn => {
            btn.onclick = () => {
                audio.playClick();
                this.arenaBet = Number(btn.dataset.bet) || 0;
                this.refreshSubTabInContainer(container);
            };
        });

        const modeRadios = container.querySelectorAll('input[name="arenaModeRadio"]');
        modeRadios.forEach(radio => {
            radio.onchange = () => {
                this.arenaMode = radio.value;
                this.refreshSubTabInContainer(container);
            };
        });

        const btnQuickMatch = container.querySelector('#btnQuickMatch1v1');
        if (btnQuickMatch) {
            btnQuickMatch.onclick = () => {
                audio.playClick();
                const opps = Array.from(network.otherPlayers.values());
                const targetId = opps.length > 0 ? opps[Math.floor(Math.random() * opps.length)].id : 'bot_1';
                const res = network.sendPvpInvite(targetId, this.arenaMode, this.arenaBet);
                this.showToastNotification(res.message);
            };
        }

        const btnTap = container.querySelector('#btnArenaActionTap');
        if (btnTap) {
            btnTap.onclick = () => {
                if (network.activeArena && network.activeArena.status === 'PLAYING') {
                    audio.playChop();
                    network.sendPvpTap(network.activeArena.id);
                }
            };
        }

        const btnExitArena = container.querySelector('#btnArenaExit');
        if (btnExitArena) {
            btnExitArena.onclick = () => {
                audio.playClick();
                network.activeArena = null;
                this.refreshSubTabInContainer(container);
            };
        }

        // Subtab 3: Trò chuyện & Bạn bè
        const chanBtns = container.querySelectorAll('.btn-chat-chan');
        chanBtns.forEach(btn => {
            btn.onclick = () => {
                audio.playClick();
                this.chatChannel = btn.dataset.chan;
                this.refreshSubTabInContainer(container);
            };
        });

        // Chọn bạn bè để chat riêng
        const friendCards = container.querySelectorAll('.friend-item-card');
        friendCards.forEach(card => {
            card.onclick = () => {
                audio.playClick();
                this.selectedFriendId = card.dataset.fid;
                state.markMessagesAsRead(this.selectedFriendId);
                this.refreshSubTabInContainer(container);
            };
        });

        const btnVisitFactory = container.querySelector('.btn-visit-friend-factory');
        if (btnVisitFactory) {
            btnVisitFactory.onclick = () => {
                audio.playClick();
                this.openFriendFactoryModal(btnVisitFactory.dataset.fid, btnVisitFactory.dataset.fname);
            };
        }

        const btnChallengeFriend = container.querySelector('.btn-challenge-friend');
        if (btnChallengeFriend) {
            btnChallengeFriend.onclick = () => {
                audio.playClick();
                this.showChallengeDialog({ id: btnChallengeFriend.dataset.fid, name: btnChallengeFriend.dataset.fname });
            };
        }

        // Gửi câu nhanh 1 chạm
        const phraseBtns = container.querySelectorAll('.btn-quick-phrase');
        phraseBtns.forEach(btn => {
            btn.onclick = () => {
                audio.playClick();
                const text = btn.dataset.phrase;
                if (this.chatChannel === 'friends' && this.selectedFriendId) {
                    network.sendChatMessage(text, 'private', this.selectedFriendId);
                } else {
                    network.sendChatMessage(text, 'global');
                }
            };
        });

        // Gửi chat cộng đồng
        const inputGlobal = container.querySelector('#inputChatGlobal');
        const btnSendGlobal = container.querySelector('#btnSendChatGlobal');
        const sendGlobalHandler = () => {
            if (!inputGlobal) return;
            const text = inputGlobal.value.trim();
            if (text.length > 0) {
                audio.playClick();
                network.sendChatMessage(text, 'global');
                inputGlobal.value = '';
            }
        };
        if (btnSendGlobal) btnSendGlobal.onclick = sendGlobalHandler;
        if (inputGlobal) {
            inputGlobal.onkeydown = (e) => {
                e.stopPropagation();
                if (e.key === 'Enter') sendGlobalHandler();
            };
        }

        // Gửi chat riêng bạn bè
        const inputPrivate = container.querySelector('#inputChatPrivate');
        const btnSendPrivate = container.querySelector('#btnSendChatPrivate');
        const sendPrivateHandler = () => {
            if (!inputPrivate || !this.selectedFriendId) return;
            const text = inputPrivate.value.trim();
            if (text.length > 0) {
                audio.playClick();
                network.sendChatMessage(text, 'private', this.selectedFriendId);
                inputPrivate.value = '';
            }
        };
        if (btnSendPrivate) btnSendPrivate.onclick = sendPrivateHandler;
        if (inputPrivate) {
            inputPrivate.onkeydown = (e) => {
                e.stopPropagation();
                if (e.key === 'Enter') sendPrivateHandler();
            };
        }

        // Subtab 4: Co-op
        const coopBtns = container.querySelectorAll('.btn-coop-contrib');
        coopBtns.forEach(btn => {
            btn.onclick = () => {
                const count = parseInt(btn.dataset.count, 10) || 1;
                audio.playClick();
                network.contributeCoopRice(count);
                this.refreshSubTabInContainer(container);
            };
        });

        // Bấm vào tên người gửi trong khung Chat để mở Thẻ Hồ Sơ Người Chơi
        const senderBtns = container.querySelectorAll('.cmr-sender-btn');
        senderBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                audio.playClick();
                const sid = btn.dataset.senderId;
                if (!sid || sid === network.selfId) return;
                const player = network.otherPlayers.get(sid) || {
                    id: sid,
                    playerId: sid,
                    brandName: btn.dataset.senderName || 'Người Chơi',
                    name: btn.dataset.senderName || 'Người Chơi',
                    level: Number(btn.dataset.senderLevel) || 1,
                    city: btn.dataset.senderCity || 'hcm'
                };
                this.openPlayerProfile(player);
            };
        });

        // Bấm vào tên người chơi trong BXH Tỷ Phú để mở Thẻ Hồ Sơ Người Chơi
        const bilNames = container.querySelectorAll('.bil-brand-cell');
        bilNames.forEach(cell => {
            const row = cell.closest('tr');
            const targetBtn = row?.querySelector('.btn-friend-player, .btn-challenge-player');
            const targetId = targetBtn?.dataset.targetid;
            const targetName = targetBtn?.dataset.targetname;
            if (targetId && targetId !== network.selfId) {
                cell.style.cursor = 'pointer';
                cell.title = 'Bấm để xem hồ sơ và kết bạn';
                cell.onclick = (e) => {
                    e.stopPropagation();
                    audio.playClick();
                    const player = network.otherPlayers.get(targetId) || {
                        id: targetId,
                        playerId: targetId,
                        brandName: targetName || 'Chi Nhánh Đối Tác',
                        name: targetName || 'Chi Nhánh Đối Tác',
                        level: 1,
                        city: 'hcm'
                    };
                    this.openPlayerProfile(player);
                };
            }
        });
    }

    refreshSubTabInContainer(container) {
        const subContainer = container.querySelector('#onlineSubtabContent');
        if (subContainer) {
            subContainer.innerHTML = this.renderSubTabContent();
            this.bindEvents(container);
        }
    }

    refreshCurrentSubTab() {
        if (typeof document === 'undefined') return;
        const phoneModal = document.getElementById('phoneModal');
        if (phoneModal && !phoneModal.classList.contains('hidden')) {
            this.refreshSubTabInContainer(phoneModal);
        }
    }

    updateArenaUI() {
        this.refreshCurrentSubTab();
    }

    updateCoopUI() {
        this.refreshCurrentSubTab();
    }

    updateChatContainer() {
        if (typeof document === 'undefined') return;
        const globalBox = document.getElementById('globalChatBox');
        if (globalBox) {
            globalBox.innerHTML = this.globalMessages.map(m => `
                <div class="chat-msg-row ${m.senderId === network.selfId ? 'is-self' : ''}">
                    <div class="cmr-meta">
                        <strong class="cmr-sender">${m.senderName}</strong>
                        <span class="cmr-lvl">Cấp ${m.senderLevel || 1}</span>
                        <span class="cmr-time">${new Date(m.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div class="cmr-bubble">${m.text}</div>
                </div>
            `).join('');
            globalBox.scrollTop = globalBox.scrollHeight;
        }

        const privateBox = document.getElementById('privateChatBox');
        if (privateBox && this.selectedFriendId) {
            const pMessages = (state.privateMessages && state.privateMessages[this.selectedFriendId]) || [];
            privateBox.innerHTML = pMessages.map(m => `
                <div class="chat-msg-row ${m.from === 'self' ? 'is-self' : ''}">
                    <div class="cmr-meta">
                        <strong class="cmr-sender">${m.from === 'self' ? 'Bạn' : (m.senderName || 'Bạn')}</strong>
                        <span class="cmr-time">${new Date(m.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div class="cmr-bubble">${m.text}</div>
                </div>
            `).join('');
            privateBox.scrollTop = privateBox.scrollHeight;
        }
    }

    // =========================================================================
    // 4. MENU TƯƠNG TÁC NHANH KHI BẤM VÀO NGƯỜI CHƠI TRÊN PHỐ
    // =========================================================================
    openQuickMenu(player, screenX, screenY) {
        if (!this.quickMenuElement || !player) return;

        this.quickMenuTarget = player;
        const brandName = player.brandName || 'Thương hiệu đối tác';
        const level = player.level || 1;
        const reputation = player.reputation || 100;
        const revenue = player.totalRevenue || 0;
        const isFriend = state.isFriend ? state.isFriend(player.id || player.brandName) : false;

        let posX = Math.max(16, Math.min(window.innerWidth - 250, screenX - 110));
        let posY = Math.max(70, Math.min(window.innerHeight - 260, screenY - 140));

        this.quickMenuElement.style.left = `${posX}px`;
        this.quickMenuElement.style.top = `${posY}px`;

        this.quickMenuElement.innerHTML = `
            <div class="quick-menu-card animate-pop">
                <div class="qmc-header">
                    <span class="qmc-avatar">🍙</span>
                    <div class="qmc-title">
                        <h4>${brandName}</h4>
                        <span class="qmc-lvl">Cấp ${level} • ⭐ ${reputation} Uy Tín</span>
                    </div>
                    <button type="button" class="btn-qmc-close" id="btnQuickMenuClose">✕</button>
                </div>

                <div class="qmc-emotes-row">
                    <button type="button" class="btn-emote" data-emote="wave" title="Vẫy tay chào">👋 Vẫy tay</button>
                    <button type="button" class="btn-emote" data-emote="heart" title="Tặng tim">❤️ Thả tim</button>
                    <button type="button" class="btn-emote" data-emote="cheer" title="Cổ vũ nhiệt tình">🍙 Cổ vũ</button>
                </div>

                <div class="qmc-actions">
                    <button type="button" class="btn-qmc-action btn-qmc-challenge" id="btnQuickChallenge">
                        ⚔️ Thách Đấu 1v1
                    </button>
                    ${isFriend ? `
                        <button type="button" class="btn-qmc-action" id="btnQuickChatFriend">
                            💬 Nhắn Tin Bạn Bè
                        </button>
                    ` : `
                        <button type="button" class="btn-qmc-action btn-qmc-friend" id="btnQuickAddFriend">
                            🤝 Gửi Lời Kết Bạn
                        </button>
                    `}
                </div>
            </div>
        `;

        this.quickMenuElement.classList.remove('hidden');

        const btnClose = this.quickMenuElement.querySelector('#btnQuickMenuClose');
        if (btnClose) btnClose.onclick = () => this.closeQuickMenu();

        const emoteBtns = this.quickMenuElement.querySelectorAll('.btn-emote');
        emoteBtns.forEach(btn => {
            btn.onclick = () => {
                const emType = btn.dataset.emote;
                audio.playClick();
                network.sendEmote(emType, player.id);
                this.closeQuickMenu();
            };
        });

        const btnChallenge = this.quickMenuElement.querySelector('#btnQuickChallenge');
        if (btnChallenge) {
            btnChallenge.onclick = () => {
                audio.playClick();
                this.closeQuickMenu();
                this.showChallengeDialog(player);
            };
        }

        const btnAddFriend = this.quickMenuElement.querySelector('#btnQuickAddFriend');
        if (btnAddFriend) {
            btnAddFriend.onclick = () => {
                audio.playClick();
                this.closeQuickMenu();
                const res = network.sendFriendRequest(player.id);
                this.showToastNotification(res.message);
            };
        }

        const btnChatFriend = this.quickMenuElement.querySelector('#btnQuickChatFriend');
        if (btnChatFriend) {
            btnChatFriend.onclick = () => {
                audio.playClick();
                this.closeQuickMenu();
                if (window.game?.questManager) {
                    window.game.questManager.open('online');
                    this.activeSubTab = 'chat';
                    this.chatChannel = 'friends';
                    this.selectedFriendId = player.id;
                    window.game.questManager.render();
                }
            };
        }
    }

    closeQuickMenu() {
        if (this.quickMenuElement) {
            this.quickMenuElement.classList.add('hidden');
        }
        this.quickMenuTarget = null;
    }

    // =========================================================================
    // 5. DIALOG ĐẶT & ĐỔI TÊN THƯƠNG HIỆU
    // =========================================================================
    showBrandNameDialog() {
        if (!this.brandModalElement) return;

        this.brandModalElement.innerHTML = `
            <div class="brand-modal-card animate-pop">
                <h3>🏷️ ĐẶT TÊN THƯƠNG HIỆU</h3>
                <p>Tên thương hiệu sẽ hiển thị trực tiếp trên bản đồ thế giới và bảng xếp hạng trực tuyến toàn server:</p>
                
                <div class="brand-input-group">
                    <input type="text" id="inputBrandName" class="brand-text-input" maxlength="30" value="${state.brandName}" placeholder="Nhập tên thương hiệu của bạn...">
                </div>

                <div class="brand-modal-actions">
                    <button type="button" class="btn-brand-save" id="btnSaveBrandName">💾 Lưu Thương Hiệu</button>
                    <button type="button" class="btn-brand-cancel" id="btnCancelBrandName">Hủy Bỏ</button>
                </div>
            </div>
        `;

        this.brandModalElement.classList.remove('hidden');

        const inputElem = this.brandModalElement.querySelector('#inputBrandName');
        if (inputElem) {
            inputElem.focus();
            inputElem.select();
        }

        const btnSave = this.brandModalElement.querySelector('#btnSaveBrandName');
        if (btnSave) {
            btnSave.onclick = () => {
                const val = inputElem ? inputElem.value.trim() : '';
                if (val.length > 0) {
                    audio.playCoin();
                    state.setBrandName(val);
                    network.refreshLeaderboard();
                    this.brandModalElement.classList.add('hidden');

                    const brandNameTitle = document.getElementById('onlineProfileBrandName');
                    if (brandNameTitle) {
                        brandNameTitle.textContent = val;
                    }
                }
            };
        }

        const btnCancel = this.brandModalElement.querySelector('#btnCancelBrandName');
        if (btnCancel) {
            btnCancel.onclick = () => {
                this.brandModalElement.classList.add('hidden');
            };
        }
    }

    openFriendFactoryModal(friendId, friendName = 'Bạn Bè') {
        let modal = document.getElementById('friendFactoryModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'friendFactoryModal';
            modal.className = 'game-modal-backdrop hidden';
            document.body.appendChild(modal);
        }

        const helpStatus = state.canHelpFriend ? state.canHelpFriend(friendId) : { canHelp: true, remainingMs: 0 };
        const remainingMinutes = Math.ceil((helpStatus.remainingMs || 0) / 60000);

        modal.innerHTML = `
            <div class="game-modal-dialog friend-factory-modal-dialog">
                <div class="game-modal-header">
                    <div class="gmh-title">
                        <span class="gmh-icon">🏭</span>
                        <h3>Xưởng Bếp Cơm Nắm - ${friendName}</h3>
                    </div>
                    <button type="button" class="btn-modal-close" id="btnCloseFriendFactoryModal">✕</button>
                </div>
                <div class="friend-factory-modal-body">
                    <div class="ffm-banner">
                        <span class="ffm-stamp">🛡️ Chuẩn ISO 22000 & ATVSTP</span>
                        <p>Bạn đang ghé thăm xưởng sản xuất của <strong>${friendName}</strong>. Hãy tương trợ lẫn nhau để cùng phát triển chuỗi cơm nắm toàn quốc!</p>
                    </div>

                    <!-- 1. TIẾP LỬA DÂY CHUYỀN -->
                    <div class="ffm-section-card">
                        <div class="ffm-sec-header">
                            <span class="sec-icon">🔥</span>
                            <div>
                                <h4>Tiếp Lửa Dây Chuyền (Giúp Bạn)</h4>
                                <small>Rút ngắn ngay <strong>20% thời gian nấu</strong> của mẻ cơm đang nấu cho bạn bè! (1 lần / 2 giờ)</small>
                            </div>
                        </div>
                        <div class="ffm-boost-box">
                            <div class="ffm-boost-reward-hint">
                                🎁 Bạn nhận ngay: <strong style="color: #4ade80;">+15.000đ</strong> và <strong style="color: #facc15;">+10 Uy Tín</strong>
                            </div>
                            ${helpStatus.canHelp ? `
                                <button type="button" class="btn-ffm-boost" id="btnHelpFriendFactory">
                                    🔥 Tiếp Lửa Dây Chuyền Ngay
                                </button>
                            ` : `
                                <button type="button" class="btn-ffm-boost disabled" disabled>
                                    ⏳ Đang chờ hồi sức (${remainingMinutes} phút nữa)
                                </button>
                            `}
                        </div>
                    </div>

                    <!-- 2. QUẦY KÝ GỬI BẠN BÈ -->
                    <div class="ffm-section-card">
                        <div class="ffm-sec-header">
                            <span class="sec-icon">🛒</span>
                            <div>
                                <h4>Quầy Ký Gửi Nguyên Liệu Bạn Bè</h4>
                                <small>Mua lại nguyên liệu sạch dư thừa với mức giá hữu nghị niêm yết</small>
                            </div>
                        </div>
                        <div class="ffm-consignment-grid">
                            <div class="consignment-item-card">
                                <span class="cic-icon">🌾</span>
                                <div class="cic-info">
                                    <strong>Gạo Nhật Sạch (10 phần)</strong>
                                    <small>Chuẩn giống Koshihikari</small>
                                </div>
                                <button type="button" class="btn-buy-consignment" data-crop="rice_seaweed" data-price="10000" data-amount="10">
                                    10.000đ
                                </button>
                            </div>
                            <div class="consignment-item-card">
                                <span class="cic-icon">🌊</span>
                                <div class="cic-info">
                                    <strong>Rong Biển Nori (10 phần)</strong>
                                    <small>Giòn tan, thơm chuẩn vị biển</small>
                                </div>
                                <button type="button" class="btn-buy-consignment" data-crop="rice_seaweed" data-price="10000" data-amount="10">
                                    10.000đ
                                </button>
                            </div>
                            <div class="consignment-item-card">
                                <span class="cic-icon">🥩</span>
                                <div class="cic-info">
                                    <strong>Thịt Sạch Tươi (10 phần)</strong>
                                    <small>Thịt bò / gà đạt chuẩn ATVSTP</small>
                                </div>
                                <button type="button" class="btn-buy-consignment" data-crop="meat_clean" data-price="20000" data-amount="10">
                                    20.000đ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');

        // Ẩn phím ảo
        const vc = document.getElementById('virtualControls');
        if (vc) vc.classList.add('hidden');

        const btnClose = modal.querySelector('#btnCloseFriendFactoryModal');
        if (btnClose) {
            btnClose.onclick = () => {
                modal.classList.add('hidden');
                if (vc && (('ontouchstart' in window) || navigator.maxTouchPoints > 0)) {
                    vc.classList.remove('hidden');
                }
            };
        }

        const btnBoost = modal.querySelector('#btnHelpFriendFactory');
        if (btnBoost) {
            btnBoost.onclick = () => {
                const res = state.helpFriendFactory ? state.helpFriendFactory(friendId, friendName) : { success: false };
                if (res.success) {
                    audio.playLevelUp();
                    audio.playTingComplete();
                    network.sendFriendBoost(friendId, state.brandName || state.playerName);
                    this.showToastNotification(`🔥 Đã tiếp lửa thành công cho xưởng ${friendName}! Nhận +15.000đ & +10 Uy Tín!`);
                    this.openFriendFactoryModal(friendId, friendName);
                } else {
                    audio.playError();
                    this.showToastNotification(`⚠️ Chưa thể tiếp lửa: Còn phải chờ cooldown.`);
                }
            };
        }

        const buyBtns = modal.querySelectorAll('.btn-buy-consignment');
        buyBtns.forEach(btn => {
            btn.onclick = () => {
                const price = Number(btn.dataset.price) || 10000;
                const crop = btn.dataset.crop;
                const amount = Number(btn.dataset.amount) || 10;
                if (state.money < price) {
                    audio.playError();
                    this.showToastNotification(`⚠️ Không đủ tiền! Cần ${price.toLocaleString('vi-VN')}đ.`);
                    return;
                }
                state.deductMoney(price);
                if (!state.ingredients) state.ingredients = {};
                state.ingredients[crop] = (state.ingredients[crop] || 0) + amount;
                state.save();
                state.notify();
                audio.playClick();
                this.showToastNotification(`🛒 Mua thành công +${amount} phần từ quầy ký gửi bạn bè!`);
            };
        });
    }

    /**
     * Khởi tạo DOM và lắng nghe sự kiện Thanh Radar Đua Cấp Sát Sườn
     */
    initRivalRadarDom() {
        if (typeof document === 'undefined') return;

        this.rivalRadarBar = document.getElementById('rivalRadarBar');
        this.btnToggleRadar = document.getElementById('btnToggleRadar');
        this.btnChallengeAbove = document.getElementById('btnChallengeAbove');
        this.overtakeAlertBanner = document.getElementById('overtakeAlertBanner');

        if (this.btnToggleRadar && this.rivalRadarBar) {
            this.btnToggleRadar.onclick = () => {
                try { audio.playClick(); } catch (e) {}
                this.rivalRadarBar.classList.toggle('collapsed');
                const isCollapsed = this.rivalRadarBar.classList.contains('collapsed');
                this.btnToggleRadar.textContent = isCollapsed ? '+' : '−';
            };
        }

        if (this.btnChallengeAbove) {
            this.btnChallengeAbove.onclick = () => {
                if (!this.currentRivalAbove) {
                    this.showToastNotification('⚠️ Không tìm thấy đối thủ trên để thách đấu!');
                    return;
                }
                try { audio.playClick(); } catch (e) {}
                this.showChallengeDialog(this.currentRivalAbove);
            };
        }

        // Đưa onlineUI vào window để network và các module khác dễ dàng gọi
        if (typeof window !== 'undefined') {
            window.onlineUI = this;
        }
    }

    /**
     * Cập nhật giao diện Thanh Radar Đua Cấp Sát Sườn
     * @param {Object} data 
     */
    updateRivalRadar(data) {
        if (!data || typeof document === 'undefined') return;

        if (!this.rivalRadarBar) {
            this.rivalRadarBar = document.getElementById('rivalRadarBar');
        }
        if (!this.rivalRadarBar) return;

        this.rivalRadarBar.classList.remove('hidden');

        // 1. Đối thủ xếp ngay trên
        const aboveNameEl = document.getElementById('rrbAboveName');
        const aboveLevelEl = document.getElementById('rrbAboveLevel');
        const btnChallenge = document.getElementById('btnChallengeAbove');

        if (data.rivalAbove) {
            this.currentRivalAbove = {
                id: data.rivalAbove.id,
                name: data.rivalAbove.name || 'Đối thủ sát trên',
                level: data.rivalAbove.level || 1,
                reputation: data.rivalAbove.reputation || 100
            };
            if (aboveNameEl) aboveNameEl.textContent = data.rivalAbove.name || 'Đối thủ';
            if (aboveLevelEl) aboveLevelEl.textContent = `Lv.${data.rivalAbove.level || 1}`;
            if (btnChallenge) {
                btnChallenge.style.display = 'inline-block';
                btnChallenge.title = `Thách đấu ${data.rivalAbove.name}`;
            }
        } else {
            this.currentRivalAbove = null;
            if (aboveNameEl) aboveNameEl.textContent = '🏆 BẠN ĐANG TOP 1!';
            if (aboveLevelEl) aboveLevelEl.textContent = 'VÔ ĐỐI';
            if (btnChallenge) btnChallenge.style.display = 'none';
        }

        // 2. Bản thân
        const selfRankEl = document.getElementById('rrbSelfRank');
        const selfLevelEl = document.getElementById('rrbSelfLevel');
        const selfExpFillEl = document.getElementById('rrbSelfExpFill');

        if (selfRankEl) selfRankEl.textContent = `#${data.rank || 1}`;
        if (selfLevelEl) selfLevelEl.textContent = `Lv.${data.self?.level || state.level || 1}`;

        if (selfExpFillEl) {
            const nextLevelExp = state.getNextLevelExp ? state.getNextLevelExp() : 100;
            const curExp = state.exp || 0;
            const pct = Math.min(100, Math.max(0, (curExp / nextLevelExp) * 100));
            selfExpFillEl.style.width = `${pct}%`;
        }

        // 3. Đối thủ bám đuổi ngay sau
        const belowNameEl = document.getElementById('rrbBelowName');
        const belowLevelEl = document.getElementById('rrbBelowLevel');

        if (data.rivalBelow) {
            if (belowNameEl) belowNameEl.textContent = data.rivalBelow.name || 'Đối thủ sát dưới';
            if (belowLevelEl) belowLevelEl.textContent = `Lv.${data.rivalBelow.level || 1}`;
        } else {
            if (belowNameEl) belowNameEl.textContent = '🏁 Chưa có người sau';
            if (belowLevelEl) belowLevelEl.textContent = '–';
        }
    }

    /**
     * Hiển thị thông báo Overtake Alert khi vượt mặt thành công
     * @param {Object} data 
     */
    showOvertakeAlert(data) {
        if (!data || typeof document === 'undefined') return;

        if (!this.overtakeAlertBanner) {
            this.overtakeAlertBanner = document.getElementById('overtakeAlertBanner');
        }
        if (!this.overtakeAlertBanner) return;

        const targetName = data.targetName || 'Đối thủ';
        const newRank = data.newRank || 1;
        const bonusMoney = Number(data.bonusMoney) || 25000;
        const bonusRep = Number(data.bonusReputation) || 10;

        // Thưởng nóng trực tiếp
        if (state.addMoney) {
            state.addMoney(bonusMoney);
        } else {
            state.money = (state.money || 0) + bonusMoney;
        }

        if (state.addReputation) {
            state.addReputation(bonusRep);
        } else {
            state.reputation = (state.reputation || 0) + bonusRep;
        }
        state.notify();

        // Âm thanh ăn mừng
        try {
            audio.playLevelUp();
            audio.playTingComplete();
        } catch (e) {}

        this.overtakeAlertBanner.innerHTML = `
            <div class="oab-title">🚀 VƯỢT MẶT THÀNH CÔNG!</div>
            <div class="oab-desc">Bạn vừa vượt qua <strong>${targetName}</strong>! Vươn lên Hạng #${newRank}</div>
            <div class="oab-reward">+${bonusMoney.toLocaleString('vi-VN')}đ  +${bonusRep} Uy Tín ⭐</div>
        `;
        this.overtakeAlertBanner.classList.remove('hidden');

        if (this._overtakeTimer) clearTimeout(this._overtakeTimer);
        this._overtakeTimer = setTimeout(() => {
            if (this.overtakeAlertBanner) {
                this.overtakeAlertBanner.classList.add('hidden');
            }
        }, 4500);
    }

    /**
     * Cảnh báo khi bị đối thủ vượt mặt
     * @param {Object} data 
     */
    showOvertakenWarning(data) {
        if (!data) return;
        const byName = data.byName || 'Một người chơi';
        try { audio.playError(); } catch (e) {}
        this.showToastNotification(`⚠️ Cảnh báo: ${byName} vừa vượt mặt bạn! Hãy tăng tốc sạp hàng!`);
    }

    /**
     * Khởi tạo DOM cho Tranh Đoạt Địa Bàn Vàng & Đấu Thầu Hợp Đồng Độc Quyền
     */
    initTerritoryAndContractDom() {
        if (typeof document === 'undefined') return;

        this.territoryOverthrownBanner = document.getElementById('territoryOverthrownBanner');
        this.btnReclaimTerritory = document.getElementById('btnReclaimTerritory');
        this.exclusiveContractWidget = document.getElementById('exclusiveContractWidget');
        this.btnToggleContract = document.getElementById('btnToggleContract');
        this.btnDeliverContractRice = document.getElementById('btnDeliverContractRice');

        const ecwHeader = document.getElementById('ecwHeader');
        if (ecwHeader && this.exclusiveContractWidget) {
            ecwHeader.onclick = (e) => {
                if (e.target && e.target.id === 'btnDeliverContractRice') return;
                try { audio.playClick(); } catch (err) {}
                this.exclusiveContractWidget.classList.toggle('collapsed');
                const isCollapsed = this.exclusiveContractWidget.classList.contains('collapsed');
                if (this.btnToggleContract) {
                    this.btnToggleContract.textContent = isCollapsed ? '+' : '−';
                }
            };
        }

        if (this.btnDeliverContractRice) {
            this.btnDeliverContractRice.onclick = () => {
                try { audio.playClick(); } catch (err) {}
                const res = network.deliverContractRice(5);
                if (res && res.success) {
                    try { audio.playTingComplete(); } catch (err) {}
                    this.showToastNotification(`🚚 Đã giao thành công +${res.count} nắm cơm vào Hợp Đồng Độc Quyền!`);
                }
            };
        }

        if (this.btnReclaimTerritory) {
            this.btnReclaimTerritory.onclick = () => {
                try { audio.playClick(); } catch (err) {}
                if (this.lastLostTerritoryRuler) {
                    this.showChallengeDialog(this.lastLostTerritoryRuler);
                } else {
                    this.showToastNotification('🔥 Hãy đến ngay ô vạch xanh địa bàn và mở sạp bán cơm để giành lại quyền lực!');
                }
            };
        }
    }

    /**
     * Hiển thị thông báo Soán Ngôi Địa Bàn Vàng toàn server
     * @param {Object} data 
     */
    showTerritoryOverthrown(data) {
        if (!data || typeof document === 'undefined') return;

        if (!this.territoryOverthrownBanner) {
            this.territoryOverthrownBanner = document.getElementById('territoryOverthrownBanner');
        }
        if (!this.territoryOverthrownBanner) return;

        const tobDesc = document.getElementById('tobDesc');
        if (tobDesc) {
            tobDesc.innerHTML = `<strong>${data.newRulerName}</strong> đã chính thức chiếm lĩnh <strong>${data.territoryName}</strong> với <strong>${data.newRulerScore || 0}đ</strong> thống trị!`;
        }

        try {
            audio.playLevelUp();
            audio.playTingComplete();
        } catch (e) {}

        this.territoryOverthrownBanner.classList.remove('hidden');

        if (this._tobTimer) clearTimeout(this._tobTimer);
        this._tobTimer = setTimeout(() => {
            if (this.territoryOverthrownBanner) {
                this.territoryOverthrownBanner.classList.add('hidden');
            }
        }, 5500);
    }

    /**
     * Cảnh báo riêng khi người chơi bị soán ngôi địa bàn
     * @param {Object} data 
     */
    showTerritoryLost(data) {
        if (!data || typeof document === 'undefined') return;

        try { audio.playError(); } catch (e) {}

        this.lastLostTerritoryRuler = {
            name: data.newRulerName,
            level: 10,
            reputation: 150
        };

        if (this.btnReclaimTerritory) {
            this.btnReclaimTerritory.classList.remove('hidden');
        }

        this.showToastNotification(`🚨 BÁO ĐỘNG: Bạn vừa bị [${data.newRulerName}] cướp mất địa bàn [${data.territoryName}]! Hãy giành lại ngay!`);
    }

    /**
     * Thông báo nhận tiền bản quyền thương hiệu từ Chủ Tịch Khu Vực
     * @param {Object} data 
     */
    showTerritoryRoyalty(data) {
        if (!data) return;
        const amount = Number(data.amount) || 5000;
        state.addMoney(amount);
        try { audio.playTingComplete(); } catch (e) {}
        this.showToastNotification(`👑 +${amount.toLocaleString('vi-VN')}đ tiền bản quyền từ [${data.fromSellerName || 'Khách bán'}] tại [${data.territoryName}]!`);
    }

    /**
     * Cập nhật thông tin Thẻ Hợp Đồng Cung Ứng Độc Quyền Theo Giờ
     * @param {Object} data 
     */
    updateExclusiveContract(data) {
        if (!data || typeof document === 'undefined') return;

        const ecwDesc = document.getElementById('ecwDesc');
        const ecwProgressFill = document.getElementById('ecwProgressFill');
        const ecwProgressText = document.getElementById('ecwProgressText');
        const ecwTimer = document.getElementById('ecwTimer');

        if (ecwDesc && data.title) {
            ecwDesc.textContent = data.title;
        }

        const target = Number(data.targetCount) || 30;
        let myCount = 0;
        if (data.bidders && Array.isArray(data.bidders)) {
            const selfBidder = data.bidders.find(b => b.playerId === network.selfId || b.name === (state.brandName || state.playerName));
            if (selfBidder) myCount = selfBidder.progress || 0;
        } else if (typeof data.myProgress === 'number') {
            myCount = data.myProgress;
        }

        if (ecwProgressFill) {
            const pct = Math.min(100, Math.max(0, (myCount / target) * 100));
            ecwProgressFill.style.width = `${pct}%`;
        }

        if (ecwProgressText) {
            ecwProgressText.textContent = `${myCount} / ${target} nắm`;
        }

        // Tính thời gian đếm ngược
        if (ecwTimer && data.startedAt && data.durationSeconds) {
            const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
            const remain = Math.max(0, data.durationSeconds - elapsed);
            const m = Math.floor(remain / 60);
            const s = remain % 60;
            ecwTimer.textContent = `⏳ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
    }

    /**
     * Thông báo kết quả trao thưởng người chiến thắng Hợp Đồng Độc Quyền
     * @param {Object} data 
     */
    showContractWinner(data) {
        if (!data) return;
        const isMe = data.winnerName === (state.brandName || state.playerName) || data.winnerId === network.selfId;

        if (isMe) {
            const money = Number(data.rewardMoney) || 300000;
            const rep = Number(data.rewardRep) || 50;
            const exp = Number(data.rewardExp) || 500;

            state.addMoney(money);
            state.addReputation(rep);
            state.addExp(exp);

            try {
                audio.playLevelUp();
                audio.playTingComplete();
            } catch (e) {}

            this.showToastNotification(`🏆 XUẤT SẮC! Bạn ôm trọn GIẢI ĐỘC QUYỀN: +${money.toLocaleString('vi-VN')}đ • +${rep} Uy Tín • +${exp} EXP!`);
        } else {
            this.showToastNotification(`📜 Hợp Đồng Độc Quyền hoàn thành! Người chiến thắng: [${data.winnerName}]!`);
        }
    }
}

export const onlineUI = new OnlineUIManager();
