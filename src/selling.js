// src/selling.js - Hệ thống Đi bán hàng, Khách hàng NPC & Xếp hàng mua cơm nắm

import { state, FILLINGS, VEHICLES } from './state.js';
import { audio } from './audio.js';
import { characterRenderer } from './characterRenderer.js';
import { seaweedGame } from './seaweedGame.js';
import { LEGAL_SELLING_ZONES, isInsideLegalZone } from './world.js';
import { city3D } from './city3D.js';
import { network } from './network.js';

export { LEGAL_SELLING_ZONES, isInsideLegalZone };

export const STAFF_SPOTS = [
    { id: 'staff_1', name: 'Nhân viên TH Hoa Mai', x: 620, y: 520, facing: 1, loc: 'school_hoamai' },
    { id: 'staff_2', name: 'Nhân viên THCS Nguyễn Du', x: 1820, y: 520, facing: -1, loc: 'school_nguyendu' },
    { id: 'staff_3', name: 'Nhân viên THPT Lê Quý Đôn', x: 3020, y: 520, facing: 1, loc: 'school_lequydon' },
    { id: 'staff_4', name: 'Nhân viên Làng Đại Học', x: 740, y: 1420, facing: -1, loc: 'university_town' },
    { id: 'staff_5', name: 'Nhân viên Văn Phòng Q1', x: 2140, y: 1420, facing: 1, loc: 'office_q1' },
    { id: 'staff_6', name: 'Nhân viên Phố Đi Bộ', x: 3240, y: 1420, facing: -1, loc: 'walking_street' }
];

export class SellingManager {
    constructor() {
        this.isOpen = false;
        this.currentSpot = null;
        this.stallX = 0;
        this.stallY = 0;

        this.customers = [];
        this.maxCustomers = 3;
        this.spawnTimer = 0;
        this.spawnInterval = 160; // Số frame giữa các đợt sinh khách (~2.6 giây)

        // Cơ chế Trật tự đô thị (Mức độ chú ý 0% -> 100%)
        this.heatLevel = 0;
        this.urbanWarning = 0; // Alias tương thích tuyệt đối cho urbanWarning
        this.heatWarned = false;
        this.violationReason = '';
        this.warningBeepTimer = 0;
        this.penaltyBanner = null;

        // Hiệu ứng chữ số bay (+25.000đ, +15 EXP)
        this.floatingTexts = [];

        // Thông báo Toast trên màn hình
        this.toastMessage = null;
        this.toastTimer = 0;

        // Banner lên cấp RPG
        this.levelUpBanner = null;
        this.levelUpTimer = 0;

        // Chu kỳ nhận thu nhập thụ động từ nhân viên (mỗi 15 giây = 15000ms)
        this.lastPassiveCycleTime = Date.now();
        this.passiveCycleInterval = 15000;

        // [TỰ ĐỘNG BÁN THÔNG MINH & COMBO TẠI SẠP]
        this.autoServeTimer = 0;
        this.autoServeInterval = 90; // 90 frames (~1.5 giây ở 60fps)
        this.comboCount = 0;
        this.lastServeTime = 0;

        // Lắng nghe sự kiện Level Up từ state
        state.onUpdate((s, extra) => {
            if (extra && extra.leveledUp) {
                this.triggerLevelUpBanner(extra.newLevel);
            }
        });
    }

    // Getter/Setter đồng bộ trạng thái bán hàng & cảnh báo trật tự đô thị
    get isSelling() {
        return this.isOpen;
    }
    set isSelling(val) {
        this.isOpen = Boolean(val);
    }

    // Kiểm tra vị trí có nằm trong Ô Vạch Xanh Hợp Pháp không (+20px biên độ an toàn)
    isInsideLegalZone(x, y) {
        const cityId = (state && state.currentCity) || null;
        return isInsideLegalZone(x, y, cityId);
    }

    get urbanWarning() {
        return this.heatLevel;
    }
    set urbanWarning(val) {
        this.heatLevel = typeof val === 'number' && !isNaN(val) ? val : 0;
    }

    // Danh sách vị trí các nhân viên AI Staff đang làm việc
    getActiveStaffList() {
        const count = state.staffCount || 0;
        const list = [];
        for (let i = 0; i < count; i++) {
            const spotIndex = i % STAFF_SPOTS.length;
            const baseSpot = STAFF_SPOTS[spotIndex];
            const offsetMultiplier = Math.floor(i / STAFF_SPOTS.length);
            list.push({
                id: `staff_${i + 1}`,
                x: baseSpot.x + offsetMultiplier * 16,
                y: baseSpot.y + offsetMultiplier * 12,
                facing: baseSpot.facing,
                loc: baseSpot.loc
            });
        }
        return list;
    }

    // Bật / Tắt chế độ mở sạp bán hàng
    toggleSelling(spot, player) {
        if (this.isOpen) {
            this.closeSelling();
        } else {
            this.openSelling(spot, player);
        }
    }

    openSelling(spot, player) {
        if (!this.currentSpot || this.currentSpot.id !== spot.id) {
            this.heatLevel = 0;
            this.urbanWarning = 0;
            this.heatWarned = false;
            this.warningBeepTimer = 0;
            this.violationReason = '';
        }
        this.isOpen = true;
        this.isSelling = true;
        this.currentSpot = spot;
        this.stallX = player.x;
        this.stallY = player.y;
        this.customers = [];
        this.autoServeTimer = 0;
        this.comboCount = 0;
        this.lastServeTime = 0;

        const currentRice = state.inventory ? state.inventory.length : 0;
        if (currentRice === 0) {
            this.showToast('⚠️ Hết sạch cơm trong thùng! Hãy về Xưởng nấu thêm.');
        } else {
            this.showToast(`🏪 Đã mở sạp! Trong thùng có ${currentRice} nắm cơm chuẩn ISO.`);
        }

        const timeInfo = state.getTimePeriodInfo();
        const spotId = (spot.regionId || spot.id || '');
        const isSchool = (spot.type === 'school' || spotId.startsWith('school_') || spotId.includes('school') || spotId === 'university_town');
        const isOffice = (spot.type === 'office' || spotId.includes('office') || spot.type === 'market' || spotId.includes('ben_thanh'));
        const isWalking = (spot.type === 'walking_street' || spotId.includes('walking'));

        // Điều chỉnh công suất & nhịp độ sinh khách đều đặn (~0.8 - 1.2 giây một khách mới)
        if (isSchool) {
            if (timeInfo.isSchoolRush) {
                this.maxCustomers = 5;
                this.spawnInterval = 45; // Khách học sinh ùa ra đông đúc (~0.75s)
                this.showToast(`🎒 GIỜ CAO ĐIỂM CỔNG TRƯỜNG (${timeInfo.timeStr})! Học sinh ùa ra đông, Tip cao!`);
            } else {
                this.maxCustomers = 4;
                this.spawnInterval = 65; // Khách học sinh đi bộ nườm nượp (~1.1s)
                this.showToast(`🎒 Cổng trường học: Học sinh ghé mua sắm cơm nắm 20k/22k!`);
            }
        } else if (isOffice) {
            if (timeInfo.isOfficeRush) {
                this.maxCustomers = 5;
                this.spawnInterval = 50;
                this.showToast(`🏢 GIỜ CAO ĐIỂM VĂN PHÒNG (${timeInfo.timeStr})! Dân công sở chuộng vị 22k-25k!`);
            } else {
                this.maxCustomers = 4;
                this.spawnInterval = 70;
                this.showToast(`🏪 Đã mở sạp bán hàng tại ${spot.name}! Dân công sở ghé mua đều đặn.`);
            }
        } else if (isWalking) {
            if (timeInfo.isWalkingStreetRush) {
                this.maxCustomers = 5;
                this.spawnInterval = 55;
                this.showToast(`✨ GIỜ CAO ĐIỂM PHỐ ĐI BỘ (${timeInfo.timeStr})! Tăng tỷ lệ Khách VIP 25k!`);
            } else {
                this.maxCustomers = 4;
                this.spawnInterval = 75;
                this.showToast(`🏪 Đã mở sạp bán hàng tại ${spot.name}!`);
            }
        } else {
            this.maxCustomers = 4;
            this.spawnInterval = 65;
            this.showToast(`🏪 Đã mở sạp bán hàng tại ${spot.name}! Nhấn Space hoặc chạm vào khách để bán.`);
        }

        // Sinh ngay khách hàng đầu tiên ngay khi bấm Mở Sạp
        this.trySpawnCustomer();
        this.spawnTimer = 0;
        audio.playClick();
    }

    closeSelling() {
        this.isOpen = false;
        this.isSelling = false;
        this.currentSpot = null;
        // Dọn dẹp sạch danh sách khách hàng để chống rò rỉ bộ nhớ (memory leak)
        this.customers = [];
        this.showToast('🛑 Đã đóng sạp bán hàng.');
        try {
            audio.playClick();
        } catch (eAudio) {
            // Fallback an toàn
        }
    }

    // Hiển thị thông báo Toast nhẹ nhàng
    showToast(msg, duration = 180) {
        this.toastMessage = msg;
        this.toastTimer = duration;
    }

    triggerLevelUpBanner(newLevel) {
        audio.playLevelUp();
        this.levelUpBanner = {
            level: newLevel,
            timer: 240, // Hiển thị 4 giây
            priceBonus: (newLevel - 1) * 10,
            speedBonus: (newLevel - 1) * 5
        };
    }

    // Cập nhật logic bán hàng mỗi khung hình
    update(player, world) {
        // Cập nhật thông báo Toast
        if (this.toastTimer > 0) {
            this.toastTimer--;
            if (this.toastTimer <= 0) this.toastMessage = null;
        }

        // Cập nhật banner lên cấp
        if (this.levelUpBanner) {
            this.levelUpBanner.timer--;
            if (this.levelUpBanner.timer <= 0) this.levelUpBanner = null;
        }

        // Cập nhật banner xử phạt Trật Tự Đô Thị
        if (this.penaltyBanner) {
            this.penaltyBanner.timer--;
            if (this.penaltyBanner.timer <= 0) this.penaltyBanner = null;
        }

        // Cập nhật các dòng chữ bay (+tiền, +exp)
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y -= ft.vy;
            ft.alpha -= 0.016;
            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Cập nhật dòng tiền thu nhập thụ động mỗi 15 giây cho các Nhân viên AI Staff
        const now = Date.now();
        if (state.staffCount > 0 && now - this.lastPassiveCycleTime >= this.passiveCycleInterval) {
            this.lastPassiveCycleTime = now;
            if (state.isOperatingHalted) {
                // Tạm ngưng do nợ chi phí vận hành cuối ngày
                this.floatingTexts.push({
                    x: this.stallX,
                    y: this.stallY - 50,
                    text: '⚠️ Tạm ngưng (Nợ hóa đơn)',
                    color: '#ef4444',
                    alpha: 1.0,
                    vy: 0.5
                });
            } else if (!state.ingredients || state.ingredients.rice_seaweed < 1) {
                // Hết nguyên liệu trong kho
                this.floatingTexts.push({
                    x: this.stallX,
                    y: this.stallY - 50,
                    text: '⚠️ Nhân viên hết gạo làm cơm!',
                    color: '#f59e0b',
                    alpha: 1.0,
                    vy: 0.5
                });
            } else {
                // Tiêu hao nguyên liệu hợp lý: 1 phần gạo rong biển cho mỗi chu kỳ nhân viên
                state.ingredients.rice_seaweed = Math.max(0, state.ingredients.rice_seaweed - 1);
                const incomePerStaff = 12000;
                const totalPassive = state.staffCount * incomePerStaff;
                state.addMoney(totalPassive);
                state.recordRevenue(totalPassive);

                // Sinh chữ số bay màu xanh lá trên đầu từng nhân viên
                const activeStaffs = this.getActiveStaffList();
                activeStaffs.forEach(staff => {
                    this.floatingTexts.push({
                        x: staff.x,
                        y: staff.y - 40,
                        text: `+${incomePerStaff.toLocaleString('vi-VN')}đ`,
                        color: '#22c55e',
                        alpha: 1.0,
                        vy: 0.8
                    });
                });
            }
        }

        // Cơ chế Vị trí Đỗ xe Hợp lệ & Luật Phạt Trật Tự Đô Thị (Bọc try-catch phòng thủ toàn diện)
        let isSchoolSpot = false;
        let timeInfo = { isSchoolRush: false, isSchoolOvertime: false, isOfficeRush: false, isWalkingStreetRush: false };
        try {
            if (state && typeof state.getTimePeriodInfo === 'function') {
                timeInfo = state.getTimePeriodInfo() || timeInfo;
            }
        } catch (eTime) {
            console.error('[SellingManager] Error getting time period info:', eTime);
        }

        try {
            // Kiểm tra Ô Vạch Xanh từ Single Source of Truth duy nhất (kết hợp tọa độ sạp và người chơi)
            const currentCityId = (state && state.currentCity) || null;
            const checkX = (typeof this.stallX === 'number' && this.stallX !== 0) ? this.stallX : (player ? player.x : 0);
            const checkY = (typeof this.stallY === 'number' && this.stallY !== 0) ? this.stallY : (player ? player.y : 0);

            const matchedZone = isInsideLegalZone(checkX, checkY, currentCityId) ||
                                (player ? isInsideLegalZone(player.x, player.y, currentCityId) : null) ||
                                (world && typeof world.isInValidSellingSpot === 'function' ? (world.isInValidSellingSpot(checkX, checkY) || (player ? world.isInValidSellingSpot(player.x, player.y) : null)) : null);

            const inGreenSpot = Boolean(matchedZone);

            isSchoolSpot = Boolean(this.isOpen && (
                (matchedZone && matchedZone.type === 'school') ||
                (this.currentSpot && (
                    this.currentSpot.type === 'school' ||
                    (this.currentSpot.id && this.currentSpot.id.startsWith('school_')) ||
                    this.currentSpot.id === 'university_town'
                ))
            ));

            // THIẾT LẬP Ô VẠCH XANH LÀ "VÙNG AN TOÀN TUYỆT ĐỐI" (Miễn nhiễm Trật Tự Đô Thị 100%):
            // - Khi inGreenSpot === true (kể cả tại Trường Học): cấm tuyệt đối Trật Tự Đô Thị phạt tiền, tịch thu hàng hoặc tăng mức truy đuổi.
            // - Loại bỏ hoàn toàn lỗi phạt isSchoolOvertime khi người chơi đang đứng trong Ô Vạch Xanh.
            // - Nếu người chơi đang bị truy đuổi từ ngoài đường mà chạy lọt vào Ô Vạch Xanh, AI Trật Tự tự động hủy truy đuổi, reset heatLevel = 0, urbanWarning = 0.
            if (inGreenSpot) {
                this.heatLevel = 0;
                this.urbanWarning = 0;
                this.heatWarned = false;
                this.warningBeepTimer = 0;
                this.violationReason = '';
            } else {
                // Vi phạm CHỈ KHI mở sạp ngoài Ô Vạch Xanh Lá quy định
                const isViolating = Boolean(this.isOpen);

                if (isViolating) {
                    this.violationReason = 'BÁN NGOÀI Ô VẠCH XANH QUY ĐỊNH';

                    // Thanh cảnh báo tăng 0% -> 100% trong đúng 8 giây thực tế (8s * 60fps = 480 frames, ~0.208% per frame)
                    const heatReduce = state.permanentBuffs?.heatRateReduce || 0;
                    const heatInc = (100 / 480) * Math.max(0.1, 1 - heatReduce);
                    this.heatLevel = Math.min(100, (this.heatLevel || 0) + heatInc);
                    this.urbanWarning = this.heatLevel;

                    // Phát tiếng còi cảnh báo định kỳ từ audio.js mỗi ~1.2 giây
                    this.warningBeepTimer = (this.warningBeepTimer || 0) + 1;
                    if (this.warningBeepTimer >= 72 || !this.heatWarned) {
                        this.warningBeepTimer = 0;
                        this.heatWarned = true;
                        try {
                            if (audio && typeof audio.playWarningBeep === 'function') {
                                audio.playWarningBeep();
                            } else if (audio && typeof audio.playWarning === 'function') {
                                audio.playWarning();
                            }
                        } catch (eAudio) {
                            // Safe fallback
                        }
                    }

                    // Khi chạm ngưỡng 100%: KÍCH HOẠT MỘT LẦN (ONE-SHOT TRIGGER)
                    // Dòng code đầu tiên bắt buộc phải thực hiện ngay lập tức: reset cảnh báo, dọn sạp, cho phép di chuyển tự do
                    if (this.heatLevel >= 100 || this.urbanWarning >= 100) {
                        this.heatLevel = 0;
                        this.urbanWarning = 0;
                        this.isOpen = false;
                        this.isSelling = false;
                        this.heatWarned = false;
                        this.warningBeepTimer = 0;
                        this.closeSelling(); // Đảm bảo isOpen = false ngay lập tức

                        // Đảm bảo nhân vật và phương tiện vẫn di chuyển bình thường, không bị khóa cứng
                        if (player) {
                            player.canMove = true;
                        }

                        // Âm thanh còi hụ cảnh sát (Web Audio API có bộ lọc chống spam)
                        try {
                            if (audio && typeof audio.playPoliceSiren === 'function') {
                                audio.playPoliceSiren();
                            } else if (audio && typeof audio.playSiren === 'function') {
                                audio.playSiren();
                            }
                        } catch (eSiren) {
                            // Safe fallback
                        }

                        // Trừ tiền phạt 150.000đ an toàn tuyệt đối
                        let penaltyResult = { deductedMoney: 150000, reputationPenalty: 0 };
                        try {
                            if (state && typeof state.applyUrbanPenalty === 'function') {
                                penaltyResult = state.applyUrbanPenalty() || penaltyResult;
                            }
                        } catch (ePenalty) {
                            console.error('[SellingManager] applyUrbanPenalty error:', ePenalty);
                        }

                        const detailMsg = (penaltyResult && penaltyResult.reputationPenalty > 0)
                            ? 'Ví không đủ tiền! Tiền mặt về 0đ và trừ 20 Danh vọng!'
                            : 'Đã trừ trực tiếp 150.000đ tiền phạt vào tài khoản!';

                        this.penaltyBanner = {
                            timer: 360, // Hiển thị 6 giây trên Canvas
                            text: 'BỊ PHẠT 150.000Đ DO BÁN SAI VỊ TRÍ / NGOÀI VẠCH XANH!',
                            subtext: detailMsg
                        };
                        this.showToast('🚨 BỊ PHẠT 150.000Đ DO BÁN SAI VỊ TRÍ / NGOÀI VẠCH XANH!', 300);
                    }
                } else {
                    // Khi di chuyển rời đi, hoặc hợp lệ, hoặc đóng sạp: thanh cảnh báo tự giảm về 0%
                    if (this.heatLevel > 0 || this.urbanWarning > 0) {
                        this.heatLevel = Math.max(0, (this.heatLevel || 0) - 1.2);
                        this.urbanWarning = this.heatLevel;
                        this.warningBeepTimer = 0;
                        if (this.heatLevel === 0) {
                            this.heatWarned = false;
                            this.violationReason = '';
                        }
                    }
                }
            }
        } catch (errUrban) {
            console.error('[SellingManager] Error in urban order logic:', errUrban);
        }

        if (!this.isOpen) return;

        // Cập nhật nhịp khách theo giờ cao điểm khi sạp đang mở (duy trì sinh khách đều đặn ~1 - 1.2s)
        const evoTier = (state && typeof state.getEvolutionTier === 'function') ? state.getEvolutionTier() : 1;

        if (isSchoolSpot) {
            this.maxCustomers = timeInfo.isSchoolRush ? 5 : 4;
            this.spawnInterval = timeInfo.isSchoolRush ? 45 : 65;
        } else if (this.currentSpot && (this.currentSpot.id === 'office_q1' || this.currentSpot.type === 'office' || this.currentSpot.type === 'market')) {
            this.maxCustomers = timeInfo.isOfficeRush ? 5 : 4;
            this.spawnInterval = timeInfo.isOfficeRush ? 50 : 70;
        } else if (this.currentSpot && (this.currentSpot.id === 'walking_street' || this.currentSpot.type === 'walking_street')) {
            this.maxCustomers = timeInfo.isWalkingStreetRush ? 5 : 4;
            this.spawnInterval = timeInfo.isWalkingStreetRush ? 55 : 75;
        } else {
            this.maxCustomers = 4;
            this.spawnInterval = 65;
        }

        // Bậc 4: Vua Cơm Nắm Cyber Food-Tech - Tự động hút khách từ xa (giảm thời gian chờ khách 20%)
        if (evoTier >= 4) {
            this.spawnInterval = Math.max(30, Math.floor(this.spawnInterval * 0.8));
            this.maxCustomers = Math.min(6, this.maxCustomers + 1);
        }

        // Kiểm tra nếu nhân vật bỏ chạy ra xa khu vực bán hàng (> 150px), tự động đóng sạp an toàn và reset mức chú ý
        const dx = player.x - this.stallX;
        const dy = player.y - this.stallY;
        const distFromStall = Math.sqrt(dx * dx + dy * dy);
        if (distFromStall > 150) {
            this.closeSelling();
            this.heatLevel = 0;
            this.heatWarned = false;
            return;
        }

        // Đếm nhịp sinh khách hàng mới
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.trySpawnCustomer();
        }

        // Cập nhật trạng thái và vị trí từng khách hàng
        for (let i = this.customers.length - 1; i >= 0; i--) {
            const cust = this.customers[i];

            if (cust.status === 'walking_in') {
                // Khách đang đi bộ tiến vào vị trí xếp hàng
                const targetPos = this.getQueuePosition(cust.queueIndex);
                const toTargetX = targetPos.x - cust.x;
                const toTargetY = targetPos.y - cust.y;
                const dist = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);

                if (dist > 3) {
                    cust.x += (toTargetX / dist) * cust.speed;
                    cust.y += (toTargetY / dist) * cust.speed;
                    cust.facing = toTargetX >= 0 ? 1 : -1;
                    cust.stepCycle += 0.2;
                } else {
                    cust.x = targetPos.x;
                    cust.y = targetPos.y;
                    cust.status = 'waiting';
                    cust.facing = this.stallX > cust.x ? 1 : -1;
                }
            } else if (cust.status === 'waiting') {
                // Khách đang kiên nhẫn chờ mua cơm
                cust.stepCycle = 0;
                cust.patience -= cust.decayRate;

                // Cập nhật vị trí nếu hàng phía trước có chỗ trống
                const targetPos = this.getQueuePosition(cust.queueIndex);
                cust.x += (targetPos.x - cust.x) * 0.1;
                cust.y += (targetPos.y - cust.y) * 0.1;

                if (cust.patience <= 0) {
                    // Hết kiên nhẫn! Khách bực mình bỏ đi
                    cust.status = 'leaving_angry';
                    cust.leaveTargetX = cust.x + (cust.x > this.stallX ? 250 : -250);
                    cust.leaveTargetY = cust.y + (Math.random() > 0.5 ? 180 : -180);
                    this.reorderQueue();
                }
            } else if (cust.status === 'leaving_happy' || cust.status === 'leaving_angry') {
                // Khách đi bộ rời khỏi màn hình
                const toLeaveX = cust.leaveTargetX - cust.x;
                const toLeaveY = cust.leaveTargetY - cust.y;
                const dist = Math.sqrt(toLeaveX * toLeaveX + toLeaveY * toLeaveY);

                if (dist > 5) {
                    cust.x += (toLeaveX / dist) * (cust.speed * 1.3);
                    cust.y += (toLeaveY / dist) * (cust.speed * 1.3);
                    cust.facing = toLeaveX >= 0 ? 1 : -1;
                    cust.stepCycle += 0.25;
                } else {
                    // Đã ra khỏi khu vực, xóa khỏi bộ nhớ
                    this.customers.splice(i, 1);
                }
            }
        }

        // [CƠ CHẾ TỰ ĐỘNG PHỤC VỤ THÔNG MINH - MỖI 1.5 GIÂY / KHÁCH]
        const waitingCustomer = this.customers.find(c => c.status === 'waiting' && c.queueIndex === 0)
            || this.customers.find(c => c.status === 'waiting');
        const hasRice = Boolean(state.inventory && state.inventory.length > 0);

        if (waitingCustomer && hasRice) {
            this.autoServeTimer = (this.autoServeTimer || 0) + 1;
            if (this.autoServeTimer >= this.autoServeInterval) {
                this.autoServeTimer = 0;
                this.serveCustomer(waitingCustomer);
            }
        } else {
            this.autoServeTimer = 0;
        }
    }

    // Tính toán tọa độ xếp hàng gọn gàng (Anti-Stacking Queue)
    // Khách 1 đứng cách sạp 50px, các khách sau nối đuôi cách nhau 40px
    getQueuePosition(index) {
        const spacing = 40;
        // Xếp hàng ngang hướng về phía trước sạp bán (khoảng cách tối ưu < 80px)
        return {
            x: this.stallX + 50 + index * spacing,
            y: this.stallY + 6
        };
    }

    // Sắp xếp lại thứ tự hàng khi có khách rời đi
    reorderQueue() {
        let activeIdx = 0;
        for (const c of this.customers) {
            if (c.status === 'walking_in' || c.status === 'waiting') {
                c.queueIndex = activeIdx++;
            }
        }
    }

    // Sinh khách hàng dựa trên địa bàn khu vực (TP.HCM, Đắk Lắk, Vinh, Hà Nội)
    trySpawnCustomer() {
        const activeCount = this.customers.filter(c => c.status === 'walking_in' || c.status === 'waiting').length;
        if (activeCount >= this.maxCustomers) return;

        const spotId = this.currentSpot ? (this.currentSpot.regionId || this.currentSpot.id || '') : 'school_hoamai';
        const spotType = this.currentSpot ? (this.currentSpot.type || 'school') : 'school';
        const timeInfo = state.getTimePeriodInfo();

        const isSchoolSpot = spotType === 'school' || spotId.includes('school') || spotId.includes('university') || spotType === 'park';
        const isOfficeSpot = spotType === 'office' || spotId.includes('office') || spotType === 'market' || spotId.includes('ben_thanh');
        const isWalkingSpot = spotType === 'walking_street' || spotId.includes('walking');
        const evoTier = (state && typeof state.getEvolutionTier === 'function') ? state.getEvolutionTier() : 1;

        let baseVipChance = 0.15; // 15% khách VIP
        // Bậc 3: Tổng Giám Đốc Chuỗi Toàn Quốc - Tăng 20% tỷ lệ gặp khách VIP
        if (evoTier >= 3) {
            baseVipChance += 0.20;
        }

        let isVip = Math.random() < baseVipChance;
        if (isWalkingSpot) {
            let walkVipRate = timeInfo.isWalkingStreetRush ? 0.70 : 0.35;
            if (evoTier >= 3) walkVipRate += 0.20;
            isVip = Math.random() < Math.min(0.95, walkVipRate);
        }

        let variant = 'student';
        let requestedFilling = 'crab_egg_mayo';

        if (isVip) {
            variant = 'vip';
            const vipFillings = ['melting_beef_cheese', 'beef_bbq', 'salmon_mayo', 'cheese_chicken_roll', 'baked_cheese_shrimp'];
            requestedFilling = vipFillings[Math.floor(Math.random() * vipFillings.length)];
        } else if (isSchoolSpot) {
            variant = 'student';
            const schoolMenu = [
                'crab_egg_mayo', 'super_cheese_sausage', 'egg_sausage_mayo', 
                'cowboy_sausage', 'chicken_teriyaki', 'fish_cake', 'chicken_tomyum',
                'pate_cheese', 'grilled_pork_kimchi', 'salmon_mayo', 'cheese_chicken_roll'
            ];
            requestedFilling = schoolMenu[Math.floor(Math.random() * schoolMenu.length)];
        } else if (isOfficeSpot) {
            variant = 'office';
            const officeMenu = [
                'melting_beef_cheese', 'beef_bbq', 'salmon_mayo', 
                'cheese_chicken_roll', 'tuna_mayo', 'baked_cheese_shrimp', 'crab_egg_mayo'
            ];
            requestedFilling = officeMenu[Math.floor(Math.random() * officeMenu.length)];
        } else if (isWalkingSpot) {
            variant = Math.random() < 0.5 ? 'student' : 'office';
            const walkMenu = ['melting_beef_cheese', 'beef_bbq', 'cheese_chicken_roll', 'salmon_mayo'];
            requestedFilling = walkMenu[Math.floor(Math.random() * walkMenu.length)];
        } else {
            variant = Math.random() < 0.5 ? 'student' : 'office';
            const allFillings = Object.keys(FILLINGS);
            requestedFilling = allFillings[Math.floor(Math.random() * allFillings.length)];
        }

        // Tọa độ sinh từ vỉa hè cách sạp ~110 - 135px
        const queuePos = this.getQueuePosition(activeCount);
        const spawnX = queuePos.x + 110 + Math.random() * 25;
        const spawnY = queuePos.y + (Math.random() * 20 - 10);
        const colorVar = Math.floor(Math.random() * 4);

        // Cạnh tranh thị phần với xe đối thủ: CHỈ KÍCH HOẠT KHI ĐÃ CÓ ÍT NHẤT 2 KHÁCH TRONG HÀNG
        if (activeCount >= 2) {
            const veh = VEHICLES[state.currentVehicle];
            const vehLvl = veh ? (veh.level || 1) : 1;
            let avgFreshness = 100;
            if (state.inventory && state.inventory.length > 0) {
                const sumF = state.inventory.reduce((acc, it) => acc + (typeof it.freshness === 'number' ? it.freshness : 100), 0);
                avgFreshness = sumF / state.inventory.length;
            }
            const hasRequestedFilling = state.getFillingCount(requestedFilling) > 0;

            let playerAttractScore = 40 + vehLvl * 6 + (state.level * 2);
            if (avgFreshness >= 80) playerAttractScore += 25;
            else if (avgFreshness < 40) playerAttractScore -= 35;
            if (hasRequestedFilling) playerAttractScore += 25;

            const competitorScore = 65 + (timeInfo.isSchoolRush || timeInfo.isOfficeRush ? 18 : 0);
            if (playerAttractScore < competitorScore && Math.random() < 0.25) {
                this.floatingTexts.push({
                    x: spawnX,
                    y: spawnY - 20,
                    text: '⚡ Xe đối thủ tranh mất khách!',
                    color: '#ec4899',
                    alpha: 1.0,
                    vy: 0.6
                });
                return;
            }
        }

        const newCustomer = {
            id: 'cust_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            variant: variant,
            colorVariation: colorVar,
            recipeId: requestedFilling,
            x: spawnX,
            y: spawnY,
            facing: -1,
            speed: 2.2 + Math.random() * 0.4,
            stepCycle: 0,
            status: 'walking_in', // walking_in -> waiting -> leaving_happy / leaving_angry
            queueIndex: activeCount,
            patience: 100, // 100% -> 0%
            maxPatience: 100,
            decayRate: variant === 'office' ? 0.09 : 0.07,
            leaveTargetX: spawnX + 80,
            leaveTargetY: spawnY + 20,
            isHoldingOnigiri: false,
            happyMessage: null
        };

        this.customers.push(newCustomer);
    }

    // Bán cho khách hàng đầu tiên trong hàng (Phím Space hoặc Nút Bán Cho Khách)
    sellQuick() {
        if (!this.isOpen) return false;
        if (!state.inventory || state.inventory.length === 0) {
            this.showToast('⚠️ Hết sạch cơm trong thùng! Hãy về Xưởng nấu thêm.');
            try {
                if (audio && typeof audio.playError === 'function') audio.playError();
            } catch (e) {}
            return false;
        }
        const waitingCustomer = this.customers.find(c => c.status === 'waiting' && c.queueIndex === 0)
            || this.customers.find(c => c.status === 'waiting');
        if (!waitingCustomer) {
            this.showToast('⏳ Đang đợi khách xếp hàng vào sạp...');
            return false;
        }
        return this.serveCustomer(waitingCustomer);
    }

    // Xử lý sự kiện click/chạm vào nhân vật khách hàng trên màn hình
    handleClick(worldX, worldY) {
        if (!this.isOpen) return false;

        // Tìm khách hàng gần vị trí bấm nhất (bán kính chạm 36px)
        for (const cust of this.customers) {
            if (cust.status === 'waiting') {
                const dx = worldX - cust.x;
                const dy = worldY - (cust.y - 10);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= 36) {
                    return this.serveCustomer(cust);
                }
            }
        }
        return false;
    }

    // Xử lý giao dịch bán hàng cho khách (hỗ trợ Tự Động Đổi Vị và Chuỗi Combo)
    serveCustomer(cust) {
        // 1. Kiểm tra kho hàng: Lấy đúng vị hoặc tự động đổi sang vị có sẵn
        let wasRecipeChanged = false;
        let riceItem = state.removeRiceBallByFilling(cust.recipeId);

        if (!riceItem && state.inventory && state.inventory.length > 0) {
            riceItem = state.removeRiceBallAny();
            if (riceItem) {
                cust.recipeId = riceItem.filling;
                wasRecipeChanged = true;
            }
        }

        if (!riceItem) {
            // Hết sạch cơm: Thông báo nhẹ, âm thanh cảnh báo, tuyệt đối không trừ kho âm!
            this.showToast('⚠️ Hết sạch cơm trong thùng! Hãy về Xưởng nấu thêm.');
            try {
                if (audio && typeof audio.playError === 'function') audio.playError();
            } catch (e) {}
            return false;
        }

        const fillingConfig = FILLINGS[cust.recipeId] || FILLINGS.crab_egg_mayo;
        const freshness = typeof riceItem.freshness === 'number' ? riceItem.freshness : 100;

        // Chuẩn ATVSTP & ISO: Dưới 40% độ tươi khách từ chối mua và bị trừ điểm Uy Tín ISO
        if (freshness < 40) {
            this.showToast(`🤢 Cơm chỉ còn ${Math.round(freshness)}% độ tươi (ôi thiu)! Khách từ chối mua & trừ 2 Uy Tín.`);
            try {
                if (audio && typeof audio.playError === 'function') audio.playError();
            } catch (e) {}
            state.reputation = Math.max(0, (state.reputation || 100) - 2);
            cust.status = 'leaving_angry';
            cust.leaveTargetX = cust.x + (cust.x > this.stallX ? 250 : -250);
            cust.leaveTargetY = cust.y + (Math.random() > 0.5 ? 180 : -180);
            this.reorderQueue();
            state.notify();
            state.save();
            return false;
        }

        const timeInfo = state.getTimePeriodInfo();

        // 2. Tính chuỗi Combo (trong vòng 4 giây giữa 2 lượt bán)
        const now = Date.now();
        if (this.lastServeTime && (now - this.lastServeTime) <= 4000) {
            this.comboCount = Math.min(5, (this.comboCount || 1) + 1);
        } else {
            this.comboCount = 1;
        }
        this.lastServeTime = now;

        // 3. Tính tiền & Tiền tip (bảo mật: tính theo giá bán lẻ niêm yết)
        const itemRetailPrice = fillingConfig.price || fillingConfig.basePrice || 20000;
        const retailBuff = state.permanentBuffs?.retailBonus || 0;
        const basePrice = Math.round(itemRetailPrice * state.getPriceMultiplier() * (1 + retailBuff));
        let tip = 0;

        // Thưởng Tip Cơm tươi hảo hạng chuẩn ISO (độ tươi >= 80%)
        if (freshness >= 80) {
            const isoFreshTip = Math.round(basePrice * 0.25);
            tip += isoFreshTip;
        }

        // Thưởng 30% Tip nếu cơm 5 sao
        if (riceItem.stars === 5) {
            tip += Math.round(basePrice * 0.30);
        }

        // Thưởng chuỗi Combo (x2 đến x5)
        if (this.comboCount > 1) {
            const comboBonusTip = Math.round(basePrice * 0.10 * (this.comboCount - 1));
            tip += comboBonusTip;
        }

        // Thưởng gấp đôi Tip nếu là khách VIP
        if (cust.variant === 'vip') {
            tip = (tip > 0) ? (tip * 2) : Math.round(basePrice * 0.20);
        }

        // Cổng trường học vào Giờ Cao Điểm (06:30-08:00 & 16:30-18:00): Tỷ lệ tip cao (+3.000đ - 7.000đ)
        const isSchool = this.currentSpot && (
            this.currentSpot.type === 'school' ||
            (this.currentSpot.id && this.currentSpot.id.startsWith('school_')) ||
            this.currentSpot.id === 'university_town'
        );
        if (isSchool && timeInfo.isSchoolRush && Math.random() < 0.40) {
            const schoolBonusTip = Math.round(3000 + Math.random() * 4000);
            tip += schoolBonusTip;
        }

        const totalEarned = basePrice + tip;

        // 4. Tính EXP
        let expGained = fillingConfig.baseExp || 20;
        if (cust.variant === 'vip') expGained = Math.round(expGained * 1.5);
        const expBuff = state.permanentBuffs?.expBonus || 0;
        if (expBuff > 0) expGained = Math.round(expGained * (1 + expBuff));

        // 5. Cập nhật Tiền & EXP vào hệ thống RPG
        state.addMoney(totalEarned);
        state.addExp(expGained);
        state.recordRevenue(basePrice, tip);

        // 5b. Đặc quyền Chủ Tịch Khu Vực: +15% Doanh Thu Vàng & Báo cáo điểm tranh đoạt địa bàn
        if (this.currentSpot) {
            const spotId = this.currentSpot.id || this.currentSpot.regionId;
            const isRuler = network && typeof network.isTerritoryRuler === 'function' && network.isTerritoryRuler(spotId);
            if (isRuler) {
                const goldBonus = Math.round(totalEarned * 0.15);
                state.addMoney(goldBonus);
                this.addFloatingText(cust.x, cust.y - 48, `👑 +${goldBonus.toLocaleString('vi-VN')}đ (+15% Vàng Chủ Tịch)!`, '#facc15');
            }

            if (network && typeof network.reportTerritorySales === 'function') {
                network.reportTerritorySales(spotId, 1, totalEarned, state.brandName || state.playerName);
            }
        }

        // Nếu người chơi đang nợ hóa đơn vận hành cuối ngày, trích tự động trả nợ
        if (state.unpaidDebt > 0) {
            const debtPay = state.payOperatingDebt(Math.min(totalEarned, state.unpaidDebt));
            if (debtPay > 0 && !state.isOperatingHalted) {
                this.showToast(`🎉 Đã trả hết ${debtPay.toLocaleString('vi-VN')}đ nợ! Dây chuyền và nhân viên đã hoạt động trở lại!`);
            }
        }

        // Ghi nhận phân khúc giá đã bán (20k / 22k / 25k)
        if (fillingConfig && fillingConfig.priceGroup && typeof state.recordSoldPriceGroup === 'function') {
            state.recordSoldPriceGroup(fillingConfig.priceGroup);
        }

        // Ghi nhận phục vụ khách giờ cao điểm (nếu đang trong giờ cao điểm)
        if (timeInfo && (timeInfo.isSchoolRush || timeInfo.isOfficeRush || timeInfo.isWalkingStreetRush)) {
            if (typeof state.recordRushHourCustomer === 'function') {
                state.recordRushHourCustomer();
            }
        }

        // Ghi nhận tiến trình nhiệm vụ theo địa bàn bán hàng
        if (this.currentSpot) {
            const sid = this.currentSpot.id;
            // Nhiệm vụ chung: Bán tại cổng trường
            if (sid.startsWith('school_') || sid === 'school' || sid === 'university_town') {
                state.recordSoldSchool();
            }

            // NV 5: Bán vị 20k tại Tiểu học Hoa Mai
            if ((sid === 'school_hoamai' || sid === 'school') && fillingConfig.priceGroup === '20k') {
                state.recordSoldHoaMai20k();
            }

            // NV 6: Phục vụ sinh viên tại Làng Đại Học
            if (sid === 'university_town') {
                state.recordServedUni();
            }

            // NV 7: Bán vị 22k tại THPT Lê Quý Đôn
            if (sid === 'school_lequydon' && fillingConfig.priceGroup === '22k') {
                state.recordSoldLequydon22k();
            }

            // NV 8: Chinh phục khách VIP ở Phố Đi Bộ với vị Bò phô mai tan chảy 25k
            if (sid === 'walking_street' && cust.variant === 'vip' && cust.recipeId === 'melting_beef_cheese') {
                state.recordSoldWalkStreetVip();
            }

            // NV 3: Giao cơm tại Khu Văn Phòng
            if (sid === 'office_q1' || sid === 'office') {
                state.recordSoldOfficeDelivery();
            }
        }

        // 6. Âm thanh & Hiệu ứng chữ số bay
        try {
            if (typeof audio.playCoin === 'function') audio.playCoin();
            else if (typeof audio.playCoinKeng === 'function') audio.playCoinKeng();
        } catch (eAudio) {}

        const comboPrefix = this.comboCount > 1 ? `🔥 Combo x${this.comboCount}! ` : '';
        const tipText = tip > 0 ? ` (Tip +${tip.toLocaleString('vi-VN')}đ)` : '';
        this.floatingTexts.push({
            x: cust.x,
            y: cust.y - 45,
            text: `${comboPrefix}+${totalEarned.toLocaleString('vi-VN')}đ${tipText}  +${expGained} EXP`,
            color: cust.variant === 'vip' ? '#fbbf24' : (this.comboCount > 1 ? '#f97316' : '#22c55e'),
            alpha: 1.0,
            vy: 0.9
        });

        // 7. Khách hàng vui vẻ cầm nắm cơm rời đi
        cust.status = 'leaving_happy';
        cust.isHoldingOnigiri = true;
        if (wasRecipeChanged) {
            cust.happyMessage = 'Đổi sang vị này cũng ngon chuẩn ISO! ❤️';
            this.showToast(`✨ Khách vui vẻ đổi sang ${fillingConfig.name} chuẩn ISO!`);
        } else {
            cust.happyMessage = Math.random() < 0.35 ? 'Ngon chuẩn ISO! ❤️' : (Math.random() < 0.6 ? 'Tươi nóng hổi! 🍙' : 'Tuyệt vời! ⭐');
        }
        cust.leaveTargetX = cust.x + (cust.x > this.stallX ? 240 : -240);
        cust.leaveTargetY = cust.y + (Math.random() > 0.5 ? 160 : -160);

        if (cust.variant === 'vip' && Math.random() < 0.35 && !seaweedGame.isOpen) {
            setTimeout(() => {
                this.showToast('👑 Khách VIP hào hứng muốn xem bạn biểu diễn bóc rong biển 1-2-3!');
                seaweedGame.open(cust.recipeId || 'melting_beef_cheese', (success) => {
                    if (success) {
                        this.showToast('👑 Khách VIP vô cùng mãn nhãn! Đã nhận thưởng Tip x3!');
                    }
                });
            }, 400);
        }

        this.reorderQueue();
        return true;
    }

    // Helper vẽ hình chữ nhật bo góc an toàn trên mọi trình duyệt
    safeRoundRect(ctx, x, y, w, h, r) {
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, w, h, r);
        } else {
            ctx.rect(x, y, w, h);
        }
    }

    // Vẽ toàn bộ sạp hàng, vòng sáng, NPC và bong bóng giao diện trên Canvas
    render(ctx, camera) {
        if (!this.isOpen && this.floatingTexts.length === 0 && !this.toastMessage && !this.levelUpBanner && state.staffCount === 0) {
            return;
        }

        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        // 0. VẼ CÁC NHÂN VIÊN TYCOON TỰ ĐỘNG (BƯỚC 4)
        const activeStaffs = this.getActiveStaffList();
        activeStaffs.forEach(staff => {
            // Thảm sạp nhân viên
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            this.safeRoundRect(ctx, staff.x - 16, staff.y + 12, 32, 8, 2);
            ctx.fill();

            // Vẽ nhân viên Onigiri đội mũ bảo hiểm và tạp dề
            characterRenderer.render(ctx, {
                x: staff.x,
                y: staff.y,
                facing: staff.facing,
                bounce: 0,
                variant: 'staff',
                nearKitchen: false
            });

            // Nhãn quầy nhân viên
            ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
            ctx.beginPath();
            this.safeRoundRect(ctx, staff.x - 28, staff.y - 42, 56, 14, 3);
            ctx.fill();
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 8px "Be Vietnam Pro", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🧑‍🍳 NV Bán Cơm', staff.x, staff.y - 32);
        });

        // 1. VẼ VÒNG SÁNG SẠP BÁN HÀNG & BẢNG HIỆU SẠP
        if (this.isOpen) {
            const pulse = Math.sin(Date.now() / 250) * 4;

            // Vòng hào quang bán hàng phát sáng lan tỏa
            ctx.beginPath();
            ctx.arc(this.stallX, this.stallY, 68 + pulse, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
            ctx.fill();
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 6]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Thảm sạp hàng caro đường phố dưới chân người chơi
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            this.safeRoundRect(ctx, this.stallX - 28, this.stallY + 12, 56, 18, 4);
            ctx.fill();
            ctx.strokeStyle = '#b45309';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Biển hiệu sạp hàng nổi phía trên
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            this.safeRoundRect(ctx, this.stallX - 48, this.stallY - 52, 96, 22, 6);
            ctx.fill();
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🍙 SẠP CƠM NẮM', this.stallX, this.stallY - 41);

            // Thanh Mức độ chú ý của Trật tự đô thị (khi bán tại cổng trường)
            if (this.heatLevel > 0) {
                const barW = 120;
                const barH = 10;
                const barX = this.stallX - barW / 2;
                const barY = this.stallY - 82;

                // Nền khung
                ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                ctx.beginPath();
                this.safeRoundRect(ctx, barX - 6, barY - 14, barW + 12, barH + 18, 6);
                ctx.fill();
                const isFlashing = this.heatLevel >= 80 && Math.sin(Date.now() / 120) > 0;
                ctx.strokeStyle = isFlashing ? '#ef4444' : (this.heatLevel >= 80 ? '#ffffff' : '#334155');
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Tiêu đề mức độ chú ý
                ctx.fillStyle = this.heatLevel >= 80 ? '#f87171' : '#facc15';
                ctx.font = 'bold 9px "Be Vietnam Pro", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`🚨 TRẬT TỰ ĐÔ THỊ: ${Math.round(this.heatLevel)}%`, this.stallX, barY - 4);

                // Khung track
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(barX, barY, barW, barH);

                // Thanh fill màu (Xanh lá -> Vàng -> Đỏ cảnh báo)
                const fillW = Math.max(0, Math.min(barW, (this.heatLevel / 100) * barW));
                ctx.fillStyle = this.heatLevel >= 80 ? '#ef4444' : this.heatLevel >= 50 ? '#f59e0b' : '#22c55e';
                ctx.fillRect(barX, barY, fillW, barH);
            }
        }

        // 2. VẼ TỪNG KHÁCH HÀNG NPC BẰNG CharacterRenderer & City3D
        this.customers.forEach(cust => {
            const bounce = (cust.status === 'walking_in' || cust.status === 'leaving_happy' || cust.status === 'leaving_angry')
                ? Math.abs(Math.sin(cust.stepCycle || 0)) * 3 : 0;

            // Vẽ sprite + phụ kiện vector chuẩn chỉ (nhiều màu áo, bước chân nảy, cầm nắm cơm)
            characterRenderer.render(ctx, {
                x: cust.x,
                y: cust.y,
                facing: cust.facing,
                bounce: bounce,
                variant: cust.variant,
                colorVariation: cust.colorVariation || 0,
                isHoldingOnigiri: cust.isHoldingOnigiri || false,
                nearKitchen: false
            });

            // Vẽ bong bóng yêu cầu và thanh kiên nhẫn khi đang xếp hàng
            if (cust.status === 'waiting' || cust.status === 'walking_in') {
                this.drawCustomerBubble(ctx, cust);
            } else if (cust.status === 'leaving_happy') {
                // Hiệu ứng biểu cảm hài lòng: "Ngon chuẩn ISO!", "Tươi nóng hổi!", ❤️ 🍙
                const happyText = cust.happyMessage || 'Ngon chuẩn ISO! ❤️';
                const hbX = cust.x;
                const hbY = cust.y - 46;
                const hbW = 100;
                const hbH = 22;

                ctx.save();
                ctx.fillStyle = 'rgba(236, 253, 245, 0.96)';
                ctx.beginPath();
                this.safeRoundRect(ctx, hbX - hbW / 2, hbY - hbH / 2, hbW, hbH, 6);
                ctx.fill();
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 1.2;
                ctx.stroke();

                ctx.fillStyle = '#047857';
                ctx.font = 'bold 9.5px "Be Vietnam Pro", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(happyText, hbX, hbY);
                ctx.restore();
            } else if (cust.status === 'leaving_angry') {
                // Biểu tượng bực mình khi chờ quá lâu
                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('💢', cust.x, cust.y - 42);
            }
        });

        // 3. VẼ CHỮ SỐ BAY (+Tiền, +EXP)
        this.floatingTexts.forEach(ft => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        });

        ctx.restore();
    }

    // Vẽ bong bóng gọi món & Thanh kiên nhẫn trên đầu NPC (Menu 15 vị + Giá bán lẻ niêm yết)
    drawCustomerBubble(ctx, cust) {
        const bubbleX = cust.x;
        const bubbleY = cust.y - 50;
        const fillingConfig = FILLINGS[cust.recipeId] || FILLINGS.crab_egg_mayo;
        const retailPrice = fillingConfig.price || 20000;
        const fillingName = fillingConfig.name || 'Cơm nắm';

        const isVip = (cust.variant === 'vip');
        const bubbleW = isVip ? 122 : 114;
        const bubbleH = 34;

        ctx.save();

        // Khung bong bóng nền trắng bo góc mềm mại
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        this.safeRoundRect(ctx, bubbleX - bubbleW / 2, bubbleY - bubbleH / 2, bubbleW, bubbleH, 8);
        ctx.fill();
        ctx.strokeStyle = isVip ? '#eab308' : '#f97316';
        ctx.lineWidth = isVip ? 2.2 : 1.6;
        ctx.stroke();

        // Mũi nhọn tam giác chỉ xuống đầu khách
        ctx.beginPath();
        ctx.moveTo(bubbleX - 4, bubbleY + bubbleH / 2);
        ctx.lineTo(bubbleX, bubbleY + bubbleH / 2 + 5);
        ctx.lineTo(bubbleX + 4, bubbleY + bubbleH / 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = isVip ? '#eab308' : '#f97316';
        ctx.stroke();

        // Dòng 1: Icon nắm cơm + Tên vị cơm nắm chuẩn ISO & ATVSTP
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const iconX = bubbleX - bubbleW / 2 + 6;
        ctx.fillText(fillingConfig.icon || '🍙', iconX, bubbleY - 6);

        // Giới hạn độ dài tên vị để vừa vặn khung
        const displayName = fillingName.length > 14 ? fillingName.substring(0, 13) + '…' : fillingName;
        ctx.fillText(displayName, iconX + 16, bubbleY - 6);

        if (isVip) {
            ctx.fillStyle = '#ca8a04';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('⭐', bubbleX + bubbleW / 2 - 13, bubbleY - 6);
        }

        // Dòng 2: Giá bán lẻ niêm yết (20.000đ / 22.000đ / 25.000đ)
        ctx.fillStyle = '#ea580c';
        ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`🍙 ${retailPrice.toLocaleString('vi-VN')}đ`, iconX + 2, bubbleY + 7);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 8px "Be Vietnam Pro", sans-serif';
        ctx.fillText('• ISO', iconX + 66, bubbleY + 7);

        // Thanh kiên nhẫn (Patience Bar)
        const barW = 56;
        const barH = 3.5;
        const barX = bubbleX - barW / 2;
        const barY = bubbleY + bubbleH / 2 + 6;

        // Nền thanh
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.beginPath();
        this.safeRoundRect(ctx, barX, barY, barW, barH, 2);
        ctx.fill();

        // Phần trăm còn lại
        const pct = Math.max(0, Math.min(1, cust.patience / cust.maxPatience));
        let fillColor = '#22c55e'; // Xanh lá
        if (pct < 0.3) fillColor = '#ef4444'; // Đỏ gấp gáp
        else if (pct < 0.6) fillColor = '#f59e0b'; // Vàng

        ctx.fillStyle = fillColor;
        ctx.beginPath();
        this.safeRoundRect(ctx, barX, barY, barW * pct, barH, 2);
        ctx.fill();

        ctx.restore();
    }

    // Vẽ giao diện cố định trên màn hình (UI HUD: Toast & Banner Lên Cấp & Cảnh báo Trật tự đô thị)
    renderScreenUI(ctx, screenWidth, screenHeight) {
        try {
            ctx.save();

            // 0. Thông báo đỏ lớn xử phạt Trật Tự Đô Thị
            if (this.penaltyBanner) {
                const pb = this.penaltyBanner;
                const pbW = Math.min(480, screenWidth - 30);
                const pbH = 82;
                const pbx = (screenWidth - pbW) / 2;
                const pby = 120;

                ctx.fillStyle = 'rgba(185, 28, 28, 0.96)';
                ctx.beginPath();
                this.safeRoundRect(ctx, pbx, pby, pbW, pbH, 14);
                ctx.fill();
                ctx.strokeStyle = '#f87171';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = '900 15px "Be Vietnam Pro", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`🚨 ${pb.text}`, pbx + pbW / 2, pby + 28);

                ctx.fillStyle = '#fecaca';
                ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
                ctx.fillText(pb.subtext, pbx + pbW / 2, pby + 56);
            }

            // 0b. Thanh Cảnh Báo Trật Tự Đô Thị (0% -> 100%) khi vi phạm
            if (this.heatLevel > 0 || this.urbanWarning > 0) {
                const currentWarning = this.urbanWarning || this.heatLevel || 0;
                const barW = Math.min(360, screenWidth - 40);
                const barH = 46;
                const bx = (screenWidth - barW) / 2;
                const by = 80;

                const isFlashing = Math.sin(Date.now() / 120) > 0;
                const borderColor = currentWarning >= 75 ? (isFlashing ? '#ef4444' : '#f59e0b') : '#f59e0b';

                ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
                ctx.beginPath();
                this.safeRoundRect(ctx, bx, by, barW, barH, 10);
                ctx.fill();
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Track nền thanh Heat
                const trackX = bx + 12;
                const trackY = by + 26;
                const trackW = barW - 24;
                const trackH = 12;

                ctx.fillStyle = '#334155';
                ctx.beginPath();
                this.safeRoundRect(ctx, trackX, trackY, trackW, trackH, 6);
                ctx.fill();

                const heatFillW = Math.max(0, Math.min(trackW, (currentWarning / 100) * trackW));
                ctx.fillStyle = currentWarning >= 75 ? '#ef4444' : (currentWarning >= 40 ? '#f59e0b' : '#eab308');
                ctx.beginPath();
                this.safeRoundRect(ctx, trackX, trackY, heatFillW, trackH, 6);
                ctx.fill();

                // Nhãn cảnh báo
                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(`🚨 CẢNH BÁO TRẬT TỰ ĐÔ THỊ: ${Math.round(currentWarning)}%`, bx + 12, by + 8);

                ctx.fillStyle = '#fca5a5';
                ctx.font = 'bold 9px "Be Vietnam Pro", sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(this.violationReason || 'BÁN SAI VỊ TRÍ / SAI GIỜ', bx + barW - 12, by + 9);
            }

            // 1. Banner Lên Cấp RPG (Level Up Fanfare)
            if (this.levelUpBanner) {
                const b = this.levelUpBanner;
                const bannerW = Math.min(380, screenWidth - 40);
                const bannerH = 76;
                const bx = (screenWidth - bannerW) / 2;
                const by = 80;

                ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
                ctx.beginPath();
                this.safeRoundRect(ctx, bx, by, bannerW, bannerH, 14);
                ctx.fill();
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#fde047';
                ctx.font = '900 17px "Be Vietnam Pro", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`🎉 CHÚC MỪNG LÊN CẤP ${b.level}!`, bx + bannerW / 2, by + 26);

                ctx.fillStyle = '#ffffff';
                ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
                ctx.fillText(`Tăng vĩnh viễn: +${b.priceBonus}% Giá bán • +${b.speedBonus}% Tốc độ chạy`, bx + bannerW / 2, by + 52);
            }

            // 2. Thông báo Toast
            if (this.toastMessage) {
                const toastW = Math.min(420, screenWidth - 40);
                const toastH = 40;
                const tx = (screenWidth - toastW) / 2;
                const ty = screenHeight - 90;

                ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
                ctx.beginPath();
                this.safeRoundRect(ctx, tx, ty, toastW, toastH, 10);
                ctx.fill();
                ctx.strokeStyle = '#f97316';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.toastMessage, tx + toastW / 2, ty + toastH / 2);
            }

            ctx.restore();
        } catch (errUI) {
            console.error('[SellingManager] Error rendering screen UI:', errUI);
            try { ctx.restore(); } catch (e) {}
        }
    }
}

export const sellingManager = new SellingManager();
