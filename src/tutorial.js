/**
 * ==============================================================================
 * DỰ ÁN GAME THẾ GIỚI MỞ "ĐẾ CHẾ CƠM NẮM" (ONIGIRI EMPIRE)
 * MODULE: TUTORIAL MANAGER (HỆ THỐNG HƯỚNG DẪN TÂN THỦ 5 BƯỚC & CẨM NANG TRA CỨU)
 * 
 * Hội đồng 12 Bộ Phận & 4 Bộ Phận Chuyên Trách Mobile Game Studio thẩm định:
 * - Brand Director: 100% Cơm Nắm Onigiri, chuẩn ISO 22000 & ATVSTP, không lộ giá vốn/công thức.
 * - Mobile UI & Safe-Area: Khung hướng dẫn góc trên gọn đẹp, không che HUD hay cụm Joystick.
 * - Touch Controls Engineer: Nút "Bỏ qua" và nút "Hành động nhanh" chạm nhạy, type="button".
 * ==============================================================================
 */

import { state } from './state.js';
import { audio } from './audio.js';

export const TUTORIAL_STEPS = [
    {
        id: 1,
        title: 'Bước 1: Thu Hoạch & Gieo Trồng',
        icon: '🌱',
        badge: 'NÔNG TRẠI SẠCH',
        desc: 'Chạm vào <strong>Xưởng Bếp → tab Vườn Nguyên Liệu</strong> để tự tay thu hoạch lúa Nhật hoặc rong biển đầu tiên và gieo lứa mới!',
        actionLabel: '🌾 Vào Vườn Ngay',
        highlightTarget: '#btnTouchE'
    },
    {
        id: 2,
        title: 'Bước 2: Nấu Cơm Chuẩn ISO',
        icon: '🍙',
        badge: 'BẾP CHẾ BIẾN',
        desc: 'Tại <strong>Bếp Chế Biến</strong>, chọn 1 trong 15 vị (<strong>20.000đ – 22.000đ – 25.000đ</strong>), nhấn Nấu Nhanh hoặc Xếp Mẻ Hàng Đợi rồi thu vào xe!',
        actionLabel: '👨‍🍳 Vào Bếp Nấu Cơm',
        highlightTarget: '#btnTouchE'
    },
    {
        id: 3,
        title: 'Bước 3: Tìm Ô Vạch Xanh Hợp Pháp',
        icon: '🟢',
        badge: 'ĐÔ THỊ AN TOÀN',
        desc: 'Đứng trong <strong>Vạch Xanh Trường Học</strong> để bán an toàn 100%, không bị Trật Tự Đô Thị phạt! Đi theo mũi tên dẫn đường trên mặt đất.',
        actionLabel: '📍 Đi Tới Vạch Xanh',
        targetLocation: { x: 790, y: 625, name: 'Cổng Trường Tiểu Học Hoa Mai' }
    },
    {
        id: 4,
        title: 'Bước 4: Mở Sạp & Bán Cho Khách',
        icon: '🏪',
        badge: 'DOANH THU ĐẦU TIÊN',
        desc: 'Chạm nút <strong>Mở Sạp</strong>! Sạp tự động bán mỗi 1.5s hoặc bạn bấm nhanh nút <strong>🍙 Bán Cho Khách</strong> để chốt đơn tức thì.',
        actionLabel: '🏪 Mở Sạp Bán Hàng',
        highlightTarget: '#btnTouchStall'
    },
    {
        id: 5,
        title: 'Bước 5: Khởi Đầu Đế Chế Tự Động',
        icon: '🏆',
        badge: 'VUA CƠM NẮM',
        desc: 'Nhận ngay <strong>+100.000đ Vốn Khởi Nghiệp</strong>! Mục tiêu kế tiếp: Nâng cấp <strong>Robot Tự Động</strong>, mở chuỗi <strong>4 Chi Nhánh Toàn Quốc</strong> và Thách Đấu 1v1!',
        actionLabel: '🏆 Nhận +100.000đ & Bắt Đầu',
        reward: 100000
    }
];

export class TutorialManager {
    constructor(gameApp) {
        this.game = gameApp;
        this.container = null;
        this.guideModal = null;
        this.currentHighlight = null;
        this.targetCoords = { x: 790, y: 625 }; // Cổng Trường Tiểu Học Hoa Mai
    }

    init() {
        this.container = document.getElementById('tutorialCardContainer');
        this.guideModal = document.getElementById('tutorialGuideModal');

        this.setupEventListeners();
        this.renderStepCard();
    }

    setupEventListeners() {
        // Nút Hướng Dẫn trên thanh HUD
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
                this.renderStepCard();
            });
        }

        // Lắng nghe cập nhật từ state
        state.onUpdate((s, extra) => {
            if (extra && extra.tutorialUpdated) {
                this.renderStepCard();
            }
            // Tự động kiểm tra điều kiện chuyển bước
            this.checkAutoStepProgress();
        });
    }

    checkAutoStepProgress() {
        if (state.tutorialCompleted) return;

        const curStep = state.tutorialStep || 1;

        // Bước 1: Nếu người chơi đã có nông sản thu hoạch hoặc kho nguyên liệu tăng
        if (curStep === 1) {
            // Khi mở bếp hoặc thu hoạch, bước 1 sẵn sàng
        } else if (curStep === 2) {
            // Nếu trong thùng xe đã có cơm
            if (state.inventory && state.inventory.length > 0) {
                // Tự động gợi ý chuyển sang bước 3
            }
        } else if (curStep === 3) {
            // Nếu người chơi đã bước vào vạch xanh hợp pháp
            const isLegal = Boolean(
                (this.game?.world && typeof this.game.world.isInValidSellingSpot === 'function' && this.game.world.isInValidSellingSpot(this.game.player.x, this.game.player.y))
            );
            if (isLegal) {
                // Đã tới vạch xanh
            }
        } else if (curStep === 4) {
            // Nếu đã mở sạp và bán được cơm
            if (state.stats && state.stats.cookedCount > 0 && state.money > 50000) {
                // Đã có doanh thu
            }
        }
    }

    renderStepCard() {
        if (!this.container) return;

        // Nếu đã hoàn thành hướng dẫn và không yêu cầu xem lại, ẩn thẻ
        if (state.tutorialCompleted) {
            this.container.classList.add('hidden');
            this.clearHighlight();
            return;
        }

        const stepIdx = Math.max(1, Math.min(5, state.tutorialStep || 1));
        const stepData = TUTORIAL_STEPS.find(s => s.id === stepIdx) || TUTORIAL_STEPS[0];

        this.container.classList.remove('hidden');

        this.container.innerHTML = `
            <div class="tutorial-card animate-slide-down">
                <div class="tutorial-card-header">
                    <div class="tutorial-card-badge">
                        <span class="tc-icon">${stepData.icon}</span>
                        <span class="tc-step-num">BƯỚC ${stepData.id}/5</span>
                        <span class="tc-badge-name">${stepData.badge}</span>
                    </div>
                    <button type="button" id="btnTutorialSkip" class="btn-tutorial-skip" title="Bỏ qua hướng dẫn nếu bạn đã thành thạo">
                        Bỏ qua ✕
                    </button>
                </div>
                <div class="tutorial-card-body">
                    <h4 class="tc-title">${stepData.title}</h4>
                    <p class="tc-desc">${stepData.desc}</p>
                </div>
                <div class="tutorial-card-footer">
                    <button type="button" id="btnTutorialAction" class="btn-tutorial-action">
                        ${stepData.actionLabel}
                    </button>
                </div>
            </div>
        `;

        // Gắn sự kiện nút Bỏ Qua
        const btnSkip = this.container.querySelector('#btnTutorialSkip');
        if (btnSkip) {
            btnSkip.onclick = () => {
                try { audio.playClick(); } catch (e) {}
                state.skipTutorial();
                this.container.classList.add('hidden');
                this.clearHighlight();
            };
        }

        // Gắn sự kiện nút Hành Động Nhanh
        const btnAction = this.container.querySelector('#btnTutorialAction');
        if (btnAction) {
            btnAction.onclick = () => {
                try { audio.playClick(); } catch (e) {}
                this.executeStepAction(stepData);
            };
        }

        // Cập nhật Highlight nút
        if (stepData.highlightTarget) {
            this.applyHighlight(stepData.highlightTarget);
        } else {
            this.clearHighlight();
        }
    }

    executeStepAction(stepData) {
        if (!stepData) return;

        switch (stepData.id) {
            case 1:
                // Bước 1: Mở Bếp ASMR và chuyển ngay sang tab Vườn Nguyên Liệu
                if (this.game && this.game.kitchen) {
                    this.game.isKitchenOpen = true;
                    this.game.kitchen.open();
                    // Chuyển tab sang Vườn
                    setTimeout(() => {
                        const btnFarm = document.getElementById('btnTabFarm');
                        if (btnFarm) btnFarm.click();
                    }, 100);
                }
                state.completeTutorialStep(1);
                break;

            case 2:
                // Bước 2: Mở Bếp ASMR và chuyển ngay sang tab Bếp Hàng Đợi
                if (this.game && this.game.kitchen) {
                    this.game.isKitchenOpen = true;
                    this.game.kitchen.open();
                    setTimeout(() => {
                        const btnQueue = document.getElementById('btnTabKitchenQueue');
                        if (btnQueue) btnQueue.click();
                    }, 100);
                }
                state.completeTutorialStep(2);
                break;

            case 3:
                // Bước 3: Dẫn đường tới vạch xanh trường học
                if (this.game && this.game.player) {
                    // Hiển thị toast thông báo
                    if (this.game.sellingManager) {
                        this.game.sellingManager.showToast('📍 Đi theo mũi tên xanh trên mặt đất tới Cổng trường Tiểu học Hoa Mai!');
                    }
                }
                state.completeTutorialStep(3);
                break;

            case 4:
                // Bước 4: Mở sạp bán hàng
                if (this.game && this.game.sellingManager) {
                    const spot = this.game.world ? this.game.world.isInValidSellingSpot(this.game.player.x, this.game.player.y) : null;
                    if (spot) {
                        this.game.sellingManager.openSelling(spot, this.game.player);
                    } else {
                        // Tự động đưa nhân viên tới vạch xanh hợp pháp để mở sạp an toàn
                        this.game.player.x = this.targetCoords.x;
                        this.game.player.y = this.targetCoords.y;
                        const validSpot = this.game.world ? this.game.world.isInValidSellingSpot(this.targetCoords.x, this.targetCoords.y) : null;
                        this.game.sellingManager.openSelling(validSpot, this.game.player);
                    }
                }
                state.completeTutorialStep(4);
                break;

            case 5:
                // Bước 5: Trao thưởng +100.000đ và hoàn tất tân thủ
                state.addMoney(stepData.reward || 100000);
                try { audio.playLevelUp(); } catch (e) {}
                if (this.game && this.game.sellingManager) {
                    this.game.sellingManager.showToast('🎉 Chúc mừng bạn đã hoàn thành khóa Huấn Luyện Tân Thủ! Nhận +100.000đ Vốn Khởi Nghiệp!');
                }
                state.completeTutorialStep(5);
                this.renderStepCard();
                break;

            default:
                break;
        }
    }

    applyHighlight(selector) {
        this.clearHighlight();
        try {
            const el = document.querySelector(selector);
            if (el) {
                el.classList.add('tutorial-pulse-target');
                this.currentHighlight = el;
            }
        } catch (e) {}
    }

    clearHighlight() {
        if (this.currentHighlight) {
            this.currentHighlight.classList.remove('tutorial-pulse-target');
            this.currentHighlight = null;
        }
        document.querySelectorAll('.tutorial-pulse-target').forEach(el => {
            el.classList.remove('tutorial-pulse-target');
        });
    }

    // Vẽ Mũi Tên Dẫn Đường Trên Mặt Đất (Wayfinding Arrow) khi ở Bước 3
    renderWayfinding(ctx, camera, playerX, playerY) {
        if (state.tutorialCompleted) return;
        if (state.tutorialStep !== 3) return;

        const targetX = this.targetCoords.x;
        const targetY = this.targetCoords.y;

        const dx = targetX - playerX;
        const dy = targetY - playerY;
        const dist = Math.hypot(dx, dy);

        // Nếu đã tới nơi (< 50px), vẽ vòng sáng chúc mừng
        if (dist <= 50) {
            const screenTargetX = targetX - camera.x;
            const screenTargetY = targetY - camera.y;

            ctx.save();
            ctx.beginPath();
            ctx.arc(screenTargetX, screenTargetY, 40, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#22c55e';
            ctx.stroke();

            ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
            ctx.fillStyle = '#22c55e';
            ctx.textAlign = 'center';
            ctx.fillText('🟢 ĐÃ TỚI Ô VẠCH XANH HỢP PHÁP!', screenTargetX, screenTargetY - 48);
            ctx.restore();
            return;
        }

        // Tính góc hướng về điểm đích
        const angle = Math.atan2(dy, dx);
        const screenPx = playerX - camera.x;
        const screenPy = playerY - camera.y;

        // Vẽ mũi tên nổi xung quanh nhân vật (bán kính 60px)
        const arrowDist = 60;
        const arrowX = screenPx + Math.cos(angle) * arrowDist;
        const arrowY = screenPy + Math.sin(angle) * arrowDist;

        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);

        // Thân & đầu mũi tên nhấp nháy phát sáng
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(-8, -10);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-8, 10);
        ctx.closePath();

        ctx.fillStyle = '#22c55e';
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.restore();

        // Hiển thị nhãn khoảng cách
        ctx.save();
        ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(`🟢 Vạch Xanh: ${Math.round(dist / 10)}m`, screenPx, screenPy - 45);
        ctx.restore();
    }

    openGuideModal() {
        if (!this.guideModal) return;

        this.guideModal.classList.remove('hidden');

        // Ẩn bàn phím ảo khi mở modal
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
                            <p>Menu 15 vị độc quyền chia 3 phân khúc niêm yết: <strong>20.000đ – 22.000đ – 25.000đ</strong>. Cơm luôn đạt 100% tươi.</p>
                        </div>

                        <div class="tgd-step-item">
                            <div class="tgd-step-badge">BƯỚC 3</div>
                            <div class="tgd-step-icon">🟢</div>
                            <h4>Ô Vạch Xanh</h4>
                            <p>Chỉ bán tại điểm quy hoạch hợp pháp (Trường học, Công viên, Phố đi bộ). Bán sai vị trí sẽ bị Đô Thị xử phạt!</p>
                        </div>

                        <div class="tgd-step-item">
                            <div class="tgd-step-badge">BƯỚC 4</div>
                            <div class="tgd-step-icon">🏪</div>
                            <h4>Bán Cho Khách</h4>
                            <p>Sạp tự động bán mỗi 1.5s hoặc bấm nút <strong>🍙 Bán Cho Khách</strong> để kích hoạt chuỗi Combo x2 – x5 tiền Tip.</p>
                        </div>

                        <div class="tgd-step-item tgd-item-highlight">
                            <div class="tgd-step-badge">BƯỚC 5</div>
                            <div class="tgd-step-icon">🏢</div>
                            <h4>Đế Chế 4 Chi Nhánh</h4>
                            <p>Nâng cấp Robot tự động hóa và mở rộng chuỗi 4 chi nhánh toàn quốc: <strong>TP.HCM, Đắk Lắk, TP. Vinh, Hà Nội</strong> kiếm tiền offline 8 tiếng!</p>
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

        // Gắn lại sự kiện cho các nút trong modal
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
                this.renderStepCard();
            };
        }
    }

    closeGuideModal() {
        if (!this.guideModal) return;
        this.guideModal.classList.add('hidden');

        // Phục hồi bàn phím ảo nếu đang trên thiết bị cảm ứng
        const virtualControls = document.getElementById('virtualTouchControls');
        const isTouchDevice = (typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)));
        if (virtualControls && isTouchDevice) {
            virtualControls.classList.remove('hidden');
        }
    }
}
