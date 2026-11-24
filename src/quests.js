// src/quests.js - Smartphone iGiri OS: Tuyến 20 Nhiệm vụ cốt truyện, Hợp Đồng Đặt Tiệc, 12 Thành Tựu & Tycoon

import {
    state,
    VEHICLES,
    VEHICLE_ORDER,
    KITCHEN_TIERS,
    KITCHEN_MANUAL_TIERS,
    KITCHEN_AUTO_CONFIG,
    BRANCH_CONFIGS,
    BRANCH_ORDER,
    STAFF_CONFIG,
    FILLINGS,
    ACHIEVEMENTS_CONFIG,
    ACHIEVEMENT_ORDER,
    resolveFillingId
} from './state.js';
import { audio } from './audio.js';
import { sellingManager } from './selling.js';
import { deliveryManager } from './deliveryMode.js';
import { onlineUI } from './onlineUI.js';

export const QUEST_DEFS = {
    // === GIAI ĐOẠN 1: KHỞI NGHIỆP VỈA HÈ (NV 1–5) ===
    nv1: {
        id: 'nv1',
        stage: 1,
        title: 'NV 1: Bếp Khởi Nghiệp',
        desc: 'Làm quen Bếp ASMR: Làm 5 nắm cơm đầu tiên tại Xưởng Bếp.',
        target: 5,
        reward: { money: 100000, exp: 30 },
        getProgress: () => ({ current: Math.min(5, state.stats?.cookedCount || 0), target: 5 }),
        isReady: () => (state.stats?.cookedCount || 0) >= 5
    },
    nv2: {
        id: 'nv2',
        stage: 1,
        title: 'NV 2: Nhập Hàng Chợ Đầu Mối',
        desc: 'Làm quen Chợ: Mua ít nhất 1 gói nguyên liệu tại Chợ Đầu Mối.',
        target: 1,
        reward: { money: 150000, exp: 40 },
        getProgress: () => ({ current: Math.min(1, state.stats?.marketBuyCount || 0), target: 1 }),
        isReady: () => (state.stats?.marketBuyCount || 0) >= 1
    },
    nv3: {
        id: 'nv3',
        stage: 1,
        title: 'NV 3: Bán Đủ 3 Phân Khúc Giá',
        desc: 'Bán đủ 3 phân khúc giá niêm yết chuẩn: 20k, 22k và 25k.',
        target: 3,
        reward: { money: 200000, exp: 50 },
        getProgress: () => {
            const p = state.stats?.soldPriceGroups || {};
            const c = (p['20k'] > 0 ? 1 : 0) + (p['22k'] > 0 ? 1 : 0) + (p['25k'] > 0 ? 1 : 0);
            return { current: c, target: 3 };
        },
        isReady: () => {
            const p = state.stats?.soldPriceGroups || {};
            return Boolean(p['20k'] > 0 && p['22k'] > 0 && p['25k'] > 0);
        }
    },
    nv4: {
        id: 'nv4',
        stage: 1,
        title: 'NV 4: Tậu Xe Đạp Lăn Bánh',
        desc: 'Sở hữu Xe đạp (Bike) hoặc cao hơn tại tab Xe & Thùng.',
        target: 1,
        reward: { money: 250000, exp: 60 },
        getProgress: () => {
            const has = (state.unlockedVehicles || []).includes('bike') ||
                        Boolean(VEHICLES[state.currentVehicle] && VEHICLES[state.currentVehicle].level >= 2);
            return { current: has ? 1 : 0, target: 1 };
        },
        isReady: () => (state.unlockedVehicles || []).includes('bike') ||
                       Boolean(VEHICLES[state.currentVehicle] && VEHICLES[state.currentVehicle].level >= 2)
    },
    nv5: {
        id: 'nv5',
        stage: 1,
        title: 'NV 5: Một Ngày Bình Yên',
        desc: 'Vượt qua 1 ngày kinh doanh không bị phạt trật tự đô thị.',
        target: 1,
        reward: { money: 300000, exp: 80, title: 'Công Dân Gương Mẫu 🚴' },
        getProgress: () => {
            const ok = (state.stats?.cleanDaysCount || 0) >= 1 || (state.gameDay >= 2 && (state.stats?.penaltiesCount || 0) === 0);
            return { current: ok ? 1 : 0, target: 1 };
        },
        isReady: () => (state.stats?.cleanDaysCount || 0) >= 1 || (state.gameDay >= 2 && (state.stats?.penaltiesCount || 0) === 0)
    },

    // === GIAI ĐOẠN 2: LÀM CHỦ XƯỞNG TP.HCM (NV 6–10) ===
    nv6: {
        id: 'nv6',
        stage: 2,
        title: 'NV 6: Nâng Cấp Xe Máy Giữ Nhiệt',
        desc: 'Nâng cấp Xe tay ga giao hàng có thùng giữ nhiệt nóng hổi (Cấp 5).',
        target: 1,
        reward: { money: 500000, exp: 100 },
        getProgress: () => {
            const has = (state.unlockedVehicles || []).includes('motorcycle') ||
                        Boolean(VEHICLES[state.currentVehicle] && VEHICLES[state.currentVehicle].level >= 5);
            return { current: has ? 1 : 0, target: 1 };
        },
        isReady: () => (state.unlockedVehicles || []).includes('motorcycle') ||
                       Boolean(VEHICLES[state.currentVehicle] && VEHICLES[state.currentVehicle].level >= 5)
    },
    nv7: {
        id: 'nv7',
        stage: 2,
        title: 'NV 7: Duy Trì Uy Tín ISO 90%',
        desc: 'Duy trì Uy tín an toàn thực phẩm ISO đạt từ 90% trở lên.',
        target: 90,
        reward: { money: 600000, exp: 120 },
        getProgress: () => ({ current: Math.min(90, state.reputation || 0), target: 90 }),
        isReady: () => (state.reputation || 0) >= 90
    },
    nv8: {
        id: 'nv8',
        stage: 2,
        title: 'NV 8: Doanh Thu 5 Triệu Đồng',
        desc: 'Đạt tổng doanh thu bán cơm tích lũy 5.000.000đ.',
        target: 5000000,
        reward: { money: 800000, exp: 150 },
        getProgress: () => ({ current: Math.min(5000000, state.stats?.totalRevenue || state.money || 0), target: 5000000, isMoney: true }),
        isReady: () => (state.stats?.totalRevenue || 0) >= 5000000 || (state.money || 0) >= 5000000
    },
    nv9: {
        id: 'nv9',
        stage: 2,
        title: 'NV 9: Dây Chuyền Bọc Màng Tự Động',
        desc: 'Mở khóa dây chuyền đóng gói tự động (Nâng cấp Auto Level >= 2).',
        target: 2,
        reward: { money: 1000000, exp: 180 },
        getProgress: () => ({ current: Math.min(2, state.kitchenAutoLevel || 0), target: 2 }),
        isReady: () => (state.kitchenAutoLevel || 0) >= 2
    },
    nv10: {
        id: 'nv10',
        stage: 2,
        title: 'NV 10: Thủ Phủ Trụ Sở TP.HCM',
        desc: 'Nâng cấp Chi nhánh Trụ sở TP.HCM lên Cấp 3.',
        target: 3,
        reward: { money: 1500000, exp: 200, title: 'Ông Chủ Xưởng Sài Gòn 🏢' },
        getProgress: () => ({ current: Math.min(3, state.getBranchLevel('branch_hcm')), target: 3 }),
        isReady: () => state.getBranchLevel('branch_hcm') >= 3
    },

    // === GIAI ĐOẠN 3: CHINH PHỤC CHUỖI CUNG ỨNG (NV 11–15) ===
    nv11: {
        id: 'nv11',
        stage: 3,
        title: 'NV 11: Thần Tốc 5 Đơn Hỏa Tốc',
        desc: 'Hoàn thành 5 đơn giao hàng hỏa tốc trong 60 giây.',
        target: 5,
        reward: { money: 2000000, exp: 250 },
        getProgress: () => ({ current: Math.min(5, (state.stats?.expressCompletedCount || 0) + (state.stats?.sideQuestsCompleted || 0)), target: 5 }),
        isReady: () => ((state.stats?.expressCompletedCount || 0) + (state.stats?.sideQuestsCompleted || 0)) >= 5
    },
    nv12: {
        id: 'nv12',
        stage: 3,
        title: 'NV 12: Sở Hữu Xe Tải Lạnh',
        desc: 'Sở hữu Xe tải lạnh bảo ôn (Cấp 8) để bảo quản cơm đường dài.',
        target: 1,
        reward: { money: 3000000, exp: 300 },
        getProgress: () => {
            const has = (state.unlockedVehicles || []).includes('truck') ||
                        Boolean(VEHICLES[state.currentVehicle] && VEHICLES[state.currentVehicle].level >= 8);
            return { current: has ? 1 : 0, target: 1 };
        },
        isReady: () => (state.unlockedVehicles || []).includes('truck') ||
                       Boolean(VEHICLES[state.currentVehicle] && VEHICLES[state.currentVehicle].level >= 8)
    },
    nv13: {
        id: 'nv13',
        stage: 3,
        title: 'NV 13: Danh Vang 500 Điểm',
        desc: 'Tích lũy uy tín & danh tiếng thương hiệu đạt 500 điểm Danh vọng.',
        target: 500,
        reward: { money: 4000000, exp: 350 },
        getProgress: () => ({ current: Math.min(500, state.reputation || 0), target: 500 }),
        isReady: () => (state.reputation || 0) >= 500
    },
    nv14: {
        id: 'nv14',
        stage: 3,
        title: 'NV 14: Ký Hợp Đồng Đặt Tiệc Lớn',
        desc: 'Bàn giao thành công ít nhất 1 Hợp Đồng Lớn Đặt Tiệc tại tab Hợp Đồng.',
        target: 1,
        reward: { money: 5000000, exp: 400 },
        getProgress: () => ({ current: Math.min(1, state.stats?.contractsCompleted || 0), target: 1 }),
        isReady: () => (state.stats?.contractsCompleted || 0) >= 1
    },
    nv15: {
        id: 'nv15',
        stage: 3,
        title: 'NV 15: Kho Vàng 50 Triệu',
        desc: 'Tích lũy tài sản đạt 50.000.000đ tiền mặt trong tài khoản.',
        target: 50000000,
        reward: { money: 6000000, exp: 500, title: 'Vua Chuỗi Cung Ứng 🚚' },
        getProgress: () => ({ current: Math.min(50000000, state.money || 0), target: 50000000, isMoney: true }),
        isReady: () => (state.money || 0) >= 50000000
    },

    // === GIAI ĐOẠN 4: TẬP ĐOÀN TOÀN QUỐC (NV 16–20) ===
    nv16: {
        id: 'nv16',
        stage: 4,
        title: 'NV 16: Mở Khóa Chi Nhánh Đắk Lắk',
        desc: 'Mở rộng thị trường lên Buôn Ma Thuột - Đắk Lắk tại tab Đế Chế.',
        target: 1,
        reward: { money: 8000000, exp: 600 },
        getProgress: () => ({ current: state.branches?.branch_daklak?.unlocked ? 1 : 0, target: 1 }),
        isReady: () => Boolean(state.branches?.branch_daklak?.unlocked)
    },
    nv17: {
        id: 'nv17',
        stage: 4,
        title: 'NV 17: Nâng Tầm Đắk Lắk Cấp 3',
        desc: 'Nâng cấp Chi nhánh Đắk Lắk lên Cấp 3.',
        target: 3,
        reward: { money: 10000000, exp: 700 },
        getProgress: () => ({ current: Math.min(3, state.getBranchLevel('branch_daklak')), target: 3 }),
        isReady: () => state.getBranchLevel('branch_daklak') >= 3
    },
    nv18: {
        id: 'nv18',
        stage: 4,
        title: 'NV 18: Cửa Ngõ Miền Trung TP. Vinh',
        desc: 'Mở rộng tới Cửa ngõ Miền Trung tại Chi nhánh TP. Vinh.',
        target: 1,
        reward: { money: 15000000, exp: 800 },
        getProgress: () => ({ current: state.branches?.branch_vinh?.unlocked ? 1 : 0, target: 1 }),
        isReady: () => Boolean(state.branches?.branch_vinh?.unlocked)
    },
    nv19: {
        id: 'nv19',
        stage: 4,
        title: 'NV 19: Vươn Ra Thủ Đô Hà Nội',
        desc: 'Mở khóa thành công Chi nhánh Thủ đô Hà Nội.',
        target: 1,
        reward: { money: 20000000, exp: 900 },
        getProgress: () => ({ current: state.branches?.branch_hanoi?.unlocked ? 1 : 0, target: 1 }),
        isReady: () => Boolean(state.branches?.branch_hanoi?.unlocked)
    },
    nv20: {
        id: 'nv20',
        stage: 4,
        title: 'NV 20: Đại Đế Chế Cơm Nắm Toàn Quốc',
        desc: 'Nâng cấp Chi nhánh Hà Nội lên Cấp 5 để hoàn thành đại đế chế ẩm thực Việt Nam!',
        target: 5,
        reward: { money: 50000000, exp: 2000, title: 'Đại Đế Vương Ẩm Thực 🍙👑' },
        getProgress: () => ({ current: Math.min(5, state.getBranchLevel('branch_hanoi')), target: 5 }),
        isReady: () => state.getBranchLevel('branch_hanoi') >= 5
    }
};

export const QUEST_ORDER = [
    'nv1', 'nv2', 'nv3', 'nv4', 'nv5',
    'nv6', 'nv7', 'nv8', 'nv9', 'nv10',
    'nv11', 'nv12', 'nv13', 'nv14', 'nv15',
    'nv16', 'nv17', 'nv18', 'nv19', 'nv20'
];

export const QUEST_STAGES = [
    {
        stage: 1,
        title: 'Giai Đoạn 1: Khởi Nghiệp Vỉa Hè',
        questIds: ['nv1', 'nv2', 'nv3', 'nv4', 'nv5'],
        icon: '🍙'
    },
    {
        stage: 2,
        title: 'Giai Đoạn 2: Làm Chủ Xưởng TP.HCM',
        questIds: ['nv6', 'nv7', 'nv8', 'nv9', 'nv10'],
        icon: '🏢'
    },
    {
        stage: 3,
        title: 'Giai Đoạn 3: Chinh Phục Chuỗi Cung Ứng',
        questIds: ['nv11', 'nv12', 'nv13', 'nv14', 'nv15'],
        icon: '🚚'
    },
    {
        stage: 4,
        title: 'Giai Đoạn 4: Tập Đoàn Toàn Quốc',
        questIds: ['nv16', 'nv17', 'nv18', 'nv19', 'nv20'],
        icon: '👑'
    }
];

export class QuestManager {
    constructor(modalEl, triggerBtnEl) {
        this.container = modalEl;
        this.triggerBtn = triggerBtnEl;
        this.isOpen = false;
        this.activeTab = 'quests'; // 'quests' | 'vehicles' | 'tycoon'
        this.timerInterval = null;
        this.isClaiming = false; // Cờ bảo vệ chống spam click nhận thưởng

        // Hệ thống Nhiệm vụ phụ ngẫu nhiên (GTA Style)
        this.incomingCall = null;
        this.activeSideQuest = null;
        this.lastSideQuestTriggerTime = Date.now();
        this.sideQuestIntervalMs = 120000; // Cứ mỗi 2 phút (120 giây)

        // Chu kỳ 10 giây cho Đế chế Tycoon (Sản xuất tự động & Doanh thu 4 Chi nhánh)
        this.lastTycoonCycleTime = Date.now();

        this.init();
    }

    init() {
        if (this.triggerBtn) {
            this.triggerBtn.onclick = () => {
                this.toggle();
            };
        }

        // Lắng nghe phím tắt P để mở điện thoại (không can thiệp khi đang nhập văn bản)
        window.addEventListener('keydown', (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
            if (e.code === 'KeyP') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Bắt đầu cập nhật timer NV 3 và vòng lặp Nhiệm vụ phụ GTA
        this.startTimerLoop();

        // Lắng nghe cập nhật state để vẽ lại badge thông báo (KHÔNG vẽ lại innerHTML)
        state.onUpdate(() => {
            this.updateNotificationBadge();
            if (this.isOpen) {
                this.updateHeaderStats();
            }
        });

        this.updateNotificationBadge();
    }

    // Cập nhật text tiêu đề Header điện thoại (không render lại DOM danh sách)
    updateHeaderStats() {
        const subtitleEl = document.getElementById('phoneAppSubtitle');
        if (subtitleEl) {
            subtitleEl.textContent = `Cấp ${state.level} • ${state.money.toLocaleString('vi-VN')}đ`;
        }
        const clockEl = document.getElementById('phoneClockText');
        if (clockEl) {
            const now = new Date();
            clockEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        }
    }

    // Bật / Tắt hiển thị chấm đỏ thông báo
    updateNotificationBadge() {
        const badge = document.getElementById('phoneBadge');
        if (!badge) return;

        const hasNotify = state.hasNotificationBadge() || Boolean(this.incomingCall) || Boolean(this.activeSideQuest);
        if (hasNotify) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open(tabName = null) {
        if (tabName) {
            this.activeTab = tabName;
        }
        this.isOpen = true;
        this.container.classList.remove('hidden');

        // [KỸ SƯ CẢM ỨNG & BÀN PHÍM ẢO] Ẩn phím ảo ngoài phố để màn hình thoáng đãng
        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls) virtualControls.classList.add('hidden');

        audio.playClick();
        this.render();
    }

    close() {
        this.isOpen = false;
        this.container.classList.add('hidden');

        // Phục hồi lại cụm phím ảo nếu đang ở chế độ cảm ứng
        const virtualControls = document.getElementById('virtualTouchControls');
        const touchBtn = document.getElementById('btnToggleTouch');
        const isTouchActive = touchBtn && touchBtn.classList.contains('active');
        const isTouchDevice = (typeof window !== 'undefined') && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
        if (virtualControls && (isTouchActive || isTouchDevice)) {
            virtualControls.classList.remove('hidden');
        }

        audio.playClick();
    }

    // Vòng lặp đếm ngược timer & kích hoạt cuộc gọi ngẫu nhiên GTA
    startTimerLoop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.timerInterval = setInterval(() => {
            const now = Date.now();

            // 1. Kiểm tra NV 3 đếm ngược (chỉ cập nhật textContent của thẻ timer, không render lại danh sách)
            if (state.quests && state.quests.activeId === 'nv3' && state.quests.nv3 && state.quests.nv3.status === 'in_progress') {
                const elapsed = (now - state.quests.nv3.startTime) / 1000;
                const remaining = Math.max(0, state.quests.nv3.durationSeconds - elapsed);

                if (remaining <= 0) {
                    if (state.quests.nv3.delivered < state.quests.nv3.target) {
                        state.quests.nv3.status = 'failed';
                        audio.playError();
                        state.save();
                        state.notify();
                        if (this.isOpen && this.activeTab === 'quests') {
                            this.render();
                        }
                    }
                } else {
                    if (this.isOpen && this.activeTab === 'quests') {
                        const timerTextEl = document.getElementById('nv3TimerText');
                        if (timerTextEl) {
                            const mins = Math.floor(remaining / 60);
                            const secs = Math.floor(remaining % 60);
                            timerTextEl.textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                        }
                    }
                }
            }

            // 2. Kiểm tra đếm ngược Nhiệm vụ phụ GTA đang thực hiện
            if (this.activeSideQuest) {
                const sqElapsed = (now - this.activeSideQuest.startTime) / 1000;
                const sqRemaining = Math.max(0, this.activeSideQuest.durationSeconds - sqElapsed);

                if (sqRemaining <= 0) {
                    // Hết giờ nhận đơn phụ
                    this.activeSideQuest = null;
                    audio.playError();
                    this.updateNotificationBadge();
                    if (this.isOpen && this.activeTab === 'quests') this.render();
                } else {
                    if (this.isOpen && this.activeTab === 'quests') {
                        const sqTimerEl = document.getElementById('sideQuestTimerText');
                        if (sqTimerEl) {
                            const m = Math.floor(sqRemaining / 60);
                            const s = Math.floor(sqRemaining % 60);
                            sqTimerEl.textContent = `⏱️ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                        }
                    }
                }
            }

            // 3. Chu kỳ 2 phút kích hoạt cuộc gọi đơn hàng ngẫu nhiên mới
            if (!this.incomingCall && !this.activeSideQuest && (now - this.lastSideQuestTriggerTime >= this.sideQuestIntervalMs)) {
                this.triggerRandomSideQuestCall();
            }

            // 4. Chu kỳ 15 giây (15.000ms): Sản xuất tự động & Doanh thu 4 Chi Nhánh Liên Tỉnh (Cân bằng quản lý)
            if (now - this.lastTycoonCycleTime >= 15000) {
                this.lastTycoonCycleTime = now;

                // 4.1. Sản xuất tự động tại Xưởng Bếp
                if (state.kitchenAutoLevel && state.kitchenAutoLevel > 0) {
                    const autoRes = state.processAutoProduction();
                    if (autoRes.produced > 0) {
                        sellingManager.showToast(`🤖 Xưởng tự động sản xuất +${autoRes.produced} nắm cơm!`);
                    } else if (autoRes.reason === 'halted_debt') {
                        if (this.isOpen && this.activeTab === 'tycoon') {
                            sellingManager.showToast('⚠️ Dây chuyền tự động tạm ngưng: Đang nợ hóa đơn vận hành!');
                        }
                    } else if (autoRes.reason === 'out_of_ingredients') {
                        if (this.isOpen && this.activeTab === 'tycoon') {
                            sellingManager.showToast('⚠️ Dây chuyền tự động tạm dừng: Hết nguyên liệu từ Chợ!');
                        }
                    }
                }

                // 4.2. Doanh thu thụ động từ 4 Chi nhánh toàn quốc
                const branchRes = state.processBranchIncome();
                if (branchRes.totalIncome > 0) {
                    sellingManager.showToast(`🏢 Doanh thu chi nhánh toàn quốc: +${branchRes.totalIncome.toLocaleString('vi-VN')}đ`);
                } else if (branchRes.reason === 'out_of_ingredients' && this.isOpen && this.activeTab === 'tycoon') {
                    sellingManager.showToast('⚠️ Chi nhánh tạm ngưng sinh tiền: Hết gạo trong kho!');
                }

                // TUYỆT ĐỐI KHÔNG GỌI this.render() trong vòng lặp!
                if (this.isOpen) {
                    this.updateHeaderStats();
                }
            }

            // 5. Cập nhật đồng hồ máy, timer Hỏa Tốc và timer Hợp Đồng nếu đang mở tab
            if (this.isOpen) {
                this.updateHeaderStats();
                if (this.activeTab === 'delivery') {
                    const expTimerEl = document.getElementById('expLiveTimer');
                    if (expTimerEl && deliveryManager && deliveryManager.activeOrder) {
                        const timerSecs = Math.max(0, Math.ceil(deliveryManager.timer));
                        expTimerEl.textContent = `⏱️ ${timerSecs}s`;
                    }
                } else if (this.activeTab === 'contracts') {
                    const cTimerEl = document.getElementById('contractRefreshTimerText');
                    if (cTimerEl && state.contracts) {
                        const lastRef = state.contracts.lastRefreshTime || now;
                        const interval = state.contracts.refreshIntervalMs || 180000;
                        const remSecs = Math.max(0, Math.ceil((lastRef + interval - now) / 1000));
                        const m = Math.floor(remSecs / 60);
                        const s = remSecs % 60;
                        cTimerEl.textContent = `⏱️ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                        if (remSecs <= 0) {
                            state.generateContracts();
                            this.render();
                        }
                    }
                }
            }
        }, 500);
    }

    // Kích hoạt cuộc gọi đến ngẫu nhiên kiểu GTA
    triggerRandomSideQuestCall() {
        this.lastSideQuestTriggerTime = Date.now();

        const candidateLocations = [
            { id: 'school_nguyendu', name: 'THCS Nguyễn Du' },
            { id: 'school_lequydon', name: 'THPT Lê Quý Đôn' },
            { id: 'university_town', name: 'Làng Đại Học' },
            { id: 'office_q1', name: 'Văn Phòng Quận 1' },
            { id: 'walking_street', name: 'Phố Đi Bộ' }
        ];

        const targetLoc = candidateLocations[Math.floor(Math.random() * candidateLocations.length)];
        const candidateFillings = ['crab_egg_mayo', 'chicken_teriyaki', 'salmon_mayo', 'beef_bbq', 'melting_beef_cheese'];
        const targetFillingId = candidateFillings[Math.floor(Math.random() * candidateFillings.length)];
        const fillingConfig = FILLINGS[targetFillingId] || FILLINGS.crab_egg_mayo;

        this.incomingCall = {
            id: 'call_' + Date.now(),
            locId: targetLoc.id,
            locName: targetLoc.name,
            fillingId: targetFillingId,
            fillingName: fillingConfig.name,
            count: 3,
            rewardMoney: 200000,
            rewardExp: 50,
            durationSeconds: 120
        };

        audio.playLevelUp(); // m thanh chuông điện thoại
        this.updateNotificationBadge();
        if (this.isOpen) {
            this.render();
        }
    }

    // Bắt đầu hoặc nhận lại NV3
    startOrResetNV3() {
        state.quests.nv3.status = 'in_progress';
        state.quests.nv3.startTime = Date.now();
        state.quests.nv3.delivered = 0;
        state.save();
        state.notify();
        audio.playClick();
        this.render();
    }

    // Nhận thưởng nhiệm vụ chính - Chống spam click tuyệt đối
    claimQuest(questId) {
        if (this.isClaiming) return;
        if (state.quests.completedIds.includes(questId)) return;

        const def = QUEST_DEFS[questId];
        if (!def || !def.isReady()) return;

        this.isClaiming = true;

        try {
            state.quests.completedIds.push(questId);
            state.addMoney(def.reward.money);
            state.addExp(def.reward.exp);

            const curIdx = QUEST_ORDER.indexOf(questId);
            if (curIdx >= 0 && curIdx < QUEST_ORDER.length - 1) {
                state.quests.activeId = QUEST_ORDER[curIdx + 1];
            } else {
                state.quests.activeId = 'all_done';
            }

            audio.playLevelUp();
            audio.playTingComplete();

            state.save();
            state.notify();
        } finally {
            setTimeout(() => {
                this.isClaiming = false;
                this.render();
            }, 300);
        }
    }

    // Hoàn thành giao đơn phụ GTA khi người chơi đã ở đúng địa điểm
    deliverSideQuest() {
        if (!this.activeSideQuest) return false;
        const sq = this.activeSideQuest;

        const availableCount = state.getFillingCount(sq.fillingId);
        if (availableCount < sq.count) {
            audio.playError();
            sellingManager.showToast(`⚠️ Bạn cần có đủ ${sq.count} nắm ${sq.fillingName} trong thùng xe để giao! (Hiện có: ${availableCount} nắm)`, 240);
            return false;
        }

        // Khấu trừ số lượng cơm
        for (let i = 0; i < sq.count; i++) {
            state.removeRiceBallByFilling(sq.fillingId);
        }

        // Nhận thưởng
        state.addMoney(sq.rewardMoney);
        state.addExp(sq.rewardExp);
        state.recordSideQuestDone();

        audio.playLevelUp();
        audio.playTingComplete();

        this.activeSideQuest = null;
        this.updateNotificationBadge();
        this.render();
        return true;
    }

    render() {
        const prevScrollWrapper = this.container.querySelector('.phone-tab-content-wrapper');
        const prevScrollTop = prevScrollWrapper ? prevScrollWrapper.scrollTop : 0;

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        this.container.innerHTML = `
            <div class="phone-modal-backdrop" id="phoneBackdrop">
                <div class="phone-frame animate-slide-up" id="phoneFrame">
                    <!-- Dynamic Island & Loa thoại -->
                    <div class="phone-notch">
                        <div class="notch-speaker"></div>
                        <div class="notch-camera"></div>
                    </div>

                    <!-- Màn hình hiển thị điện thoại -->
                    <div class="phone-screen">
                        <!-- Thanh trạng thái đỉnh máy -->
                        <div class="phone-status-bar">
                            <span class="phone-clock" id="phoneClockText">${timeStr}</span>
                            <span class="phone-brand">iGiri 15 Pro • GTA OS</span>
                            <span class="phone-battery">5G 🔋 98%</span>
                        </div>

                        <!-- Header app điện thoại -->
                        <div class="phone-app-header">
                            <div class="phone-header-user">
                                <span class="phone-app-avatar">🍙</span>
                                <div>
                                    <h4 class="phone-app-title">Đế Chế Cơm Nắm • ISO & ATVSTP</h4>
                                    <small class="phone-app-subtitle" id="phoneAppSubtitle">Cấp ${state.level} • ${state.money.toLocaleString('vi-VN')}đ • Chuẩn ATVSTP</small>
                                </div>
                            </div>
                            <button type="button" class="btn-phone-close" id="btnClosePhone" title="Đóng điện thoại">✕</button>
                        </div>

                        <!-- Kênh Kết Nối Chính Thức Thương Hiệu (Facebook & TikTok) -->
                        <div class="phone-social-bar">
                            <a href="https://www.facebook.com/onigiriviet" target="_blank" rel="noopener noreferrer" class="phone-social-btn fb-btn" title="Fanpage Facebook Chính Thức">
                                <span class="social-icon">📘</span>
                                <span class="social-label">Fanpage FB</span>
                            </a>
                            <a href="https://www.tiktok.com/@comnam_onigiriviet?_r=1&_t=ZS-9BdKFHssRQC" target="_blank" rel="noopener noreferrer" class="phone-social-btn tt-btn" title="Kênh TikTok Chính Thức">
                                <span class="social-icon">🎵</span>
                                <span class="social-label">Kênh TikTok</span>
                            </a>
                        </div>

                        <!-- 6 Tab chuyển đổi chức năng iGiri OS -->
                        <div class="phone-tab-bar">
                            <button type="button" class="phone-tab-btn ${this.activeTab === 'quests' ? 'active' : ''}" data-tab="quests">
                                📜 Nhiệm Vụ
                            </button>
                            <button type="button" class="phone-tab-btn ${this.activeTab === 'contracts' ? 'active' : ''}" data-tab="contracts">
                                📑 Hợp Đồng
                            </button>
                            <button type="button" class="phone-tab-btn ${this.activeTab === 'achievements' ? 'active' : ''}" data-tab="achievements">
                                🏆 Thành Tựu
                            </button>
                            <button type="button" class="phone-tab-btn ${this.activeTab === 'delivery' ? 'active' : ''}" data-tab="delivery">
                                ⚡ Hỏa Tốc
                            </button>
                            <button type="button" class="phone-tab-btn ${this.activeTab === 'vehicles' ? 'active' : ''}" data-tab="vehicles">
                                🛵 Xe & Thùng
                            </button>
                            <button type="button" class="phone-tab-btn ${this.activeTab === 'tycoon' ? 'active' : ''}" data-tab="tycoon">
                                🏢 Đế Chế
                            </button>
                            <button type="button" class="phone-tab-btn ${this.activeTab === 'online' ? 'active' : ''}" data-tab="online">
                                🌐 Cộng Đồng
                            </button>
                        </div>

                        <!-- Nội dung tab đang chọn -->
                        <div class="phone-tab-content-wrapper">
                            ${this.renderActiveTab()}
                        </div>

                        <!-- Thanh Home Bar dưới đáy -->
                        <div class="phone-home-bar" id="phoneHomeBar"></div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();

        // Khôi phục vị trí cuộn mượt mà khi re-render
        if (prevScrollTop > 0) {
            const newScrollWrapper = this.container.querySelector('.phone-tab-content-wrapper');
            if (newScrollWrapper) {
                newScrollWrapper.scrollTop = prevScrollTop;
            }
        }
    }

    renderActiveTab() {
        switch (this.activeTab) {
            case 'quests':
                return this.renderQuestsTab();
            case 'contracts':
                return this.renderContractsTab();
            case 'achievements':
                return this.renderAchievementsTab();
            case 'delivery':
                return this.renderDeliveryTab();
            case 'vehicles':
                return this.renderVehiclesTab();
            case 'tycoon':
                return this.renderTycoonTab();
            case 'online':
                return onlineUI.renderOnlineTab();
            default:
                return '';
        }
    }

    // --- TAB MỚI: ỨNG DỤNG ĐƠN HỎA TỐC 60S (+50% TIỀN THƯỞNG) ---
    renderDeliveryTab() {
        const activeOrder = deliveryManager.activeOrder;
        const available = deliveryManager.availableOrders;

        let activeHtml = '';
        if (activeOrder) {
            const currentStock = state.getFillingCount(activeOrder.fillingId);
            const canDeliver = currentStock >= activeOrder.count;
            const timerSecs = Math.max(0, Math.ceil(deliveryManager.timer));

            activeHtml = `
                <div class="express-active-card animate-pop">
                    <div class="exp-active-header">
                        <span class="exp-tag">⚡ ĐƠN ĐANG GIAO HỎA TỐC</span>
                        <span class="exp-timer" id="expLiveTimer">⏱️ ${timerSecs}s</span>
                    </div>
                    <h4>${activeOrder.destIcon} ${activeOrder.destName}</h4>
                    <p class="exp-desc">
                        Yêu cầu: <strong>${activeOrder.count} nắm ${activeOrder.fillingName}</strong>
                    </p>
                    <div class="exp-stock-row">
                        <span>Kho xe đang có: <strong>${currentStock} / ${activeOrder.count} nắm</strong></span>
                        <span class="${canDeliver ? 'text-green' : 'text-red'}">${canDeliver ? '✓ Đã đủ cơm' : '❌ Chưa đủ'}</span>
                    </div>
                    <div class="exp-reward-row">
                        <span>💰 +${activeOrder.rewardMoney.toLocaleString('vi-VN')}đ (+50%)</span>
                        <span>⭐ +${activeOrder.rewardExp} EXP</span>
                    </div>
                    <div class="exp-guide-hint">
                        👉 Lái xe theo <strong>mũi tên vàng chỉ hướng</strong> tới vùng phát sáng tại ${activeOrder.destName} và nhấn <strong>E</strong>!
                    </div>
                    <button type="button" class="btn-cancel-express" id="btnCancelExpress">✕ Hủy Đơn Hỏa Tốc</button>
                </div>
            `;
        }

        return `
            <div class="tab-content delivery-view">
                <div class="tab-banner-hint">
                    ⚡ <strong>Ứng dụng Đơn Hỏa Tốc:</strong> Nhận đơn giao gấp trong 60 giây, lái xe theo mũi tên chỉ đường và nhấn <strong>E</strong> tại điểm đến để nhận tiền thưởng <strong>+50%</strong>!
                </div>

                ${activeHtml}

                <div class="express-header-row">
                    <h4>Đơn Hàng Sẵn Sàng (${available.length})</h4>
                    <button type="button" class="btn-refresh-orders" id="btnRefreshOrders">🔄 Đổi Đơn</button>
                </div>

                <div class="express-orders-list">
                    ${available.map(ord => {
                        const inStock = state.getFillingCount(ord.fillingId);
                        const hasEnough = inStock >= ord.count;
                        const isBusy = !!activeOrder;

                        return `
                            <div class="express-order-card ${hasEnough ? 'ready-to-go' : ''}">
                                <div class="eoc-header">
                                    <div class="eoc-dest">
                                        <span class="eoc-icon">${ord.destIcon}</span>
                                        <strong>${ord.destName}</strong>
                                    </div>
                                    <span class="eoc-bonus-badge">+50% Thưởng</span>
                                </div>
                                <div class="eoc-body">
                                    <p>Giao: <strong>${ord.count} nắm ${ord.fillingName}</strong></p>
                                    <small>Kho xe hiện có: <strong class="${hasEnough ? 'text-green' : 'text-orange'}">${inStock} nắm</strong></small>
                                </div>
                                <div class="eoc-footer">
                                    <div class="eoc-reward">
                                        <span>💰 +${ord.rewardMoney.toLocaleString('vi-VN')}đ</span>
                                        <span>⭐ +${ord.rewardExp} EXP</span>
                                    </div>
                                    <button type="button" class="btn-accept-express ${isBusy ? 'disabled' : ''}" data-oid="${ord.id}" ${isBusy ? 'disabled' : ''}>
                                        ${isBusy ? 'Đang giao đơn khác' : '⚡ Nhận Đơn (60s)'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // --- TAB 1: TUYẾN 20 NHIỆM VỤ TIẾN TRÌNH & ĐƠN HÀNG PHỤ GTA ---
    renderQuestsTab() {
        let sideQuestHtml = '';

        // Hiển thị cuộc gọi đến ngẫu nhiên nếu có
        if (this.incomingCall) {
            const call = this.incomingCall;
            sideQuestHtml = `
                <div class="phone-incoming-call-box animate-pop">
                    <div class="call-header">
                        <span class="call-pulse-icon">📞</span>
                        <div>
                            <h4>CUỘC GỌI ĐƠN HÀNG GẤP!</h4>
                            <small>Đối tác ẩm thực Sài Gòn đang gọi...</small>
                        </div>
                    </div>
                    <p class="call-order-desc">
                        Cần giao gấp <strong>${call.count} nắm ${call.fillingName}</strong> đến <strong>${call.locName}</strong> trong 120 giây!
                    </p>
                    <div class="call-reward-row">
                        <span>💰 +${call.rewardMoney.toLocaleString('vi-VN')}đ</span>
                        <span>⭐ +${call.rewardExp} EXP</span>
                    </div>
                    <div class="call-action-btns">
                        <button type="button" class="btn-accept-call" id="btnAcceptCall">✅ Nhận Đơn Giao Gấp</button>
                        <button type="button" class="btn-decline-call" id="btnDeclineCall">❌ Từ Chối</button>
                    </div>
                </div>
            `;
        } else if (this.activeSideQuest) {
            const sq = this.activeSideQuest;
            const elapsed = (Date.now() - sq.startTime) / 1000;
            const rem = Math.max(0, sq.durationSeconds - elapsed);
            const m = Math.floor(rem / 60);
            const s = Math.floor(rem % 60);
            const timeFmt = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            const inStock = state.getFillingCount(sq.fillingId);
            const canDeliver = inStock >= sq.count;

            sideQuestHtml = `
                <div class="phone-sidequest-card in-progress">
                    <div class="sq-top">
                        <span class="sq-tag">🛵 ĐƠN GIAO GẤP GTA</span>
                        <span class="sq-countdown" id="sideQuestTimerText">⏱️ ${timeFmt}</span>
                    </div>
                    <h4>Giao ${sq.count} nắm ${sq.fillingName} tới ${sq.locName}</h4>
                    <p class="sq-stock-info">Cơm mang theo: <strong>${inStock} / ${sq.count} nắm</strong></p>
                    <div class="sq-bottom">
                        <span class="sq-reward">💰 +${sq.rewardMoney.toLocaleString('vi-VN')}đ | ⭐ +${sq.rewardExp} EXP</span>
                        <button type="button" class="btn-deliver-sq ${canDeliver ? '' : 'disabled'}" id="btnDeliverSQ" ${canDeliver ? '' : 'disabled'}>
                            ${canDeliver ? '📦 Giao Hàng Ngay' : 'Thiếu cơm mang theo'}
                        </button>
                    </div>
                </div>
            `;
        }

        const completedCount = state.quests?.completedIds?.length || 0;

        return `
            <div class="tab-content quests-view">
                <div class="tab-banner-hint">
                    📜 <strong>Hành Trình 20 Nhiệm Vụ Cốt Truyện:</strong> Trải qua 4 giai đoạn phát triển từ vỉa hè đến Chủ tịch Tập đoàn Cơm Nắm toàn quốc (${completedCount}/20 Hoàn Thành).
                </div>

                ${sideQuestHtml}

                <div class="quests-list">
                    ${QUEST_STAGES.map(stage => {
                        const stageDone = stage.questIds.filter(qId => state.quests?.completedIds?.includes(qId)).length;
                        const isStageComplete = stageDone === stage.questIds.length;

                        return `
                            <div class="quest-stage-group ${isStageComplete ? 'stage-completed' : ''}">
                                <div class="quest-stage-header">
                                    <div class="qsh-left">
                                        <span class="qsh-icon">${stage.icon}</span>
                                        <div>
                                            <h4 class="qsh-title">${stage.title}</h4>
                                            <small class="qsh-sub">${stageDone}/${stage.questIds.length} Hoàn Thành</small>
                                        </div>
                                    </div>
                                    <span class="qsh-badge ${isStageComplete ? 'done' : ''}">${isStageComplete ? '✓ Hoàn Tất' : `${Math.round(stageDone / stage.questIds.length * 100)}%`}</span>
                                </div>
                                <div class="quest-stage-cards">
                                    ${stage.questIds.map(qId => {
                                        const idx = QUEST_ORDER.indexOf(qId);
                                        return this.renderQuestCard(qId, idx);
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderQuestCard(qId, idx) {
        const def = QUEST_DEFS[qId];
        if (!def) return '';
        const isCompleted = state.quests.completedIds.includes(qId);
        const isActive = state.quests.activeId === qId;

        let statusClass = 'locked';
        let statusBadge = '🔒 Chưa mở khóa';

        if (isCompleted) {
            statusClass = 'completed';
            statusBadge = '✓ Đã hoàn thành';
        } else if (isActive) {
            if (def.isReady()) {
                statusClass = 'ready';
                statusBadge = '🎁 Sẵn sàng nhận!';
            } else {
                statusClass = 'in-progress';
                statusBadge = '⚡ Đang thực hiện';
            }
        }

        const prog = def.getProgress();
        const pct = Math.min(100, Math.round((prog.current / prog.target) * 100));

        let actionArea = '';

        if (isCompleted) {
            actionArea = `<div class="quest-claimed-stamp">✓ ĐÃ NHẬN THƯỞNG</div>`;
        } else if (isActive) {
            if (def.isReady()) {
                actionArea = `
                    <button type="button" class="btn-quest-claim ${this.isClaiming ? 'disabled' : ''}" data-qid="${qId}">
                        🎁 NHẬN THƯỞNG
                    </button>
                `;
            } else {
                actionArea = `
                    <div class="quest-inprogress-note">
                        ${def.desc}
                    </div>
                `;
            }
        }

        const currentText = prog.isMoney ? prog.current.toLocaleString('vi-VN') + 'đ' : `${prog.current} / ${prog.target}`;
        const targetText = prog.isMoney ? prog.target.toLocaleString('vi-VN') + 'đ' : `${prog.target}`;

        return `
            <div class="quest-card ${statusClass}">
                <div class="quest-header-row">
                    <span class="quest-tag">Nhiệm Vụ ${idx + 1}</span>
                    <span class="quest-badge-pill ${statusClass}">${statusBadge}</span>
                </div>
                <h4 class="quest-title">${def.title}</h4>
                <p class="quest-desc">${def.desc}</p>

                <!-- Tiến độ -->
                <div class="quest-progress-wrap">
                    <div class="quest-prog-info">
                        <span>Tiến độ: <strong>${currentText}</strong></span>
                        <span>Mục tiêu: <strong>${targetText}</strong></span>
                    </div>
                    <div class="quest-prog-track">
                        <div class="quest-prog-fill" style="width: ${pct}%;"></div>
                    </div>
                </div>

                <!-- Phần thưởng & Nút hành động -->
                <div class="quest-bottom-row">
                    <div class="quest-reward-tags">
                        <span class="reward-item">💰 +${def.reward.money.toLocaleString('vi-VN')}đ</span>
                        <span class="reward-item">⭐ +${def.reward.exp} EXP</span>
                        ${def.reward.title ? `<span class="reward-item title-tag">👑 ${def.reward.title}</span>` : ''}
                    </div>
                    ${actionArea}
                </div>
            </div>
        `;
    }

    // --- TAB MỚI: HỢP ĐỒNG ĐẶT TIỆC LỚN (DYNAMIC PARTY CONTRACTS) ---
    renderContractsTab() {
        state.initContracts();
        const contracts = state.contracts?.available || [];
        const now = Date.now();
        const lastRef = state.contracts?.lastRefreshTime || now;
        const interval = state.contracts?.refreshIntervalMs || 180000;
        const remainingSecs = Math.max(0, Math.ceil((lastRef + interval - now) / 1000));
        const remMins = Math.floor(remainingSecs / 60);
        const remSecsPart = remainingSecs % 60;
        const timerFmt = `${String(remMins).padStart(2, '0')}:${String(remSecsPart).padStart(2, '0')}`;

        return `
            <div class="tab-content contracts-view">
                <div class="tab-banner-hint">
                    📑 <strong>Hợp Đồng Đặt Tiệc Lớn:</strong> Giao tổ hợp nhiều vị cơm nắm cùng lúc với độ tươi chuẩn ISO để nhận tiền thưởng lớn và Danh vọng! Hợp đồng tự động làm mới sau mỗi 3 phút.
                </div>

                <div class="contract-timer-bar">
                    <div class="contract-timer-info">
                        <span>Làm mới sau: <strong id="contractRefreshTimerText">⏱️ ${timerFmt}</strong></span>
                        <small>Hoàn thành: ${state.stats?.contractsCompleted || 0} hợp đồng</small>
                    </div>
                    <button type="button" class="btn-refresh-contracts" id="btnRefreshContracts">🔄 Đổi Hợp Đồng</button>
                </div>

                <div class="contracts-list">
                    ${contracts.map(c => {
                        const check = state.checkContractDeliverable(c);
                        const isDeliverable = check.deliverable;
                        const isFulfilled = Boolean(c.fulfilled);

                        return `
                            <div class="contract-card ${isFulfilled ? 'fulfilled' : (isDeliverable ? 'ready' : '')}" style="border-left: 4px solid ${c.tierColor || '#0284c7'};">
                                <div class="contract-header">
                                    <div class="contract-title-row">
                                        <span class="contract-tier-tag" style="background: ${c.tierColor}22; color: ${c.tierColor}; border: 1px solid ${c.tierColor};">${c.tierLabel}</span>
                                        <h4>${c.title}</h4>
                                    </div>
                                    <span class="contract-freshness-req">Độ tươi: ≥ ${c.minFreshness}%</span>
                                </div>
                                <p class="contract-desc">${c.desc}</p>

                                <div class="contract-items-table">
                                    <div class="cit-head">
                                        <span>Món yêu cầu</span>
                                        <span>Trong xe</span>
                                        <span>Độ tươi TB</span>
                                    </div>
                                    ${c.items.map(it => {
                                        const inStock = state.getFillingCount(it.fillingId);
                                        const hasEnough = inStock >= it.count;
                                        const matching = (state.inventory || []).filter(r => resolveFillingId(r.filling) === resolveFillingId(it.fillingId));
                                        const sumFresh = matching.reduce((acc, r) => acc + (typeof r.freshness === 'number' ? r.freshness : 100), 0);
                                        const avgFresh = matching.length > 0 ? Math.round(sumFresh / matching.length) : 0;
                                        const freshOk = inStock > 0 && avgFresh >= c.minFreshness;

                                        return `
                                            <div class="cit-row">
                                                <span class="cit-name">${it.name} (x${it.count})</span>
                                                <span class="${hasEnough ? 'text-green' : 'text-red'}">${inStock}/${it.count}</span>
                                                <span class="${freshOk ? 'text-green' : 'text-orange'}">${inStock > 0 ? avgFresh + '%' : '--'}</span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>

                                <div class="contract-footer">
                                    <div class="contract-rewards">
                                        <span>💰 +${c.rewardMoney.toLocaleString('vi-VN')}đ</span>
                                        <span>⭐ +${c.rewardExp} EXP</span>
                                        <span>👑 +${c.rewardFame || 10} Danh vọng</span>
                                    </div>
                                    ${isFulfilled ? `
                                        <button type="button" class="btn-contract-deliver disabled" disabled>✓ Đã Hoàn Thành</button>
                                    ` : `
                                        <button type="button" class="btn-contract-deliver ${isDeliverable ? 'ready' : 'disabled'}" data-cid="${c.id}" ${isDeliverable ? '' : 'disabled'}>
                                            ${isDeliverable ? '🚚 Bàn Giao Tiệc Ngay' : 'Chưa Đủ Cơm / Độ Tươi'}
                                        </button>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // --- TAB MỚI: BẢNG 12 THÀNH TỰU & DANH HIỆU (PERMANENT BUFFS) ---
    renderAchievementsTab() {
        const claimed = state.achievements?.claimedIds || [];
        const unlockedCount = ACHIEVEMENT_ORDER.filter(aId => {
            const ach = ACHIEVEMENTS_CONFIG[aId];
            return ach && (claimed.includes(aId) || ach.isUnlocked(state));
        }).length;

        return `
            <div class="tab-content achievements-view">
                <div class="tab-banner-hint">
                    🏆 <strong>Bảng Thành Tựu & Danh Hiệu:</strong> Mở khóa 12 cột mốc danh giá để nhận danh hiệu cao quý và kích hoạt các <strong>Buff Vĩnh Viễn</strong> cộng dồn vào đế chế ẩm thực của bạn!
                </div>

                <div class="ach-summary-card">
                    <div class="asc-stat">
                        <span class="asc-number">${unlockedCount}/12</span>
                        <span class="asc-label">Thành Tựu Mở Khóa</span>
                    </div>
                    <div class="asc-stat">
                        <span class="asc-number">${claimed.length}</span>
                        <span class="asc-label">Buff Đang Kích Hoạt</span>
                    </div>
                </div>

                <div class="achievements-list">
                    ${ACHIEVEMENT_ORDER.map(aId => {
                        const ach = ACHIEVEMENTS_CONFIG[aId];
                        if (!ach) return '';
                        const isClaimed = claimed.includes(aId);
                        const isUnlocked = ach.isUnlocked(state);
                        const prog = ach.getProgress(state);
                        const pct = Math.min(100, Math.round((prog.current / prog.target) * 100));

                        return `
                            <div class="achievement-card ${isClaimed ? 'claimed' : (isUnlocked ? 'ready' : 'in-progress')}">
                                <div class="ach-header">
                                    <span class="ach-icon">${ach.icon}</span>
                                    <div class="ach-title-area">
                                        <h4>${ach.title}</h4>
                                        <span class="ach-buff-tag">${ach.buffText}</span>
                                    </div>
                                    ${isClaimed ? '<span class="ach-badge-active">✓ ĐÃ KÍCH HOẠT</span>' : ''}
                                </div>
                                <p class="ach-desc">${ach.desc}</p>
                                <div class="ach-progress-bar-bg">
                                    <div class="ach-progress-bar-fill" style="width: ${pct}%"></div>
                                </div>
                                <div class="ach-footer">
                                    <small class="ach-prog-text">Tiến độ: ${prog.isMoney ? prog.current.toLocaleString('vi-VN') + 'đ' : prog.current} / ${prog.isMoney ? prog.target.toLocaleString('vi-VN') + 'đ' : prog.target}</small>
                                    ${isClaimed ? `
                                        <span class="ach-status-stamp">✓ Buff Vĩnh Viễn Đang Bật</span>
                                    ` : (isUnlocked ? `
                                        <button type="button" class="btn-claim-achievement ready" data-aid="${ach.id}">
                                            🏅 Kích Hoạt Buff
                                        </button>
                                    ` : `
                                        <span class="ach-status-lock">🔒 Đang phấn đấu (${pct}%)</span>
                                    `)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // --- TAB 2: PHƯƠNG TIỆN & SỨC CHỨA THÙNG XE ---
    renderVehiclesTab() {
        const nextVeh = state.getNextVehicleToBuy();

        return `
            <div class="tab-content vehicles-view">
                <div class="tab-banner-hint">
                    🛵 Nâng cấp phương tiện giúp tăng tốc độ di chuyển và mở rộng sức chứa thùng xe (Đi bộ: 10 → Xe đạp: 25 → Xe máy: 60 → Xe tải: 150 nắm)!
                </div>

                <div class="vehicle-list">
                    ${VEHICLE_ORDER.map((vKey) => {
                        const veh = VEHICLES[vKey];
                        const isCurrent = state.currentVehicle === vKey;
                        const isUnlocked = state.unlockedVehicles.includes(vKey);
                        const isNext = nextVeh && nextVeh.id === vKey;
                        const canAfford = state.money >= veh.price;

                        let statusBadge = isCurrent ? '🟢 Đang dùng' : isUnlocked ? '✓ Đã sở hữu' : isNext ? '🛒 Kế tiếp' : '🔒 Khóa';

                        return `
                            <div class="vehicle-card ${isCurrent ? 'active' : ''} ${isUnlocked ? 'unlocked' : ''}">
                                <div class="veh-left-icon">${veh.icon}</div>
                                <div class="veh-center-info">
                                    <div class="veh-title-row">
                                        <h4>${veh.name}</h4>
                                        <span class="veh-badge ${isCurrent ? 'badge-current' : ''}">${statusBadge}</span>
                                    </div>
                                    <p class="veh-desc">${veh.desc}</p>
                                    <div class="veh-stats">
                                        <span class="veh-stat-pill">⚡ Tốc độ: +${veh.speedBonus}%</span>
                                        <span class="veh-stat-pill" style="background: rgba(249, 115, 22, 0.15); color: #f97316;">🎒 Sức chứa: ${veh.capacity} nắm</span>
                                        <span class="veh-price-pill">${veh.price === 0 ? 'Miễn phí' : veh.price.toLocaleString('vi-VN') + 'đ'}</span>
                                    </div>
                                </div>
                                <div class="veh-right-action">
                                    ${isCurrent ? `
                                        <button type="button" class="btn-veh-action current" disabled>Đang chạy</button>
                                    ` : isUnlocked ? `
                                        <button type="button" class="btn-veh-action equip" data-vid="${veh.id}">Chọn dùng</button>
                                    ` : isNext ? `
                                        <button type="button" class="btn-veh-action buy ${canAfford ? '' : 'disabled'}" data-vid="${veh.id}" ${canAfford ? '' : 'disabled'}>
                                            ${canAfford ? 'Nâng cấp' : 'Chưa đủ tiền'}
                                        </button>
                                    ` : `
                                        <button type="button" class="btn-veh-action locked" disabled>Bậc trước</button>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // --- TAB 3: ĐẾ CHẾ TYCOON (XƯỞNG BẾP 2 NHÁNH & 4 CHI NHÁNH TOÀN QUỐC) ---
    renderTycoonTab() {
        // 1. Nhánh Năng Suất Thủ Công
        const curManualTier = KITCHEN_MANUAL_TIERS[state.kitchenManualTier || state.kitchenTier || 1];
        const nextManualTier = state.getNextKitchenManualTier();
        const canAffordManual = nextManualTier && state.money >= nextManualTier.price;

        // 2. Nhánh Dây Chuyền Tự Động (Auto-Production)
        const curAutoLevel = state.kitchenAutoLevel || 0;
        const curAutoCfg = KITCHEN_AUTO_CONFIG[curAutoLevel] || null;
        const nextAutoCfg = state.getNextKitchenAutoConfig();
        const canAffordAuto = nextAutoCfg && state.money >= nextAutoCfg.price;
        const hasMat = state.hasIngredients(1);
        const autoStockCount = Array.isArray(state.kitchenStock) ? state.kitchenStock.length : 0;
        const vehicleCurrent = state.inventory.length;
        const vehicleMax = state.getMaxCapacity();
        const canTransferStock = autoStockCount > 0 && vehicleCurrent < vehicleMax;

        // 3. Quản Lý 4 Chi Nhánh Toàn Quốc
        const branchIncome = state.getBranchTotalIncomePer10s();

        // 4. Nhân Viên AI
        const staffPrice = state.getStaffHirePrice();
        const canAffordStaff = state.money >= staffPrice;

        return `
            <div class="tab-content tycoon-view">
                ${state.isOperatingHalted ? `
                    <div class="tab-banner-hint" style="background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #f87171;">
                        ⚠️ DOANH NGHIỆP TẠM NGƯNG VẬN HÀNH: Đang nợ <strong>${(state.unpaidDebt || 0).toLocaleString('vi-VN')}đ</strong> chi phí cuối ngày. Dây chuyền tự động & nhân viên AI tạm dừng. Đi bán cơm kiếm tiền bù nợ nhé!
                    </div>
                ` : ''}
                <div class="tab-banner-hint">
                    🏢 Xây dựng đế chế ẩm thực: Sản xuất tự động, mở rộng chi nhánh toàn quốc và vận hành nhân viên AI!
                </div>

                <!-- 1. XƯỞNG SẢN XUẤT CƠM NẮM (2 NHÁNH RÕ RÀNG) -->
                <div class="tycoon-section-card">
                    <div class="sec-header">
                        <span class="sec-icon">🍳</span>
                        <div>
                            <h4>Xưởng Sản Xuất Cơm Nắm</h4>
                            <small>Chia làm 2 nhánh: Năng suất thủ công & Dây chuyền tự động</small>
                        </div>
                    </div>

                    <!-- NHÁNH 1: THỦ CÔNG (1 -> 3 -> 6 -> 10 NẮM) -->
                    <div class="sub-branch-block">
                        <div class="sub-branch-title">
                            <span>🥄 Nhánh 1: Năng Suất Nấu Thủ Công</span>
                            <span class="sub-badge highlight">${curManualTier.batchSize} nắm / lần nấu</span>
                        </div>
                        <p class="sub-branch-desc">Thiết bị: <strong>${curManualTier.name}</strong> (${curManualTier.desc})</p>
                        ${nextManualTier ? `
                            <div class="tycoon-upgrade-box compact">
                                <div class="upgrade-next-info">
                                    <span>Lên cấp: <strong>${nextManualTier.name}</strong></span>
                                    <small>Mỗi lần làm cơm cho ra ngay <strong>${nextManualTier.batchSize} nắm</strong></small>
                                </div>
                                <button type="button" class="btn-tycoon-upgrade ${canAffordManual ? '' : 'disabled'}" id="btnUpgradeKitchenManual" ${canAffordManual ? '' : 'disabled'}>
                                    ${canAffordManual ? `Nâng cấp (${nextManualTier.price.toLocaleString('vi-VN')}đ)` : `Thiếu ${(nextManualTier.price - state.money).toLocaleString('vi-VN')}đ`}
                                </button>
                            </div>
                        ` : `
                            <div class="tycoon-max-badge compact">✓ ĐÃ ĐẠT CẤP ĐỘ THỦ CÔNG TỐI ĐA (10 nắm/lần)</div>
                        `}
                    </div>

                    <!-- NHÁNH 2: DÂY CHUYỀN TỰ ĐỘNG (AUTO-PRODUCTION) -->
                    <div class="sub-branch-block auto-line">
                        <div class="sub-branch-title">
                            <span>🤖 Nhánh 2: Dây Chuyền Tự Động (Auto 10s)</span>
                            <span class="sub-badge ${curAutoLevel > 0 ? (hasMat ? 'active' : 'warn') : 'locked'}">
                                ${curAutoLevel > 0 ? (hasMat ? `🟢 Đang chạy (+${curAutoCfg.ratePer10s} nắm/10s)` : '🔴 Hết nguyên liệu Chợ') : '🔒 Chưa lắp đặt'}
                            </span>
                        </div>
                        <p class="sub-branch-desc">
                            ${curAutoCfg ? `Trang bị: <strong>${curAutoCfg.name}</strong> (${curAutoCfg.desc})` : 'Tự động trừ nguyên liệu Chợ để sản xuất thêm cơm nắm vào Kho Xưởng mỗi 10 giây.'}
                        </p>

                        <!-- Kho Xưởng Tự Động & Chuyển vào Thùng Xe & Thanh Lý Hàng Cũ -->
                        <div class="kitchen-stock-hud">
                            <div class="stock-info-row">
                                <span>🍙 Kho Xưởng: <strong>${autoStockCount} / 300 nắm</strong></span>
                                <span>🎒 Xe mang theo: <strong>${vehicleCurrent} / ${vehicleMax}</strong></span>
                            </div>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
                                <button type="button" class="btn-transfer-stock ${canTransferStock ? '' : 'disabled'}" id="btnTransferKitchenStock" ${canTransferStock ? '' : 'disabled'} style="flex: 1;">
                                    ${canTransferStock ? `📦 Chuyển ra xe (+${Math.min(autoStockCount, vehicleMax - vehicleCurrent)})` : (autoStockCount === 0 ? 'Kho xưởng trống' : 'Thùng xe đầy')}
                                </button>
                                <button type="button" class="btn-transfer-stock" id="btnDiscardSpoiled" style="background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #f87171; flex: 1;">
                                    🗑️ Thanh lý cơm cũ (<40%)
                                </button>
                            </div>
                        </div>

                        ${nextAutoCfg ? `
                            <div class="tycoon-upgrade-box compact">
                                <div class="upgrade-next-info">
                                    <span>Mua máy: <strong>${nextAutoCfg.name}</strong></span>
                                    <small>Tự động sản xuất <strong>+${nextAutoCfg.ratePer15s || nextAutoCfg.ratePer10s} nắm cơm mỗi 15 giây</strong></small>
                                </div>
                                <button type="button" class="btn-tycoon-upgrade ${canAffordAuto ? '' : 'disabled'}" id="btnUpgradeKitchenAuto" ${canAffordAuto ? '' : 'disabled'}>
                                    ${canAffordAuto ? `Mua Máy (${nextAutoCfg.price.toLocaleString('vi-VN')}đ)` : `Thiếu ${(nextAutoCfg.price - state.money).toLocaleString('vi-VN')}đ`}
                                </button>
                            </div>
                        ` : `
                            <div class="tycoon-max-badge compact">✓ DÂY CHUYỀN TỰ ĐỘNG ĐẠT CÔNG SUẤT TỐI ĐA (+10 nắm/15s)</div>
                        `}
                    </div>
                </div>

                <!-- 2. HỆ THỐNG MỞ RỘNG 4 CHI NHÁNH LIÊN TỈNH TOÀN QUỐC -->
                <div class="tycoon-section-card branches-section">
                    <div class="sec-header">
                        <span class="sec-icon">🏢</span>
                        <div>
                            <h4>Quản Lý 4 Chi Nhánh Toàn Quốc</h4>
                            <small>
                                Doanh thu tự động mỗi 15 giây: <strong style="color: #4ade80;">+${branchIncome.toLocaleString('vi-VN')}đ</strong>
                                ${typeof state.getBranchChainSynergy === 'function' && state.getBranchChainSynergy() > 0 ? `
                                    <span style="color: #facc15; margin-left: 8px;">(Thưởng chuỗi: +${state.getBranchChainSynergy()}%)</span>
                                ` : ''}
                            </small>
                        </div>
                    </div>

                    <div class="branch-card-stack">
                        ${BRANCH_ORDER.map(bId => {
                            const cfg = BRANCH_CONFIGS[bId];
                            const bState = (state.branches && state.branches[bId]) || { unlocked: false, level: 1 };
                            const isUnlocked = bState.unlocked;
                            const curLvl = bState.level || 1;
                            const curLvlCfg = cfg.levels[curLvl];
                            const nextLvl = curLvl + 1;
                            const nextLvlCfg = cfg.levels[nextLvl];
                            const minLevel = cfg.minLevel || 1;
                            const meetsLevel = state.level >= minLevel;
                            const canAffordUnlock = state.money >= cfg.unlockPrice;
                            const canUnlock = meetsLevel && canAffordUnlock;
                            const canAffordUpgrade = nextLvlCfg && state.money >= nextLvlCfg.upgradeCost;
                            const unlockedSpots = typeof state.getUnlockedSellingSpotsCount === 'function' ? state.getUnlockedSellingSpotsCount(bId) : (curLvl >= 4 ? 6 : (curLvl >= 2 ? 4 : 2));

                            let statusTag = '';
                            if (bId === 'branch_hcm') {
                                statusTag = '<span class="branch-pill headquarter">⭐ Trụ sở chính</span>';
                            } else if (isUnlocked) {
                                statusTag = '<span class="branch-pill active">🟢 Đang hoạt động</span>';
                            } else {
                                statusTag = '<span class="branch-pill locked">🔒 Chưa mở khóa</span>';
                            }

                            return `
                                <div class="branch-item-card ${isUnlocked ? 'unlocked' : 'locked'}">
                                    <div class="branch-card-header">
                                        <div class="branch-title-left">
                                            <span class="branch-icon">${cfg.icon}</span>
                                            <div>
                                                <h4>${cfg.name}</h4>
                                                <small>${cfg.subtitle}</small>
                                            </div>
                                        </div>
                                        ${statusTag}
                                    </div>

                                    ${isUnlocked ? `
                                        <div class="branch-stats-grid">
                                            <div class="b-stat">
                                                <small>Cấp độ chi nhánh:</small>
                                                <strong>⭐ Cấp ${curLvl} / 10</strong>
                                            </div>
                                            <div class="b-stat">
                                                <small>Doanh thu tự động:</small>
                                                <strong class="income">+${((curLvlCfg && (curLvlCfg.incomePer15s || curLvlCfg.incomePer10s)) || 0).toLocaleString('vi-VN')}đ / 15s</strong>
                                            </div>
                                            <div class="b-stat">
                                                <small>Điểm bán mở khóa:</small>
                                                <strong class="spots" style="color: #38bdf8;">🏪 ${unlockedSpots} / 6 điểm</strong>
                                            </div>
                                        </div>

                                        <div class="branch-travel-box">
                                            ${bId === state.currentCity ? `
                                                <span class="branch-travel-tag current">📍 Bạn đang ở thành phố này</span>
                                            ` : `
                                                <button type="button" class="btn-branch-travel btn-travel-city" data-travel-city="${bId}">
                                                    ✈️ Tới Thành Phố Này
                                                </button>
                                            `}
                                        </div>

                                        ${nextLvlCfg ? `
                                            <div class="branch-action-row">
                                                <div class="branch-next-hint">
                                                    <span>Lên Cấp ${nextLvl}:</span>
                                                    <small>+${(nextLvlCfg.incomePer15s || nextLvlCfg.incomePer10s).toLocaleString('vi-VN')}đ/15s (Mở ${nextLvl >= 4 ? '6' : (nextLvl >= 2 ? '4' : '2')} điểm bán)</small>
                                                </div>
                                                <button type="button" class="btn-branch-action upgrade btn-upgrade-branch ${canAffordUpgrade ? '' : 'disabled'}" data-bid="${cfg.id}" ${canAffordUpgrade ? '' : 'disabled'}>
                                                    ${canAffordUpgrade ? `Nâng cấp (${nextLvlCfg.upgradeCost.toLocaleString('vi-VN')}đ)` : `Thiếu ${(nextLvlCfg.upgradeCost - state.money).toLocaleString('vi-VN')}đ`}
                                                </button>
                                            </div>
                                        ` : `
                                            <div class="branch-max-tag">👑 ĐÃ ĐẠT CẤP ĐỘ CHI NHÁNH TỐI ĐA (ĐÔ THỊ HIỆN ĐẠI CẤP 10)</div>
                                        `}
                                    ` : `
                                        <div class="branch-unlock-row">
                                            <div class="branch-unlock-info">
                                                <span>Doanh thu Cấp 1: <strong>+${(cfg.levels[1].incomePer15s || cfg.levels[1].incomePer10s).toLocaleString('vi-VN')}đ / 15s</strong> (2 điểm bán)</span>
                                                <small>Chi phí mở: <strong>${cfg.unlockPrice.toLocaleString('vi-VN')}đ</strong> ${minLevel > 1 ? `(Yêu cầu: Level ${minLevel})` : ''}</small>
                                            </div>
                                            <button type="button" class="btn-branch-action unlock btn-unlock-branch ${canUnlock ? '' : 'disabled'}" data-bid="${cfg.id}" ${canUnlock ? '' : 'disabled'}>
                                                ${!meetsLevel ? `Cần Level ${minLevel}` : (canAffordUnlock ? `Mở Chi Nhánh` : `Thiếu ${(cfg.unlockPrice - state.money).toLocaleString('vi-VN')}đ`)}
                                            </button>
                                        </div>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- 3. THUÊ NHÂN VIÊN AI TỰ ĐỘNG BÁN HÀNG -->
                <div class="tycoon-section-card">
                    <div class="sec-header">
                        <span class="sec-icon">🧑‍🍳</span>
                        <div>
                            <h4>Thuê Nhân Viên Bán Hàng AI</h4>
                            <small>Tự động sinh dòng tiền thụ động mỗi 15 giây (cần nguyên liệu kho)</small>
                        </div>
                    </div>

                    <div class="staff-stats-grid">
                        <div class="staff-tile">
                            <small>Đang làm việc:</small>
                            <strong>${state.staffCount} Nhân viên</strong>
                        </div>
                        <div class="staff-tile">
                            <small>Dòng tiền thụ động:</small>
                            <strong class="income-val">+${(state.staffCount * STAFF_CONFIG.passiveIncomePerCycle).toLocaleString('vi-VN')}đ / 15s</strong>
                        </div>
                    </div>

                    <div class="tycoon-upgrade-box compact">
                        <div class="upgrade-next-info">
                            <span>Tuyển thêm 1 nhân viên Onigiri</span>
                            <small>Mang về thêm <strong>+12.000đ đều đặn mỗi 15 giây</strong></small>
                        </div>
                        <button type="button" class="btn-tycoon-upgrade ${canAffordStaff ? '' : 'disabled'}" id="btnHireStaff" ${canAffordStaff ? '' : 'disabled'}>
                            ${canAffordStaff ? `Tuyển Dụng (${staffPrice.toLocaleString('vi-VN')}đ)` : `Thiếu ${(staffPrice - state.money).toLocaleString('vi-VN')}đ`}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const btnClose = document.getElementById('btnClosePhone');
        if (btnClose) btnClose.onclick = () => this.close();

        const homeBar = document.getElementById('phoneHomeBar');
        if (homeBar) homeBar.onclick = () => this.close();

        const backdrop = document.getElementById('phoneBackdrop');
        if (backdrop) {
            backdrop.onclick = (e) => {
                if (e.target === backdrop) this.close();
            };
        }

        // Chuyển đổi giữa 3 tab
        const tabBtns = this.container.querySelectorAll('.phone-tab-btn');
        tabBtns.forEach(btn => {
            btn.onclick = () => {
                audio.playClick();
                this.activeTab = btn.dataset.tab;
                this.render();
            };
        });

        // Bắt đầu hoặc nhận lại NV3
        const btnStartNV3 = document.getElementById('btnStartNV3');
        if (btnStartNV3) btnStartNV3.onclick = () => this.startOrResetNV3();

        const btnRetryNV3 = document.getElementById('btnRetryNV3');
        if (btnRetryNV3) btnRetryNV3.onclick = () => this.startOrResetNV3();

        // Nhận thưởng các nhiệm vụ chính
        const claimBtns = this.container.querySelectorAll('.btn-quest-claim');
        claimBtns.forEach(btn => {
            btn.onclick = () => {
                const qid = btn.dataset.qid;
                this.claimQuest(qid);
            };
        });

        // Xử lý cuộc gọi đơn hàng gấp ngẫu nhiên GTA
        const btnAcceptCall = document.getElementById('btnAcceptCall');
        if (btnAcceptCall && this.incomingCall) {
            btnAcceptCall.onclick = () => {
                audio.playClick();
                this.activeSideQuest = {
                    ...this.incomingCall,
                    startTime: Date.now()
                };
                this.incomingCall = null;
                this.updateNotificationBadge();
                this.render();
            };
        }

        const btnDeclineCall = document.getElementById('btnDeclineCall');
        if (btnDeclineCall) {
            btnDeclineCall.onclick = () => {
                audio.playClick();
                this.incomingCall = null;
                this.updateNotificationBadge();
                this.render();
            };
        }

        // Nút giao đơn phụ GTA khi đến địa điểm
        const btnDeliverSQ = document.getElementById('btnDeliverSQ');
        if (btnDeliverSQ && !btnDeliverSQ.disabled) {
            btnDeliverSQ.onclick = () => {
                this.deliverSideQuest();
            };
        }

        // Nâng cấp & Chọn phương tiện
        const buyVehBtns = this.container.querySelectorAll('.btn-veh-action.buy');
        buyVehBtns.forEach(btn => {
            btn.onclick = () => {
                if (state.buyNextVehicle()) {
                    audio.playLevelUp();
                    this.render();
                } else {
                    audio.playError();
                }
            };
        });

        const equipVehBtns = this.container.querySelectorAll('.btn-veh-action.equip');
        equipVehBtns.forEach(btn => {
            btn.onclick = () => {
                const vid = btn.dataset.vid;
                if (state.unlockedVehicles.includes(vid)) {
                    state.currentVehicle = vid;
                    audio.playClick();
                    state.save();
                    state.notify();
                    this.render();
                }
            };
        });

        // Nâng cấp Xưởng Bếp - Nhánh 1: Thủ Công
        const btnUpgradeKitchenManual = document.getElementById('btnUpgradeKitchenManual') || document.getElementById('btnUpgradeKitchen');
        if (btnUpgradeKitchenManual && !btnUpgradeKitchenManual.disabled) {
            btnUpgradeKitchenManual.onclick = () => {
                if (state.upgradeKitchenManual()) {
                    audio.playLevelUp();
                    this.render();
                } else {
                    audio.playError();
                }
            };
        }

        // Nâng cấp Xưởng Bếp - Nhánh 2: Dây Chuyền Tự Động
        const btnUpgradeKitchenAuto = document.getElementById('btnUpgradeKitchenAuto');
        if (btnUpgradeKitchenAuto && !btnUpgradeKitchenAuto.disabled) {
            btnUpgradeKitchenAuto.onclick = () => {
                if (state.upgradeKitchenAuto()) {
                    audio.playLevelUp();
                    this.render();
                } else {
                    audio.playError();
                }
            };
        }

        // Chuyển Cơm từ Kho Xưởng sang Thùng Xe
        const btnTransferStock = document.getElementById('btnTransferKitchenStock');
        if (btnTransferStock && !btnTransferStock.disabled) {
            btnTransferStock.onclick = () => {
                const count = state.transferKitchenStockToVehicle();
                if (count > 0) {
                    audio.playClick();
                    sellingManager.showToast(`🎒 Đã chuyển +${count} nắm cơm từ xưởng vào thùng xe!`);
                    this.render();
                } else {
                    audio.playError();
                }
            };
        }

        // Thanh lý cơm cũ (<40% tươi)
        const btnDiscard = document.getElementById('btnDiscardSpoiled');
        if (btnDiscard) {
            btnDiscard.onclick = () => {
                const discarded = state.discardSpoiledRice(40);
                if (discarded > 0) {
                    audio.playClick();
                    sellingManager.showToast(`🗑️ Đã thanh lý ${discarded} nắm cơm không đạt chuẩn ATVSTP!`);
                    this.render();
                } else {
                    sellingManager.showToast('✨ Kho không có cơm cũ hỏng, 100% đạt chuẩn ATVSTP!');
                }
            };
        }

        // Mở khóa Chi Nhánh Liên Tỉnh
        const unlockBranchBtns = this.container.querySelectorAll('.btn-unlock-branch');
        unlockBranchBtns.forEach(btn => {
            btn.onclick = () => {
                const bid = btn.dataset.bid;
                if (state.unlockBranch(bid)) {
                    audio.playLevelUp();
                    const cfg = BRANCH_CONFIGS[bid];
                    sellingManager.showToast(`🎉 Chúc mừng bạn đã khai trương ${cfg ? cfg.name : 'Chi Nhánh Mới'}!`);
                    this.render();
                } else {
                    audio.playError();
                }
            };
        });

        // Nâng cấp Chi Nhánh Liên Tỉnh
        const upgradeBranchBtns = this.container.querySelectorAll('.btn-upgrade-branch');
        upgradeBranchBtns.forEach(btn => {
            btn.onclick = () => {
                const bid = btn.dataset.bid;
                if (state.upgradeBranch(bid)) {
                    audio.playLevelUp();
                    const cfg = BRANCH_CONFIGS[bid];
                    const curLvl = state.branches[bid] ? state.branches[bid].level : 1;
                    sellingManager.showToast(`⭐ ${cfg ? cfg.name : 'Chi Nhánh'} đã nâng cấp lên Cấp ${curLvl}!`);
                    this.render();
                } else {
                    audio.playError();
                }
            };
        });

        // Di chuyển tới thành phố chi nhánh (Dịch chuyển bản đồ)
        const travelCityBtns = this.container.querySelectorAll('.btn-travel-city');
        travelCityBtns.forEach(btn => {
            btn.onclick = () => {
                const targetCity = btn.dataset.travelCity;
                if (window.game && typeof window.game.switchCity === 'function') {
                    window.game.switchCity(targetCity);
                } else if (typeof state.switchCity === 'function') {
                    state.switchCity(targetCity);
                }
                audio.playClick();
                this.render();
            };
        });

        // Nút Hủy đơn hỏa tốc
        const btnCancelExpress = document.getElementById('btnCancelExpress');
        if (btnCancelExpress) {
            btnCancelExpress.onclick = () => {
                deliveryManager.cancelOrder(false);
                sellingManager.showToast('🛑 Đã hủy đơn giao hỏa tốc.');
                this.render();
            };
        }

        // Nút Đổi danh sách đơn hỏa tốc
        const btnRefreshOrders = document.getElementById('btnRefreshOrders');
        if (btnRefreshOrders) {
            btnRefreshOrders.onclick = () => {
                deliveryManager.refreshAvailableOrders();
                audio.playClick();
                this.render();
            };
        }

        // Nút Nhận đơn hỏa tốc
        const acceptExpBtns = this.container.querySelectorAll('.btn-accept-express');
        acceptExpBtns.forEach(btn => {
            btn.onclick = () => {
                const oid = btn.dataset.oid;
                if (deliveryManager.acceptOrder(oid)) {
                    sellingManager.showToast('⚡ Đã nhận đơn hỏa tốc 60s! Hãy lái xe theo mũi tên chỉ đường!');
                    this.close(); // Đóng điện thoại để người chơi lái xe
                }
            };
        });

        // Thuê Nhân viên AI
        const btnHireStaff = document.getElementById('btnHireStaff');
        if (btnHireStaff && !btnHireStaff.disabled) {
            btnHireStaff.onclick = () => {
                if (state.hireStaff()) {
                    audio.playLevelUp();
                    this.render();
                } else {
                    audio.playError();
                }
            };
        }

        // Bàn giao Hợp Đồng Đặt Tiệc Lớn
        const deliverContractBtns = this.container.querySelectorAll('.btn-contract-deliver');
        deliverContractBtns.forEach(btn => {
            btn.onclick = () => {
                const cid = btn.dataset.cid;
                if (!cid) return;
                const res = state.deliverContract(cid);
                if (res.success) {
                    audio.playLevelUp();
                    audio.playTingComplete();
                    sellingManager.showToast(`🎉 Bàn giao thành công tiệc ${res.contract.title}! Nhận +${res.finalMoney.toLocaleString('vi-VN')}đ & +${res.finalExp} EXP!`);
                    this.render();
                } else {
                    audio.playError();
                    const reasonMsg = res.details ? res.details.join(', ') : 'Chưa đáp ứng đủ yêu cầu hợp đồng!';
                    sellingManager.showToast(`⚠️ Không thể giao: ${reasonMsg}`);
                }
            };
        });

        // Đổi danh sách hợp đồng tiệc
        const btnRefreshContracts = document.getElementById('btnRefreshContracts');
        if (btnRefreshContracts) {
            btnRefreshContracts.onclick = () => {
                state.generateContracts();
                audio.playClick();
                sellingManager.showToast('🔄 Đã làm mới 3 Hợp Đồng Đặt Tiệc mới!');
                this.render();
            };
        }

        // Kích hoạt Buff Thành Tựu
        const claimAchBtns = this.container.querySelectorAll('.btn-claim-achievement');
        claimAchBtns.forEach(btn => {
            btn.onclick = () => {
                const aid = btn.dataset.aid;
                if (!aid) return;
                const res = state.claimAchievement(aid);
                if (res.success) {
                    audio.playLevelUp();
                    audio.playTingComplete();
                    sellingManager.showToast(`🏅 Kích hoạt danh hiệu "${res.achievement.title}": ${res.achievement.buffText}!`);
                    this.render();
                } else {
                    audio.playError();
                }
            };
        });

        // Gắn sự kiện Sub-tab Cộng Đồng Online
        if (this.activeTab === 'online') {
            onlineUI.bindTabEvents(this.container);
        }
    }
}
