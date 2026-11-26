// src/kitchenASMR.js - Kho Bếp Cơm Nắm & Vườn Nguyên Liệu Sạch Chuẩn Studio
// Tích hợp: 1) Dây Chuyền Bếp Hàng Đợi (Queue Timer 20s/45s/90s), 2) Khu Vườn Nguyên Liệu Sạch (45s/60s/180s), 3) Mở Khóa 15 Vị Chuẩn ISO
import { state, FILLINGS, FARM_CROPS, KITCHEN_MANUAL_TIERS, resolveFillingId } from './state.js';
import { audio } from './audio.js';

export class KitchenASMR {
    constructor(modalContainer, onCloseCallback) {
        this.container = modalContainer;
        this.onClose = onCloseCallback;

        // Trạng thái tab chính: 'kitchen' (Dây chuyền bếp nấu) | 'farm' (Khu vườn nguyên liệu sạch)
        this.activeTab = 'kitchen';

        // Trạng thái Bếp
        this.selectedFilling = 'crab_egg_mayo';
        this.priceFilter = 'all'; // 'all' | '20k' | '22k' | '25k'
        this.step = 1; // 1: Chuẩn bị/chọn vị/hàng đợi, 2: Ép 3 lần mini-game, 3: Vuốt bọc rong biển, 4: Thành phẩm

        // Mini-game thủ công Bước 1: Giữ múc cơm & thanh lực
        this.isHoldingPower = false;
        this.power = 0;
        this.powerDirection = 1;
        this.powerInterval = null;
        this.step1Score = 5;

        // Mini-game thủ công Bước 2: Nhấn 3 lần ép khuôn
        this.pressCount = 0;
        this.pressCooldown = false;

        // Mini-game thủ công Bước 3: Vuốt bọc rong biển
        this.swipeStartX = 0;
        this.isSwiping = false;
        this.wrapped = false;

        // Quản lý thông báo toast & đồng hồ đếm ngược nội bộ
        this.toastMessage = '';
        this.toastTimer = null;
        this.pollTimer = null;

        // Dialog gieo hạt cây trồng
        this.selectedPlotForPlant = null;
    }

    open() {
        this.step = 1;
        this.power = 0;
        this.isHoldingPower = false;
        this.pressCount = 0;
        this.wrapped = false;
        this.toastMessage = '';

        if (!FILLINGS[this.selectedFilling]) {
            this.selectedFilling = 'crab_egg_mayo';
        }

        // Tự động ẩn toàn bộ cụm phím điều khiển ảo bên ngoài
        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls) virtualControls.classList.add('hidden');

        this.container.classList.remove('hidden');
        this.render();

        // Khởi động vòng lặp cập nhật đồng hồ đếm ngược mỗi 500ms khi modal mở
        if (this.pollTimer) clearInterval(this.pollTimer);
        this.pollTimer = setInterval(() => {
            this.updateRealtimeTimers();
        }, 500);
    }

    close() {
        if (this.powerInterval) {
            clearInterval(this.powerInterval);
            this.powerInterval = null;
        }
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
            this.toastTimer = null;
        }
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
        window.onmousemove = null;
        window.onmouseup = null;
        window.ontouchmove = null;
        window.ontouchend = null;
        window.ontouchcancel = null;

        this.container.classList.add('hidden');

        // Phục hồi cụm phím ảo khi quay lại đường phố
        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls) {
            virtualControls.classList.remove('hidden');
        }

        if (this.onClose) this.onClose();
    }

    showToast(msg) {
        this.toastMessage = msg;
        if (this.toastTimer) clearTimeout(this.toastTimer);
        const toastEl = this.container.querySelector('#kitchenToastBanner');
        if (toastEl) {
            toastEl.textContent = msg;
            toastEl.classList.remove('hidden');
            toastEl.classList.add('animate-pop');
        }
        this.toastTimer = setTimeout(() => {
            this.toastMessage = '';
            const tEl = this.container.querySelector('#kitchenToastBanner');
            if (tEl) tEl.classList.add('hidden');
        }, 3200);
    }

    // Cập nhật giao diện đếm ngược theo thời gian thực (không re-render toàn bộ DOM)
    updateRealtimeTimers() {
        const now = Date.now();
        state.updateFarm(now);
        state.updateKitchenSlots(now);

        // 1. Cập nhật các ô bếp nấu đang chạy
        if (Array.isArray(state.kitchenSlots)) {
            state.kitchenSlots.forEach(slot => {
                const el = this.container.querySelector(`[data-slot-timer-id="${slot.id}"]`);
                const progEl = this.container.querySelector(`[data-slot-prog-id="${slot.id}"]`);
                if (el && slot.status === 'cooking' && slot.startTime && slot.durationMs) {
                    const elapsed = now - slot.startTime;
                    const remainingSec = Math.max(0, Math.ceil((slot.durationMs - elapsed) / 1000));
                    el.textContent = `⏳ Đang nấu: ${remainingSec}s`;
                    if (progEl) {
                        const pct = Math.min(100, Math.floor((elapsed / slot.durationMs) * 100));
                        progEl.style.width = pct + '%';
                    }
                    if (remainingSec <= 0) {
                        slot.status = 'ready';
                        audio.playTingComplete();
                        this.render();
                    }
                }
            });
        }

        // 2. Cập nhật các ô đất nông trại đang sinh trưởng
        if (state.farm && Array.isArray(state.farm.plots)) {
            state.farm.plots.forEach(plot => {
                const el = this.container.querySelector(`[data-plot-timer-id="${plot.id}"]`);
                const progEl = this.container.querySelector(`[data-plot-prog-id="${plot.id}"]`);
                if (el && plot.status === 'growing' && plot.plantedTime && plot.durationMs) {
                    const elapsed = now - plot.plantedTime;
                    const remainingSec = Math.max(0, Math.ceil((plot.durationMs - elapsed) / 1000));
                    const mins = Math.floor(remainingSec / 60);
                    const secs = remainingSec % 60;
                    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                    el.textContent = `⏳ ${timeStr}`;
                    if (progEl) {
                        const pct = Math.min(100, Math.floor((elapsed / plot.durationMs) * 100));
                        progEl.style.width = pct + '%';
                    }
                    if (remainingSec <= 0) {
                        plot.status = 'ready';
                        this.render();
                    }
                }
            });
        }
    }

    // ⚡ NẤU NHANH (+1 NẮM): Trừ 1 Gạo + 1 Nhân + 1 Sốt, nấu ngay vị đã mở khóa
    quickCookOne() {
        audio.resume();
        const currentRice = state.getTotalRiceCount();
        const maxCap = state.getMaxCapacity();
        if (currentRice >= maxCap) {
            this.showToast(`🚨 Thùng xe đã đầy (${currentRice}/${maxCap} nắm)! Hãy ra phố bán bớt.`);
            return false;
        }

        const unlockCheck = state.isFillingUnlocked(this.selectedFilling);
        if (!unlockCheck.unlocked) {
            this.showToast(`🔒 Vị này đang bị khóa! ${unlockCheck.reason}`);
            return false;
        }

        if ((state.ingredients.rice_seaweed || 0) < 1 || (state.ingredients.meat_seafood || 0) < 1 || (state.ingredients.cheese_sauce || 0) < 1) {
            this.showToast('⚠️ Hết nguyên liệu! Hãy thu hoạch ở Vườn hoặc ghé Chợ Đầu Mối.');
            return false;
        }

        state.ingredients.rice_seaweed -= 1;
        state.ingredients.meat_seafood -= 1;
        state.ingredients.cheese_sauce -= 1;

        state.addRiceBall(this.selectedFilling, 5);
        state.recordCooked(1);
        state.addExp(50);

        audio.playTingComplete();
        audio.playSizzleHotKitchen();

        try {
            if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                navigator.vibrate(40);
            }
        } catch (e) {}

        const filling = FILLINGS[this.selectedFilling] || FILLINGS.crab_egg_mayo;
        this.showToast(`⚡ Đã nấu nhanh 1 Cơm Nắm ${filling.name} chuẩn ISO 5 sao!`);
        this.render();
        return true;
    }

    // 📦 NẤU ĐẦY THÙNG: Tự động lấp đầy sức chứa xe theo nguyên liệu hiện có
    fillBagCook() {
        audio.resume();
        const currentRice = state.getTotalRiceCount();
        const maxCap = state.getMaxCapacity();
        const spaceLeft = maxCap - currentRice;

        if (spaceLeft <= 0) {
            this.showToast(`🚨 Thùng xe đã đầy (${currentRice}/${maxCap} nắm)! Hãy ra phố bán bớt.`);
            return false;
        }

        const unlockCheck = state.isFillingUnlocked(this.selectedFilling);
        if (!unlockCheck.unlocked) {
            this.showToast(`🔒 Vị này đang bị khóa! ${unlockCheck.reason}`);
            return false;
        }

        const maxByIngredients = Math.min(
            state.ingredients.rice_seaweed || 0,
            state.ingredients.meat_seafood || 0,
            state.ingredients.cheese_sauce || 0
        );

        if (maxByIngredients <= 0) {
            this.showToast('⚠️ Hết nguyên liệu! Hãy thu hoạch ở Vườn hoặc ghé Chợ Đầu Mối.');
            return false;
        }

        const countToCook = Math.min(spaceLeft, maxByIngredients);

        state.ingredients.rice_seaweed -= countToCook;
        state.ingredients.meat_seafood -= countToCook;
        state.ingredients.cheese_sauce -= countToCook;

        for (let i = 0; i < countToCook; i++) {
            state.addRiceBall(this.selectedFilling, 5);
        }

        state.recordCooked(countToCook);
        state.addExp(50 * countToCook);

        audio.playTingComplete();
        audio.playSizzleHotKitchen();

        try {
            if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                navigator.vibrate(60);
            }
        } catch (e) {}

        const filling = FILLINGS[this.selectedFilling] || FILLINGS.crab_egg_mayo;
        this.showToast(`📦 Đã nấu đầy +${countToCook} Cơm Nắm ${filling.name} vào thùng xe!`);
        this.render();
        return true;
    }

    render() {
        const filling = FILLINGS[this.selectedFilling] || FILLINGS.crab_egg_mayo;
        const currentRice = state.getTotalRiceCount();
        const maxCap = state.getMaxCapacity();
        const batchSize = state.getKitchenBatchSize();

        // Đếm số mẻ/cây trồng đã sẵn sàng thu hoạch
        const readyKitchenSlots = (state.kitchenSlots || []).filter(s => s.status === 'ready').length;
        const readyFarmPlots = (state.farm?.plots || []).filter(p => p.status === 'ready').length;

        this.container.innerHTML = `
            <div class="kitchen-fullscreen-backdrop">
                <div class="kitchen-modal-panel">
                    <!-- TẦNG 1: Thanh Tiêu Đề & Kho Nguyên Liệu Gọn Đẹp -->
                    <div class="kitchen-topbar">
                        <div class="kitchen-topbar-left">
                            <span class="kitchen-badge-iso">🍙 XƯỞNG BẾP & NÔNG TRẠI ISO</span>
                            <span class="stat-badge stat-bag">🎒 Túi Giữ Nhiệt: <strong>${currentRice}/${maxCap}</strong></span>
                        </div>
                        <div class="kitchen-topbar-center">
                            <span class="stat-pill">🌾 Gạo/Rong: <strong>${state.ingredients.rice_seaweed || 0}</strong></span>
                            <span class="stat-pill">🥩 Thịt/Nhân: <strong>${state.ingredients.meat_seafood || 0}</strong></span>
                            <span class="stat-pill">🥫 Sốt/Mayo: <strong>${state.ingredients.cheese_sauce || 0}</strong></span>
                        </div>
                        <div class="kitchen-topbar-right">
                            <button type="button" class="btn-exit-kitchen" id="btnExitKitchen">✕ Rời Bếp</button>
                        </div>
                    </div>

                    <!-- THANH CHUYỂN TAB CHÍNH: BẾP NẤU HÀNG ĐỢI VS VƯỜN NGUYÊN LIỆU -->
                    <div class="kitchen-main-tabs-bar">
                        <button type="button" class="btn-main-tab ${this.activeTab === 'kitchen' ? 'active' : ''}" id="tabBtnKitchen">
                            🍙 Bếp Chế Biến & Hàng Đợi ${readyKitchenSlots > 0 ? `<span class="tab-badge-glow">♨️ ${readyKitchenSlots} Mẻ Chín</span>` : ''}
                        </button>
                        <button type="button" class="btn-main-tab ${this.activeTab === 'farm' ? 'active' : ''}" id="tabBtnFarm">
                            🌱 Vườn Nguyên Liệu Sạch ${readyFarmPlots > 0 ? `<span class="tab-badge-glow">✨ ${readyFarmPlots} Chín</span>` : ''}
                        </button>
                    </div>

                    <!-- THÔNG BÁO TRẠNG THÁI NỔI (TOAST BANNER) -->
                    <div class="kitchen-toast-banner ${this.toastMessage ? '' : 'hidden'}" id="kitchenToastBanner">
                        ${this.toastMessage}
                    </div>

                    <!-- NỘI DUNG CHÍNH THEO TAB -->
                    <div class="kitchen-arena">
                        ${this.step === 4
                            ? this.renderResult(filling, currentRice, maxCap)
                            : (this.step === 2
                                ? this.renderStep2(filling)
                                : (this.step === 3
                                    ? this.renderStep3(filling)
                                    : (this.activeTab === 'farm'
                                        ? this.renderFarmTab()
                                        : this.renderKitchenTab(filling, currentRice, maxCap, batchSize))))}
                    </div>

                    <!-- TẦNG 4: Thanh Hành Động Đáy Cố Định -->
                    <div class="kitchen-bottom-action-bar">
                        <button type="button" class="btn-kitchen-action btn-quick-cook" id="btnQuickCook" title="Nấu nhanh 1 nắm cơm không cần chờ">
                            <span class="bka-icon">⚡</span>
                            <span class="bka-text">Nấu Nhanh (+1)</span>
                        </button>
                        <button type="button" class="btn-kitchen-action btn-fill-bag" id="btnFillBag" title="Tự động nấu đầy thùng xe theo nguyên liệu">
                            <span class="bka-icon">📦</span>
                            <span class="bka-text">Nấu Đầy Thùng</span>
                        </button>
                        <button type="button" class="btn-kitchen-action btn-finish-kitchen" id="btnFinishKitchen" title="Quay lại đường phố bán cơm">
                            <span class="bka-icon">🛵</span>
                            <span class="bka-text">Ra Phố Bán Hàng</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    // --- TAB 1: DÂY CHUYỀN BẾP NẤU & HÀNG ĐỢI ---
    renderKitchenTab(filling, currentRice, maxCap, batchSize) {
        const slots = Array.isArray(state.kitchenSlots) ? state.kitchenSlots : [];
        const maxSlots = 4;
        const expandCost = state.getKitchenSlotExpandCost();
        const hasPressUpgrade = Boolean(state.kitchenPressUpgrade);

        // Danh sách 15 vị chuẩn
        const allFillings = Object.values(FILLINGS);
        const displayedFillings = this.priceFilter === 'all'
            ? allFillings
            : allFillings.filter(f => f.priceGroup === this.priceFilter);

        const currentFillingUnlocked = state.isFillingUnlocked(this.selectedFilling);

        return `
            <div class="kitchen-tab-wrapper animate-fade">
                <!-- KHU VỰC 1: DÂY CHUYỀN CÁC Ô BẾP NẤU (HÀNG ĐỢI) -->
                <div class="kitchen-slots-section">
                    <div class="slots-header-row">
                        <div class="slots-title">
                            <h4>🔥 DÂY CHUYỀN Ô BẾP NẤU CƠM HÀNG ĐỢI (${slots.length}/${maxSlots} Ô)</h4>
                            <span class="slots-sub">Thời gian nấu: 20s (vị 20k) • 45s (vị 22k) • 90s (VIP 25k)</span>
                        </div>
                        <div class="slots-upgrades-row">
                            ${slots.length < maxSlots ? `
                                <button type="button" class="btn-slot-upgrade btn-expand-slot" id="btnExpandSlot">
                                    ➕ Mở Thêm Ô Bếp (${expandCost ? expandCost.toLocaleString('vi-VN') + 'đ' : ''})
                                </button>
                            ` : '<span class="upgrade-max-tag">✓ Đã Mở Tối Đa 4 Ô Bếp</span>'}
                            ${!hasPressUpgrade ? `
                                <button type="button" class="btn-slot-upgrade btn-press-upgrade" id="btnUpgradePress" title="Máy ép khuôn bán tự động giảm 40% thời gian chờ nấu">
                                    ⚙️ Máy Ép Khuôn (-40% Thời Gian - 200.000đ)
                                </button>
                            ` : '<span class="upgrade-active-tag">⚡ Máy Ép Trợ Lực (-40% Thời Gian)</span>'}
                        </div>
                    </div>

                    <!-- LƯỚI CÁC Ô BẾP NẤU -->
                    <div class="kitchen-slots-grid">
                        ${slots.map((slot, idx) => {
                            const slotFilling = slot.fillingId ? FILLINGS[slot.fillingId] : null;
                            const isIdle = slot.status === 'idle';
                            const isCooking = slot.status === 'cooking';
                            const isReady = slot.status === 'ready';

                            let cardClass = 'slot-card-idle';
                            if (isCooking) cardClass = 'slot-card-cooking';
                            if (isReady) cardClass = 'slot-card-ready animate-pulse-glow';

                            const now = Date.now();
                            const elapsed = slot.startTime ? (now - slot.startTime) : 0;
                            const remainingSec = slot.durationMs ? Math.max(0, Math.ceil((slot.durationMs - elapsed) / 1000)) : 0;
                            const pct = (slot.durationMs && slot.durationMs > 0) ? Math.min(100, Math.floor((elapsed / slot.durationMs) * 100)) : 0;

                            return `
                                <div class="kitchen-slot-card ${cardClass}">
                                    <div class="ksc-header">
                                        <span class="ksc-num">Ô Bếp #${idx + 1}</span>
                                        ${isReady ? '<span class="badge-iso-hot">♨️ Nóng Hổi Chuẩn ISO & ATVSTP</span>' : ''}
                                    </div>
                                    <div class="ksc-body">
                                        ${isIdle ? `
                                            <div class="ksc-idle-view">
                                                <div class="ksc-icon-idle">🍳</div>
                                                <div class="ksc-idle-text">Bếp Đang Sẵn Sàng</div>
                                                <button type="button" class="btn-start-cook-slot" data-slot-id="${slot.id}">
                                                    🔥 Nấu Mẻ Này (${filling.name})
                                                </button>
                                            </div>
                                        ` : ''}

                                        ${isCooking ? `
                                            <div class="ksc-cooking-view">
                                                <div class="ksc-cooking-icon animate-bounce">${slotFilling?.icon || '🍙'}</div>
                                                <div class="ksc-cooking-name">${slotFilling?.name || 'Cơm Nắm'}</div>
                                                <div class="ksc-timer-text" data-slot-timer-id="${slot.id}">⏳ Đang nấu: ${remainingSec}s</div>
                                                <div class="ksc-progress-bar">
                                                    <div class="ksc-progress-fill" data-slot-prog-id="${slot.id}" style="width: ${pct}%;"></div>
                                                </div>
                                            </div>
                                        ` : ''}

                                        ${isReady ? `
                                            <div class="ksc-ready-view">
                                                <div class="ksc-ready-icon animate-bounce">🍙</div>
                                                <div class="ksc-ready-name">${slotFilling?.name || 'Cơm Nắm'}</div>
                                                <div class="ksc-ready-subtitle">Đã Chín Nóng Hổi 100% Tươi!</div>
                                                <button type="button" class="btn-harvest-slot" data-slot-id="${slot.id}">
                                                    ✨ Thu Hoạch Vào Xe (+${slot.batchSize || 1})
                                                </button>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- KHU VỰC 2: THANH CHỌN 15 VỊ & BỘ LỌC GIÁ BÁN LẺ -->
                <div class="kitchen-selector-tier">
                    <div class="selector-filter-row">
                        <span class="selector-label">Chọn Vị Cho Mẻ Nấu (Menu 15 Vị):</span>
                        <div class="price-filter-chips">
                            <button type="button" class="btn-filter-tab ${this.priceFilter === 'all' ? 'active' : ''}" data-filter="all">Tất cả (15)</button>
                            <button type="button" class="btn-filter-tab ${this.priceFilter === '20k' ? 'active' : ''}" data-filter="20k">20.000đ (11)</button>
                            <button type="button" class="btn-filter-tab ${this.priceFilter === '22k' ? 'active' : ''}" data-filter="22k">22.000đ (3)</button>
                            <button type="button" class="btn-filter-tab ${this.priceFilter === '25k' ? 'active' : ''}" data-filter="25k">25.000đ (1)</button>
                        </div>
                    </div>
                    <div class="fillings-options fillings-scroll-track">
                        ${displayedFillings.map(f => {
                            const isLockedInfo = state.isFillingUnlocked(f.id);
                            const isLocked = !isLockedInfo.unlocked;
                            const isSelected = f.id === this.selectedFilling;
                            return `
                                <button type="button" class="btn-filling-tab btn-filling-card ${isSelected ? 'active' : ''} ${isLocked ? 'is-locked' : ''}" data-fid="${f.id}" title="${f.name}">
                                    <span class="fc-icon f-icon">${f.icon}</span>
                                    <span class="fc-name f-name">${f.name}</span>
                                    <span class="fc-price f-price-tag">${f.price.toLocaleString('vi-VN')}đ</span>
                                    ${isLocked ? `<span class="lock-indicator">🔒 Khóa</span>` : `<span class="open-indicator">✓ Sẵn sàng</span>`}
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- KHU VỰC 3: CHI TIẾT VỊ ĐANG CHỌN HOẶC TRẢI NGHIỆM MINI-GAME THỦ CÔNG -->
                <div class="kitchen-craft-panel">
                    ${!currentFillingUnlocked.unlocked ? `
                        <div class="locked-filling-alert animate-pop">
                            <div class="lfa-icon">🔒</div>
                            <div class="lfa-title">Vị Này Đang Bị Khóa: <strong>${filling.name}</strong></div>
                            <div class="lfa-desc">${currentFillingUnlocked.reason}</div>
                            <div class="lfa-tip">💡 Hãy bán cơm nâng cao Uy Tín và mở rộng Chi Nhánh để mở khóa trọn bộ 15 vị!</div>
                        </div>
                    ` : `
                        <div class="craft-action-box animate-fade">
                            <div class="cab-left">
                                <div class="cab-filling-icon">${filling.icon}</div>
                                <div class="cab-info">
                                    <div class="cab-badge-iso">🛡️ ISO & ATVSTP 100%</div>
                                    <div class="cab-title">Đang chọn: <strong>${filling.name}</strong> (${filling.price.toLocaleString('vi-VN')}đ)</div>
                                    <div class="cab-desc">${filling.desc}</div>
                                    <div class="cab-cook-time">⏱️ Thời gian nấu: <strong>${filling.cookTimeSec || 20}s</strong> ${hasPressUpgrade ? '<span class="text-green">(-40% máy ép: ' + Math.round((filling.cookTimeSec || 20) * 0.6) + 's)</span>' : ''}</div>
                                </div>
                            </div>
                            <div class="cab-right">
                                <button type="button" class="btn-queue-cook-primary" id="btnQueueCookActive">
                                    🔥 Bắt Đầu Nấu Mẻ Này Vào Bếp Trống
                                </button>
                                <button type="button" class="btn-play-asmr-manual" id="btnPlayAsmrManual">
                                    🥣 Nặn Thủ Công (CHẠM & GIỮ Múc Cơm 5 Sao ⭐)
                                </button>
                                <div class="asmr-hint-tag">💡 Hướng dẫn: CHẠM & GIỮ múc cơm, ép 3 lần và bọc rong biển chuẩn ISO 100%</div>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    // --- TAB 2: KHU VƯỜN NGUYÊN LIỆU SẠCH (TỰ CUNG TỰ CẤP) ---
    renderFarmTab() {
        const farm = state.farm || { autoWaterLevel: 0, plots: [] };
        const plots = Array.isArray(farm.plots) ? farm.plots : [];
        const maxPlots = 6;
        const expandCost = state.getFarmPlotExpandCost();
        const hasAutoWater = farm.autoWaterLevel >= 1;

        return `
            <div class="farm-tab-wrapper animate-fade">
                <!-- TIÊU ĐỀ NÔNG TRẠI & NÚT NÂNG CẤP -->
                <div class="farm-top-banner">
                    <div class="ftb-info">
                        <h3>🌱 NÔNG TRẠI NGUYÊN LIỆU SẠCH (TỰ CUNG TỰ CẤP CHUẨN ISO)</h3>
                        <p>Trồng Lúa Nhật (45s), Rong Biển (60s), Trại Gà/Bò/Cá Hồi sạch để chủ động nguồn nguyên liệu 0đ!</p>
                    </div>
                    <div class="ftb-actions">
                        ${plots.length < maxPlots ? `
                            <button type="button" class="btn-farm-upgrade btn-expand-plot" id="btnExpandFarmPlot">
                                ➕ Mở Thêm Ô Đất (${expandCost ? expandCost.toLocaleString('vi-VN') + 'đ' : ''})
                            </button>
                        ` : '<span class="upgrade-max-tag">✓ Đã Mở Tối Đa 6 Ô Đất</span>'}
                        ${!hasAutoWater ? `
                            <button type="button" class="btn-farm-upgrade btn-upgrade-water" id="btnUpgradeAutoWater" title="Tưới tự động giảm 30% thời gian sinh trưởng">
                                💧 Tưới Tự Động (-30% Thời Gian - 120.000đ)
                            </button>
                        ` : '<span class="upgrade-active-tag">💧 Đã Lắp Tưới Tự Động (-30% Time)</span>'}
                    </div>
                </div>

                <!-- LƯỚI CÁC Ô ĐẤT NUÔI TRỒNG (TỐI ĐA 6 Ô) -->
                <div class="farm-plots-grid">
                    ${plots.map((plot, idx) => {
                        const crop = plot.cropKey ? FARM_CROPS[plot.cropKey] : null;
                        const isEmpty = plot.status === 'empty' || !crop;
                        const isGrowing = plot.status === 'growing' && crop;
                        const isReady = plot.status === 'ready' && crop;

                        let plotCardClass = 'plot-empty';
                        if (isGrowing) plotCardClass = 'plot-growing';
                        if (isReady) plotCardClass = 'plot-ready animate-pulse-glow';

                        const now = Date.now();
                        const elapsed = plot.plantedTime ? (now - plot.plantedTime) : 0;
                        const remainingSec = plot.durationMs ? Math.max(0, Math.ceil((plot.durationMs - elapsed) / 1000)) : 0;
                        const mins = Math.floor(remainingSec / 60);
                        const secs = remainingSec % 60;
                        const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                        const pct = (plot.durationMs && plot.durationMs > 0) ? Math.min(100, Math.floor((elapsed / plot.durationMs) * 100)) : 0;

                        return `
                            <div class="farm-plot-card ${plotCardClass}">
                                <div class="fpc-header">
                                    <span class="fpc-num">Ô Đất #${idx + 1}</span>
                                    <span class="fpc-type">${crop ? crop.name : 'Đang Trống'}</span>
                                </div>
                                <div class="fpc-body">
                                    ${isEmpty ? `
                                        <div class="fpc-empty-view">
                                            <div class="fpc-empty-icon">🌱</div>
                                            <div class="fpc-empty-title">Đất Trống Sẵn Sàng</div>
                                            <button type="button" class="btn-plant-action" data-plot-id="${plot.id}">
                                                🌾 Gieo Trồng Cây Mới
                                            </button>
                                        </div>
                                    ` : ''}

                                    ${isGrowing ? `
                                        <div class="fpc-growing-view">
                                            <div class="fpc-crop-icon animate-sway">${crop.icon}</div>
                                            <div class="fpc-crop-name">${crop.name}</div>
                                            <div class="fpc-timer-text" data-plot-timer-id="${plot.id}">⏳ ${timeStr}</div>
                                            <div class="fpc-progress-bar">
                                                <div class="fpc-progress-fill" data-plot-prog-id="${plot.id}" style="width: ${pct}%;"></div>
                                            </div>
                                        </div>
                                    ` : ''}

                                    ${isReady ? `
                                        <div class="fpc-ready-view">
                                            <div class="fpc-ready-icon animate-bounce">${crop.icon}</div>
                                            <div class="fpc-ready-name">${crop.name} Chín Rộ!</div>
                                            <div class="fpc-yield-tag">+${crop.yieldCount} ${crop.yieldType === 'rice_seaweed' ? 'Gạo/Rong' : crop.yieldType === 'meat_seafood' ? 'Thịt/Nhân' : 'Sốt/Mayo'}</div>
                                            <button type="button" class="btn-harvest-crop" data-plot-id="${plot.id}">
                                                ✨ Thu Hoạch Vào Kho Bếp
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- POPUP CHỌN GIỐNG CÂY TRỒNG (NẾU ĐANG CHỌN Ô ĐẤT) -->
                ${this.selectedPlotForPlant ? this.renderPlantModal(this.selectedPlotForPlant) : ''}
            </div>
        `;
    }

    renderPlantModal(plotId) {
        const crops = Object.values(FARM_CROPS);
        const curTier = state.kitchenManualTier || state.kitchenTier || 1;
        const curRep = state.reputation || 100;

        return `
            <div class="plant-modal-overlay animate-fade">
                <div class="plant-modal-card">
                    <div class="pmc-header">
                        <h4>🌱 CHỌN GIỐNG NGUYÊN LIỆU CHO Ô ĐẤT</h4>
                        <button type="button" class="btn-close-plant-modal" id="btnClosePlantModal">✕</button>
                    </div>
                    <div class="pmc-list">
                        ${crops.map(crop => {
                            const isLocked = curTier < crop.reqTier || curRep < crop.reqRep;
                            const durText = crop.durationSec >= 60 ? `${Math.round(crop.durationSec / 60)} phút` : `${crop.durationSec} giây`;
                            return `
                                <div class="crop-select-item ${isLocked ? 'is-crop-locked' : ''}">
                                    <div class="csi-icon">${crop.icon}</div>
                                    <div class="csi-info">
                                        <div class="csi-name">${crop.name} <span class="csi-dur">⏱️ ${durText}</span></div>
                                        <div class="csi-desc">${crop.desc}</div>
                                        ${isLocked ? `<div class="csi-locked-text">🔒 Yêu cầu: Xưởng Cấp ${crop.reqTier} & Uy Tín ${crop.reqRep} ⭐</div>` : ''}
                                    </div>
                                    <div class="csi-action">
                                        ${!isLocked ? `
                                            <button type="button" class="btn-confirm-plant" data-plot-id="${plotId}" data-crop-key="${crop.id}">
                                                Gieo Hạt ${crop.cost > 0 ? `(${crop.cost.toLocaleString('vi-VN')}đ)` : '(0đ Miễn phí)'}
                                            </button>
                                        ` : `
                                            <button type="button" class="btn-confirm-plant btn-disabled" disabled>Chưa Mở</button>
                                        `}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // --- BƯỚC 1 MINI-GAME THỦ CÔNG ---
    renderStep1(filling, isFull, hasIngredients, currentRice, maxCap, batchSize) {
        let warningHtml = '';
        let disabledAttr = '';
        let btnText = '👆 CHẠM & GIỮ ĐỂ MÚC CƠM';

        if (isFull) {
            warningHtml = `
                <div class="kitchen-alert-box alert-error">
                    🚨 <strong>THÙNG XE ĐÃ ĐẦY (${currentRice}/${maxCap} NẮM)!</strong> Bấm <strong>🛵 Ra Phố Bán Hàng</strong> để kinh doanh.
                </div>
            `;
            disabledAttr = 'disabled';
            btnText = `❌ THÙNG XE ĐÃ ĐẦY (${currentRice}/${maxCap})`;
        } else if (!hasIngredients) {
            warningHtml = `
                <div class="kitchen-alert-box alert-warning">
                    ⚠️ <strong>HẾT NGUYÊN LIỆU!</strong> Hãy thu hoạch ở Vườn hoặc ghé <strong>Chợ Đầu Mối</strong>.
                </div>
            `;
            disabledAttr = 'disabled';
            btnText = '❌ THIẾU NGUYÊN LIỆU';
        }

        return `
            <div class="step-content animate-fade">
                ${warningHtml}

                <div class="step-instruction">
                    <div class="iso-mini-badge">🛡️ CHUẨN ISO & ATVSTP 100%</div>
                    <h3>Chế Biến Thủ Công: Cơm Nắm ${filling.name} (${filling.price.toLocaleString('vi-VN')}đ)</h3>
                    <p>Chạm & giữ ngón tay vào nút bên dưới để thanh lực tăng. <strong>Thả đúng vùng XANH LÁ</strong> để cơm dẻo ngon nhất!</p>
                </div>

                <div class="power-gauge-wrapper">
                    <div class="power-gauge-track">
                        <div class="power-gauge-target"></div>
                        <div class="power-gauge-bar" id="powerGaugeBar" style="width: ${this.power}%;"></div>
                    </div>
                    <div class="gauge-labels">
                        <span>0%</span>
                        <span class="target-label">🎯 VÙNG CHUẨN (65% - 85%)</span>
                        <span>100%</span>
                    </div>
                </div>

                <div class="mold-visual-step1">
                    <div class="mold-wood-box">
                        <div class="rice-fill-preview" style="height: ${this.power}%; background: ${filling.color || '#f97316'}22;">
                            <span class="rice-grains">🍚 ${filling.icon}</span>
                        </div>
                    </div>
                </div>

                <button type="button" class="btn-hold-scoop ${disabledAttr ? 'btn-disabled' : ''}" id="btnHoldScoop" ${disabledAttr}>
                    ${btnText}
                </button>
                <div style="margin-top: 10px; text-align: center;">
                    <button type="button" class="btn-back-to-queue" id="btnBackToQueue">← Quay Lại Bếp Hàng Đợi</button>
                </div>
            </div>
        `;
    }

    renderStep2(filling) {
        return `
            <div class="step-content animate-fade">
                <div class="step-instruction">
                    <div class="iso-mini-badge">🛡️ CHUẨN ISO & ATVSTP 100%</div>
                    <h3>Chạm 3 lần để ép khuôn tam giác chặt tay</h3>
                    <p>Mỗi lần chạm sẽ nén chặt cơm. Tiến độ: <strong>${this.pressCount} / 3 lần</strong></p>
                </div>

                <div class="press-mold-arena">
                    <div class="press-cap ${this.pressCount > 0 ? 'cap-pressed' : ''}">
                        <div class="cap-handle"></div>
                        <div class="cap-plate">NẮP ÉP TAM GIÁC</div>
                    </div>
                    <div class="press-base">
                        <div class="triangle-rice-blob" style="border-bottom-color: ${filling.color || '#f97316'};"></div>
                    </div>
                </div>

                <button type="button" class="btn-press-action" id="btnPressMold">
                    💥 CHẠM 3 LẦN ĐỂ ÉP KHUÔN (${this.pressCount}/3)
                </button>
            </div>
        `;
    }

    renderStep3(filling) {
        return `
            <div class="step-content animate-fade">
                <div class="step-instruction">
                    <div class="iso-mini-badge">🛡️ CHUẨN ISO & ATVSTP 100%</div>
                    <h3>Vuốt nhẹ ngón tay sang phải để bọc rong biển</h3>
                    <p>Chạm giữ và <strong>vuốt nhẹ sang phải</strong> qua lá rong biển Nori giòn rụm!</p>
                </div>

                <div class="wrap-workbench" id="wrapBench">
                    <div class="nori-flat-sheet ${this.wrapped ? 'nori-folded' : ''}">
                        <div class="onigiri-tri-core" style="border-bottom-color: #f8fafc;">
                            <span class="onigiri-core-icon">${filling.icon}</span>
                        </div>
                    </div>
                    <div class="swipe-hint-arrow ${this.wrapped ? 'hidden' : ''}">
                        👉 Vuốt ngón tay từ trái sang phải tại đây
                    </div>
                </div>

                <div class="wrap-status-text">
                    ${this.wrapped ? '✓ Đã bọc kín hoàn hảo!' : 'Đang chờ vuốt bọc...'}
                </div>
            </div>
        `;
    }

    renderResult(filling, currentRice, maxCap) {
        const starsText = '⭐'.repeat(this.step1Score);
        const batchSize = this.lastCookCount || state.getKitchenBatchSize();
        const curTierCfg = KITCHEN_MANUAL_TIERS[state.kitchenManualTier || state.kitchenTier || 1];
        const tierName = curTierCfg ? curTierCfg.name : 'Nồi Cơm Điện';

        return `
            <div class="step-content animate-pop">
                <div class="result-banner">
                    <div class="iso-gold-stamp animate-stamp">
                        <span class="stamp-icon">🛡️</span>
                        <span class="stamp-text">CHỨNG NHẬN ISO & ATVSTP 100%</span>
                        <span class="stamp-sub">NGUYÊN LIỆU TƯƠI SẠCH NẤU MỚI MỖI NGÀY</span>
                    </div>

                    <div class="result-stars">${starsText}</div>
                    <h2>TUYỆT TÁC CƠM NẮM RA LÒ!</h2>
                    <div class="result-icon-large">🍙</div>
                    <h3>Cơm Nắm ${filling.name}</h3>
                    <div class="result-price-badge">Giá bán lẻ: ${filling.price.toLocaleString('vi-VN')}đ</div>

                    <div class="result-reward-badges">
                        <span class="badge-item">+${batchSize} Cơm vào thùng xe (${tierName})</span>
                        <span class="badge-item">Kho xe: ${state.getTotalRiceCount()} / ${maxCap} nắm</span>
                        <span class="badge-item">+${this.step1Score * 10 * batchSize} EXP Bếp</span>
                    </div>

                    <div class="result-actions-row">
                        <button type="button" class="btn-cook-more" id="btnCookMore">🍙 Tiếp Tục Nấu Bếp</button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Nút thoát bếp trên Tầng 1
        const btnExit = document.getElementById('btnExitKitchen');
        if (btnExit) btnExit.onclick = () => {
            audio.playClick();
            this.close();
        };

        // Chuyển Tab chính: Bếp nấu vs Vườn nguyên liệu
        const tabKitchen = document.getElementById('tabBtnKitchen');
        if (tabKitchen) {
            tabKitchen.onclick = () => {
                audio.playClick();
                this.activeTab = 'kitchen';
                this.step = 1;
                this.render();
            };
        }

        const tabFarm = document.getElementById('tabBtnFarm');
        if (tabFarm) {
            tabFarm.onclick = () => {
                audio.playClick();
                this.activeTab = 'farm';
                this.render();
            };
        }

        // Chuyển tab lọc giá bán lẻ trên Tầng 2
        const filterBtns = this.container.querySelectorAll('.btn-filter-tab');
        filterBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                audio.playClick();
                this.priceFilter = btn.dataset.filter;
                const allFillings = Object.values(FILLINGS);
                const matched = this.priceFilter === 'all'
                    ? allFillings
                    : allFillings.filter(f => f.priceGroup === this.priceFilter);
                if (matched.length > 0 && !matched.some(f => f.id === this.selectedFilling)) {
                    this.selectedFilling = matched[0].id;
                }
                this.render();
            };
        });

        // Chuyển vị nhân trên Tầng 2
        const fillingBtns = this.container.querySelectorAll('.btn-filling-tab');
        fillingBtns.forEach(btn => {
            btn.onclick = () => {
                const fid = btn.dataset.fid;
                if (FILLINGS[fid]) {
                    audio.playClick();
                    this.selectedFilling = fid;
                    this.render();
                }
            };
        });

        // Nút Tầng 4: ⚡ Nấu Nhanh (+1)
        const btnQuick = document.getElementById('btnQuickCook');
        if (btnQuick) {
            btnQuick.onclick = () => {
                this.quickCookOne();
            };
        }

        // Nút Tầng 4: 📦 Nấu Đầy Thùng
        const btnFill = document.getElementById('btnFillBag');
        if (btnFill) {
            btnFill.onclick = () => {
                this.fillBagCook();
            };
        }

        // Nút Tầng 4: 🛵 Ra Phố Bán Hàng
        const btnFinish = document.getElementById('btnFinishKitchen');
        if (btnFinish) {
            btnFinish.onclick = () => {
                audio.playClick();
                this.close();
            };
        }

        // Nút: Bắt đầu nấu mẻ này vào ô bếp trống
        const btnQueueCook = document.getElementById('btnQueueCookActive');
        if (btnQueueCook) {
            btnQueueCook.onclick = () => {
                audio.playClick();
                // Tìm ô bếp đầu tiên đang idle
                const slots = state.kitchenSlots || [];
                const idleSlot = slots.find(s => s.status === 'idle');
                if (!idleSlot) {
                    this.showToast('⚠️ Tất cả ô bếp đều đang nấu! Hãy chờ hoặc bấm "➕ Mở Thêm Ô Bếp".');
                    return;
                }
                const res = state.startCookingSlot(idleSlot.id, this.selectedFilling);
                if (res.success) {
                    audio.playSizzleHotKitchen();
                    const fillingCfg = FILLINGS[this.selectedFilling];
                    this.showToast(`🔥 Đã đưa mẻ ${fillingCfg.name} vào Ô Bếp #${slots.indexOf(idleSlot) + 1} (chờ ${res.durationSec}s)!`);
                    this.render();
                } else if (res.reason === 'not_enough_ingredients') {
                    this.showToast('⚠️ Hết nguyên liệu! Hãy thu hoạch ở Vườn hoặc ghé Chợ Đầu Mối.');
                } else if (res.reason === 'filling_locked') {
                    this.showToast(`🔒 Vị này đang bị khóa! ${res.details}`);
                }
            };
        }

        // Nút: Bắt đầu nặn thủ công Mini-game ASMR
        const btnPlayAsmr = document.getElementById('btnPlayAsmrManual');
        if (btnPlayAsmr) {
            btnPlayAsmr.onclick = () => {
                audio.playClick();
                const fillingCfg = FILLINGS[this.selectedFilling];
                const currentRice = state.getTotalRiceCount();
                const maxCap = state.getMaxCapacity();
                const batchSize = state.getKitchenBatchSize();
                const hasIngredients = state.hasIngredients(batchSize);

                const arena = this.container.querySelector('.kitchen-arena');
                if (arena) {
                    arena.innerHTML = this.renderStep1(fillingCfg, currentRice >= maxCap, hasIngredients, currentRice, maxCap, batchSize);
                    this.bindStep1Events();
                }
            };
        }

        // Nút: Quay lại hàng đợi bếp từ mini-game thủ công
        const btnBackQueue = document.getElementById('btnBackToQueue');
        if (btnBackQueue) {
            btnBackQueue.onclick = () => {
                audio.playClick();
                this.step = 1;
                this.render();
            };
        }

        // Sự kiện trên từng ô bếp nấu (Bắt đầu nấu trên ô đó hoặc Thu hoạch)
        const startSlotBtns = this.container.querySelectorAll('.btn-start-cook-slot');
        startSlotBtns.forEach(btn => {
            btn.onclick = () => {
                audio.playClick();
                const slotId = btn.dataset.slotId;
                const res = state.startCookingSlot(slotId, this.selectedFilling);
                if (res.success) {
                    audio.playSizzleHotKitchen();
                    const fillingCfg = FILLINGS[this.selectedFilling];
                    this.showToast(`🔥 Đã bắt đầu nấu mẻ ${fillingCfg.name} (chờ ${res.durationSec}s)!`);
                    this.render();
                } else if (res.reason === 'not_enough_ingredients') {
                    this.showToast('⚠️ Hết nguyên liệu! Hãy thu hoạch ở Vườn hoặc ghé Chợ Đầu Mối.');
                } else if (res.reason === 'filling_locked') {
                    this.showToast(`🔒 Vị này đang bị khóa! ${res.details}`);
                }
            };
        });

        const harvestSlotBtns = this.container.querySelectorAll('.btn-harvest-slot');
        harvestSlotBtns.forEach(btn => {
            btn.onclick = () => {
                const slotId = btn.dataset.slotId;
                const res = state.harvestCookingSlot(slotId);
                if (res.success) {
                    audio.playTingComplete();
                    audio.playSizzleHotKitchen();
                    try {
                        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                            navigator.vibrate(50);
                        }
                    } catch (e) {}
                    this.showToast(`♨️ Đã thu hoạch +${res.count} Cơm Nắm ${res.fillingName} nóng hổi vào thùng xe!`);
                    this.render();
                } else if (res.reason === 'bag_full') {
                    this.showToast(`🚨 Thùng xe đã đầy (${res.current}/${res.max})! Hãy ra phố bán bớt rồi thu hoạch.`);
                }
            };
        });

        // Nâng cấp Ô Bếp & Máy Ép
        const btnExpandSlot = document.getElementById('btnExpandSlot');
        if (btnExpandSlot) {
            btnExpandSlot.onclick = () => {
                audio.playClick();
                const res = state.expandKitchenSlot();
                if (res.success) {
                    audio.playTingComplete();
                    this.showToast(`🎉 Mở rộng thành công Ô Bếp mới! Tổng: ${state.kitchenSlots.length} ô bếp.`);
                    this.render();
                } else if (res.reason === 'not_enough_money') {
                    this.showToast(`⚠️ Không đủ tiền mở ô bếp (cần ${res.cost.toLocaleString('vi-VN')}đ)!`);
                }
            };
        }

        const btnUpgradePress = document.getElementById('btnUpgradePress');
        if (btnUpgradePress) {
            btnUpgradePress.onclick = () => {
                audio.playClick();
                const res = state.upgradeKitchenPress();
                if (res.success) {
                    audio.playTingComplete();
                    this.showToast('⚡ Nâng cấp thành công Máy Ép Khuôn Bán Tự Động (-40% thời gian nấu)!');
                    this.render();
                } else if (res.reason === 'not_enough_money') {
                    this.showToast(`⚠️ Không đủ tiền nâng cấp (cần ${res.cost.toLocaleString('vi-VN')}đ)!`);
                }
            };
        }

        // --- CÁC SỰ KIỆN TAB NÔNG TRẠI (FARM) ---
        const btnExpandPlot = document.getElementById('btnExpandFarmPlot');
        if (btnExpandPlot) {
            btnExpandPlot.onclick = () => {
                audio.playClick();
                const res = state.expandFarmPlot();
                if (res.success) {
                    audio.playTingComplete();
                    this.showToast(`🎉 Mở rộng thành công Ô Đất mới! Tổng: ${state.farm.plots.length} ô đất.`);
                    this.render();
                } else if (res.reason === 'not_enough_money') {
                    this.showToast(`⚠️ Không đủ tiền mở ô đất (cần ${res.cost.toLocaleString('vi-VN')}đ)!`);
                }
            };
        }

        const btnUpgradeWater = document.getElementById('btnUpgradeAutoWater');
        if (btnUpgradeWater) {
            btnUpgradeWater.onclick = () => {
                audio.playClick();
                const res = state.upgradeAutoWater();
                if (res.success) {
                    audio.playTingComplete();
                    this.showToast('💧 Đã lắp đặt thành công Hệ Thống Tưới Tự Động (-30% thời gian sinh trưởng)!');
                    this.render();
                } else if (res.reason === 'not_enough_money') {
                    this.showToast(`⚠️ Không đủ tiền lắp tưới nước (cần ${res.cost.toLocaleString('vi-VN')}đ)!`);
                }
            };
        }

        // Mở popup gieo trồng trên ô đất trống
        const plantActionBtns = this.container.querySelectorAll('.btn-plant-action');
        plantActionBtns.forEach(btn => {
            btn.onclick = () => {
                audio.playClick();
                const plotId = btn.dataset.plotId;
                this.selectedPlotForPlant = plotId;
                this.render();
            };
        });

        // Đóng popup gieo trồng
        const btnClosePlant = document.getElementById('btnClosePlantModal');
        if (btnClosePlant) {
            btnClosePlant.onclick = () => {
                audio.playClick();
                this.selectedPlotForPlant = null;
                this.render();
            };
        }

        // Xác nhận gieo giống cây
        const confirmPlantBtns = this.container.querySelectorAll('.btn-confirm-plant');
        confirmPlantBtns.forEach(btn => {
            btn.onclick = () => {
                const plotId = btn.dataset.plotId;
                const cropKey = btn.dataset.cropKey;
                const res = state.plantCrop(plotId, cropKey);
                if (res.success) {
                    audio.playClick();
                    const crop = FARM_CROPS[cropKey];
                    this.showToast(`🌱 Đã gieo trồng thành công ${crop.name}!`);
                    this.selectedPlotForPlant = null;
                    this.render();
                } else if (res.reason === 'not_enough_money') {
                    this.showToast('⚠️ Không đủ tiền mua giống cây!');
                }
            };
        });

        // Thu hoạch cây trồng
        const harvestCropBtns = this.container.querySelectorAll('.btn-harvest-crop');
        harvestCropBtns.forEach(btn => {
            btn.onclick = () => {
                const plotId = btn.dataset.plotId;
                const res = state.harvestPlot(plotId);
                if (res.success) {
                    audio.playTingComplete();
                    try {
                        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                            navigator.vibrate(40);
                        }
                    } catch (e) {}
                    const yName = res.yieldType === 'rice_seaweed' ? 'Gạo & Rong Biển' : res.yieldType === 'meat_seafood' ? 'Thịt & Nhân Tươi' : 'Sốt & Mayonnaise';
                    this.showToast(`🌾 Đã thu hoạch thành công +${res.yieldCount} ${yName} vào kho bếp!`);
                    this.render();
                }
            };
        });
    }

    bindStep1Events() {
        const btnHold = document.getElementById('btnHoldScoop');
        if (btnHold && !btnHold.disabled) {
            const startHold = (e) => {
                if (e) e.preventDefault();
                audio.resume();
                if (this.isHoldingPower) return;
                this.isHoldingPower = true;
                audio.playScoopRice();

                const speedBuff = state.permanentBuffs?.cookSpeed || 0;
                const powerStep = 2.5 * (1 + speedBuff);

                this.powerInterval = setInterval(() => {
                    this.power += powerStep * this.powerDirection;
                    if (this.power >= 100) {
                        this.power = 100;
                        this.powerDirection = -1;
                    } else if (this.power <= 0) {
                        this.power = 0;
                        this.powerDirection = 1;
                    }

                    const bar = document.getElementById('powerGaugeBar');
                    if (bar) bar.style.width = this.power + '%';

                    const fillPreview = this.container.querySelector('.rice-fill-preview');
                    if (fillPreview) fillPreview.style.height = this.power + '%';
                }, 25);
            };

            const stopHold = (e) => {
                if (!this.isHoldingPower) return;
                this.isHoldingPower = false;
                if (this.powerInterval) {
                    clearInterval(this.powerInterval);
                    this.powerInterval = null;
                }

                if (this.power >= 65 && this.power <= 85) {
                    this.step1Score = 5;
                } else if ((this.power >= 50 && this.power < 65) || (this.power > 85 && this.power <= 95)) {
                    this.step1Score = 4;
                } else {
                    this.step1Score = 3;
                }

                setTimeout(() => {
                    const fillingCfg = FILLINGS[this.selectedFilling];
                    const arena = this.container.querySelector('.kitchen-arena');
                    if (arena) {
                        arena.innerHTML = this.renderStep2(fillingCfg);
                        this.bindStep2Events();
                    }
                }, 350);
            };

            btnHold.addEventListener('mousedown', startHold);
            window.addEventListener('mouseup', stopHold);
            btnHold.addEventListener('touchstart', startHold, { passive: false });
            window.addEventListener('touchend', stopHold);
            window.addEventListener('touchcancel', stopHold);
        }

        const btnBackQueue = document.getElementById('btnBackToQueue');
        if (btnBackQueue) {
            btnBackQueue.onclick = () => {
                audio.playClick();
                this.step = 1;
                this.render();
            };
        }
    }

    bindStep2Events() {
        const btnPress = document.getElementById('btnPressMold');
        if (btnPress) {
            const handlePress = (e) => {
                if (e && e.cancelable && e.type === 'touchend') e.preventDefault();
                if (this.pressCooldown) return;
                this.pressCooldown = true;

                this.pressCount += 1;
                audio.playRiceMolding();

                const cap = this.container.querySelector('.press-cap');
                if (cap) cap.classList.add('active-slam');

                setTimeout(() => {
                    if (cap) cap.classList.remove('active-slam');
                    this.pressCooldown = false;

                    if (this.pressCount >= 3) {
                        setTimeout(() => {
                            const fillingCfg = FILLINGS[this.selectedFilling];
                            const arena = this.container.querySelector('.kitchen-arena');
                            if (arena) {
                                arena.innerHTML = this.renderStep3(fillingCfg);
                                this.bindStep3Events();
                            }
                        }, 250);
                    } else {
                        btnPress.innerText = `💥 CHẠM 3 LẦN ĐỂ ÉP KHUÔN (${this.pressCount}/3)`;
                    }
                }, 160);
            };

            btnPress.onclick = handlePress;
            btnPress.ontouchend = handlePress;
        }
    }

    bindStep3Events() {
        const wrapBench = document.getElementById('wrapBench');
        if (wrapBench) {
            const onSwipeStart = (clientX) => {
                audio.resume();
                this.swipeStartX = clientX;
                this.isSwiping = true;
            };

            const onSwipeMove = (clientX) => {
                if (!this.isSwiping || this.wrapped) return;
                const deltaX = clientX - this.swipeStartX;
                if (deltaX >= 75) {
                    this.wrapped = true;
                    this.isSwiping = false;

                    audio.playSeaweedCrisp();

                    const nori = this.container.querySelector('.nori-flat-sheet');
                    if (nori) nori.classList.add('nori-folded');

                    setTimeout(() => {
                        const batchSize = state.getKitchenBatchSize();
                        state.consumeIngredients(batchSize);

                        let actualAdded = 0;
                        for (let i = 0; i < batchSize; i++) {
                            if (state.addRiceBall(this.selectedFilling, this.step1Score)) {
                                actualAdded++;
                            }
                        }
                        this.lastCookCount = actualAdded > 0 ? actualAdded : 1;
                        state.recordCooked(this.lastCookCount);
                        state.addExp(this.step1Score * 10 * this.lastCookCount);

                        audio.playTingComplete();
                        audio.playSizzleHotKitchen();

                        try {
                            if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                                navigator.vibrate(50);
                            }
                        } catch (eVib) {}

                        const fillingCfg = FILLINGS[this.selectedFilling];
                        const arena = this.container.querySelector('.kitchen-arena');
                        if (arena) {
                            arena.innerHTML = this.renderResult(fillingCfg, state.getTotalRiceCount(), state.getMaxCapacity());
                            const btnCookMore = document.getElementById('btnCookMore');
                            if (btnCookMore) {
                                btnCookMore.onclick = () => {
                                    audio.playClick();
                                    this.render();
                                };
                            }
                        }
                    }, 600);
                }
            };

            const onSwipeEnd = () => {
                this.isSwiping = false;
            };

            wrapBench.onmousedown = (e) => onSwipeStart(e.clientX);
            window.onmousemove = (e) => onSwipeMove(e.clientX);
            window.onmouseup = onSwipeEnd;

            wrapBench.ontouchstart = (e) => {
                if (e.cancelable) e.preventDefault();
                if (e.touches && e.touches.length > 0) {
                    onSwipeStart(e.touches[0].clientX);
                }
            };
            window.ontouchmove = (e) => {
                if (this.isSwiping && e.touches && e.touches.length > 0) {
                    if (e.cancelable) e.preventDefault();
                    onSwipeMove(e.touches[0].clientX);
                }
            };
            window.ontouchend = onSwipeEnd;
            window.ontouchcancel = onSwipeEnd;
        }
    }
}
