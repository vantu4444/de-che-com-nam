// src/kitchenASMR.js - Popup toàn màn hình Bếp ASMR: Menu 15 vị, lọc theo 3 nhóm giá, kiểm tra sức chứa thùng xe & tiêu hao nguyên liệu

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

        // Bước 1: Giữ chuột múc cơm & thanh lực
        this.isHoldingPower = false;
        this.power = 0;
        this.powerDirection = 1;
        this.powerInterval = null;
        this.step1Score = 3; // 3 đến 5 sao

        // Bước 2: Nhấn 3 lần ép khuôn
        this.pressCount = 0;
        this.pressCooldown = false;

        // Bước 3: Vuốt bọc rong biển
        this.swipeStartX = 0;
        this.isSwiping = false;
        this.wrapped = false;
    }

    open() {
        this.step = 1;
        this.power = 0;
        this.isHoldingPower = false;
        this.pressCount = 0;
        this.wrapped = false;
        
        // Đảm bảo vị được chọn hợp lệ
        if (!FILLINGS[this.selectedFilling]) {
            this.selectedFilling = 'crab_egg_mayo';
        }

        this.container.classList.remove('hidden');
        this.render();
    }

    close() {
        if (this.powerInterval) {
            clearInterval(this.powerInterval);
            this.powerInterval = null;
        }
        window.onmousemove = null;
        window.onmouseup = null;
        window.ontouchmove = null;
        window.ontouchend = null;
        window.ontouchcancel = null;
        this.container.classList.add('hidden');
        if (this.onClose) this.onClose();
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
                    <!-- Header -->
                    <div class="kitchen-topbar">
                        <div class="kitchen-heading">
                            <span class="kitchen-tag">BẾP ASMR CẬN CẢNH</span>
                            <h2>Nấu Cơm Nắm Tam Giác • Menu 15 Vị</h2>
                        </div>
                        <div class="kitchen-topbar-stats">
                            <span class="stat-badge">🎒 Thùng xe: ${currentRice} / ${maxCap}</span>
                            <span class="stat-badge">🌾 Gạo: ${state.ingredients.rice_seaweed}</span>
                            <span class="stat-badge">🥩 Thịt: ${state.ingredients.meat_seafood}</span>
                            <span class="stat-badge">🧀 Sốt: ${state.ingredients.cheese_sauce}</span>
                        </div>
                        <button type="button" class="btn-exit-kitchen" id="btnExitKitchen">✕ Rời Bếp</button>
                    </div>

                    <!-- Bộ lọc nhanh 3 nhóm giá bán lẻ & Danh sách 15 vị nhân -->
                    <div class="fillings-selector">
                        <div class="selector-header-row">
                            <span class="selector-label">Chọn nhân (Menu 15 vị):</span>
                            <div class="price-filter-tabs">
                                <button type="button" class="btn-filter-tab ${this.priceFilter === 'all' ? 'active' : ''}" data-filter="all">Tất cả (15)</button>
                                <button type="button" class="btn-filter-tab ${this.priceFilter === '20k' ? 'active' : ''}" data-filter="20k">20.000đ (11)</button>
                                <button type="button" class="btn-filter-tab ${this.priceFilter === '22k' ? 'active' : ''}" data-filter="22k">22.000đ (3)</button>
                                <button type="button" class="btn-filter-tab ${this.priceFilter === '25k' ? 'active' : ''}" data-filter="25k">25.000đ (1)</button>
                            </div>
                        </div>

                        <div class="fillings-options">
                            ${displayedFillings.map(f => `
                                <button type="button" class="btn-filling-tab ${f.id === this.selectedFilling ? 'active' : ''}" data-fid="${f.id}" title="${f.desc}">
                                    <span class="f-icon">${f.icon}</span>
                                    <span class="f-name">${f.name}</span>
                                    <span class="f-price-tag">${f.price.toLocaleString('vi-VN')}đ</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Thanh bám bước 1 -> 2 -> 3 -->
                    <div class="step-breadcrumbs">
                        <div class="step-chip ${this.step === 1 ? 'current' : this.step > 1 ? 'done' : ''}">
                            <span>1</span> Múc cơm & Canh lực
                        </div>
                        <div class="chip-divider">➔</div>
                        <div class="step-chip ${this.step === 2 ? 'current' : this.step > 2 ? 'done' : ''}">
                            <span>2</span> Nhấn ép 3 lần
                        </div>
                        <div class="chip-divider">➔</div>
                        <div class="step-chip ${this.step === 3 ? 'current' : this.step > 3 ? 'done' : ''}">
                            <span>3</span> Vuốt bọc rong biển
                        </div>
                    </div>

                    <!-- Vùng tương tác chính -->
                    <div class="kitchen-arena">
                        ${content}
                    </div>

                    <!-- Linh vật thương hiệu đồng hành trong Bếp ASMR -->
                    <div class="kitchen-mascot-box ${this.step === 4 && this.step1Score === 5 ? 'celebrate-jump' : ''}">
                        ${this.step === 4 && this.step1Score === 5 ? '<div class="mascot-speech-bubble">🎉 5 SAO TUYỆT PHẨM!</div>' : ''}
                        <img src="assets/linh_vat_1.JPG" alt="Linh vật Onigiri" class="kitchen-mascot-img" onerror="this.style.display='none';">
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    // --- BƯỚC 1: CHẠM & GIỮ NGÓN TAY MÚC CƠM & DỪNG TRONG VÙNG XANH ---
    renderStep1(filling, isFull, hasIngredients, currentRice, maxCap, batchSize) {
        let warningHtml = '';
        let disabledAttr = '';
        let btnText = '👆 CHẠM & GIỮ NGÓN TAY ĐỂ MÚC CƠM';

        if (isFull) {
            warningHtml = `
                <div class="kitchen-alert-box alert-error">
                    🚨 <strong>THÙNG XE ĐÃ ĐẦY (${currentRice} / ${maxCap} NẮM)!</strong><br>
                    Không thể lấy thêm cơm từ Xưởng ra xe. Vui lòng mang cơm đi bán hoặc nâng cấp phương tiện trong iGiri Phone!
                </div>
            `;
            disabledAttr = 'disabled';
            btnText = `❌ THÙNG XE ĐÃ ĐẦY (${currentRice}/${maxCap} NẮM)`;
        } else if (!hasIngredients) {
            warningHtml = `
                <div class="kitchen-alert-box alert-warning">
                    ⚠️ <strong>HẾT NGUYÊN LIỆU NẤU CƠM!</strong><br>
                    Mỗi lần nấu cần ${batchSize} phần mỗi loại nguyên liệu. Bạn đang thiếu nguyên liệu.<br>
                    Hãy ghé <strong>Chợ Đầu Mối</strong> (đến cổng chợ và nhấn E) để nhập thêm các gói nguyên liệu!
                </div>
            `;
            disabledAttr = 'disabled';
            btnText = '❌ THIẾU NGUYÊN LIỆU (GHÉ CHỢ ĐẦU MỐI ĐỂ NHẬP)';
        }

        return `
            <div class="step-content animate-fade">
                ${warningHtml}

                <div class="step-instruction">
                    <h3>Bước 1: Chạm & Giữ ngón tay để múc cơm & nhân ${filling.name} (${filling.price.toLocaleString('vi-VN')}đ)</h3>
                    <p>Chạm giữ ngón tay (hoặc chuột) vào nút bên dưới để thanh lực tăng dần. <strong>Thả ngón tay đúng vùng XANH LÁ</strong> để cơm dẻo đạt chuẩn ISO & ATVSTP!</p>
                </div>

                <div class="power-gauge-wrapper">
                    <div class="power-gauge-track">
                        <!-- Vùng xanh lý tưởng từ 65% đến 85% -->
                        <div class="power-gauge-target"></div>
                        <div class="power-gauge-bar" id="powerGaugeBar" style="width: ${this.power}%;"></div>
                    </div>
                    <div class="gauge-labels">
                        <span>0% (Thiếu)</span>
                        <span class="target-label">🎯 VÙNG CHUẨN (65% - 85%)</span>
                        <span>100% (Quá tay)</span>
                    </div>
                </div>

                <div class="mold-visual-step1">
                    <div class="mold-wood-box">
                        <div class="rice-fill-preview" style="height: ${this.power}%; background: ${filling.color}22;">
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

    // --- BƯỚC 2: NHẤN NHỊP NHÀNG 3 LẦN ĐỂ ÉP KHUÔN ---
    renderStep2(filling) {
        return `
            <div class="step-content animate-fade">
                <div class="step-instruction">
                    <h3>Bước 2: Nhấn nhịp nhàng 3 lần để ép khuôn chặt</h3>
                    <p>Mỗi lần nhấn sẽ nén chặt cơm tam giác. Tiến độ: <strong>${this.pressCount} / 3 lần</strong></p>
                </div>

                <div class="press-mold-arena">
                    <div class="press-cap ${this.pressCount > 0 ? 'cap-pressed' : ''}">
                        <div class="cap-handle"></div>
                        <div class="cap-plate">NẮP ÉP TAM GIÁC</div>
                    </div>
                    <div class="press-base">
                        <div class="triangle-rice-blob" style="border-bottom-color: ${filling.color};"></div>
                    </div>
                </div>

                <button type="button" class="btn-press-action" id="btnPressMold">
                    💥 NHẤN ÉP KHUÔN (${this.pressCount}/3)
                </button>
            </div>
        `;
    }

    // --- BƯỚC 3: VUỐT CHUỘT QUA LÁ RONG BIỂN ĐỂ BỌC KÍN ---
    renderStep3(filling) {
        return `
            <div class="step-content animate-fade">
                <div class="step-instruction">
                    <h3>Bước 3: Vuốt chuột qua lá rong biển để bọc kín</h3>
                    <p>Nhấp giữ và <strong>vuốt chuột ngang sang phải</strong> qua lá rong biển Nori giòn rụm!</p>
                </div>

                <div class="wrap-workbench" id="wrapBench">
                    <div class="nori-flat-sheet ${this.wrapped ? 'nori-folded' : ''}">
                        <div class="onigiri-tri-core" style="border-bottom-color: #f8fafc;">
                            <span class="onigiri-core-icon">${filling.icon}</span>
                        </div>
                    </div>
                    <div class="swipe-hint-arrow ${this.wrapped ? 'hidden' : ''}">
                        👉 Vuốt chuột từ trái sang phải tại đây
                    </div>
                </div>

                <div class="wrap-status-text">
                    ${this.wrapped ? '✓ Đã bọc kín hoàn hảo!' : 'Đang chờ vuốt bọc...'}
                </div>
            </div>
        `;
    }

    // --- MÀN HÌNH THÀNH PHẨM & CỘNG EXP ---
    renderResult(filling, currentRice, maxCap) {
        const starsText = '⭐'.repeat(this.step1Score);
        const batchSize = this.lastCookCount || state.getKitchenBatchSize();
        const curTierCfg = KITCHEN_MANUAL_TIERS[state.kitchenManualTier || state.kitchenTier || 1];
        const tierName = curTierCfg ? curTierCfg.name : 'Nồi Cơm Điện';
        return `
            <div class="step-content animate-pop">
                <div class="result-banner">
                    <!-- Con dấu chứng nhận ISO & ATVSTP phát sáng vàng kim -->
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
                    <p class="result-desc">${filling.desc}</p>
                    
                    <div class="result-reward-badges">
                        <span class="badge-item">+${batchSize} Cơm vào thùng xe (${tierName})</span>
                        <span class="badge-item">Kho xe hiện tại: ${state.getTotalRiceCount()} / ${maxCap} nắm</span>
                        <span class="badge-item">+${this.step1Score * 10 * batchSize} EXP Bếp</span>
                    </div>

                    <div class="result-actions-row">
                        <button type="button" class="btn-cook-more" id="btnCookMore">🍙 Làm Thêm Mẻ Nữa</button>
                        <button type="button" class="btn-finish-kitchen" id="btnFinishKitchen">🚶 Ra Phố Bán Cơm</button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Nút thoát bếp
        const btnExit = document.getElementById('btnExitKitchen');
        if (btnExit) btnExit.onclick = () => {
            audio.playClick();
            this.close();
        };

        // Chuyển tab lọc giá bán lẻ
        const filterBtns = this.container.querySelectorAll('.btn-filter-tab');
        filterBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                audio.playClick();
                this.priceFilter = btn.dataset.filter;
                // Nếu vị hiện tại không nằm trong bộ lọc mới, chọn vị đầu tiên của bộ lọc
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

        // Chuyển vị nhân (chỉ cho phép ở Bước 1)
        if (this.step === 1) {
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
        }

        // --- Xử lý Bước 1: Nhấn giữ chuột để múc cơm ---
        const btnHold = document.getElementById('btnHoldScoop');
        if (btnHold && this.step === 1 && !btnHold.disabled) {
            const startHold = (e) => {
                if (e) e.preventDefault();
                audio.resume();
                if (this.isHoldingPower) return;
                this.isHoldingPower = true;
                audio.playScoopRice(); // Âm thanh xào xạc múc cơm

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

                // Tính điểm sao dựa trên độ chính xác
                // Vùng xanh lý tưởng: 65% đến 85% -> 5 sao
                // Vùng 50-65 hoặc 85-95 -> 4 sao
                // Còn lại -> 3 sao
                if (this.power >= 65 && this.power <= 85) {
                    this.step1Score = 5;
                } else if ((this.power >= 50 && this.power < 65) || (this.power > 85 && this.power <= 95)) {
                    this.step1Score = 4;
                } else {
                    this.step1Score = 3;
                }

                // Chuyển sang Bước 2
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
                audio.playRiceMolding(); // Tiếng nén cơm

                const cap = this.container.querySelector('.press-cap');
                if (cap) cap.classList.add('active-slam');

                setTimeout(() => {
                    if (cap) cap.classList.remove('active-slam');
                    this.pressCooldown = false;

                    if (this.pressCount >= 3) {
                        // Đủ 3 lần, chuyển Bước 3
                        setTimeout(() => {
                            this.step = 3;
                            this.render();
                        }, 250);
                    } else {
                        btnPress.innerText = `💥 NHẤN ÉP KHUÔN (${this.pressCount}/3)`;
                    }
                }, 160);
            };

            btnPress.onclick = handlePress;
            btnPress.ontouchend = handlePress;
        }

        // --- Xử lý Bước 3: Vuốt chuột hoặc vuốt ngón tay bọc rong biển ---
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

                    audio.playSeaweedCrisp(); // Tiếng sột soạt giòn rụm của rong biển

                    const nori = this.container.querySelector('.nori-flat-sheet');
                    if (nori) nori.classList.add('nori-folded');

                    // Hoàn thành: Tiêu hao nguyên liệu và cộng cơm vào inventory theo batchSize của xưởng bếp
                    setTimeout(() => {
                        const batchSize = state.getKitchenBatchSize();
                        // Tiêu hao nguyên liệu
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
                        
                        // Âm thanh hoàn thành & xèo xèo ấm nóng
                        audio.playTingComplete();
                        audio.playSizzleHotKitchen();

                        // Phản hồi xúc giác rung nhẹ trên thiết bị cảm ứng Mobile / iPad
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

        // --- Xử lý Thành Phẩm ---
        const btnCookMore = document.getElementById('btnCookMore');
        const btnFinish = document.getElementById('btnFinishKitchen');
        if (btnCookMore) {
            btnCookMore.onclick = () => {
                audio.playClick();
                this.open();
            };
        }
        if (btnFinish) {
            btnFinish.onclick = () => {
                audio.playClick();
                this.close();
            };
        }
    }
}
