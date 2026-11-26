// src/main.js - Vòng lặp Game Loop, Camera theo nhân vật, Tương tác E, Sạp Bán Hàng, HUD RPG & Smartphone iGiri

import { state, VEHICLES } from './state.js';
import { audio } from './audio.js';
import { World } from './world.js';
import { Player } from './player.js';
import { KitchenASMR } from './kitchenASMR.js';
import { sellingManager } from './selling.js';
import { QuestManager } from './quests.js';
import { MarketManager } from './market.js';
import { deliveryManager } from './deliveryMode.js';
import { seaweedGame } from './seaweedGame.js';
import { network } from './network.js';
import { onlineUI } from './onlineUI.js';
import { characterRenderer } from './characterRenderer.js';
import { TutorialManager } from './tutorial.js';

class GameApp {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.world = new World();
        this.player = new Player(420, 1250); // Bắt đầu gần Xưởng Bếp

        this.camera = { x: 0, y: 0 };
        this.keys = {};
        this.isKitchenOpen = false;
        this.isMarketOpen = false;
        this.lastPromptKey = null;

        // Đồng hồ 24h & Khung giờ
        this.lastFrameTime = Date.now();
        this.lastRenderedClockTime = '';
        this.lastRenderedClockStatus = '';

        this.kitchen = new KitchenASMR(
            document.getElementById('kitchenModal'),
            () => {
                this.isKitchenOpen = false;
                this.updateHUD();
            }
        );

        // Khởi tạo Không gian Chợ Đầu Mối
        this.market = new MarketManager(
            document.getElementById('marketModal'),
            (restoredPos) => {
                this.isMarketOpen = false;
                if (restoredPos) {
                    this.player.x = restoredPos.x;
                    this.player.y = restoredPos.y;
                }
                this.updateHUD();
            }
        );

        // Khởi tạo hệ thống Smartphone iGiri OS (GTA Phone)
        this.questManager = new QuestManager(
            document.getElementById('phoneModal'),
            document.getElementById('phoneTriggerBtn')
        );

        this.state = state;
        this.network = network;
        this.onlineUI = onlineUI;
        if (typeof window !== 'undefined') {
            window.state = state;
            window.network = network;
            window.onlineUI = onlineUI;
        }

        this.init();
    }

    init() {
        // Tải dữ liệu lưu LocalStorage
        state.load();

        // Nạp đúng bản đồ thành phố và cấp độ đô thị hóa
        if (state.currentCity) {
            this.world.loadCity(state.currentCity, state.getBranchLevel(state.currentCity));
        }

        // Khởi tạo hệ thống mạng Multiplayer Real-time & Giả lập Bot AI
        network.init();

        // Kích thước Canvas
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Phím điều khiển
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Bắt sự kiện Click chuột & Chạm Touch trên Canvas để bán hàng & tương tác người chơi
        this.canvas.addEventListener('pointerdown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const clientY = e.clientY - rect.top;
            const intercepted = this.handleInputCoords(clientX, clientY);
            if (intercepted) {
                e.stopPropagation();
            }
        });
        this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.handleInputCoords(touch.clientX - rect.left, touch.clientY - rect.top);
            }
        }, { passive: true });

        // Click thông báo tương tác
        const promptBanner = document.getElementById('proximityPrompt');
        if (promptBanner) {
            promptBanner.onclick = () => this.triggerInteraction();
        }

        // Lắng nghe thay đổi trạng thái state
        state.onUpdate((s, extra) => {
            this.updateHUD();
            const curLvl = state.getBranchLevel(state.currentCity);
            if (this.world.currentCityId !== state.currentCity || this.world.currentCityLevel !== curLvl) {
                this.world.loadCity(state.currentCity, curLvl);
            }
            if (extra && extra.billSettled) {
                this.showDailyBillModal(extra.billSettled);
            }
        });
        this.updateHUD();

        // Xử lý nút "BẮT ĐẦU KINH DOANH" trên Màn hình bắt đầu (Hỗ trợ cả Click chuột & Chạm Touch)
        const btnStart = document.getElementById('btnStartGame');
        const startOverlay = document.getElementById('startScreen');
        if (btnStart && startOverlay) {
            let started = false;
            const handleStart = (e) => {
                if (started) return;
                started = true;
                if (e) {
                    if (e.stopPropagation) e.stopPropagation();
                    if (e.cancelable && e.type === 'touchend') e.preventDefault();
                }
                // Kích hoạt Web Audio API để âm thanh không bị trình duyệt chặn
                try {
                    audio.resume();
                    audio.playClick();
                } catch (err) {
                    console.warn('Audio resume:', err);
                }

                // Đọc và thiết lập Tên Thương Hiệu nếu người chơi nhập
                const nameInput = document.getElementById('startBrandNameInput');
                if (nameInput && nameInput.value.trim().length > 0) {
                    state.setBrandName(nameInput.value.trim());
                    network.refreshLeaderboard();
                }

                // Chọn Chi Nhánh Khởi Nghiệp
                const branchSelect = document.getElementById('startBranchSelect');
                if (branchSelect && branchSelect.value) {
                    const selCity = branchSelect.value;
                    if (selCity !== state.currentCity) {
                        this.switchCity(selCity);
                    }
                }

                // Ô nhập Số Điện Thoại nhận quà +200.000đ vốn khởi nghiệp
                const phoneInput = document.getElementById('startPhoneInput');
                if (phoneInput && phoneInput.value.trim().length >= 8) {
                    const phoneVal = phoneInput.value.trim();
                    if (!state.claimedGiftPhone) {
                        state.claimedGiftPhone = true;
                        state.addMoney(200000);
                        if (onlineUI && onlineUI.showToastNotification) {
                            onlineUI.showToastNotification('🎁 Bạn nhận được +200.000đ vốn khởi nghiệp từ số điện thoại!');
                        }
                    }
                    try {
                        fetch('/api/leads', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                phone: phoneVal,
                                brandName: state.brandName || 'Tiệm Cơm Nắm Sài Gòn',
                                city: state.currentCity || 'hcm'
                            })
                        }).catch(() => {});
                    } catch (eLeads) {}
                }

                // Hiệu ứng fade-out êm ái
                startOverlay.classList.add('fade-out');
                setTimeout(() => {
                    startOverlay.classList.add('hidden');
                    // [BƯỚC 2B] Kiểm tra Thu Nhập Offline hoặc Quà Điểm Danh 7 Ngày
                    if (state.pendingOfflineIncome && state.pendingOfflineIncome.amount > 0) {
                        if (this.questManager && typeof this.questManager.openOfflineIncomeModal === 'function') {
                            this.questManager.openOfflineIncomeModal(state.pendingOfflineIncome);
                        }
                    } else {
                        const attStatus = state.checkAttendanceStatus ? state.checkAttendanceStatus() : null;
                        if (attStatus && attStatus.canClaim) {
                            if (this.questManager && typeof this.questManager.openDailyAttendanceModal === 'function') {
                                this.questManager.openDailyAttendanceModal();
                            }
                        }
                    }
                }, 400);
            };

            btnStart.onclick = handleStart;
            btnStart.ontouchend = handleStart;
            btnStart.addEventListener('click', handleStart);
            btnStart.addEventListener('touchend', handleStart);
        }

        // Click Avatar Bếp Trưởng góc trên để đổi tên thương hiệu
        const avatarCard = document.querySelector('.hud-avatar-card');
        if (avatarCard) {
            avatarCard.style.cursor = 'pointer';
            avatarCard.onclick = () => {
                onlineUI.showBrandNameDialog();
            };
        }

        // Nút Bật/Tắt âm thanh toàn cục (Mute/Unmute) trên HUD
        const btnAudio = document.getElementById('btnToggleAudio');
        const audioIcon = document.getElementById('hudAudioIcon');
        const updateAudioIcon = () => {
            if (audioIcon) {
                audioIcon.textContent = audio.isMuted ? '🔇' : '🔊';
            }
        };
        updateAudioIcon();
        if (btnAudio) {
            btnAudio.onclick = () => {
                audio.resume();
                audio.toggleMute();
                updateAudioIcon();
            };
        }

        // Khởi tạo bộ điều khiển cảm ứng chuẩn Mobile & iPad
        this.initTouchControls();

        // Khởi tạo hệ thống Hướng Dẫn Tân Thủ 5 Bước & Cẩm Nang Khởi Nghiệp
        this.tutorialManager = new TutorialManager(this);
        this.tutorialManager.init();

        // Khởi động vòng lặp game
        requestAnimationFrame(() => this.loop());
    }

    initTouchControls() {
        const touchLayer = document.getElementById('virtualTouchControls');
        const btnToggle = document.getElementById('btnToggleTouch');
        const btnReset = document.getElementById('btnResetGame');

        // 1. Tự động phát hiện màn hình cảm ứng (Mobile / iPad)
        const isTouchDevice = (typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)));
        if (touchLayer && isTouchDevice) {
            touchLayer.classList.remove('hidden');
        }

        // 1b. TỰ ĐỘNG ẨN CỤM PHÍM ẢO KHI MỞ BẤT KỲ CỬA SỔ MODAL NÀO (Bếp ASMR, Chợ, Điện Thoại, BXH, Hóa Đơn)
        let wasTouchActiveBeforeModal = false;
        const checkModalVisibility = () => {
            if (!touchLayer) return;
            const modalSelectors = [
                '#kitchenModal',
                '#marketModal',
                '#phoneModal',
                '#dailyBillModal',
                '#onlineQuickMenu',
                '#brandNameModal',
                '#pvpChallengeDialog',
                '#pvpInviteNotification:not(.hidden)',
                '#friendInviteNotification:not(.hidden)',
                '#playerProfileModal:not(.hidden)',
                '#nearbyPlayersModal:not(.hidden)'
            ];
            const isAnyOpen = modalSelectors.some(sel => {
                const el = document.querySelector(sel);
                return el && !el.classList.contains('hidden') && el.style.display !== 'none';
            });

            // Nếu đang focus vào ô input (ví dụ ô nhập chat, đổi tên)
            const activeTag = document.activeElement ? document.activeElement.tagName : '';
            const isTyping = (activeTag === 'INPUT' || activeTag === 'TEXTAREA');

            if (isAnyOpen || isTyping) {
                if (!touchLayer.classList.contains('hidden')) {
                    wasTouchActiveBeforeModal = true;
                    touchLayer.classList.add('hidden');
                }
            } else if (wasTouchActiveBeforeModal) {
                touchLayer.classList.remove('hidden');
                wasTouchActiveBeforeModal = false;
            }
        };

        // Theo dõi thay đổi trạng thái của các Modal qua MutationObserver
        try {
            if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver(() => {
                    checkModalVisibility();
                });
                ['kitchenModal', 'marketModal', 'phoneModal', 'dailyBillModal', 'onlineQuickMenu', 'brandNameModal', 'pvpChallengeDialog', 'pvpInviteNotification', 'friendInviteNotification', 'playerProfileModal', 'nearbyPlayersModal'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        observer.observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
                    }
                });

                // Lắng nghe sự kiện focus/blur trên toàn document để ẩn/hiện phím ảo khi gõ phím
                document.addEventListener('focusin', checkModalVisibility);
                document.addEventListener('focusout', () => setTimeout(checkModalVisibility, 100));
            }
        } catch (e) {}

        // Nút bật/tắt phím ảo trên thanh HUD
        if (btnToggle && touchLayer) {
            btnToggle.onclick = () => {
                audio.resume();
                audio.playClick();
                touchLayer.classList.toggle('hidden');
            };
        }

        // Nút chơi lại từ đầu với xác nhận an toàn
        if (btnReset) {
            btnReset.onclick = () => {
                audio.resume();
                audio.playClick();
                state.resetGame();
            };
        }

        // 2. Xử lý Joystick ảo đa điểm chạm (Multi-touch Virtual Joystick)
        const joystickZone = document.getElementById('touchJoystickZone');
        const joystickBase = document.getElementById('touchJoystickBase');
        const joystickKnob = document.getElementById('touchJoystickKnob');

        if (joystickZone && joystickBase && joystickKnob) {
            let activeTouchId = null;
            let baseRect = null;
            const maxRadius = 45; // Bán kính tối đa cần gạt Joystick (px)

            const updateKnobAndAxis = (clientX, clientY) => {
                if (!baseRect) baseRect = joystickBase.getBoundingClientRect();
                const centerX = baseRect.left + baseRect.width / 2;
                const centerY = baseRect.top + baseRect.height / 2;

                const deltaX = clientX - centerX;
                const deltaY = clientY - centerY;
                const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                if (dist <= 0) {
                    joystickKnob.style.transform = `translate(0px, 0px)`;
                    this.player.resetVirtualAxis();
                    return;
                }

                const clampedDist = Math.min(dist, maxRadius);
                const normX = deltaX / dist;
                const normY = deltaY / dist;

                const knobX = normX * clampedDist;
                const knobY = normY * clampedDist;
                joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;

                // Vùng chết 8px để chống kẹt trôi khi vô tình chạm nhẹ
                if (dist < 8) {
                    this.player.resetVirtualAxis();
                } else {
                    const power = clampedDist / maxRadius;
                    this.player.setVirtualAxis(normX * power, normY * power);
                }
            };

            const resetJoystick = () => {
                activeTouchId = null;
                baseRect = null;
                joystickKnob.style.transform = `translate(0px, 0px)`;
                this.player.resetVirtualAxis();
            };

            // Quản lý đa điểm chạm tách biệt bằng touch.identifier
            joystickZone.addEventListener('touchstart', (e) => {
                if (e.cancelable) e.preventDefault();
                audio.resume();
                baseRect = joystickBase.getBoundingClientRect();

                if (e.changedTouches) {
                    for (let i = 0; i < e.changedTouches.length; i++) {
                        const touch = e.changedTouches[i];
                        if (activeTouchId === null) {
                            activeTouchId = touch.identifier;
                            updateKnobAndAxis(touch.clientX, touch.clientY);
                            break;
                        }
                    }
                }
            }, { passive: false });

            window.addEventListener('touchmove', (e) => {
                if (activeTouchId === null || !e.changedTouches) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const touch = e.changedTouches[i];
                    if (touch.identifier === activeTouchId) {
                        if (e.cancelable) e.preventDefault();
                        updateKnobAndAxis(touch.clientX, touch.clientY);
                        break;
                    }
                }
            }, { passive: false });

            const handleTouchEnd = (e) => {
                if (activeTouchId === null || !e.changedTouches) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === activeTouchId) {
                        resetJoystick();
                        break;
                    }
                }
            };

            window.addEventListener('touchend', handleTouchEnd);
            window.addEventListener('touchcancel', handleTouchEnd);

            // Hỗ trợ chuột thử nghiệm trên PC / Mac
            let isMouseDown = false;
            joystickZone.addEventListener('mousedown', (e) => {
                isMouseDown = true;
                baseRect = joystickBase.getBoundingClientRect();
                updateKnobAndAxis(e.clientX, e.clientY);
            });
            window.addEventListener('mousemove', (e) => {
                if (!isMouseDown) return;
                updateKnobAndAxis(e.clientX, e.clientY);
            });
            window.addEventListener('mouseup', () => {
                if (isMouseDown) {
                    isMouseDown = false;
                    resetJoystick();
                }
            });
        }

        // 3. Xử lý các Action Buttons góc dưới bên phải
        const btnTouchE = document.getElementById('btnTouchE');
        const btnTouchStall = document.getElementById('btnTouchStall');
        const btnTouchSell = document.getElementById('btnTouchSell');

        const attachTouchAction = (btn, actionFn) => {
            if (!btn) return;
            let lastTime = 0;
            const handler = (e) => {
                const now = Date.now();
                if (now - lastTime < 250) return;
                lastTime = now;
                if (e && e.cancelable && (e.type === 'touchstart' || e.type === 'touchend')) {
                    e.preventDefault();
                }
                actionFn();
            };
            btn.addEventListener('touchstart', handler, { passive: false });
            btn.addEventListener('click', handler);
        };

        if (btnTouchE) {
            attachTouchAction(btnTouchE, () => {
                audio.resume();
                audio.playClick();
                this.triggerInteraction();
            });
        }

        if (btnTouchStall) {
            attachTouchAction(btnTouchStall, () => {
                audio.resume();
                audio.playClick();

                if (sellingManager.isOpen) {
                    sellingManager.closeSelling();
                    this.updateHUD();
                } else {
                    let nearby = this.world.getNearbyRegion(this.player.x, this.player.y);
                    if (!nearby && typeof this.world.isInValidSellingSpot === 'function') {
                        const spot = this.world.isInValidSellingSpot(this.player.x, this.player.y);
                        if (spot) {
                            nearby = (this.world.regions && this.world.regions.find(r => r.id === spot.regionId || r.id === spot.id)) || spot;
                        }
                    }
                    const isLegalSpot = Boolean(
                        (this.world && typeof this.world.isInValidSellingSpot === 'function' && this.world.isInValidSellingSpot(this.player.x, this.player.y)) ||
                        (sellingManager && typeof sellingManager.isInsideLegalZone === 'function' && sellingManager.isInsideLegalZone(this.player.x, this.player.y))
                    );

                    if (nearby && (
                        isLegalSpot ||
                        nearby.type === 'stall' ||
                        nearby.type === 'school' ||
                        nearby.type === 'office' ||
                        nearby.type === 'walking_street' ||
                        nearby.type === 'park' ||
                        nearby.type === 'market' ||
                        nearby.type === 'green_zone' ||
                        nearby.id.startsWith('school_') ||
                        nearby.id.startsWith('spot_') ||
                        nearby.id === 'university_town' ||
                        nearby.id === 'office_q1' ||
                        nearby.id === 'walking_street' ||
                        nearby.id === 'school' ||
                        nearby.id === 'office' ||
                        (nearby.regionId && (
                            nearby.regionId.startsWith('school_') ||
                            nearby.regionId === 'university_town' ||
                            nearby.regionId === 'office_q1' ||
                            nearby.regionId === 'walking_street' ||
                            nearby.regionId.includes('school') ||
                            nearby.regionId.includes('office') ||
                            nearby.regionId.includes('walking') ||
                            nearby.regionId.includes('university')
                        ))
                    )) {
                        sellingManager.toggleSelling(nearby, this.player);
                        this.updateHUD();
                    } else {
                        sellingManager.showToast('📍 Hãy tới Cổng trường, Khu văn phòng, Công viên hoặc Phố đi bộ để mở sạp!');
                    }
                }
            });
        }

        if (btnTouchSell) {
            attachTouchAction(btnTouchSell, () => {
                audio.resume();
                if (sellingManager.isOpen) {
                    sellingManager.sellQuick();
                } else {
                    audio.playError();
                    sellingManager.showToast('🏪 Hãy mở sạp trước khi bán nhanh cho khách!');
                }
            });
        }

        const btnQuickSellStall = document.getElementById('btnQuickSellStall');
        if (btnQuickSellStall) {
            attachTouchAction(btnQuickSellStall, () => {
                audio.resume();
                if (!sellingManager.isOpen) {
                    sellingManager.showToast('🏪 Hãy mở sạp trước!');
                    return;
                }
                const hasRice = Boolean(state.inventory && state.inventory.length > 0);
                if (!hasRice) {
                    // Nếu hết sạch cơm, bấm nút sẽ mở ngay Bếp ASMR để nấu thêm
                    this.isKitchenOpen = true;
                    if (this.kitchen && typeof this.kitchen.open === 'function') {
                        this.kitchen.open();
                    }
                    return;
                }
                sellingManager.sellQuick();
            });
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    onCanvasClick(e) {
        audio.resume();
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        this.handleInputCoords(clientX, clientY);
    }

    handleInputCoords(screenX, screenY) {
        // Nếu điện thoại, bếp hoặc chợ đang mở, bỏ qua click trên canvas
        if (this.questManager.isOpen || this.isKitchenOpen || this.isMarketOpen) return false;
        if (onlineUI && typeof onlineUI.isAnyModalOpen === 'function' && onlineUI.isAnyModalOpen()) return false;

        // Chuyển đổi tọa độ màn hình sang tọa độ thực tế trong thế giới game (World Coordinates)
        const worldX = screenX + this.camera.x;
        const worldY = screenY + this.camera.y;

        // 1. Kiểm tra click/tap trúng người chơi trực tuyến khác (Bán kính chạm tối thiểu 56px trên màn hình)
        // Hỗ trợ chuẩn cả tọa độ 2D lẫn 3D Camera projection, ưu tiên bắt sự kiện chọn người chơi trước
        let clickedOther = null;
        let minDist = 56;
        for (const p of network.otherPlayers.values()) {
            const pScreen = (city3D && typeof city3D.projectToScreen === 'function')
                ? city3D.projectToScreen(p.x, p.y, this.camera)
                : { x: p.x - this.camera.x, y: p.y - this.camera.y };

            const screenDist = Math.hypot(screenX - pScreen.x, screenY - pScreen.y);
            const worldDist = Math.hypot(worldX - p.x, worldY - p.y);

            if (screenDist <= minDist || worldDist <= 56) {
                clickedOther = p;
                minDist = Math.min(minDist, screenDist);
            }
        }

        if (clickedOther) {
            if (onlineUI.closeQuickMenu) onlineUI.closeQuickMenu();
            if (onlineUI.openPlayerProfile) {
                onlineUI.openPlayerProfile(clickedOther);
            } else if (onlineUI.openQuickMenu) {
                onlineUI.openQuickMenu(clickedOther, screenX, screenY);
            }
            return true; // Ưu tiên bắt sự kiện chọn người chơi trước thao tác di chuyển/bán hàng
        } else {
            if (onlineUI.closeQuickMenu) onlineUI.closeQuickMenu();
        }

        if (sellingManager.isOpen) {
            sellingManager.handleClick(worldX, worldY);
        }
        return false;
    }

    onKeyDown(e) {
        // [KỸ SƯ CẢM ỨNG & BÀN PHÍM ẢO] Không can thiệp hoặc chặn phím khi người chơi đang gõ văn bản
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;

        audio.resume();

        // Nếu chợ hoặc mini-game bóc rong biển đang mở, chặn điều khiển bản đồ chính
        if (this.isMarketOpen || seaweedGame.isOpen) {
            return;
        }

        // Phím Escape: đóng điện thoại hoặc mini-game nếu đang mở
        if (e.code === 'Escape') {
            if (this.questManager.isOpen) {
                this.questManager.close();
                return;
            }
            if (seaweedGame.isOpen) {
                seaweedGame.close();
                return;
            }
        }

        // Nếu điện thoại đang mở, không nhận phím di chuyển và tương tác bản đồ
        if (this.questManager.isOpen) {
            return;
        }

        this.keys[e.code] = true;

        // Phím B: Phím tắt "Biểu diễn Bóc Cơm VIP" khi đứng tại Phố Đi Bộ
        if (e.code === 'KeyB') {
            const nearby = this.world.getNearbyRegion(this.player.x, this.player.y);
            const isAtWalkingStreet = (nearby && nearby.id === 'walking_street') ||
                (sellingManager.isOpen && sellingManager.currentSpot && sellingManager.currentSpot.id === 'walking_street');
            if (isAtWalkingStreet) {
                e.preventDefault();
                seaweedGame.open('melting_beef_cheese', (success) => {
                    if (success) {
                        sellingManager.showToast('👑 Biểu diễn bóc rong biển thành công rực rỡ! Khách VIP tán thưởng x3 Tip!');
                    }
                    this.updateHUD();
                });
                return;
            }
        }

        // Phím Space: Nếu đang mở sạp bán hàng thì ưu tiên BÁN NHANH cho khách đầu tiên
        if (e.code === 'Space') {
            if (sellingManager.isOpen) {
                e.preventDefault();
                sellingManager.sellQuick();
                return;
            }
        }

        // Phím E hoặc Phím Cách để kích hoạt tương tác khu vực
        if (e.code === 'KeyE' || e.code === 'Space') {
            e.preventDefault();
            this.triggerInteraction();
        }
    }

    onKeyUp(e) {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
        this.keys[e.code] = false;
    }

    triggerInteraction() {
        if (this.questManager.isOpen || this.isMarketOpen || seaweedGame.isOpen) return;

        // 1. ƯU TIÊN KIỂM TRA ĐIỂM GIAO ĐƠN HỎA TỐC
        if (deliveryManager.isPlayerAtDeliveryZone(this.player)) {
            const res = deliveryManager.tryDeliver(this.player);
            if (res.success) {
                sellingManager.showToast(`⚡ Giao hỏa tốc thành công đến ${res.destName}! Nhận +${res.rewardMoney.toLocaleString('vi-VN')}đ (+50%)`);
                this.updateHUD();
                return;
            } else if (res.reason === 'missing_rice') {
                sellingManager.showToast(`⚠️ Thiếu cơm hỏa tốc: Cần ${res.needed} nắm ${res.fillingName} (Bạn có ${res.current})!`);
                return;
            }
        }

        let nearby = this.world.getNearbyRegion(this.player.x, this.player.y);
        if (!nearby && typeof this.world.isInValidSellingSpot === 'function') {
            const spot = this.world.isInValidSellingSpot(this.player.x, this.player.y);
            if (spot) {
                nearby = (this.world.regions && this.world.regions.find(r => r.id === spot.regionId || r.id === spot.id)) || spot;
            }
        }
        if (!nearby) return;

        // Điểm bán đang bị khóa do chưa đủ cấp chi nhánh
        if (nearby.isLocked) {
            audio.playError();
            sellingManager.showToast(`🔒 ${nearby.name} đang bị khóa! ${nearby.unlockRequirement || 'Cần nâng cấp Chi nhánh'}!`);
            return;
        }

        if (nearby.id === 'kitchen') {
            this.isKitchenOpen = true;
            this.kitchen.open();
        } else if (nearby.id === 'market') {
            // Vào không gian bên trong Chợ Đầu Mối (3 sạp hàng)
            this.isMarketOpen = true;
            this.market.open({ x: this.player.x, y: this.player.y });
        } else if (
            nearby.type === 'stall' ||
            nearby.type === 'school' ||
            nearby.type === 'office' ||
            nearby.type === 'walking_street' ||
            nearby.type === 'park' ||
            nearby.type === 'market' ||
            nearby.type === 'green_zone' ||
            nearby.id.startsWith('school_') ||
            nearby.id.startsWith('spot_') ||
            nearby.id === 'university_town' ||
            nearby.id === 'office_q1' ||
            nearby.id === 'walking_street' ||
            nearby.id === 'school' ||
            nearby.id === 'office' ||
            (nearby.regionId && (
                nearby.regionId.startsWith('school_') ||
                nearby.regionId === 'university_town' ||
                nearby.regionId === 'office_q1' ||
                nearby.regionId === 'walking_street' ||
                nearby.regionId.includes('school') ||
                nearby.regionId.includes('office') ||
                nearby.regionId.includes('walking') ||
                nearby.regionId.includes('university')
            )) ||
            (this.world && typeof this.world.isInValidSellingSpot === 'function' && this.world.isInValidSellingSpot(this.player.x, this.player.y))
        ) {
            // Mở hoặc Đóng sạp bán hàng tại Cổng Trường Học, Làng Đại Học, Khu Văn Phòng, Phố Đi Bộ & Các Ô Vạch Xanh
            sellingManager.toggleSelling(nearby, this.player);
        }
    }

    // Di chuyển tới thành phố chi nhánh khác (Dịch chuyển giữ nguyên toàn bộ tài sản, kho 15 vị và đồng hồ)
    switchCity(cityId) {
        if (!state.isBranchUnlocked(cityId)) {
            sellingManager.showToast('🔒 Chi nhánh này chưa được mở khóa!');
            return false;
        }

        // Đóng sạp hàng nếu đang bán
        if (sellingManager.isOpen) {
            sellingManager.closeSelling();
        }

        state.switchCity(cityId);
        network.spawnBotsForCity(cityId);
        const lvl = state.getBranchLevel(cityId);
        this.world.loadCity(cityId, lvl);

        // Đặt nhân vật xuất hiện an toàn trước Xưởng Bếp Chi Nhánh
        this.player.x = 450 + 130;
        this.player.y = 2350 + 260;

        // Camera lập tức bám theo nhân vật
        this.camera.x = Math.max(0, Math.min(this.world.width - this.canvas.width, this.player.x - this.canvas.width / 2));
        this.camera.y = Math.max(0, Math.min(this.world.height - this.canvas.height, this.player.y - this.canvas.height / 2));

        // Đóng điện thoại nếu đang mở
        if (this.questManager && this.questManager.isOpen) {
            this.questManager.toggle();
        }

        this.updateHUD();
        sellingManager.showToast(`✈️ Chào mừng bạn đến với ${this.world.cityName}!`);
        return true;
    }

    updateHUD() {
        // Tên Thương Hiệu trên Avatar HUD
        const avatarTitleEl = document.querySelector('.hud-avatar-title');
        if (avatarTitleEl && state.brandName) {
            avatarTitleEl.textContent = state.brandName;
        }

        // Tiền
        const moneyEl = document.getElementById('hudMoney');
        if (moneyEl) moneyEl.innerText = state.money.toLocaleString('vi-VN') + 'đ';

        // Level & Chỉ số thưởng RPG
        const levelEl = document.getElementById('hudLevel');
        if (levelEl) {
            const priceBonus = Math.round((state.getPriceMultiplier() - 1) * 100);
            const speedBonus = Math.round((state.getSpeedMultiplier() - 1) * 100);
            levelEl.innerHTML = `Cấp ${state.level} <small style="font-size: 10px; opacity: 0.85; margin-left: 4px;">(+${priceBonus}% Giá, +${speedBonus}% Tốc)</small>`;
        }

        // EXP Bar
        const expBar = document.getElementById('hudExpFill');
        const needed = state.getExpNeeded();
        if (expBar) expBar.style.width = Math.min(100, (state.exp / needed) * 100) + '%';

        // Số cơm nắm đang mang theo (Hiển thị rõ dạng: Kho mang theo: X / Y nắm, kèm cơm lưu xưởng nếu có)
        const countEl = document.getElementById('hudRiceCount');
        if (countEl) {
            const currentRice = state.getTotalRiceCount();
            const maxCap = state.getMaxCapacity();
            const stockCount = Array.isArray(state.kitchenStock) ? state.kitchenStock.length : 0;
            const stockSuffix = stockCount > 0 ? ` <span style="font-size: 11px; opacity: 0.9; color: #38bdf8;">(+${stockCount} Xưởng)</span>` : '';
            countEl.innerHTML = `Kho mang theo: ${currentRice} / ${maxCap} nắm${stockSuffix}`;
            if (currentRice >= maxCap) {
                countEl.style.color = '#ef4444';
            } else {
                countEl.style.color = '';
            }
        }

        // Cập nhật chấm đỏ thông báo điện thoại
        if (this.questManager) {
            this.questManager.updateNotificationBadge();
        }

        // Cập nhật số lượng người chơi quanh đây trên HUD
        if (onlineUI && typeof onlineUI.updateNearbyCount === 'function') {
            onlineUI.updateNearbyCount();
        }

        // Cập nhật Đồng hồ 24h & Khung giờ
        this.updateClockHUD();
    }

    updateClockHUD() {
        const timeInfo = state.getTimePeriodInfo();
        if (this.lastRenderedClockTime !== timeInfo.timeStr) {
            this.lastRenderedClockTime = timeInfo.timeStr;
            const clockTimeEl = document.getElementById('hudClockTime');
            if (clockTimeEl) clockTimeEl.textContent = timeInfo.timeStr;
        }
        if (this.lastRenderedClockStatus !== timeInfo.statusLabel) {
            this.lastRenderedClockStatus = timeInfo.statusLabel;
            const clockStatusEl = document.getElementById('hudClockStatus');
            if (clockStatusEl) clockStatusEl.textContent = timeInfo.statusLabel;
        }
    }

    // Hiển thị bảng tổng kết Hóa Đơn Chi Phí Vận Hành Cuối Ngày (23:55)
    showDailyBillModal(summary) {
        const modal = document.getElementById('dailyBillModal');
        if (!modal || !summary) return;

        const isDeficit = summary.deficit > 0;
        const totalRev = (summary.dailyRevenue || 0) + (summary.dailyTips || 0);
        const v = VEHICLES[state.currentVehicle];
        const vLvl = v ? (v.level || 1) : 1;
        const staffCost = (state.staffCount || 0) * 35000;
        const vehicleCost = vLvl * 20000;
        const branchCost = Math.max(0, summary.totalCost - staffCost - vehicleCost);

        modal.innerHTML = `
            <div class="daily-bill-card">
                <div class="bill-header">
                    <h3>🧾 HÓA ĐƠN VẬN HÀNH NGÀY ${summary.day || 1} (23:55)</h3>
                    <p>Tổng kết thu chi kinh doanh & thanh toán chi phí cố định</p>
                </div>

                <div class="bill-section-title">1. Thu Nhập Trong Ngày</div>
                <div class="bill-breakdown-box">
                    <div class="bill-row">
                        <span>💰 Doanh thu bán cơm:</span>
                        <strong style="color: #4ade80;">+${(summary.dailyRevenue || 0).toLocaleString('vi-VN')}đ</strong>
                    </div>
                    <div class="bill-row">
                        <span>💖 Tiền Tip phục vụ:</span>
                        <strong style="color: #facc15;">+${(summary.dailyTips || 0).toLocaleString('vi-VN')}đ</strong>
                    </div>
                    <div class="bill-row subtotal">
                        <span>Tổng thu hôm nay:</span>
                        <strong style="color: #38bdf8;">+${totalRev.toLocaleString('vi-VN')}đ</strong>
                    </div>
                </div>

                <div class="bill-section-title">2. Chi Phí Cố Định Hằng Ngày</div>
                <div class="bill-breakdown-box">
                    <div class="bill-row">
                        <span>🧑‍🍳 Lương nhân viên AI:</span>
                        <span style="color: #f87171;">-${staffCost.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div class="bill-row">
                        <span>🏢 Phí duy trì chi nhánh:</span>
                        <span style="color: #f87171;">-${branchCost.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div class="bill-row">
                        <span>🛵 Bảo dưỡng xe & kho lạnh:</span>
                        <span style="color: #f87171;">-${vehicleCost.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div class="bill-row subtotal">
                        <span>Tổng hóa đơn vận hành:</span>
                        <strong style="color: #ef4444;">-${(summary.totalCost || 0).toLocaleString('vi-VN')}đ</strong>
                    </div>
                </div>

                ${isDeficit ? `
                    <div class="bill-deficit-warning">
                        ⚠️ <strong>QUỸ TIỀN MẶT KHÔNG ĐỦ CHI TRẢ!</strong><br>
                        Đã thanh toán: <strong>${summary.paid.toLocaleString('vi-VN')}đ</strong>. Còn nợ: <strong style="color: #fee2e2;">${summary.deficit.toLocaleString('vi-VN')}đ</strong>.<br>
                        <em>Dây chuyền tự động và nhân viên sẽ tạm ngưng làm việc cho đến khi bạn tự đi bán gom đủ tiền bù vào!</em>
                    </div>
                ` : `
                    <div class="bill-breakdown-box">
                        <div class="bill-row net-profit">
                            <span>Lợi Nhuận Ròng Ngày:</span>
                            <strong style="color: ${summary.netProfit >= 0 ? '#4ade80' : '#ef4444'};">
                                ${summary.netProfit >= 0 ? '+' : ''}${summary.netProfit.toLocaleString('vi-VN')}đ
                            </strong>
                        </div>
                    </div>
                `}

                <button type="button" class="btn-close-daily-bill" id="btnCloseDailyBill">
                    Tiếp Tục Ngày Mới (00:00)
                </button>
            </div>
        `;

        modal.classList.remove('hidden');

        const btnClose = modal.querySelector('#btnCloseDailyBill');
        if (btnClose) {
            btnClose.onclick = () => {
                audio.playClick();
                modal.classList.add('hidden');
            };
        }
    }

    loop() {
        try {
            // Cập nhật bước thời gian game (1 giây thực = 5 phút game) & Đồng hồ HUD
            const now = Date.now();
            const dt = this.lastFrameTime ? Math.min(0.2, (now - this.lastFrameTime) / 1000) : (1 / 60);
            this.lastFrameTime = now;

            state.advanceTime(dt);
            state.updateFarm(now);
            state.updateKitchenSlots(now);
            this.updateClockHUD();

            if (!this.isKitchenOpen && !this.isMarketOpen) {
                // 1. Cập nhật nhân vật chính (khi mở điện thoại hoặc mini-game bóc rong biển: isFrozen = true)
                try {
                    const isFrozen = Boolean(this.questManager?.isOpen || seaweedGame?.isOpen);
                    this.player.update(this.keys, this.world, sellingManager.isOpen, isFrozen);
                } catch (errPlayer) {
                    console.error('[GameApp] player.update error:', errPlayer);
                }

                // 2. Cập nhật phương tiện giao thông chạy trên đường & kiểm tra va chạm với người chơi
                try {
                    this.world.updateTraffic(this.player);
                } catch (errTraffic) {
                    console.error('[GameApp] world.updateTraffic error:', errTraffic);
                }

                // 3. Cập nhật hệ thống Đơn Hỏa Tốc (đếm ngược 60s & mũi tên chỉ đường)
                try {
                    deliveryManager.update(this.player);
                } catch (errDelivery) {
                    console.error('[GameApp] deliveryManager.update error:', errDelivery);
                }

                // 4. Cập nhật logic bán hàng & NPC khách hàng & AI staff (Bọc try-catch phòng thủ)
                try {
                    sellingManager.update(this.player, this.world);
                } catch (errSelling) {
                    console.error('[GameApp] sellingManager.update error:', errSelling);
                }

                // 5. Camera mượt mà bám theo nhân vật
                try {
                    const targetX = this.player.x - this.canvas.width / 2;
                    const targetY = this.player.y - this.canvas.height / 2;
                    this.camera.x += (targetX - this.camera.x) * 0.1;
                    this.camera.y += (targetY - this.camera.y) * 0.1;

                    // Khóa biên camera trong lòng bản đồ
                    this.camera.x = Math.max(0, Math.min(this.world.width - this.canvas.width, this.camera.x));
                    this.camera.y = Math.max(0, Math.min(this.world.height - this.canvas.height, this.camera.y));
                } catch (errCamera) {
                    console.error('[GameApp] camera bám theo error:', errCamera);
                }

                // 5.5. Cập nhật hệ thống Online Multiplayer & Bot AI
                try {
                    network.update(dt);
                    network.updatePlayerState(this.player.x, this.player.y, sellingManager.isOpen, state.currentVehicle, state.currentCity, this.player.facing || 1);
                } catch (errNet) {
                    // Chặn lỗi mạng không làm ngắt vòng lặp
                }

                // 6. Cập nhật thông báo tương tác
                try {
                    this.updatePrompt();
                } catch (errPrompt) {
                    console.error('[GameApp] updatePrompt error:', errPrompt);
                }
            }

            // 7. Render đồ họa
            this.render();
        } catch (loopErr) {
            console.error('[GameApp] Critical loop error caught defensively:', loopErr);
        } finally {
            requestAnimationFrame(() => this.loop());
        }
    }

    updatePrompt() {
        // Cập nhật nhãn trạng thái Nút Mở/Đóng Sạp cảm ứng (chỉ cập nhật textContent)
        const stallBtn = document.getElementById('btnTouchStall');
        const stallLegalTag = document.getElementById('stallLegalTag');
        const isLegal = Boolean(
            (this.world && typeof this.world.isInValidSellingSpot === 'function' && this.world.isInValidSellingSpot(this.player.x, this.player.y)) ||
            (sellingManager && typeof sellingManager.isInsideLegalZone === 'function' && sellingManager.isInsideLegalZone(this.player.x, this.player.y))
        );

        if (stallLegalTag) {
            if (isLegal) {
                if (stallLegalTag.classList.contains('hidden')) stallLegalTag.classList.remove('hidden');
                if (stallLegalTag.textContent !== '🟢 Điểm Bán Hợp Pháp (An toàn 100%)') {
                    stallLegalTag.textContent = '🟢 Điểm Bán Hợp Pháp (An toàn 100%)';
                }
            } else {
                if (!stallLegalTag.classList.contains('hidden')) stallLegalTag.classList.add('hidden');
            }
        }

        if (stallBtn) {
            const labelEl = stallBtn.querySelector('.touch-btn-label');
            const iconEl = stallBtn.querySelector('.touch-btn-icon');
            if (sellingManager.isOpen) {
                if (labelEl && labelEl.textContent !== 'Đóng Sạp') labelEl.textContent = 'Đóng Sạp';
                if (iconEl && iconEl.textContent !== '❌') iconEl.textContent = '❌';
            } else {
                if (labelEl && labelEl.textContent !== 'Mở Sạp') labelEl.textContent = 'Mở Sạp';
                if (iconEl && iconEl.textContent !== '🏪') iconEl.textContent = '🏪';
            }
        }

        // Cập nhật Nút Bán Cho Khách Trực Tiếp Khi Mở Sạp
        const quickSellContainer = document.getElementById('quickSellStallContainer');
        const btnQuickSellStall = document.getElementById('btnQuickSellStall');
        const qssIcon = document.getElementById('qssIcon');
        const qssText = document.getElementById('qssText');

        if (quickSellContainer && btnQuickSellStall) {
            const isAnyModalActive = Boolean(
                this.isKitchenOpen || this.isMarketOpen || this.questManager.isOpen ||
                seaweedGame.isOpen || (onlineUI && typeof onlineUI.isAnyModalOpen === 'function' && onlineUI.isAnyModalOpen())
            );

            if (sellingManager.isOpen && !isAnyModalActive) {
                if (quickSellContainer.classList.contains('hidden')) {
                    quickSellContainer.classList.remove('hidden');
                }
                const waitingCount = (sellingManager.customers || []).filter(c => c.status === 'waiting').length;
                const hasRice = Boolean(state.inventory && state.inventory.length > 0);
                const comboCount = sellingManager.comboCount || 1;

                if (!hasRice) {
                    btnQuickSellStall.classList.add('no-rice');
                    btnQuickSellStall.classList.remove('has-waiting');
                    if (qssIcon && qssIcon.textContent !== '⚠️') qssIcon.textContent = '⚠️';
                    if (qssText && qssText.textContent !== 'Hết Cơm! Vào Bếp Nấu Thêm') {
                        qssText.textContent = 'Hết Cơm! Vào Bếp Nấu Thêm';
                    }
                } else {
                    btnQuickSellStall.classList.remove('no-rice');
                    if (waitingCount > 0) {
                        btnQuickSellStall.classList.add('has-waiting');
                    } else {
                        btnQuickSellStall.classList.remove('has-waiting');
                    }
                    if (qssIcon && qssIcon.textContent !== '🍙') qssIcon.textContent = '🍙';
                    const comboStr = comboCount > 1 ? ` 🔥x${comboCount}` : '';
                    const label = waitingCount > 0 
                        ? `Bán Cho Khách (${waitingCount} chờ)${comboStr}`
                        : `Bán Cho Khách${comboStr}`;
                    if (qssText && qssText.textContent !== label) {
                        qssText.textContent = label;
                    }
                }
            } else {
                if (!quickSellContainer.classList.contains('hidden')) {
                    quickSellContainer.classList.add('hidden');
                }
            }
        }

        const promptBanner = document.getElementById('proximityPrompt');
        if (!promptBanner) return;

        if (this.questManager.isOpen || seaweedGame.isOpen) {
            if (this.lastPromptKey !== 'hidden') {
                promptBanner.classList.add('hidden');
                this.lastPromptKey = 'hidden';
            }
            return;
        }

        // [KỸ SƯ CẢM ỨNG & BÀN PHÍM ẢO] Nhận diện thiết bị cảm ứng để đổi thông điệp phù hợp công thái học
        const isTouch = (typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)));
        const interactAction = isTouch ? 'Chạm nút <strong>Tương Tác</strong> để' : 'Nhấn <strong>E</strong> để';
        const interactEnter = isTouch ? 'Chạm nút <strong>Tương Tác</strong> để vào' : 'Nhấn <strong>E</strong> để vào';

        // Ưu tiên 1: Đứng trong vùng giao hàng hỏa tốc
        if (deliveryManager.isPlayerAtDeliveryZone(this.player)) {
            const promptKey = `express_delivery_zone_${isTouch ? 'touch' : 'key'}`;
            if (this.lastPromptKey !== promptKey) {
                this.lastPromptKey = promptKey;
                promptBanner.classList.remove('hidden');
                promptBanner.innerHTML = `
                    <span class="prompt-icon">⚡</span>
                    <span class="prompt-msg">${interactAction} <strong>Giao Đơn Hỏa Tốc</strong> (+50% tiền thưởng)</span>
                `;
            }
            return;
        }

        let nearby = this.world.getNearbyRegion(this.player.x, this.player.y);
        if (!nearby && typeof this.world.isInValidSellingSpot === 'function') {
            const spot = this.world.isInValidSellingSpot(this.player.x, this.player.y);
            if (spot) {
                nearby = (this.world.regions && this.world.regions.find(r => r.id === spot.regionId || r.id === spot.id)) || spot;
            }
        }

        if (nearby) {
            if (nearby.isLocked) {
                const promptKey = `locked_${nearby.id}`;
                if (this.lastPromptKey !== promptKey) {
                    this.lastPromptKey = promptKey;
                    promptBanner.classList.remove('hidden');
                    promptBanner.innerHTML = `
                        <span class="prompt-icon">🔒</span>
                        <span class="prompt-msg"><strong>${nearby.name}</strong> đang bị khóa (${nearby.unlockRequirement || 'Cần nâng cấp Chi nhánh'})</span>
                    `;
                }
                return;
            }

            const isSellingSpot = Boolean(
                isLegal ||
                nearby.type === 'stall' ||
                nearby.type === 'school' ||
                nearby.type === 'office' ||
                nearby.type === 'walking_street' ||
                nearby.type === 'park' ||
                nearby.type === 'market' ||
                nearby.type === 'green_zone' ||
                nearby.id.startsWith('school_') ||
                nearby.id.startsWith('spot_') ||
                nearby.id === 'university_town' ||
                nearby.id === 'office_q1' ||
                nearby.id === 'walking_street' ||
                nearby.id === 'school' ||
                nearby.id === 'office' ||
                (nearby.regionId && (
                    nearby.regionId.startsWith('school_') ||
                    nearby.regionId === 'university_town' ||
                    nearby.regionId === 'office_q1' ||
                    nearby.regionId === 'walking_street' ||
                    nearby.regionId.includes('school') ||
                    nearby.regionId.includes('office') ||
                    nearby.regionId.includes('walking') ||
                    nearby.regionId.includes('university')
                ))
            );

            let promptKey = '';
            let promptHTML = '';

            if (nearby.id === 'kitchen') {
                promptKey = `kitchen_${isTouch ? 'touch' : 'key'}`;
                promptHTML = `
                    <span class="prompt-icon">${nearby.icon}</span>
                    <span class="prompt-msg">${interactEnter} <strong>${nearby.name}</strong></span>
                `;
            } else if (nearby.id === 'market') {
                promptKey = `market_${isTouch ? 'touch' : 'key'}`;
                promptHTML = `
                    <span class="prompt-icon">${nearby.icon}</span>
                    <span class="prompt-msg">${interactEnter} <strong>${nearby.name}</strong></span>
                `;
            } else if (isSellingSpot) {
                const extraHint = nearby.id === 'walking_street' ? (isTouch ? ' • <strong>Chạm Bóc Cơm VIP</strong>' : ' • <strong>Phím B</strong>: Biểu diễn Bóc Cơm VIP') : '';
                const legalBadge = isLegal ? '<div style="font-size:11px;color:#4ade80;margin-top:2px;font-weight:700;">🟢 Điểm Bán Hợp Pháp (An toàn 100%)</div>' : '';
                if (sellingManager.isOpen) {
                    promptKey = `selling_open_${nearby.id}_${isTouch ? 'touch' : 'key'}_${isLegal ? 'legal' : 'street'}`;
                    const stallMsg = isTouch ? 'Chạm <strong>Mở Sạp</strong>: Đóng • <strong>Bán Nhanh</strong>: Bán' : 'Nhấn <strong>E</strong>: Đóng sạp • <strong>Space</strong>: Bán';
                    promptHTML = `
                        <span class="prompt-icon">🏪</span>
                        <span class="prompt-msg">${stallMsg}${extraHint}${legalBadge}</span>
                    `;
                } else {
                    promptKey = `selling_closed_${nearby.id}_${isTouch ? 'touch' : 'key'}_${isLegal ? 'legal' : 'street'}`;
                    const openMsg = isTouch ? 'Chạm <strong>Mở Sạp</strong> để bán' : 'Nhấn <strong>E</strong> để <strong>Mở sạp</strong>';
                    promptHTML = `
                        <span class="prompt-icon">${nearby.icon || '🏪'}</span>
                        <span class="prompt-msg">${openMsg} tại ${nearby.name}${extraHint}${legalBadge}</span>
                    `;
                }
            } else {
                promptKey = `region_${nearby.id}_${isTouch ? 'touch' : 'key'}`;
                promptHTML = `
                    <span class="prompt-icon">${nearby.icon}</span>
                    <span class="prompt-msg">${interactEnter} <strong>${nearby.name}</strong></span>
                `;
            }

            if (this.lastPromptKey !== promptKey) {
                this.lastPromptKey = promptKey;
                promptBanner.classList.remove('hidden');
                promptBanner.innerHTML = promptHTML;
            }
        } else {
            if (this.lastPromptKey !== 'hidden') {
                promptBanner.classList.add('hidden');
                this.lastPromptKey = 'hidden';
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Vẽ bản đồ thế giới 2D
        this.world.render(this.ctx, this.camera);

        // 2. Vẽ sạp bán hàng, khách hàng NPC, nhân viên AI Staff và hiệu ứng tiền bay
        sellingManager.render(this.ctx, this.camera);

        // 2.5. Vẽ người chơi trực tuyến / Bot đối thủ (trừ chính mình)
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        for (const otherPlayer of network.otherPlayers.values()) {
            if (otherPlayer && otherPlayer.id !== network.selfId) {
                characterRenderer.renderNetworkPlayer(this.ctx, otherPlayer, {
                    isSelected: onlineUI.quickMenuTarget && onlineUI.quickMenuTarget.id === otherPlayer.id
                });
            }
        }
        this.ctx.restore();

        // 3. Vẽ nhân vật chính
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        this.player.render(this.ctx);
        this.ctx.restore();

        // 4. Vẽ Vùng Phát Sáng & Mũi Tên Chỉ Đường Đơn Hỏa Tốc
        deliveryManager.render(this.ctx, this.camera, this.player);

        // 4.5. Vẽ Mũi Tên Dẫn Đường Hướng Dẫn Tân Thủ (Bước 3: Ô Vạch Xanh Trường Học)
        if (this.tutorialManager && typeof this.tutorialManager.renderWayfinding === 'function') {
            this.tutorialManager.renderWayfinding(this.ctx, this.camera, this.player.x, this.player.y);
        }

        // 5. Vẽ UI cố định trên màn hình (Toast thông báo & Banner Lên Cấp)
        sellingManager.renderScreenUI(this.ctx, this.canvas.width, this.canvas.height);

        // 6. Vẽ Minimap thu nhỏ ở góc trên bên phải
        this.world.drawMinimap(this.ctx, this.player, this.canvas.width, this.canvas.height);
    }
}

// Khởi tạo an toàn cho ES Modules (Xử lý khi DOMContentLoaded đã kích hoạt trước khi module nạp)
function bootGame() {
    if (!window.game) {
        window.game = new GameApp();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootGame);
} else {
    // DOM đã sẵn sàng (interactive hoặc complete), khởi chạy ngay lập tức
    bootGame();
}