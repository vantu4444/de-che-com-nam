/**
 * ==============================================================================
 * DỰ ÁN GAME THẾ GIỚI MỞ "ĐẾ CHẾ CƠM NẮM" (ONIGIRI EMPIRE)
 * MODULE: TUTORIAL MANAGER (HƯỚNG DẪN TÂN THỦ "CẦM TAY CHỈ VIỆC" 6 BƯỚC SIÊU TỐC 60S)
 * 
 * Hội đồng 12 Bộ Phận & 4 Bộ Phận Chuyên Trách Mobile Game Studio thẩm định:
 * - Brand Director: 100% Cơm Nắm Onigiri, chuẩn ISO 22000 & ATVSTP, không lộ giá vốn/công thức.
 * - Mobile UI & Safe-Area: Spotlight Overlay tối 80% chỉ sáng rực nút duy nhất cần bấm.
 * - Touch & Virtual Controls: Bàn tay chỉ điểm 👆 nhấp nháy vào tâm nút, khóa click nút ngoài luồng.
 * - Interaction Designer: Bỏ nút "Tiếp theo", người chơi thao tác thật trên màn hình mới qua bước!
 * ==============================================================================
 */

import { state } from './state.js';
import { audio } from './audio.js';

export const TUTORIAL_STEPS = [
    {
        id: 1,
        title: 'Bước 1: Thu Hoạch Lúa Sạch',
        icon: '🌾',
        badge: 'NÔNG TRẠI ISO',
        desc: 'Chạm vào <strong>Xưởng Bếp</strong> → chạm <strong>Ruộng Lúa Nhật</strong> chín vàng để thu hoạch nguyên liệu sạch đầu tiên!',
        hint: 'Chạm để mở Bếp và thu hoạch lúa sạch!'
    },
    {
        id: 2,
        title: 'Bước 2: Nấu Cơm Chuẩn ISO (3 Giây)',
        icon: '🍙',
        badge: 'BẾP SIÊU TỐC',
        desc: 'Chạm <strong>Nấu Mẻ Cơm</strong>! Riêng mẻ tân thủ này chỉ nấu trong <strong>3 giây</strong>, chín xong chạm thu hoạch vào xe!',
        hint: 'Chạm Nấu Mẻ Cơm chuẩn ISO (chỉ 3 giây)!'
    },
    {
        id: 3,
        title: 'Bước 3: Ra Ô Vạch Xanh Trường Học',
        icon: '🟢',
        badge: 'ĐÔ THỊ AN TOÀN',
        desc: 'Lái xe theo <strong>dải mũi tên xanh ngọc phát sáng trên mặt đất</strong> tới Cổng Trường để bán an toàn 100%!',
        targetLocation: { x: 790, y: 625, name: 'Cổng Trường Tiểu Học Hoa Mai' },
        hint: 'Đi theo dải mũi tên xanh ngọc tới Cổng Trường!'
    },
    {
        id: 4,
        title: 'Bước 4: Bấm Mở Sạp',
        icon: '🏪',
        badge: 'MỞ SẠP BÁN HÀNG',
        desc: 'Chạm nút <strong>Mở Sạp</strong> để đón 2 bạn học sinh đầu tiên đang xếp hàng chờ mua cơm!',
        hint: 'Chạm nút Mở Sạp để bắt đầu phục vụ!'
    },
    {
        id: 5,
        title: 'Bước 5: Chạm Bán Cho Khách',
        icon: '⚡',
        badge: 'DOANH THU ĐẦU TIÊN',
        desc: 'Chạm nút <strong>🍙 Bán Cho Khách</strong> để chốt đơn ngay lập tức và nhận +20.000đ doanh thu đầu tiên!',
        hint: 'Chạm nút Bán Cho Khách để giao cơm!'
    },
    {
        id: 6,
        title: 'Bước 6: Khởi Đầu Đế Chế Toàn Quốc',
        icon: '👑',
        badge: 'VUA CƠM NẮM',
        desc: 'Xuất sắc! Bạn đã nắm vững chu trình cốt lõi. Nhận ngay <strong>+100.000đ Vốn Khởi Nghiệp</strong> và mở khóa toàn bộ Đế Chế!',
        hint: 'Nhận +100.000đ Vốn Khởi Nghiệp & Bắt Đầu!'
    }
];

export class TutorialManager {
    constructor(gameApp) {
        this.game = gameApp;
        this.overlay = null;
        this.pointerEl = null;
        this.bubbleEl = null;
        this.currentTargetEl = null;
        this.targetCoords = { x: 790, y: 625 }; // Cổng Trường Tiểu Học Hoa Mai
        this.guideModal = null;
        this.lastTargetRect = null;
    }

    skipTutorial() {
        state.skipTutorial();
        this.updateStep();
    }

    completeTutorialStep(step) {
        state.completeTutorialStep(step);
        this.updateStep();
    }

    init() {
        this.guideModal = document.getElementById('tutorialGuideModal');
        this.ensureDomElements();
        this.setupEventListeners();
        this.updateStep();
    }

    ensureDomElements() {
        // Tạo Spotlight Overlay nếu chưa có trong DOM
        let overlay = document.getElementById('tutorialSpotlightOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'tutorialSpotlightOverlay';
            overlay.className = 'tutorial-spotlight-overlay hidden';
            overlay.innerHTML = `
                <!-- Khung khoét sáng dạng viền neon phát quang -->
                <div id="spotlightBorderBox" class="spotlight-border-box"></div>

                <!-- Bàn tay chỉ điểm 👆 animated -->
                <div id="spotlightHandPointer" class="spotlight-hand-pointer">👆</div>

                <!-- Bong bóng hướng dẫn dạng chat bubble nổi (#spotlightChatBubble & #tutorialCard) -->
                <div id="spotlightChatBubble" class="spotlight-chat-bubble tutorial-card">
                    <div id="tutorialCard" class="tutorial-card-inner">
                        <div class="scb-badge" id="scbBadge">BƯỚC 1/6</div>
                        <div class="scb-text" id="scbText">Đang chuẩn bị hướng dẫn...</div>
                    </div>
                </div>

                <!-- Nút Bỏ qua tinh tế ở góc trên bên phải -->
                <button type="button" id="btnSpotlightSkip" class="btn-spotlight-skip" title="Bỏ qua hướng dẫn tân thủ">
                    Bỏ qua ✕
                </button>

                <!-- Thẻ Popup chúc mừng Hoàn tất Bước 6 -->
                <div id="tutorialCelebrationCard" class="tutorial-celebration-card hidden">
                    <div class="tcc-crown">👑</div>
                    <h3>XUẤT SẮC! BẠN ĐÃ LÀ ÔNG CHỦ CƠM NẮM</h3>
                    <p>Chu trình Nông trại Sạch → Nấu Chuẩn ISO → Bán Vạch Xanh đã hoàn tất thành thạo!</p>
                    <div class="tcc-reward">+100.000đ VỐN KHỞI NGHIỆP</div>
                    <button type="button" id="btnClaimTutorialBonus" class="btn-claim-tutorial-bonus">
                        🏆 Nhận Thưởng & Mở Khóa Toàn Bộ
                    </button>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        this.overlay = overlay;
        this.pointerEl = document.getElementById('spotlightHandPointer');
        this.bubbleEl = document.getElementById('tutorialCard') || document.getElementById('spotlightChatBubble');

        // Nút Bỏ qua trên overlay
        const btnSkip = document.getElementById('btnSpotlightSkip');
        if (btnSkip) {
            btnSkip.onclick = () => {
                try { audio.playClick(); } catch (e) {}
                state.skipTutorial();
                this.updateStep();
            };
        }

        // Nút Nhận thưởng Bước 6
        const btnClaim = document.getElementById('btnClaimTutorialBonus');
        if (btnClaim) {
            btnClaim.onclick = () => {
                try {
                    audio.playLevelUp();
                    audio.playTingComplete();
                } catch (e) {}
                state.completeTutorialStep(6);
                if (this.game && this.game.sellingManager) {
                    this.game.sellingManager.showToast('🎉 Nhận +100.000đ Vốn Khởi Nghiệp! Toàn bộ tính năng Đế Chế đã mở khóa!');
                }
                this.updateStep();
            };
        }
    }

    setupEventListeners() {
        // Nút Hướng Dẫn trên thanh HUD để mở lại cẩm nang tra cứu
        const btnOpenGuide = document.getElementById('btnOpenTutorialGuide');
        if (btnOpenGuide) {
            btnOpenGuide.addEventListener('click', () => {
                try { audio.playClick(); } catch (e) {}
                this.openGuideModal();
            });
        }

        // Nút Đóng Modal Cẩm Nang
        const btnCloseGuide = document.getElementById('btnCloseTutorialGuide');
        if (btnCloseGuide) {
            btnCloseGuide.addEventListener('click', () => {
                try { audio.playClick(); } catch (e) {}
                this.closeGuideModal();
            });
        }

        // Nút Chạy Lại Hướng Dẫn Từng Bước trong Modal Cẩm Nang
        const btnRestartTutorial = document.getElementById('btnRestartTutorialSteps');
        if (btnRestartTutorial) {
            btnRestartTutorial.addEventListener('click', () => {
                try { audio.playSuccess(); } catch (e) {}
                state.resetTutorial();
                this.closeGuideModal();
                this.updateStep();
            });
        }

        // Lắng nghe cập nhật từ state
        state.onUpdate((s, extra) => {
            if (extra && extra.tutorialUpdated) {
                this.updateStep();
            }
        });
    }

    // Cập nhật vị trí Spotlight & kiểm tra hoàn thành Bước 3 theo từng frame
    update() {
        if (state.tutorialCompleted) {
            if (document.body.classList.contains('tutorial-active')) {
                document.body.classList.remove('tutorial-active');
            }
            if (this.overlay && !this.overlay.classList.contains('hidden')) {
                this.overlay.classList.add('hidden');
                this.clearTargetHighlight();
            }
            return;
        }

        // Đảm bảo body có class tutorial-active để ẩn các thanh tính năng nâng cao
        if (!document.body.classList.contains('tutorial-active')) {
            document.body.classList.add('tutorial-active');
        }

        const curStep = state.tutorialStep || 1;

        // Xử lý kiểm tra Bước 3: Nhân vật đi tới Ô Vạch Xanh Cổng Trường
        if (curStep === 3) {
            const player = this.game ? this.game.player : null;
            if (player) {
                const dx = this.targetCoords.x - player.x;
                const dy = this.targetCoords.y - player.y;
                const dist = Math.hypot(dx, dy);

                const isInsideLegal = (this.game.world && typeof this.game.world.isInValidSellingSpot === 'function' && Boolean(this.game.world.isInValidSellingSpot(player.x, player.y)));

                if (dist <= 65 || isInsideLegal) {
                    try {
                        audio.playSuccess();
                        audio.playTingComplete();
                    } catch (e) {}
                    if (this.game && this.game.sellingManager) {
                        this.game.sellingManager.showToast('🟢 ĐÃ VÀO Ô VẠCH XANH HỢP PHÁP! Hãy bấm Mở Sạp để bán cơm!');
                    }
                    state.completeTutorialStep(3);
                    return;
                }
            }
        }

        // Cập nhật tọa độ spotlight theo element thật
        this.repositionSpotlight();
    }

    updateStep() {
        if (state.tutorialCompleted) {
            document.body.classList.remove('tutorial-active');
            if (this.overlay) this.overlay.classList.add('hidden');
            this.clearTargetHighlight();
            return;
        }

        document.body.classList.add('tutorial-active');
        if (this.overlay) this.overlay.classList.remove('hidden');

        const curStep = Math.max(1, Math.min(6, state.tutorialStep || 1));
        const stepData = TUTORIAL_STEPS.find(s => s.id === curStep) || TUTORIAL_STEPS[0];

        // Ẩn/hiển thẻ ăn mừng Bước 6
        const celebCard = document.getElementById('tutorialCelebrationCard');
        if (celebCard) {
            if (curStep === 6) {
                celebCard.classList.remove('hidden');
                if (this.pointerEl) this.pointerEl.classList.add('hidden');
                if (this.bubbleEl) this.bubbleEl.classList.add('hidden');
            } else {
                celebCard.classList.add('hidden');
                if (this.pointerEl) this.pointerEl.classList.remove('hidden');
                if (this.bubbleEl) this.bubbleEl.classList.remove('hidden');
            }
        }

        // Cập nhật nội dung bong bóng chat
        const badgeEl = document.getElementById('scbBadge');
        const textEl = document.getElementById('scbText');
        if (badgeEl) badgeEl.textContent = `${stepData.icon} BƯỚC ${stepData.id}/6: ${stepData.badge}`;
        if (textEl) textEl.innerHTML = stepData.desc;

        // Bước 3: Nhân vật lái xe ra Ô Vạch Xanh trên phố, đóng Bếp nếu đang mở
        if (curStep === 3) {
            if (this.game && this.game.kitchen && this.game.isKitchenOpen) {
                this.game.kitchen.close();
                this.game.isKitchenOpen = false;
            }
            this.clearTargetHighlight();
            // Ở bước 3, không che tối toàn màn hình để người chơi lái xe
            if (this.overlay) this.overlay.classList.add('step-3-nav-mode');
            if (this.pointerEl) this.pointerEl.classList.add('hidden');
            return;
        } else {
            if (this.overlay) this.overlay.classList.remove('step-3-nav-mode');
            if (this.pointerEl && curStep !== 6) this.pointerEl.classList.remove('hidden');
        }

        // Tự động điều hướng Bếp ASMR nếu ở Bước 1 hoặc Bước 2
        if (curStep === 1) {
            // Nếu Bếp chưa mở: hướng dẫn mở Bếp
            // Nếu Bếp đã mở: đảm bảo ở tab Vườn
            if (this.game && this.game.kitchen && this.game.isKitchenOpen) {
                if (this.game.kitchen.activeTab !== 'farm') {
                    this.game.kitchen.activeTab = 'farm';
                    this.game.kitchen.render();
                }
            }
        } else if (curStep === 2) {
            // Khi ở bước 2, đảm bảo Bếp mở và ở tab Bếp Chế Biến
            if (this.game && this.game.kitchen && this.game.isKitchenOpen) {
                if (this.game.kitchen.activeTab !== 'kitchen') {
                    this.game.kitchen.activeTab = 'kitchen';
                    this.game.kitchen.render();
                }
            }
        }

        this.repositionSpotlight();
    }

    findTargetElement(curStep) {
        if (curStep === 1) {
            // Nếu Bếp đang mở: tìm nút Thu Hoạch Ruộng Lúa (Ô đất 1)
            if (this.game && this.game.isKitchenOpen) {
                const harvestBtn = document.querySelector('.btn-harvest-crop[data-plot-id="plot_1"]') ||
                                   document.querySelector('.btn-harvest-crop') ||
                                   document.querySelector('[data-plot-id="plot_1"]');
                if (harvestBtn) return harvestBtn;
                // Nếu chưa qua tab farm
                const tabFarmBtn = document.getElementById('tabBtnFarm');
                if (tabFarmBtn) return tabFarmBtn;
            }
            // Nếu Bếp chưa mở: tìm nút mở Bếp
            return document.getElementById('btnTouchE') ||
                   document.getElementById('proximityPrompt') ||
                   document.querySelector('.btn-touch-interact');
        }

        if (curStep === 2) {
            if (this.game && this.game.isKitchenOpen) {
                // Nếu có mẻ chín: tìm nút Thu Hoạch
                const harvestSlotBtn = document.querySelector('.btn-harvest-slot');
                if (harvestSlotBtn) return harvestSlotBtn;

                // Nếu đang ở tab farm: trỏ vào tab Bếp
                if (this.game.kitchen && this.game.kitchen.activeTab === 'farm') {
                    const tabKitchenBtn = document.getElementById('tabBtnKitchen');
                    if (tabKitchenBtn) return tabKitchenBtn;
                }

                // Nếu chưa nấu: tìm nút Nấu
                const cookSlotBtn = document.querySelector('.btn-start-cook-slot') ||
                                    document.getElementById('btnQuickCook') ||
                                    document.getElementById('btnQueueCookActive');
                if (cookSlotBtn) return cookSlotBtn;
            }
            return document.getElementById('btnTouchE') || document.querySelector('.btn-touch-interact');
        }

        if (curStep === 4) {
            // Nút Mở Sạp
            return document.getElementById('btnTouchStall') ||
                   document.getElementById('btnOpenStall') ||
                   document.querySelector('.btn-touch-stall');
        }

        if (curStep === 5) {
            // Nút Bán Nhanh Cho Khách
            return document.getElementById('btnQuickSellStall') ||
                   document.getElementById('btnTouchSell') ||
                   document.querySelector('.btn-touch-sell');
        }

        if (curStep === 6) {
            return document.getElementById('btnClaimTutorialBonus');
        }

        return null;
    }

    repositionSpotlight() {
        const curStep = Math.max(1, Math.min(6, state.tutorialStep || 1));
        if (curStep === 3 || state.tutorialCompleted) return;

        const targetEl = this.findTargetElement(curStep);
        if (!targetEl) return;

        if (this.currentTargetEl !== targetEl) {
            this.clearTargetHighlight();
            this.currentTargetEl = targetEl;
        }

        // Tự động nâng nút mục tiêu lên z-index: 99996 và pointer-events: auto !important
        targetEl.style.zIndex = '99996';
        targetEl.style.pointerEvents = 'auto';
        targetEl.classList.add('tutorial-spotlight-active-target');

        const rect = targetEl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const borderBox = document.getElementById('spotlightBorderBox');
        if (borderBox) {
            borderBox.style.left = `${Math.max(4, rect.left - 6)}px`;
            borderBox.style.top = `${Math.max(4, rect.top - 6)}px`;
            borderBox.style.width = `${rect.width + 12}px`;
            borderBox.style.height = `${rect.height + 12}px`;
            borderBox.style.display = 'block';
        }

        const screenH = window.innerHeight || document.documentElement.clientHeight || 800;
        const targetCenterY = rect.top + rect.height / 2;
        // Kiểm tra nút nằm ở nửa dưới màn hình (Nút Mở Sạp / Bán Nhanh luôn ở nửa dưới)
        const isBottomHalf = (curStep === 4 || curStep === 5 || targetEl.id === 'btnTouchStall' || targetEl.id === 'btnQuickSellStall' || targetEl.id === 'btnTouchSell') || (targetCenterY > screenH * 0.45);

        // Bàn tay chỉ điểm 👆 animated
        if (this.pointerEl && curStep !== 6) {
            const centerX = rect.left + rect.width / 2;
            if (isBottomHalf) {
                // Nút ở nửa dưới (như Mở Sạp, Bán Cho Khách, Joystick, iGiri): đặt bàn tay phía trên nút trỏ xuống
                this.pointerEl.style.left = `${centerX - 19}px`;
                this.pointerEl.style.top = `${Math.max(10, rect.top - 46)}px`;
            } else {
                // Nút ở nửa trên: đặt bàn tay phía dưới nút
                this.pointerEl.style.left = `${centerX - 19}px`;
                this.pointerEl.style.top = `${Math.min(screenH - 50, rect.bottom + 6)}px`;
            }
            this.pointerEl.classList.remove('hidden');
        }

        // Tự động né vị trí nút bấm: Thẻ chữ hướng dẫn (#tutorialCard & #spotlightChatBubble)
        const cardBubble = document.getElementById('spotlightChatBubble');
        const cardInner = document.getElementById('tutorialCard');
        const cardsToStyle = [cardBubble, cardInner, this.bubbleEl].filter(Boolean);

        for (const card of cardsToStyle) {
            if (curStep !== 6) {
                card.style.left = '50%';
                card.style.transform = 'translateX(-50%)';
                card.style.right = 'auto';
                card.style.pointerEvents = 'auto';

                if (isBottomHalf) {
                    // Nút nằm ở nửa dưới màn hình: đẩy thẻ chữ hướng dẫn lên sát mép trên!
                    card.style.top = 'calc(16px + env(safe-area-inset-top, 0px))';
                    card.style.bottom = 'auto';
                    card.classList.remove('bubble-below');
                    card.classList.add('bubble-above');
                } else {
                    // Nút nằm ở nửa trên màn hình: đặt thẻ chữ ở dưới, tuyệt đối không đè lên nút!
                    card.style.top = 'auto';
                    card.style.bottom = 'calc(24px + env(safe-area-inset-bottom, 0px))';
                    card.classList.remove('bubble-above');
                    card.classList.add('bubble-below');
                }
            }
        }
    }

    clearTargetHighlight() {
        if (this.currentTargetEl) {
            this.currentTargetEl.style.zIndex = '';
            this.currentTargetEl.style.pointerEvents = '';
            this.currentTargetEl.classList.remove('tutorial-spotlight-active-target');
            this.currentTargetEl = null;
        }
        document.querySelectorAll('.tutorial-spotlight-active-target').forEach(el => {
            el.style.zIndex = '';
            el.style.pointerEvents = '';
            el.classList.remove('tutorial-spotlight-active-target');
        });
        const borderBox = document.getElementById('spotlightBorderBox');
        if (borderBox) borderBox.style.display = 'none';
    }

    // Vẽ Dải Mũi Tên Phát Sáng Dưới Chân Tới Ô Vạch Xanh trong Bước 3
    renderWayfinding(ctx, camera, playerX, playerY) {
        if (state.tutorialCompleted) return;
        if (state.tutorialStep !== 3) return;

        const targetX = this.targetCoords.x;
        const targetY = this.targetCoords.y;

        const dx = targetX - playerX;
        const dy = targetY - playerY;
        const dist = Math.hypot(dx, dy);

        // 1. Vẽ dải hạt phát sáng xanh ngọc trên mặt đất nối từ chân nhân vật tới Cổng trường
        const pointsCount = Math.min(30, Math.floor(dist / 28));
        const now = Date.now();
        const pulseOffset = (now / 220) % 1;

        ctx.save();
        for (let i = 1; i <= pointsCount; i++) {
            const t = (i + pulseOffset) / (pointsCount + 1);
            if (t > 1) continue;
            const px = playerX + dx * t - camera.x;
            const py = playerY + dy * t - camera.y;

            ctx.beginPath();
            ctx.arc(px, py, 6 * (1 - t * 0.25), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 12;
            ctx.fill();
        }

        // 2. Vòng tròn phát sáng tại Ô Vạch Xanh Cổng Trường
        const screenTargetX = targetX - camera.x;
        const screenTargetY = targetY - camera.y;
        const radiusAnim = 46 + Math.sin(now / 250) * 8;

        ctx.beginPath();
        ctx.arc(screenTargetX, screenTargetY, radiusAnim, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 16;
        ctx.stroke();

        ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'center';
        ctx.fillText('🟢 ĐÍCH ĐẾN: Ô VẠCH XANH AN TOÀN 100%', screenTargetX, screenTargetY - radiusAnim - 10);

        // 3. Mũi tên định hướng ngay trước mặt nhân vật
        const angle = Math.atan2(dy, dx);
        const screenPx = playerX - camera.x;
        const screenPy = playerY - camera.y;

        const arrowDist = 60;
        const arrowX = screenPx + Math.cos(angle) * arrowDist;
        const arrowY = screenPy + Math.sin(angle) * arrowDist;

        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-8, -10);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-8, 10);
        ctx.closePath();

        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 14;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.restore();

        // Hiển thị nhãn khoảng cách
        ctx.save();
        ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 5;
        ctx.fillText(`🟢 Vạch Xanh: ${Math.round(dist / 10)}m`, screenPx, screenPy - 50);
        ctx.restore();
    }

    openGuideModal() {
        if (!this.guideModal) return;
        this.guideModal.classList.remove('hidden');

        // Ẩn phím ảo khi mở modal
        const virtualControls = document.getElementById('virtualTouchControls');
        if (virtualControls) virtualControls.classList.add('hidden');

        this.guideModal.innerHTML = `
            <div class="tutorial-guide-dialog animate-pop">
                <div class="tgd-header">
                    <div class="tgd-title-group">
                        <span class="tgd-icon">📖</span>
                        <div>
                            <h3 class="tgd-title">CẨM NANG KHỞI NGHIỆP CƠM NẮM</h3>
                            <span class="tgd-subtitle">Tiêu chuẩn ISO 22000 & ATVSTP – Bản sắc 100% Onigiri Việt Nam</span>
                        </div>
                    </div>
                    <button type="button" id="btnCloseTutorialGuide" class="btn-tgd-close">✕</button>
                </div>

                <div class="tgd-body">
                    <div class="tgd-steps-grid">
                        <div class="tgd-step-item">
                            <div class="tgd-step-badge">BƯỚC 1</div>
                            <div class="tgd-step-icon">🌱</div>
                            <h4>Vườn Nguyên Liệu</h4>
                            <p>Tự trồng Lúa Nhật sạch (45s) & Rong biển tươi (60s). Thu hoạch đưa vào kho nấu cơm hảo hạng.</p>
                        </div>

                        <div class="tgd-step-item">
                            <div class="tgd-step-badge">BƯỚC 2</div>
                            <div class="tgd-step-icon">🍙</div>
                            <h4>Bếp Chuẩn ISO</h4>
                            <p>Menu 15 vị độc quyền chia 3 phân khúc: <strong>20.000đ – 22.000đ – 25.000đ</strong>. Cơm nóng hổi đạt 100% tươi.</p>
                        </div>

                        <div class="tgd-step-item">
                            <div class="tgd-step-badge">BƯỚC 3</div>
                            <div class="tgd-step-icon">🟢</div>
                            <h4>Dẫn Đường Vạch Xanh</h4>
                            <p>Dải mũi tên phát sáng dẫn đường tận chân ra vị trí quy hoạch hợp pháp để tránh bị xử phạt Đô Thị.</p>
                        </div>

                        <div class="tgd-step-item">
                            <div class="tgd-step-badge">BƯỚC 4</div>
                            <div class="tgd-step-icon">🏪</div>
                            <h4>Mở Sạp Bán Hàng</h4>
                            <p>Bấm Mở Sạp để khách hàng học sinh, công sở ùa ra xếp hàng nườm nượp mua cơm nắm nóng hổi.</p>
                        </div>

                        <div class="tgd-step-item">
                            <div class="tgd-step-badge">BƯỚC 5</div>
                            <div class="tgd-step-icon">⚡</div>
                            <h4>Bán Cho Khách</h4>
                            <p>Chạm nút <strong>🍙 Bán Cho Khách</strong> để bán siêu tốc và kích hoạt chuỗi Combo x2 – x5 tiền Tip.</p>
                        </div>

                        <div class="tgd-step-item tgd-item-highlight">
                            <div class="tgd-step-badge">BƯỚC 6</div>
                            <div class="tgd-step-icon">🏢</div>
                            <h4>Đế Chế 4 Chi Nhánh</h4>
                            <p>Nhận ngay <strong>+100.000đ Vốn</strong>, mở rộng 4 chi nhánh: <strong>TP.HCM, Đắk Lắk, TP. Vinh, Hà Nội</strong> kiếm tiền offline 8 tiếng!</p>
                        </div>
                    </div>

                    <div class="tgd-brand-promise">
                        <span>🛡️ <strong>Cam kết thương hiệu:</strong> Tuyệt đối 100% Cơm Nắm Onigiri, nói KHÔNG với bánh mì. Giữ kín bí mật công thức & giá vốn để giữ trọn đẳng cấp ẩm thực.</span>
                    </div>
                </div>

                <div class="tgd-footer">
                    <button type="button" id="btnRestartTutorialSteps" class="btn-tgd-restart">
                        🔄 Chạy Lại Hướng Dẫn Từng Bước
                    </button>
                    <button type="button" id="btnCloseGuideBottom" class="btn-tgd-primary">
                        Đã Hiểu & Tiếp Tục Chơi
                    </button>
                </div>
            </div>
        `;

        const btnClose = this.guideModal.querySelector('#btnCloseTutorialGuide');
        const btnCloseBottom = this.guideModal.querySelector('#btnCloseGuideBottom');
        const btnRestart = this.guideModal.querySelector('#btnRestartTutorialSteps');

        const doClose = () => {
            try { audio.playClick(); } catch (e) {}
            this.closeGuideModal();
        };

        if (btnClose) btnClose.onclick = doClose;
        if (btnCloseBottom) btnCloseBottom.onclick = doClose;
        if (btnRestart) {
            btnRestart.onclick = () => {
                try { audio.playSuccess(); } catch (e) {}
                state.resetTutorial();
                this.closeGuideModal();
                this.updateStep();
            };
        }
    }

    closeGuideModal() {
        if (!this.guideModal) return;
        this.guideModal.classList.add('hidden');

        const virtualControls = document.getElementById('virtualTouchControls');
        const isTouchDevice = (typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)));
        if (virtualControls && isTouchDevice) {
            virtualControls.classList.remove('hidden');
        }
    }
}
