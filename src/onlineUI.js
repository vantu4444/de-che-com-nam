/**
 * src/onlineUI.js
 * -----------------------------------------------------------------------------
 * GIAO DIỆN CỘNG ĐỒNG ONLINE, BẢNG XẾP HẠNG LIVE, ĐẤU TRƯỜNG 1V1 & CO-OP
 * Dự án: Game Thế Giới Mở 2D "Đế Chế Cơm Nắm" (Onigiri Empire 2D)
 * Chuẩn chất lượng: Principal Engineer / Enterprise Defensive Programming
 * -----------------------------------------------------------------------------
 */

import { state } from './state.js';
import { audio } from './audio.js';
import { network } from './network.js';

export class OnlineUIManager {
    constructor() {
        this.activeSubTab = 'leaderboard'; // 'leaderboard' | 'arena' | 'coop'
        this.leaderboardMode = 'revenue';   // 'revenue' | 'reputation'
        this.arenaMode = 'speed_kitchen';   // 'speed_kitchen' | 'seaweed_peel'
        this.quickMenuTarget = null;
        this.quickMenuPos = { x: 0, y: 0 };
        this.quickMenuElement = null;
        this.brandModalElement = null;
        this.initDomElements();
        this.bindNetworkEvents();
    }

    initDomElements() {
        if (typeof document === 'undefined') return;

        // Container cho Menu tương tác nhanh trên phố
        let qMenu = document.getElementById('onlineQuickMenu');
        if (!qMenu) {
            qMenu = document.createElement('div');
            qMenu.id = 'onlineQuickMenu';
            qMenu.className = 'online-quick-menu-layer hidden';
            const gameContainer = document.getElementById('gameContainer') || document.body;
            gameContainer.appendChild(qMenu);
        }
        this.quickMenuElement = qMenu;

        // Container cho Modal đổi tên thương hiệu
        let bModal = document.getElementById('brandNameModal');
        if (!bModal) {
            bModal = document.createElement('div');
            bModal.id = 'brandNameModal';
            bModal.className = 'brand-name-modal-layer hidden';
            const gameContainer = document.getElementById('gameContainer') || document.body;
            gameContainer.appendChild(bModal);
        }
        this.brandModalElement = bModal;
    }

    bindNetworkEvents() {
        network.on('onArenaEvent', (event) => {
            if (event.type === 'MATCH_STARTED' || event.type === 'SCORE_UPDATE' || event.type === 'COUNTDOWN_DONE' || event.type === 'MATCH_FINISHED') {
                this.updateArenaUI();
            }
        });

        network.on('onCoopChange', () => {
            this.updateCoopUI();
        });

        network.on('onEmoteReceived', (data) => {
            if (data && data.type) {
                try {
                    audio.playClick();
                } catch (e) {}
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

        return `
            <div class="tab-content online-view">
                <!-- Header thông tin thương hiệu & trạng thái mạng -->
                <div class="online-profile-bar">
                    <div class="opb-brand">
                        <span class="opb-avatar">🏪</span>
                        <div class="opb-info">
                            <h3 class="opb-name" id="onlineProfileBrandName">${state.brandName}</h3>
                            <div class="opb-tags">
                                <span class="opb-tag-lvl">Cấp ${state.level}</span>
                                <span class="opb-tag-rep">⭐ ${state.reputation} Uy Tín</span>
                                <button type="button" class="btn-change-brand" id="btnOpenChangeBrand">✏️ Đổi Tên</button>
                            </div>
                        </div>
                    </div>
                    <div class="opb-status">${statusBadge}</div>
                </div>

                <!-- Thanh chuyển 3 Tab Con -->
                <div class="online-subtab-bar">
                    <button type="button" class="online-subtab-btn ${this.activeSubTab === 'leaderboard' ? 'active' : ''}" data-subtab="leaderboard">
                        🏆 Bảng Xếp Hạng Live
                    </button>
                    <button type="button" class="online-subtab-btn ${this.activeSubTab === 'arena' ? 'active' : ''}" data-subtab="arena">
                        ⚔️ Đấu Trường 1v1
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
            case 'leaderboard':
                return this.renderLeaderboardSubTab();
            case 'arena':
                return this.renderArenaSubTab();
            case 'coop':
                return this.renderCoopSubTab();
            default:
                return this.renderLeaderboardSubTab();
        }
    }

    // -------------------------------------------------------------------------
    // Sub-Tab 1: Bảng Xếp Hạng Live (Top 20 Doanh Thu & Danh Vọng)
    // -------------------------------------------------------------------------
    renderLeaderboardSubTab() {
        const lb = network.refreshLeaderboard();
        const list = this.leaderboardMode === 'revenue' ? lb.topRevenue : lb.topReputation;

        return `
            <div class="leaderboard-view">
                <div class="lb-header-controls">
                    <div class="lb-toggle-group">
                        <button type="button" class="btn-lb-toggle ${this.leaderboardMode === 'revenue' ? 'active' : ''}" data-lbmode="revenue">
                            💰 Top Doanh Thu
                        </button>
                        <button type="button" class="btn-lb-toggle ${this.leaderboardMode === 'reputation' ? 'active' : ''}" data-lbmode="reputation">
                            ⭐ Top Danh Vọng
                        </button>
                    </div>
                    <button type="button" class="btn-lb-refresh" id="btnRefreshLeaderboard">🔄 Làm Mới</button>
                </div>

                <div class="lb-table-wrapper">
                    <table class="lb-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Thương Hiệu Cơm Nắm</th>
                                <th>Chi Nhánh</th>
                                <th>${this.leaderboardMode === 'revenue' ? 'Tổng Doanh Thu' : 'Điểm Danh Vọng'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${list.map((item, idx) => {
                                const rank = idx + 1;
                                const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
                                const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                                const isSelf = item.isSelf || item.name.includes(state.brandName);
                                const cityNames = { hcm: 'TP.HCM', daklak: 'Đắk Lắk', vinh: 'TP. Vinh', hanoi: 'Hà Nội' };
                                const cityName = cityNames[item.city] || 'TP.HCM';

                                const valStr = this.leaderboardMode === 'revenue' ?
                                    `${item.revenue.toLocaleString('vi-VN')}đ` :
                                    `⭐ ${item.reputation}`;

                                return `
                                    <tr class="${isSelf ? 'lb-self-row' : ''} ${rankClass}">
                                        <td class="lb-rank">${rankIcon}</td>
                                        <td class="lb-brand-cell">
                                            <strong>${item.name}</strong>
                                            <span class="lb-lvl">Cấp ${item.level}</span>
                                        </td>
                                        <td class="lb-city">${cityName}</td>
                                        <td class="lb-val">${valStr}</td>
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
    // Sub-Tab 2: Đấu Trường 1v1 (Bếp Tốc Độ & Bóc Rong Biển)
    // -------------------------------------------------------------------------
    renderArenaSubTab() {
        const active = network.activeArena;

        // Nếu trận đấu đang diễn ra hoặc vừa kết thúc
        if (active) {
            return this.renderActiveArenaScreen(active);
        }

        // Màn hình chọn chế độ và danh sách đối thủ
        const otherPlayersList = Array.from(network.otherPlayers.values());

        return `
            <div class="arena-lobby-view">
                <div class="arena-intro-banner">
                    <h4>⚔️ ĐẤU TRƯỜNG THÁCH ĐẤU 1V1 (30 GIÂY)</h4>
                    <p>Thi tài tay nghề làm cơm với các thương hiệu trực tuyến khác! Người thắng nhận thưởng <strong>+200.000đ</strong> và <strong>+15 Danh Vọng</strong>!</p>
                </div>

                <div class="arena-mode-selector">
                    <label class="arena-mode-card ${this.arenaMode === 'speed_kitchen' ? 'selected' : ''}">
                        <input type="radio" name="arenaModeRadio" value="speed_kitchen" ${this.arenaMode === 'speed_kitchen' ? 'checked' : ''}>
                        <div class="amc-content">
                            <span class="amc-icon">🍙⚡</span>
                            <div>
                                <h5>Bếp Tốc Độ (Speed Kitchen)</h5>
                                <small>Bấm liên tục ép khuôn gói cơm nhanh nhất trong 30 giây</small>
                            </div>
                        </div>
                    </label>

                    <label class="arena-mode-card ${this.arenaMode === 'seaweed_peel' ? 'selected' : ''}">
                        <input type="radio" name="arenaModeRadio" value="seaweed_peel" ${this.arenaMode === 'seaweed_peel' ? 'checked' : ''}>
                        <div class="amc-content">
                            <span class="amc-icon">🍘✂️</span>
                            <div>
                                <h5>Bóc Rong Biển 1-2-3 (Peel Master)</h5>
                                <small>Bóc màng tam giác chuẩn xác không rách trong 30 giây</small>
                            </div>
                        </div>
                    </label>
                </div>

                <div class="arena-quick-match-box">
                    <button type="button" class="btn-quick-match" id="btnQuickMatch1v1">
                        🎲 Ghép Cặp Tự Động Ngay
                    </button>
                </div>

                <h5 class="arena-list-title">Danh Sách Đối Thủ Trong Thành Phố:</h5>
                <div class="arena-opponent-list">
                    ${otherPlayersList.length === 0 ? '<div class="arena-empty">Không tìm thấy đối thủ nào quanh đây. Hãy bấm Ghép Cặp Tự Động!</div>' :
                        otherPlayersList.map(p => `
                            <div class="arena-opponent-card">
                                <div class="aoc-left">
                                    <span class="aoc-avatar">🍙</span>
                                    <div>
                                        <h6>${p.brandName || p.name}</h6>
                                        <small>Cấp ${p.level} • ⭐ ${p.reputation || 100} Uy Tín</small>
                                    </div>
                                </div>
                                <button type="button" class="btn-challenge-player" data-targetid="${p.id}">
                                    ⚔️ Thách Đấu
                                </button>
                            </div>
                        `).join('')}
                </div>
            </div>
        `;
    }

    renderActiveArenaScreen(arena) {
        if (arena.status === 'COUNTDOWN') {
            const countSec = Math.ceil(arena.countdown);
            return `
                <div class="arena-match-container">
                    <div class="arena-countdown-overlay">
                        <h3>CHUẨN BỊ THI ĐẤU!</h3>
                        <div class="arena-countdown-digit">${countSec}</div>
                        <p>${arena.gameType === 'speed_kitchen' ? 'Chuẩn bị tay để nắn ép cơm thật nhanh!' : 'Chuẩn bị tay bóc màng rong biển 1-2-3!'}</p>
                    </div>
                </div>
            `;
        }

        if (arena.status === 'FINISHED') {
            const res = arena.result || {};
            const isWin = res.isWin;
            const isDraw = res.isDraw;
            const title = isWin ? '🏆 CHIẾN THẮNG TUYỆT ĐỐI!' : isDraw ? '🤝 HÒA NHAU KỊCH TÍNH!' : '💔 BẠN ĐÃ THUA CUỘC!';
            const titleClass = isWin ? 'res-win' : isDraw ? 'res-draw' : 'res-loss';

            return `
                <div class="arena-match-container">
                    <div class="arena-settlement-card animate-pop">
                        <h2 class="${titleClass}">${title}</h2>
                        <div class="arena-score-comparison">
                            <div class="asc-col asc-self">
                                <span class="asc-label">${state.brandName} (Bạn)</span>
                                <span class="asc-num">${arena.playerScore}</span>
                            </div>
                            <span class="asc-vs">VS</span>
                            <div class="asc-col asc-opp">
                                <span class="asc-label">${arena.opponentName}</span>
                                <span class="asc-num">${arena.opponentScore}</span>
                            </div>
                        </div>

                        <div class="arena-rewards-row">
                            <span class="reward-chip">💰 +${(res.rewardMoney || 0).toLocaleString('vi-VN')}đ</span>
                            <span class="reward-chip">⭐ +${res.rewardRep || 0} Danh Vọng</span>
                        </div>

                        <button type="button" class="btn-arena-finish" id="btnArenaExit">
                            ✓ Hoàn Tất & Nhận Thưởng
                        </button>
                    </div>
                </div>
            `;
        }

        // Trạng thái PLAYING
        const timeLeft = Math.max(0, Math.ceil(arena.timeRemaining));
        const actionLabel = arena.gameType === 'speed_kitchen' ? '🍙 ÉP KHUÔN NẮM CƠM (+1)' : '🍘 BÓC MÀNG 1-2-3 (+1)';

        return `
            <div class="arena-match-container">
                <div class="arena-battle-header">
                    <div class="abh-fighter abh-player">
                        <span class="abh-name">${state.brandName}</span>
                        <span class="abh-score" id="arenaPlayerScore">${arena.playerScore}</span>
                    </div>
                    <div class="abh-timer">
                        <span class="timer-tag">⏱️ THỜI GIAN</span>
                        <span class="timer-sec" id="arenaTimerSec">${timeLeft}s</span>
                    </div>
                    <div class="abh-fighter abh-opponent">
                        <span class="abh-name">${arena.opponentName}</span>
                        <span class="abh-score" id="arenaOpponentScore">${arena.opponentScore}</span>
                    </div>
                </div>

                <div class="arena-battle-arena">
                    <button type="button" class="btn-arena-action-tap" id="btnArenaActionTap">
                        <span class="action-tap-icon">${arena.gameType === 'speed_kitchen' ? '🍙' : '🍘'}</span>
                        <span class="action-tap-text">${actionLabel}</span>
                    </button>
                    <p class="action-tap-hint">Chạm hoặc nhấp chuột thật nhanh để ghi điểm liên tục!</p>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------------------
    // Sub-Tab 3: Hợp Tác Đơn Đại Tiệc (Co-op)
    // -------------------------------------------------------------------------
    renderCoopSubTab() {
        const order = network.coopOrder;
        const pct = Math.min(100, Math.round((order.current / order.target) * 100));
        const myContrib = order.contributors[network.selfId]?.count || 0;
        const riceInStock = state.inventory.length;

        const contributorsList = Object.values(order.contributors || {}).sort((a, b) => b.count - a.count);

        return `
            <div class="coop-view">
                <div class="coop-event-card">
                    <div class="cec-top">
                        <span class="cec-badge">🎉 ĐẠI TIỆC LIÊN TỈNH</span>
                        <span class="cec-clock">⏱️ Sự kiện trực tuyến</span>
                    </div>
                    <h3 class="cec-title">${order.title}</h3>
                    <p class="cec-desc">
                        Cùng các chủ tiệm cơm nắm cả nước chung sức hoàn thành đại tiệc <strong>${order.target} nắm cơm</strong>. Khi đạt 100%, quỹ thưởng <strong>${order.potMoney.toLocaleString('vi-VN')}đ</strong> và <strong>${order.potRep} Danh Vọng</strong> sẽ chia cho tất cả người tham gia theo tỷ lệ đóng góp!
                    </p>

                    <div class="coop-progress-section">
                        <div class="coop-progress-labels">
                            <span>Tiến độ toàn server: <strong>${order.current} / ${order.target} nắm</strong></span>
                            <span class="coop-pct">${pct}%</span>
                        </div>
                        <div class="coop-progress-track">
                            <div class="coop-progress-bar" style="width: ${pct}%;"></div>
                        </div>
                    </div>

                    <div class="coop-my-contrib-box">
                        <span>Bạn đã góp: <strong>${myContrib} nắm</strong> (${order.target > 0 ? Math.round((myContrib / order.target) * 100) : 0}% quỹ)</span>
                        <small>Cơm hiện có trong thùng xe: <strong>${riceInStock} nắm</strong></small>
                    </div>

                    <div class="coop-action-buttons">
                        <button type="button" class="btn-coop-contrib ${riceInStock < 1 || order.isCompleted ? 'disabled' : ''}" data-count="1" ${riceInStock < 1 || order.isCompleted ? 'disabled' : ''}>
                            🍙 Góp 1 Nắm
                        </button>
                        <button type="button" class="btn-coop-contrib ${riceInStock < 5 || order.isCompleted ? 'disabled' : ''}" data-count="5" ${riceInStock < 5 || order.isCompleted ? 'disabled' : ''}>
                            🍙 Góp 5 Nắm
                        </button>
                        <button type="button" class="btn-coop-contrib ${riceInStock < 1 || order.isCompleted ? 'disabled' : ''}" data-count="${riceInStock}" ${riceInStock < 1 || order.isCompleted ? 'disabled' : ''}>
                            🎒 Góp Toàn Bộ (${riceInStock})
                        </button>
                    </div>
                </div>

                <div class="coop-contributors-section">
                    <h5>Bảng Vinh Danh Đóng Góp Hàng Đầu:</h5>
                    <div class="coop-contrib-list">
                        ${contributorsList.map((c, i) => `
                            <div class="coop-contrib-item">
                                <span class="cci-rank">#${i + 1}</span>
                                <span class="cci-name">${c.name}</span>
                                <span class="cci-count">${c.count} nắm</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // 2. GẮN SỰ KIỆN GIAO DIỆN ONLINE TRÊN IGIRI OS
    // =========================================================================
    bindTabEvents(container) {
        if (!container) return;

        // Chuyển Sub-tab (Bảng xếp hạng, Đấu trường, Hợp tác)
        const subTabBtns = container.querySelectorAll('.online-subtab-btn');
        subTabBtns.forEach(btn => {
            btn.onclick = () => {
                const sub = btn.dataset.subtab;
                if (sub && sub !== this.activeSubTab) {
                    audio.playClick();
                    this.activeSubTab = sub;
                    this.refreshSubTabInContainer(container);
                }
            };
        });

        // Nút mở modal đổi tên thương hiệu
        const btnChangeBrand = container.querySelector('#btnOpenChangeBrand');
        if (btnChangeBrand) {
            btnChangeBrand.onclick = () => {
                audio.playClick();
                this.showBrandNameDialog();
            };
        }

        // Chuyển đổi chế độ BXH (Doanh thu vs Danh vọng)
        const lbToggles = container.querySelectorAll('.btn-lb-toggle');
        lbToggles.forEach(btn => {
            btn.onclick = () => {
                const mode = btn.dataset.lbmode;
                if (mode && mode !== this.leaderboardMode) {
                    audio.playClick();
                    this.leaderboardMode = mode;
                    this.refreshSubTabInContainer(container);
                }
            };
        });

        // Nút làm mới BXH
        const btnRefreshLb = container.querySelector('#btnRefreshLeaderboard');
        if (btnRefreshLb) {
            btnRefreshLb.onclick = () => {
                audio.playClick();
                network.refreshLeaderboard();
                this.refreshSubTabInContainer(container);
            };
        }

        // Đấu trường 1v1: Chọn radio mode
        const modeRadios = container.querySelectorAll('input[name="arenaModeRadio"]');
        modeRadios.forEach(radio => {
            radio.onchange = () => {
                this.arenaMode = radio.value;
                this.refreshSubTabInContainer(container);
            };
        });

        // Đấu trường: Nút Ghép Cặp Tự Động
        const btnQuickMatch = container.querySelector('#btnQuickMatch1v1');
        if (btnQuickMatch) {
            btnQuickMatch.onclick = () => {
                audio.playClick();
                const opponents = Array.from(network.otherPlayers.values());
                const opp = opponents.length > 0 ? opponents[Math.floor(Math.random() * opponents.length)] : null;
                const targetId = opp ? opp.id : 'bot_random';
                network.start1v1Match(targetId, this.arenaMode);
                this.refreshSubTabInContainer(container);
            };
        }

        // Đấu trường: Thách đấu người chơi cụ thể
        const challengeBtns = container.querySelectorAll('.btn-challenge-player');
        challengeBtns.forEach(btn => {
            btn.onclick = () => {
                const targetId = btn.dataset.targetid;
                if (targetId) {
                    audio.playClick();
                    network.start1v1Match(targetId, this.arenaMode);
                    this.refreshSubTabInContainer(container);
                }
            };
        });

        // Đấu trường: Nút Tap ghi điểm khi thi đấu
        const btnTap = container.querySelector('#btnArenaActionTap');
        if (btnTap) {
            btnTap.onclick = () => {
                if (network.activeArena && network.activeArena.status === 'PLAYING') {
                    audio.playChop();
                    network.activeArena.playerScore += 1;
                    const pScoreElem = container.querySelector('#arenaPlayerScore');
                    if (pScoreElem) {
                        pScoreElem.textContent = String(network.activeArena.playerScore);
                    }
                }
            };
        }

        // Đấu trường: Nút hoàn tất trận đấu
        const btnExitArena = container.querySelector('#btnArenaExit');
        if (btnExitArena) {
            btnExitArena.onclick = () => {
                audio.playClick();
                network.activeArena = null;
                this.refreshSubTabInContainer(container);
            };
        }

        // Co-op: Nút góp cơm
        const coopBtns = container.querySelectorAll('.btn-coop-contrib');
        coopBtns.forEach(btn => {
            btn.onclick = () => {
                const count = parseInt(btn.dataset.count, 10) || 1;
                audio.playClick();
                network.contributeCoopRice(count);
                this.refreshSubTabInContainer(container);
            };
        });
    }

    refreshSubTabInContainer(container) {
        const subContainer = container.querySelector('#onlineSubtabContent');
        if (subContainer) {
            subContainer.innerHTML = this.renderSubTabContent();
            this.bindTabEvents(container);
        }
    }

    updateArenaUI() {
        const phoneModal = document.getElementById('phoneModal');
        if (phoneModal && !phoneModal.classList.contains('hidden')) {
            const container = phoneModal.querySelector('.tab-content.online-view');
            if (container && this.activeSubTab === 'arena') {
                this.refreshSubTabInContainer(container);
            }
        }
    }

    updateCoopUI() {
        const phoneModal = document.getElementById('phoneModal');
        if (phoneModal && !phoneModal.classList.contains('hidden')) {
            const container = phoneModal.querySelector('.tab-content.online-view');
            if (container && this.activeSubTab === 'coop') {
                this.refreshSubTabInContainer(container);
            }
        }
    }

    // =========================================================================
    // 3. MENU TƯƠNG TÁC NHANH KHI BẤM VÀO NGƯỜI CHƠI TRÊN PHỐ
    // =========================================================================
    openQuickMenu(player, screenX, screenY) {
        if (!this.quickMenuElement || !player) return;
        this.quickMenuTarget = player;
        this.quickMenuPos = { x: screenX, y: screenY };

        const brandName = player.brandName || player.name || 'Người chơi';
        const level = player.level || 1;
        const revenue = player.totalRevenue || 0;
        const reputation = player.reputation || 100;

        // Giới hạn menu trong khung nhìn màn hình
        const posX = Math.max(20, Math.min(window.innerWidth - 260, screenX - 120));
        const posY = Math.max(60, Math.min(window.innerHeight - 300, screenY - 40));

        this.quickMenuElement.style.left = `${posX}px`;
        this.quickMenuElement.style.top = `${posY}px`;

        this.quickMenuElement.innerHTML = `
            <div class="quick-menu-card animate-pop">
                <div class="qmc-header">
                    <span class="qmc-avatar">🍙</span>
                    <div class="qmc-title-box">
                        <h4 class="qmc-name">${brandName}</h4>
                        <small class="qmc-sub">Cấp ${level} • ⭐ ${reputation} Uy Tín</small>
                    </div>
                    <button type="button" class="btn-qmc-close" id="btnQuickMenuClose">✕</button>
                </div>

                <div class="qmc-emotes-row">
                    <button type="button" class="btn-emote" data-emote="wave" title="Vẫy tay chào">👋 Vẫy tay</button>
                    <button type="button" class="btn-emote" data-emote="heart" title="Tặng tim">❤️ Thả tim</button>
                    <button type="button" class="btn-emote" data-emote="cheer" title="Cổ vũ nhiệt tình">🍙 Cổ vũ</button>
                </div>

                <div class="qmc-actions">
                    <button type="button" class="btn-qmc-action" id="btnQuickVisit">
                        🏭 Ghé Thăm Xưởng (${revenue.toLocaleString('vi-VN')}đ)
                    </button>
                    <button type="button" class="btn-qmc-action btn-qmc-challenge" id="btnQuickChallenge">
                        ⚔️ Mời Thách Đấu 1v1
                    </button>
                </div>
            </div>
        `;

        this.quickMenuElement.classList.remove('hidden');

        // Gắn sự kiện đóng
        const btnClose = this.quickMenuElement.querySelector('#btnQuickMenuClose');
        if (btnClose) {
            btnClose.onclick = () => this.closeQuickMenu();
        }

        // Gắn sự kiện Emote
        const emoteBtns = this.quickMenuElement.querySelectorAll('.btn-emote');
        emoteBtns.forEach(btn => {
            btn.onclick = () => {
                const emType = btn.dataset.emote;
                audio.playClick();
                network.sendEmote(emType, player.id);
                this.closeQuickMenu();
            };
        });

        // Ghé thăm xưởng
        const btnVisit = this.quickMenuElement.querySelector('#btnQuickVisit');
        if (btnVisit) {
            btnVisit.onclick = () => {
                audio.playClick();
                alert(`🏭 XƯỞNG CƠM NẮM: ${brandName}\nCấp độ: ${level}\nTổng doanh thu: ${revenue.toLocaleString('vi-VN')}đ\nUy tín thương hiệu: ${reputation} điểm`);
                this.closeQuickMenu();
            };
        }

        // Mời thách đấu 1v1
        const btnChallenge = this.quickMenuElement.querySelector('#btnQuickChallenge');
        if (btnChallenge) {
            btnChallenge.onclick = () => {
                audio.playClick();
                this.closeQuickMenu();
                // Mở điện thoại ở tab Đấu trường 1v1
                if (window.game && window.game.questManager) {
                    window.game.questManager.open('online');
                    this.activeSubTab = 'arena';
                    network.start1v1Match(player.id, this.arenaMode);
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
    // 4. DIALOG ĐẶT & ĐỔI TÊN THƯƠNG HIỆU
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

                    // Cập nhật tên trong điện thoại nếu đang mở
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
}

export const onlineUI = new OnlineUIManager();
