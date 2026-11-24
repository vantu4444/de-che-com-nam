// src/seaweedGame.js - Kiểu chơi 2: Thử Thách Bóc Rong Biển 1-2-3 (8 Giây, Cảm Biến Kéo Chuột & Thưởng VIP x3)

import { state, FILLINGS } from './state.js';
import { audio } from './audio.js';

export class SeaweedGame {
    constructor() {
        this.isOpen = false;
        this.container = null;
        this.timer = 8.0;
        this.timerInterval = null;
        this.filling = null;
        this.onFinishCallback = null;

        // Trạng thái 3 dải bóc: false = chưa bóc, true = đã bóc thành công
        this.strips = {
            1: false, // Dải 1: Kéo thẳng từ đỉnh xuống đáy
            2: false, // Dải 2: Kéo sang phải
            3: false  // Dải 3: Kéo sang trái
        };

        this.isDragging = false;
        this.activeStrip = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.lastDragX = 0;
        this.lastDragY = 0;
        this.lastDragTime = 0;
        this.isFailed = false;
        this.failReason = '';
        this.isSuccess = false;

        this.initDOM();
    }

    initDOM() {
        let el = document.getElementById('seaweedModal');
        if (!el) {
            el = document.createElement('div');
            el.id = 'seaweedModal';
            el.className = 'seaweed-modal-layer hidden';
            document.body.appendChild(el);
        }
        this.container = el;
    }

    // Mở mini-game bóc rong biển với thông tin khách VIP
    open(fillingId = 'melting_beef_cheese', onFinish = null) {
        this.isOpen = true;
        this.filling = FILLINGS[fillingId] || FILLINGS.melting_beef_cheese;
        this.onFinishCallback = onFinish;

        this.timer = 8.0;
        this.strips = { 1: false, 2: false, 3: false };
        this.isDragging = false;
        this.activeStrip = null;
        this.isFailed = false;
        this.failReason = '';
        this.isSuccess = false;

        this.container.classList.remove('hidden');
        this.render();
        this.startTimer();
        audio.playClick();
    }

    close() {
        this.isOpen = false;
        this.stopTimer();
        if (this.container) {
            this.container.classList.add('hidden');
        }
        if (this.onFinishCallback) {
            this.onFinishCallback(this.isSuccess);
        }
    }

    startTimer() {
        this.stopTimer();
        const startTimestamp = Date.now();
        const totalDuration = 8.0;

        this.timerInterval = setInterval(() => {
            if (this.isSuccess || this.isFailed) {
                this.stopTimer();
                return;
            }

            const elapsed = (Date.now() - startTimestamp) / 1000;
            this.timer = Math.max(0, totalDuration - elapsed);

            const timerText = document.getElementById('swTimerText');
            const timerBar = document.getElementById('swTimerBarFill');
            if (timerText) timerText.innerText = `⏱️ ${this.timer.toFixed(1)}s`;
            if (timerBar) timerBar.style.width = `${(this.timer / totalDuration) * 100}%`;

            if (this.timer <= 0) {
                this.triggerFail('HẾT THỜI GIAN 8S! Khách VIP đã thất vọng rời đi.');
            }
        }, 50);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    triggerFail(reason) {
        if (this.isSuccess || this.isFailed) return;
        this.isFailed = true;
        this.failReason = reason;
        audio.playError();
        this.render();
    }

    triggerSuccess() {
        if (this.isSuccess || this.isFailed) return;
        this.isSuccess = true;
        this.stopTimer();

        // Âm thanh rong biển giòn rụm & chuông tiền
        audio.playSeaweedCrisp();
        setTimeout(() => audio.playMoneyChime(), 350);

        // Thưởng Tip gấp 3 lần giá bán lẻ + 100 EXP
        const basePrice = this.filling ? this.filling.price : 20000;
        const tipMoney = basePrice * 3;
        const bonusExp = 100;

        state.addMoney(tipMoney);
        state.addExp(bonusExp);

        this.render();
    }

    // Xử lý bắt đầu kéo một dải bóc
    onPointerDown(stripNum, clientX, clientY) {
        if (this.isFailed || this.isSuccess) return;

        // KIỂM TRA THỨ TỰ BÓC NGHIÊM NGẶT: 1 -> 2 -> 3
        if (stripNum === 2 && !this.strips[1]) {
            this.triggerFail('BÓC SAI THỨ TỰ! Phải kéo Dải 1 ở giữa trước!');
            return;
        }
        if (stripNum === 3 && (!this.strips[1] || !this.strips[2])) {
            this.triggerFail('BÓC SAI THỨ TỰ! Phải bóc Dải 1 rồi Dải 2 trước!');
            return;
        }
        if (this.strips[stripNum]) return; // Dải này đã bóc xong

        this.isDragging = true;
        this.activeStrip = stripNum;
        this.dragStartX = clientX;
        this.dragStartY = clientY;
        this.lastDragX = clientX;
        this.lastDragY = clientY;
        this.lastDragTime = Date.now();
    }

    onPointerMove(clientX, clientY) {
        if (!this.isDragging || !this.activeStrip || this.isFailed || this.isSuccess) return;

        const now = Date.now();
        const dt = Math.max(1, now - this.lastDragTime);
        const dxStep = clientX - this.lastDragX;
        const dyStep = clientY - this.lastDragY;
        const stepDist = Math.sqrt(dxStep * dxStep + dyStep * dyStep);

        // KIỂM TRA LỰC KÉO QUÁ MẠNH LÀM RÁCH LÁ
        const velocity = stepDist / (dt / 16.6); // px trên mỗi frame 60fps
        if (velocity > 90) {
            this.isDragging = false;
            this.triggerFail('RÁCH LÁ RONG BIỂN! Lực kéo quá mạnh và giật cục!');
            return;
        }

        this.lastDragX = clientX;
        this.lastDragY = clientY;
        this.lastDragTime = now;

        const totalDx = clientX - this.dragStartX;
        const totalDy = clientY - this.dragStartY;

        // KIỂM TRA HƯỚNG KÉO TỪNG DẢI
        if (this.activeStrip === 1) {
            // Dải 1: Kéo dọc từ trên xuống dưới ít nhất 70px
            if (totalDy >= 70) {
                this.strips[1] = true;
                this.isDragging = false;
                this.activeStrip = null;
                audio.playSeaweedCrisp();
                this.render();
            }
        } else if (this.activeStrip === 2) {
            // Dải 2: Kéo sang bên phải ít nhất 65px
            if (totalDx >= 65) {
                this.strips[2] = true;
                this.isDragging = false;
                this.activeStrip = null;
                audio.playSeaweedCrisp();
                this.render();
            }
        } else if (this.activeStrip === 3) {
            // Dải 3: Kéo sang bên trái ít nhất 65px
            if (totalDx <= -65) {
                this.strips[3] = true;
                this.isDragging = false;
                this.activeStrip = null;
                audio.playSeaweedCrisp();

                // Hoàn tất cả 3 dải thành công!
                if (this.strips[1] && this.strips[2] && this.strips[3]) {
                    this.triggerSuccess();
                } else {
                    this.render();
                }
            }
        }
    }

    onPointerUp() {
        this.isDragging = false;
        this.activeStrip = null;
    }

    render() {
        if (!this.container) return;

        const basePrice = this.filling ? this.filling.price : 20000;
        const tipMoney = basePrice * 3;

        let statusBanner = '';
        if (this.isSuccess) {
            statusBanner = `
                <div class="sw-result-box success animate-pop">
                    <div class="sw-trophy">👑 ⭐ ⭐ ⭐ 👑</div>
                    <h3>BÓC RONG BIỂN HOÀN HẢO!</h3>
                    <p>Khách VIP cực kỳ mãn nhãn và vỗ tay khen ngợi!</p>
                    <div class="sw-reward-grid">
                        <span class="sw-rw-item highlight">💰 Tiền Tip x3: +${tipMoney.toLocaleString('vi-VN')}đ</span>
                        <span class="sw-rw-item">⭐ Điểm thưởng: +100 EXP</span>
                    </div>
                    <button type="button" class="btn-sw-finish" id="btnSWClose">✨ Nhận Tiền & Rời Bàn</button>
                </div>
            `;
        } else if (this.isFailed) {
            statusBanner = `
                <div class="sw-result-box failed animate-pop">
                    <div class="sw-failed-icon">❌</div>
                    <h3>THỬ THÁCH THẤT BẠI!</h3>
                    <p class="sw-fail-reason">${this.failReason}</p>
                    <button type="button" class="btn-sw-finish retry" id="btnSWRetry">🔄 Thử Lại Lần Nữa</button>
                    <button type="button" class="btn-sw-finish secondary" id="btnSWClose">Đóng Lại</button>
                </div>
            `;
        }

        this.container.innerHTML = `
            <div class="seaweed-modal-backdrop"></div>
            <div class="seaweed-game-card">
                <!-- Header -->
                <div class="sw-header">
                    <div>
                        <span class="sw-badge-vip">👑 KHÁCH VIP YÊU CẦU</span>
                        <h4>Thử Thách Bóc Rong Biển 1-2-3</h4>
                    </div>
                    <button type="button" class="btn-sw-close-corner" id="btnSWCornerClose">✕</button>
                </div>

                <!-- Timer 8s Bar -->
                <div class="sw-timer-wrap">
                    <div class="sw-timer-info">
                        <span>Thời gian dứt khoát:</span>
                        <strong id="swTimerText">⏱️ ${this.timer.toFixed(1)}s</strong>
                    </div>
                    <div class="sw-timer-track">
                        <div class="sw-timer-fill" id="swTimerBarFill" style="width: ${(this.timer / 8.0) * 100}%;"></div>
                    </div>
                </div>

                <!-- Hướng Dẫn Thao Tác -->
                <div class="sw-guide-hint">
                    Kéo chuột/vuốt dứt khoát theo thứ tự: 
                    <strong style="color: #ef4444;">[1] Kéo Xuống</strong> ➔ 
                    <strong style="color: #f59e0b;">[2] Kéo Phải</strong> ➔ 
                    <strong style="color: #10b981;">[3] Kéo Trái</strong>!
                </div>

                <!-- Khung Cơm Nắm & 3 Dải Bóc Cận Cảnh -->
                <div class="sw-onigiri-stage">
                    <div class="sw-triangle-body ${this.isSuccess ? 'crispy' : ''}">
                        <!-- Cơm trắng bên trong -->
                        <div class="sw-rice-core">🍙</div>

                        <!-- Lá rong biển bao phủ -->
                        <div class="sw-nori-sheet"></div>

                        <!-- Dải 1: Dọc ở giữa (Kéo xuống) -->
                        <div class="sw-strip strip-1 ${this.strips[1] ? 'peeled' : ''}" id="strip1">
                            <div class="strip-tab">
                                <span class="num">1</span>
                                <span class="arrow">⬇ KÉO XUỐNG</span>
                            </div>
                        </div>

                        <!-- Dải 2: Cánh bên phải (Kéo sang phải) -->
                        <div class="sw-strip strip-2 ${this.strips[2] ? 'peeled' : ''}" id="strip2">
                            <div class="strip-tab">
                                <span class="num">2</span>
                                <span class="arrow">KÉO PHẢI ➡</span>
                            </div>
                        </div>

                        <!-- Dải 3: Cánh bên trái (Kéo sang trái) -->
                        <div class="sw-strip strip-3 ${this.strips[3] ? 'peeled' : ''}" id="strip3">
                            <div class="strip-tab">
                                <span class="num">3</span>
                                <span class="arrow">⬅ KÉO TRÁI</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Banner Kết Quả (Nếu thắng hoặc thua) -->
                ${statusBanner}
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const btnCorner = document.getElementById('btnSWCornerClose');
        if (btnCorner) btnCorner.onclick = () => this.close();

        const btnClose = document.getElementById('btnSWClose');
        if (btnClose) btnClose.onclick = () => this.close();

        const btnRetry = document.getElementById('btnSWRetry');
        if (btnRetry) {
            btnRetry.onclick = () => {
                this.open(this.filling ? this.filling.id : 'melting_beef_cheese', this.onFinishCallback);
            };
        }

        // Bắt sự kiện Mouse & Touch cho 3 dải bóc
        [1, 2, 3].forEach(stripNum => {
            const el = document.getElementById('strip' + stripNum);
            if (!el) return;

            // Mouse down
            el.onmousedown = (e) => {
                e.preventDefault();
                this.onPointerDown(stripNum, e.clientX, e.clientY);
            };

            // Touch start
            el.ontouchstart = (e) => {
                if (e.cancelable) e.preventDefault();
                if (e.touches && e.touches.length > 0) {
                    const t = e.touches[0];
                    this.onPointerDown(stripNum, t.clientX, t.clientY);
                }
            };
        });

        // Lắng nghe pointer move & up toàn cục trong modal
        const stage = this.container.querySelector('.sw-onigiri-stage');
        if (stage) {
            stage.onmousemove = (e) => {
                this.onPointerMove(e.clientX, e.clientY);
            };
            stage.onmouseup = () => {
                this.onPointerUp();
            };
            stage.onmouseleave = () => {
                this.onPointerUp();
            };

            stage.ontouchmove = (e) => {
                if (e.cancelable) e.preventDefault();
                if (e.touches && e.touches.length > 0) {
                    const t = e.touches[0];
                    this.onPointerMove(t.clientX, t.clientY);
                }
            };
            stage.ontouchend = () => {
                this.onPointerUp();
            };
            stage.ontouchcancel = () => {
                this.onPointerUp();
            };
        }
    }
}

export const seaweedGame = new SeaweedGame();
