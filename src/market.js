// src/market.js - Không gian bên trong Chợ Đầu Mối: 3 quầy sạp, điều khiển linh vật đi bộ, mua nguyên liệu & thoát chợ an toàn

import { state, MARKET_STALLS } from './state.js';
import { audio } from './audio.js';
import { characterRenderer } from './characterRenderer.js';
import { sellingManager } from './selling.js';

export class MarketManager {
    constructor(modalContainer, onExitCallback) {
        this.container = modalContainer;
        this.onExit = onExitCallback;
        this.isOpen = false;

        // Vị trí ngoài phố của nhân vật trước khi vào chợ
        this.savedStreetPos = { x: 420, y: 1250 };

        // Canvas và hoạt cảnh bên trong chợ
        this.canvas = null;
        this.ctx = null;
        this.animFrameId = null;

        // Kích thước thế giới nội bộ Chợ Đầu Mối
        this.marketWidth = 900;
        this.marketHeight = 600;

        // Vị trí linh vật Onigiri bên trong chợ
        this.mascot = {
            x: 450,
            y: 480,
            facing: 1,
            speed: 3.5,
            stepCycle: 0,
            isMoving: false,
            targetX: null,
            targetY: null
        };

        // Phím điều khiển bên trong chợ
        this.keys = {};

        // Sạp hàng được chọn để mở bảng giao dịch (null nếu không ở gần sạp nào)
        this.activeStall = null;

        // Toast timer nội bộ
        this.toastTimeout = null;

        // Định nghĩa 3 quầy sạp hàng bên trong chợ
        this.stalls = [
            {
                id: 'rice_seaweed',
                key: 'rice_seaweed',
                stallName: 'Sạp Gạo & Rong Biển',
                vendorName: 'Bác Ba Gạo ST25',
                x: 180,
                y: 200,
                w: 160,
                h: 110,
                color: '#16a34a',
                roofColor: '#15803d',
                icon: '🌾',
                item: MARKET_STALLS.rice_seaweed
            },
            {
                id: 'meat_seafood',
                key: 'meat_seafood',
                stallName: 'Sạp Thịt & Hải Sản',
                vendorName: 'Cô Tư Hải Sản Tươi',
                x: 450,
                y: 190,
                w: 170,
                h: 110,
                color: '#dc2626',
                roofColor: '#b91c1c',
                icon: '🥩',
                item: MARKET_STALLS.meat_seafood
            },
            {
                id: 'cheese_sauce',
                key: 'cheese_sauce',
                stallName: 'Sạp Phô Mai & Sốt',
                vendorName: 'Anh Năm Phô Mai Sốt',
                x: 720,
                y: 200,
                w: 160,
                h: 110,
                color: '#eab308',
                roofColor: '#ca8a04',
                icon: '🧀',
                item: MARKET_STALLS.cheese_sauce
            }
        ];

        // Ranh giới đi lại trong chợ
        this.bounds = {
            minX: 70,
            maxX: 830,
            minY: 260,
            maxY: 540
        };

        // Lắng nghe sự kiện bàn phím khi ở trong chợ
        this.onKeyDown = (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
            if (!this.isOpen) return;
            if (e.code === 'Escape') {
                if (this.activeStall) {
                    this.closeStall();
                } else {
                    this.close();
                }
                return;
            }

            // Hỗ trợ nhấn E hoặc Space để tương tác với sạp gần nhất
            if (e.code === 'KeyE' || e.code === 'Space') {
                const near = this.getNearestStall(130);
                if (near) {
                    e.preventDefault();
                    this.openStall(near);
                    return;
                }
            }

            this.keys[e.code] = true;
        };

        this.onKeyUp = (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
            if (!this.isOpen) return;
            this.keys[e.code] = false;
        };

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    getNearestStall(maxDist = 130) {
        let nearest = null;
        let minDist = maxDist;
        for (const stall of this.stalls) {
            const dx = this.mascot.x - stall.x;
            const dy = this.mascot.y - (stall.y + 60);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = stall;
            }
        }
        return nearest;
    }

    open(playerPos = { x: 1420, y: 1180 }) {
        this.isOpen = true;
        this.savedStreetPos = { x: playerPos.x, y: playerPos.y };

        // Đặt linh vật tại cửa vào chợ
        this.mascot.x = 450;
        this.mascot.y = 500;
        this.mascot.facing = 1;
        this.mascot.targetX = null;
        this.mascot.targetY = null;
        this.mascot.stepCycle = 0;
        this.keys = {};
        this.activeStall = null;

        this.container.classList.remove('hidden');
        this.renderDomStructure();
        this.initCanvas();

        audio.playClick();
        this.startLoop();
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;

        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
            this.toastTimeout = null;
        }

        this.container.classList.add('hidden');
        audio.playClick();

        if (this.onExit) {
            this.onExit(this.savedStreetPos);
        }
    }

    openStall(stall) {
        if (!stall) return;
        this.activeStall = stall;
        audio.playClick();
        this.renderStallModalUI();
    }

    closeStall() {
        this.activeStall = null;
        const modal = document.getElementById('stallModalCard');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showToast(msg, isSuccess = true) {
        if (sellingManager && sellingManager.showToast) {
            sellingManager.showToast(msg);
        }

        const toastEl = document.getElementById('marketToast');
        if (!toastEl) return;

        toastEl.textContent = msg;
        toastEl.className = `market-toast-banner ${isSuccess ? '' : 'error'}`;
        toastEl.classList.remove('hidden');

        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            const t = document.getElementById('marketToast');
            if (t) t.classList.add('hidden');
        }, 2200);
    }

    renderDomStructure() {
        this.container.innerHTML = `
            <div class="market-fullscreen-backdrop">
                <div class="market-panel">
                    <!-- Top bar -->
                    <div class="market-topbar">
                        <div class="market-heading">
                            <span class="market-tag">KHÔNG GIAN NỘI BỘ</span>
                            <h2>🏪 Chợ Đầu Mối Nguyên Liệu Nông Sản</h2>
                        </div>
                        <div class="market-inventory-pills">
                            <span class="m-pill">💰 Tiền: <strong id="mktMoney">${state.money.toLocaleString('vi-VN')}đ</strong></span>
                            <span class="m-pill">🌾 Gạo & Rong biển: <strong id="mktRice">${state.ingredients.rice_seaweed}</strong> phần</span>
                            <span class="m-pill">🥩 Thịt & Hải sản: <strong id="mktMeat">${state.ingredients.meat_seafood}</strong> phần</span>
                            <span class="m-pill">🧀 Phô mai & Sốt: <strong id="mktCheese">${state.ingredients.cheese_sauce}</strong> phần</span>
                        </div>
                        <button type="button" class="btn-exit-market" id="btnExitMarket">🚪 Ra khỏi Chợ</button>
                    </div>

                    <!-- Khu vực Canvas đi bộ trong Chợ -->
                    <div class="market-arena-wrapper">
                        <!-- Thông báo Toast nổi bên trong Chợ -->
                        <div id="marketToast" class="market-toast-banner hidden"></div>

                        <canvas id="marketCanvas" width="${this.marketWidth}" height="${this.marketHeight}"></canvas>
                        
                        <!-- Lời nhắc điều khiển -->
                        <div class="market-controls-hint">
                            🎮 Dùng <strong>W, A, S, D</strong> / <strong>Mũi tên</strong>, đến gần quầy nhấn <strong>E</strong> hoặc <strong>Click trực tiếp vào sạp</strong> để mua nguyên liệu
                        </div>

                        <!-- Bảng Modal Giao Dịch Mua Hàng của Sạp (z-index cao, tương tác độc lập) -->
                        <div id="stallModalCard" class="stall-modal-card hidden">
                            <!-- Cập nhật khi mở sạp -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        const btnExit = document.getElementById('btnExitMarket');
        if (btnExit) {
            btnExit.onclick = () => this.close();
        }
    }

    initCanvas() {
        this.canvas = document.getElementById('marketCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        // Bắt sự kiện click trên canvas để điều khiển di chuyển hoặc chọn sạp trực tiếp
        this.canvas.onclick = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.marketWidth / rect.width;
            const scaleY = this.marketHeight / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;

            // Kiểm tra click trực tiếp vào sạp hàng
            for (const stall of this.stalls) {
                if (
                    clickX >= stall.x - stall.w / 2 &&
                    clickX <= stall.x + stall.w / 2 &&
                    clickY >= stall.y - stall.h / 2 &&
                    clickY <= stall.y + stall.h / 2 + 70
                ) {
                    this.mascot.targetX = stall.x;
                    this.mascot.targetY = stall.y + 80;
                    this.openStall(stall);
                    return;
                }
            }

            // Click vào sàn chợ để di chuyển
            this.mascot.targetX = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, clickX));
            this.mascot.targetY = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, clickY));
        };
    }

    startLoop() {
        const loop = () => {
            if (!this.isOpen) return;
            this.update();
            this.draw();
            this.animFrameId = requestAnimationFrame(loop);
        };
        this.animFrameId = requestAnimationFrame(loop);
    }

    update() {
        let vx = 0;
        let vy = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) vy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) vy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) vx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) vx += 1;

        if (vx !== 0 || vy !== 0) {
            // Hủy mục tiêu di chuyển bằng chuột nếu bấm phím
            this.mascot.targetX = null;
            this.mascot.targetY = null;

            // Chuẩn hóa vector di chuyển chéo
            const len = Math.sqrt(vx * vx + vy * vy);
            vx = (vx / len) * this.mascot.speed;
            vy = (vy / len) * this.mascot.speed;

            this.mascot.x += vx;
            this.mascot.y += vy;
            this.mascot.facing = vx > 0 ? 1 : vx < 0 ? -1 : this.mascot.facing;
            this.mascot.isMoving = true;
            this.mascot.stepCycle += 0.25;
        } else if (this.mascot.targetX !== null && this.mascot.targetY !== null) {
            const dx = this.mascot.targetX - this.mascot.x;
            const dy = this.mascot.targetY - this.mascot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5) {
                this.mascot.targetX = null;
                this.mascot.targetY = null;
                this.mascot.isMoving = false;
            } else {
                vx = (dx / dist) * this.mascot.speed;
                vy = (dy / dist) * this.mascot.speed;
                this.mascot.x += vx;
                this.mascot.y += vy;
                this.mascot.facing = vx > 0 ? 1 : vx < 0 ? -1 : this.mascot.facing;
                this.mascot.isMoving = true;
                this.mascot.stepCycle += 0.25;
            }
        } else {
            this.mascot.isMoving = false;
        }

        // Khóa biên di chuyển trong lòng Chợ
        this.mascot.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.mascot.x));
        this.mascot.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, this.mascot.y));

        // TUYỆT ĐỐI KHÔNG GỌI render lại DOM mỗi khung hình trong vòng lặp 60fps!
        // Nếu người chơi di chuyển quá xa sạp đang mở (> 220px), tự động đóng bảng giao dịch
        if (this.activeStall) {
            const dx = this.mascot.x - this.activeStall.x;
            const dy = this.mascot.y - (this.activeStall.y + 60);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 220) {
                this.closeStall();
            }
        }
    }

    renderStallModalUI() {
        const modal = document.getElementById('stallModalCard');
        if (!modal) return;

        if (!this.activeStall) {
            modal.classList.add('hidden');
            return;
        }

        const stall = this.activeStall;
        const item = stall.item;
        const currentQty = state.ingredients[stall.key] || 0;
        const canAfford = state.money >= item.price;

        modal.classList.remove('hidden');
        modal.innerHTML = `
            <button type="button" class="btn-close-stall" id="btnCloseStall" title="Đóng bảng mua">✕</button>
            <div class="stall-card-content">
                <div class="stall-badge-tag">${stall.vendorName}</div>
                <div class="stall-header">
                    <span class="stall-icon-big">${item.icon}</span>
                    <div class="stall-text">
                        <h3>${stall.stallName}</h3>
                        <p class="stall-desc">${item.desc}</p>
                    </div>
                </div>

                <div class="stall-info-row">
                    <div class="info-block">
                        <span class="lbl">Quy cách gói:</span>
                        <span class="val">+${item.packSize} phần</span>
                    </div>
                    <div class="info-block">
                        <span class="lbl">Tồn kho hiện có:</span>
                        <span class="val highlight">${currentQty} phần</span>
                    </div>
                    <div class="info-block">
                        <span class="lbl">Giá thanh toán:</span>
                        <span class="val price">${item.price.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>

                <div class="stall-action-row">
                    <button type="button" class="btn-buy-ingredient ${canAfford ? '' : 'disabled'}" id="btnBuyIngredient">
                        ${canAfford ? `🛒 Mua Gói Nguyên Liệu (${item.price.toLocaleString('vi-VN')}đ)` : '❌ Chưa đủ tiền'}
                    </button>
                </div>
            </div>
        `;

        const btnClose = document.getElementById('btnCloseStall');
        if (btnClose) {
            btnClose.onclick = () => {
                audio.playClick();
                this.closeStall();
            };
        }

        const btnBuy = document.getElementById('btnBuyIngredient');
        if (btnBuy) {
            btnBuy.onclick = (e) => {
                e.stopPropagation();
                if (!canAfford) {
                    audio.playError();
                    this.showToast(`❌ Chưa đủ tiền! Cần ${item.price.toLocaleString('vi-VN')}đ`, false);
                    return;
                }

                const res = state.buyIngredient(stall.key);
                if (res && res.success) {
                    audio.playCoinKeng();
                    this.showToast(`✅ Đã mua +${res.count} phần ${res.item.name}!`, true);
                    this.updateTopBarStats();
                    this.renderStallModalUI();
                } else {
                    audio.playError();
                    this.showToast(`❌ Giao dịch thất bại! Không đủ tiền.`, false);
                    this.renderStallModalUI();
                }
            };
        }
    }

    updateTopBarStats() {
        const mMoney = document.getElementById('mktMoney');
        const mRice = document.getElementById('mktRice');
        const mMeat = document.getElementById('mktMeat');
        const mCheese = document.getElementById('mktCheese');

        if (mMoney) mMoney.textContent = state.money.toLocaleString('vi-VN') + 'đ';
        if (mRice) mRice.textContent = state.ingredients.rice_seaweed;
        if (mMeat) mMeat.textContent = state.ingredients.meat_seafood;
        if (mCheese) mCheese.textContent = state.ingredients.cheese_sauce;
    }

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.marketWidth;
        const h = this.marketHeight;

        // 1. Nền Chợ: Sàn gạch bông cổ điển
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, w, h);

        // Hàng gạch lát nền
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        const tileSize = 40;
        for (let x = 0; x < w; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 150);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 150; y < h; y += tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Tường phía sau
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(0, 0, w, 150);

        // Viền trang trí chân tường
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, 140, w, 10);

        // Băng rôn chào mừng trên tường chợ
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(150, 20, w - 300, 50);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.strokeRect(150, 20, w - 300, 50);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 20px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏮 CHỢ ĐẦU MỐI NÔNG SẢN & THỰC PHẨM SÀI GÒN 🏮', w / 2, 52);

        // 2. Vẽ 3 Quầy Sạp Hàng
        for (const stall of this.stalls) {
            this.drawStall(ctx, stall);
        }

        // 3. Vẽ Thảm lối đi chính giữa chợ
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(w / 2 - 50, 260, 100, h - 260);
        ctx.strokeStyle = '#f59e0b';
        ctx.strokeRect(w / 2 - 50, 260, 100, h - 260);

        // 4. Vẽ Cửa ra vào phía dưới
        ctx.fillStyle = '#334155';
        ctx.fillRect(w / 2 - 60, h - 25, 120, 25);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚪 CỔNG RA PHỐ', w / 2, h - 8);

        // 5. Vẽ Linh vật Onigiri di chuyển bên trong chợ
        const bounce = this.mascot.isMoving ? Math.sin(this.mascot.stepCycle) * 3 : 0;
        characterRenderer.render(ctx, {
            x: this.mascot.x,
            y: this.mascot.y,
            facing: this.mascot.facing,
            bounce: bounce,
            variant: 'player',
            nearKitchen: true, // Đội nón đầu bếp Onigiri
            customScale: 1.15,
            vehicle: 'walk'
        });

        // Tên linh vật trên đầu
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(this.mascot.x - 45, this.mascot.y - 48, 90, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Bếp Trưởng 🍙', this.mascot.x, this.mascot.y - 35);
    }

    drawStall(ctx, stall) {
        ctx.save();
        const x = stall.x;
        const y = stall.y;
        const w = stall.w;
        const h = stall.h;

        // Bóng đổ của sạp
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.beginPath();
        ctx.ellipse(x, y + 45, w / 2 + 10, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Thân bàn sạp bằng gỗ
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x - w / 2, y, w, 55);

        // Mặt quầy sạp
        ctx.fillStyle = '#92400e';
        ctx.fillRect(x - w / 2 - 6, y - 6, w + 12, 14);

        // Mái che sạp lượn sóng (sọc màu phong cách chợ truyền thống)
        const roofY = y - 45;
        const stripeWidth = (w + 16) / 5;
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = (i % 2 === 0) ? stall.roofColor : '#ffffff';
            ctx.fillRect(x - (w + 16) / 2 + i * stripeWidth, roofY, stripeWidth, 35);
        }

        // Cột chống mái che
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x - w / 2 + 2, roofY + 30, 6, 25);
        ctx.fillRect(x + w / 2 - 8, roofY + 30, 6, 25);

        // NPC Tiểu thương đứng sau quầy
        characterRenderer.render(ctx, {
            x: x,
            y: y - 8,
            facing: 1,
            bounce: 0,
            variant: 'market',
            customScale: 0.95,
            vehicle: 'walk'
        });

        // Biển hiệu sạp hàng
        ctx.fillStyle = stall.color;
        ctx.fillRect(x - w / 2 + 10, y + 10, w - 20, 24);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - w / 2 + 10, y + 10, w - 20, 24);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${stall.icon} ${stall.stallName}`, x, y + 26);

        // Nhãn giá gói nguyên liệu
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        ctx.fillText(`${stall.item.price.toLocaleString('vi-VN')}đ / gói`, x, y + 48);

        // Vòng hào quang tương tác nếu đang đứng gần sạp
        if (this.activeStall && this.activeStall.id === stall.id) {
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.ellipse(x, y + 55, 65, 25, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Mũi tên chỉ dẫn
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 14px "Be Vietnam Pro", sans-serif';
            ctx.fillText('👇 ĐANG Ở SẠP', x, y + 90);
        } else if (!this.activeStall) {
            // Nếu linh vật lại gần mà chưa mở sạp, hiện hướng dẫn phím E hoặc click
            const dx = this.mascot.x - x;
            const dy = this.mascot.y - (y + 60);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.fillRect(x - 65, y + 70, 130, 22);
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x - 65, y + 70, 130, 22);
                ctx.fillStyle = '#4ade80';
                ctx.font = 'bold 10.5px "Be Vietnam Pro", sans-serif';
                ctx.fillText('🛒 Nhấn [E] hoặc Bấm', x, y + 85);
            }
        }

        ctx.restore();
    }
}
