// src/kitchenASMR.js - Kho Bếp Cơm Nắm Chuẩn Studio: Bố Cục 4 Tầng Gọn Đẹp, Nấu Nhanh & Nấu Đầy Thùng, 100% Không Cắt Nút
import { state, FILLINGS, KITCHEN_MANUAL_TIERS } from './state.js';
import { audio } from './audio.js';

export class KitchenASMR {
    constructor(modalContainer, onCloseCallback) {
        this.container = modalContainer;
        this.onClose = onCloseCallback;

        // Trạng thái Bếp
        this.selectedFilling = 'crab_egg_mayo';
        this.priceFilter = 'all'; // 'all' | '20k' | '22k' | '25k'
        this.step = 1; // 1: Múc cơm & thanh lực, 2: Ép 3 lần, 3: Vuốt bọc rong biển, 4: Thành phẩm

        // Bước 1: Giữ múc cơm & thanh lực
        this.isHoldingPower = false;
        this.power = 0;
        this.powerDirection = 1;
        this.powerInterval = null;
        this.step1Score = 5; // 3 đến 5 sao

        // Bước 2: Nhấn 3 lần ép khuôn
        this.pressCount = 0;
        this.pressCooldown = false;

        // Bước 3: Vuốt bọc rong biển
        this.swipeStartX = 0;
        this.isSwiping = false;
        this.wrapped = false;
        this.toastMessage = '';
        this.toastTimer = null;
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

    // ⚡ NẤU NHANH (+1 NẮM): Trừ đúng 1 Gạo + 1 Nhân + 1 Sốt, không cần chơi mini-game
    quickCookOne() {
        audio.resume();
        const currentRice = state.getTotalRiceCount();
        const maxCap = state.getMaxCapacity();
        if (currentRice >= maxCap) {
            this.showToast(`🚨 Thùng xe đã đầy (${currentRice}/${maxCap} nắm)! Hãy ra phố bán bớt.`);
            return false;
        }

        if ((state.ingredients.rice_seaweed || 0) < 1 || (state.ingredients.meat_seafood || 0) < 1 || (state.ingredients.cheese_sauce || 0) < 1) {
            this.showToast('⚠️ Hết nguyên liệu! Hãy ghé Chợ Đầu Mối để nhập thêm (cần 1 Gạo, 1 Nhân, 1 Sốt).');
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

        const maxByIngredients = Math.min(
            state.ingredients.rice_seaweed || 0,
            state.ingredients.meat_seafood || 0,
            state.ingredients.cheese_sauce || 0
        );

        if (maxByIngredients <= 0) {
            this.showToast('⚠️ Hết nguyên liệu! Hãy ghé Chợ Đầu Mối để nhập thêm.');
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
        this.showToast(`📦 Đã nấu đầy +${countToCook} Cơm Nắm ${filling.name} chuẩn ISO vào thùng xe!`);
        this.render();
        return true;
    }

    render() {
        const filling = FILLINGS[this.selectedFilling] || FILLINGS.crab_egg_mayo;
        const currentRice = state.getTotalRiceCount();
        const maxCap = state.getMaxCapacity();
        const isFull = currentRice >= maxCap;
        const batchSize = state.getKitchenBatchSize();
        const hasIngredients = state.hasIngredients(batchSize);

        let content = '';
        if (this.step === 1) {
            content = this.renderStep1(filling, isFull, hasIngredients, currentRice, maxCap, batchSize);
        } else if (this.step === 2) {
            content = this.renderStep2(filling);
        } else if (this.step === 3) {
            content = this.renderStep3(filling);
        } else if (this.step === 4) {
            content = this.renderResult(filling, currentRice, maxCap);
        }

        // Danh sách 15 vị chuẩn
        const allFillings = Object.values(FILLINGS);
        const displayedFillings = this.priceFilter === 'all'
            ? allFillings
            : allFillings.filter(f => f.priceGroup === this.priceFilter);

        this.container.innerHTML = `
            <div class="kitchen-fullscreen-backdrop">
                <div class="kitchen-modal-panel">
                    <!-- TẦNG 1: Thanh Tiêu Đề & Kho Nguyên Liệu (Cao ~48px, 1 dòng gọn) -->
                    <div class="kitchen-topbar">
                        <div class="kitchen-topbar-left">
                            <span class="kitchen-badge-iso">🍙 KHO BẾP ISO</span>
                            <span class="stat-badge stat-bag">🎒 Thùng: <strong>${currentRice}/${maxCap}</strong></span>
                        </div>
                        <div class="kitchen-topbar-center">
                            <span class="stat-pill">🌾 Gạo: <strong>${state.ingredients.rice_seaweed || 0}</strong></span>
                            <span class="stat-pill">🥩 Nhân: <strong>${state.ingredients.meat_seafood || 0}</strong></span>
                            <span class="stat-pill">🥫 Sốt: <strong>${state.ingredients.cheese_sauce || 0}</strong></span>
                        </div>
                        <div class="kitchen-topbar-right">
                            <button type="button" class="btn-exit-kitchen" id="btnExitKitchen">✕ Rời Bếp</button>
                        </div>
                    </div>

                    <!-- TẦNG 2: Bộ Lọc & Thanh Chọn 15 Vị Cuộn Ngang (Cao ~95px) -->
                    <div class="kitchen-selector-tier">
                        <div class="selector-filter-row">
                            <span class="selector-label">Menu 15 Vị Chuẩn ISO:</span>
                            <div class="price-filter-chips">
                                <button type="button" class="btn-filter-tab ${this.priceFilter === 'all' ? 'active' : ''}" data-filter="all">Tất cả (15)</button>
                                <button type="button" class="btn-filter-tab ${this.priceFilter === '20k' ? 'active' : ''}" data-filter="20k">20.000đ (11)</button>
                                <button type="button" class="btn-filter-tab ${this.priceFilter === '22k' ? 'active' : ''}" data-filter="22k">22.000đ (3)</button>
                                <button type="button" class="btn-filter-tab ${this.priceFilter === '25k' ? 'active' : ''}" data-filter="25k">25.000đ (1)</button>
                            </div>
                        </div>
                        <div class="fillings-options fillings-scroll-track">
                            ${displayedFillings.map(f => `
                                <button type="button" class="btn-filling-tab btn-filling-card ${f.id === this.selectedFilling ? 'active' : ''}" data-fid="${f.id}" title="${f.name}">
                                    <span class="fc-icon f-icon">${f.icon}</span>
                                    <span class="fc-name f-name">${f.name}</span>
                                    <span class="fc-price f-price-tag">${f.price.toLocaleString('vi-VN')}đ</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Thông báo trạng thái nổi (Toast banner) -->
                    <div class="kitchen-toast-banner ${this.toastMessage ? '' : 'hidden'}" id="kitchenToastBanner">
                        ${this.toastMessage}
                    </div>

                    <!-- TẦNG 3: Bàn Chế Biến Trung Tâm (Chiếm phần lớn không gian ở giữa) -->
                    <div class="kitchen-arena">
                        ${content}
                    </div>

                    <!-- TẦNG 4: Thanh Hành Động Đáy Cố Định (Luôn nằm trọn trong vùng an toàn) -->
                    <div class="kitchen-bottom-action-bar">
                        <button type="button" class="btn-kitchen-action btn-quick-cook" id="btnQuickCook" title="Nấu nhanh 1 nắm cơm chuẩn ISO không cần chơi mini-game">
                            <span class="bka-icon">⚡</span>
                            <span class="bka-text">Nấu Nhanh (+1)</span>
                        </button>
                        <button type="button" class="btn-kitchen-action btn-fill-bag" id="btnFillBag" title="Tự động nấu đầy thùng xe theo nguyên liệu hiện có">
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

    // --- BƯỚC 1: CHẠM & GIỮ ĐỂ MÚC CƠM ---
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
                    ⚠️ <strong>HẾT NGUYÊN LIỆU!</strong> Ghé <strong>Chợ Đầu Mối</strong> để nhập thêm Gạo, Nhân, Sốt.
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
                    <h3>Chế Biến: Cơm Nắm ${filling.name} (${filling.price.toLocaleString('vi-VN')}đ)</h3>
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
            </div>
        `;
    }

    // --- BƯỚC 2: CHẠM 3 LẦN ĐỂ ÉP KHUÔN ---
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

    // --- BƯỚC 3: VUỐT NHẸ ĐỂ BỌC RONG BIỂN ---
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

    // --- BƯỚC 4: THÀNH PHẨM & CỘNG EXP ---
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
                        <button type="button" class="btn-cook-more" id="btnCookMore">🍙 Làm Thêm Mẻ Nữa</button>
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

        // Nút Bước 4: Làm Thêm Mẻ Nữa
        const btnCookMore = document.getElementById('btnCookMore');
        if (btnCookMore) {
            btnCookMore.onclick = () => {
                audio.playClick();
                this.open();
            };
        }

        // --- Xử lý Bước 1: Nhấn giữ để múc cơm ---
        const btnHold = document.getElementById('btnHoldScoop');
        if (btnHold && this.step === 1 && !btnHold.disabled) {
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
                    this.step = 2;
                    this.render();
                }, 350);
            };

            btnHold.addEventListener('mousedown', startHold);
            window.addEventListener('mouseup', stopHold);
            btnHold.addEventListener('touchstart', startHold, { passive: false });
            window.addEventListener('touchend', stopHold);
            window.addEventListener('touchcancel', stopHold);
        }

        // --- Xử lý Bước 2: Nhấn ép 3 lần ---
        const btnPress = document.getElementById('btnPressMold');
        if (btnPress && this.step === 2) {
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
                            this.step = 3;
                            this.render();
                        }, 250);
                    } else {
                        btnPress.innerText = `💥 CHẠM 3 LẦN ĐỂ ÉP KHUÔN (${this.pressCount}/3)`;
                    }
                }, 160);
            };

            btnPress.onclick = handlePress;
            btnPress.ontouchend = handlePress;
        }

        // --- Xử lý Bước 3: Vuốt bọc rong biển ---
        const wrapBench = document.getElementById('wrapBench');
        if (wrapBench && this.step === 3) {
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

                        this.step = 4;
                        this.render();
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
