// src/selling.js - Hệ thống Đi bán hàng, Khách hàng NPC & Xếp hàng mua cơm nắm

import { state, FILLINGS, VEHICLES } from './state.js';
import { audio } from './audio.js';
import { characterRenderer } from './characterRenderer.js';
import { seaweedGame } from './seaweedGame.js';
import { LEGAL_SELLING_ZONES, isInsideLegalZone } from './world.js';

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

        const timeInfo = state.getTimePeriodInfo();
        const isSchool = (spot.type === 'school' || spot.id.startsWith('school_') || spot.id === 'university_town');
        const isOffice = (spot.id === 'office_q1' || spot.type === 'office');
        const isWalking = (spot.id === 'walking_street');

        // Điều chỉnh công suất & nhịp độ theo địa bàn và khung giờ cao điểm
        if (isSchool) {
            if (timeInfo.isSchoolRush) {
                this.maxCustomers = 5;
                this.spawnInterval = 60; // Khách ùa ra đông
                this.showToast(`🎒 GIỜ CAO ĐIỂM CỔNG TRƯỜNG (${timeInfo.timeStr})! Học sinh ùa ra đông, Tip cao!`);
            } else {
                this.maxCustomers = 2;
                this.spawnInterval = 1000; // Tốc độ khách tới giảm 85%
                this.showToast('Cổng trường đang trong giờ học, vắng khách!');
            }
        } else if (isOffice) {
            if (timeInfo.isOfficeRush) {
                this.maxCustomers = 4;
                this.spawnInterval = 75;
                this.showToast(`🏢 GIỜ CAO ĐIỂM VĂN PHÒNG (${timeInfo.timeStr})! Dân công sở chuộng vị 22k-25k!`);
            } else {
                this.maxCustomers = 3;
                this.spawnInterval = 160;
                this.showToast(`🏪 Đã mở sạp bán hàng tại ${spot.name}!`);
            }
        } else if (isWalking) {
            if (timeInfo.isWalkingStreetRush) {
                this.maxCustomers = 5;
                this.spawnInterval = 70;
                this.showToast(`✨ GIỜ CAO ĐIỂM PHỐ ĐI BỘ (${timeInfo.timeStr})! Tăng tỷ lệ Khách VIP!`);
            } else {
                this.maxCustomers = 3;
                this.spawnInterval = 160;
                this.showToast(`🏪 Đã mở sạp bán hàng tại ${spot.name}!`);
            }
        } else {
            this.maxCustomers = 3;
            this.spawnInterval = 150;
            this.showToast(`🏪 Đã mở sạp bán hàng tại ${spot.name}! Nhấn Space hoặc chạm vào khách để bán.`);
        }

        this.spawnTimer = 25; // Sinh ngay khách đầu tiên sau ~0.4s
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

        // Cập nhật nhịp khách theo giờ cao điểm khi sạp đang mở
        if (isSchoolSpot) {
            if (timeInfo.isSchoolRush) {
                this.maxCustomers = 5;
                this.spawnInterval = 60;
            } else {
                this.maxCustomers = 2;
                this.spawnInterval = 1000;
            }
        } else if (this.currentSpot && (this.currentSpot.id === 'office_q1' || this.currentSpot.type === 'office')) {
            if (timeInfo.isOfficeRush) {
                this.maxCustomers = 4;
                this.spawnInterval = 75;
            } else {
                this.maxCustomers = 3;
                this.spawnInterval = 160;
            }
        } else if (this.currentSpot && this.currentSpot.id === 'walking_street') {
            if (timeInfo.isWalkingStreetRush) {
                this.maxCustomers = 5;
                this.spawnInterval = 70;
            } else {
                this.maxCustomers = 3;
                this.spawnInterval = 160;
            }
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
    }

    // Tính toán tọa độ xếp hàng gọn gàng (Anti-Stacking Queue)
    // Khách 1 đứng cách sạp 55px, các khách sau nối đuôi cách nhau 45px
    getQueuePosition(index) {
        const spacing = 46;
        // Xếp hàng ngang hướng về phía sạp bán
        return {
            x: this.stallX + 55 + index * spacing,
            y: this.stallY + 8
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

    // Sinh khách hàng dựa trên địa bàn khu vực TP.HCM
    trySpawnCustomer() {
        const activeCount = this.customers.filter(c => c.status === 'walking_in' || c.status === 'waiting').length;
        if (activeCount >= this.maxCustomers) return;

        const spotId = this.currentSpot ? this.currentSpot.id : 'school_hoamai';
        const timeInfo = state.getTimePeriodInfo();

        let isVip = Math.random() < 0.15; // Mặc định 15% khách VIP
        if (spotId === 'walking_street') {
            // Phố Đi Bộ / Quảng Trường: Giờ cao điểm vào 18:30–22:00 tăng tỷ lệ xuất hiện Khách VIP lên 70%
            isVip = timeInfo.isWalkingStreetRush ? (Math.random() < 0.70) : (Math.random() < 0.35);
        }

        let variant = 'student';
        let requestedFilling = 'crab_egg_mayo';

        if (isVip) {
            variant = 'vip';
            if (spotId === 'walking_street') {
                // Khách VIP Phố Đi Bộ đặc biệt ưa chuộng Bò phô mai tan chảy 25k (70%)
                requestedFilling = Math.random() < 0.70 ? 'melting_beef_cheese' : (Math.random() < 0.5 ? 'beef_bbq' : 'salmon_mayo');
            } else {
                // Khách VIP thông thường chọn ngẫu nhiên các món cao cấp
                const vipFillings = ['melting_beef_cheese', 'beef_bbq', 'salmon_mayo', 'cheese_chicken_roll', 'baked_cheese_shrimp'];
                requestedFilling = vipFillings[Math.floor(Math.random() * vipFillings.length)];
            }
        } else if (spotId === 'school_hoamai' || spotId === 'school') {
            variant = 'student';
            // Trường Tiểu học Hoa Mai: Ưa chuộng các món nhóm 20k
            const hoaMai20k = [
                'crab_egg_mayo', 'super_cheese_sausage', 'egg_sausage_mayo', 
                'cowboy_sausage', 'chicken_teriyaki', 'fish_cake', 'chicken_tomyum',
                'pate_cheese', 'grilled_pork_kimchi'
            ];
            requestedFilling = hoaMai20k[Math.floor(Math.random() * hoaMai20k.length)];
        } else if (spotId === 'school_nguyendu') {
            variant = 'student';
            // Trường THCS Nguyễn Du: Ưa chuộng các món nhóm 20k - 22k
            const nguyenDuMix = [
                'crab_egg_mayo', 'chicken_teriyaki', 'salmon_mayo', 
                'beef_bbq', 'cheese_chicken_roll', 'tuna_mayo', 'cowboy_sausage'
            ];
            requestedFilling = nguyenDuMix[Math.floor(Math.random() * nguyenDuMix.length)];
        } else if (spotId === 'school_lequydon') {
            variant = 'student';
            // Trường THPT Lê Quý Đôn: Ưa chuộng các món nhóm 22k
            const leQuyDon22k = ['salmon_mayo', 'beef_bbq', 'cheese_chicken_roll'];
            requestedFilling = leQuyDon22k[Math.floor(Math.random() * leQuyDon22k.length)];
        } else if (spotId === 'university_town') {
            variant = 'student';
            // Làng Đại Học: Sinh viên đông đúc, mua đa dạng cả 3 mức giá
            const allFillings = Object.keys(FILLINGS);
            requestedFilling = allFillings[Math.floor(Math.random() * allFillings.length)];
        } else if (spotId === 'office_q1' || spotId === 'office') {
            variant = 'office';
            // Khu Văn Phòng Quận 1: Giờ cao điểm (11:30–13:30) ưa chuộng các vị 22.000đ – 25.000đ (85%)
            if (timeInfo.isOfficeRush && Math.random() < 0.85) {
                const officeHighPrices = ['melting_beef_cheese', 'beef_bbq', 'salmon_mayo', 'cheese_chicken_roll', 'baked_cheese_shrimp'];
                requestedFilling = officeHighPrices[Math.floor(Math.random() * officeHighPrices.length)];
            } else {
                const officeMix = [
                    'melting_beef_cheese', 'beef_bbq', 'salmon_mayo', 
                    'cheese_chicken_roll', 'tuna_mayo', 'baked_cheese_shrimp'
                ];
                requestedFilling = officeMix[Math.floor(Math.random() * officeMix.length)];
            }
        } else if (spotId === 'walking_street') {
            variant = 'student';
            // Phố Đi Bộ: Ưa chuộng vị 25k và các món bò/gà đậm đà
            const walkMix = ['melting_beef_cheese', 'beef_bbq', 'cheese_chicken_roll', 'salmon_mayo'];
            requestedFilling = walkMix[Math.floor(Math.random() * walkMix.length)];
        }

        // Tọa độ sinh từ mép ngoài đường
        const queuePos = this.getQueuePosition(activeCount);
        const spawnX = queuePos.x + 160 + Math.random() * 60;
        const spawnY = queuePos.y + (Math.random() * 80 - 40);

        // Cạnh tranh thị phần với xe hàng đối thủ ngoài phố:
        // Khách cân nhắc: Cấp xe người chơi, Độ tươi cơm trong kho và vị ưa chuộng
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

        // Điểm cạnh tranh của xe đối thủ vào giờ cao điểm
        const competitorScore = 65 + (timeInfo.isSchoolRush || timeInfo.isOfficeRush ? 18 : 0);
        if (playerAttractScore < competitorScore && Math.random() < 0.40) {
            // Xe đối thủ hút mất khách
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

        const newCustomer = {
            id: 'cust_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            variant: variant,
            recipeId: requestedFilling,
            x: spawnX,
            y: spawnY,
            facing: -1,
            speed: 1.8 + Math.random() * 0.4,
            stepCycle: 0,
            status: 'walking_in', // walking_in -> waiting -> leaving_happy / leaving_angry
            queueIndex: activeCount,
            patience: 100, // 100% -> 0%
            maxPatience: 100,
            decayRate: variant === 'office' ? 0.11 : 0.08, // Dân văn phòng vội hơn
            leaveTargetX: spawnX,
            leaveTargetY: spawnY
        };

        this.customers.push(newCustomer);
    }

    // Bán cho khách hàng đầu tiên trong hàng (Phím Space hoặc Nút Bán Nhanh)
    sellQuick() {
        if (!this.isOpen) return false;
        const waitingCustomer = this.customers.find(c => c.status === 'waiting' && c.queueIndex === 0)
            || this.customers.find(c => c.status === 'waiting');
        if (!waitingCustomer) {
            this.showToast('⏳ Chưa có khách nào đứng vào sạp.');
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

    // Xử lý giao dịch bán hàng cho khách
    serveCustomer(cust) {
        const fillingConfig = FILLINGS[cust.recipeId] || FILLINGS.crab_egg_mayo;

        // 1. Kiểm tra kho hàng
        const riceItem = state.removeRiceBallByFilling(cust.recipeId);

        if (!riceItem) {
            // Hết hàng: Thông báo nhẹ, âm thanh cảnh báo, tuyệt đối không trừ kho âm!
            this.showToast(`⚠️ Hết ${fillingConfig.name} rồi! Về Xưởng Bếp làm thêm nhé.`);
            audio.playError();
            return false;
        }

        const freshness = typeof riceItem.freshness === 'number' ? riceItem.freshness : 100;

        // Chuẩn ATVSTP & ISO: Dưới 40% độ tươi khách từ chối mua và bị trừ điểm Uy Tín ISO
        if (freshness < 40) {
            this.showToast(`🤢 Cơm chỉ còn ${Math.round(freshness)}% độ tươi (ôi thiu)! Khách từ chối mua & trừ 2 Uy Tín.`);
            audio.playError();
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

        // 2. Tính tiền & Tiền tip (bảo mật: tính theo giá bán lẻ niêm yết)
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

        // 3. Tính EXP
        let expGained = fillingConfig.baseExp;
        if (cust.variant === 'vip') expGained = Math.round(expGained * 1.5);
        const expBuff = state.permanentBuffs?.expBonus || 0;
        if (expBuff > 0) expGained = Math.round(expGained * (1 + expBuff));

        // 4. Cập nhật Tiền & EXP vào hệ thống RPG
        state.addMoney(totalEarned);
        state.addExp(expGained);
        state.recordRevenue(basePrice, tip);

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

        // 5. m thanh & Hiệu ứng chữ số bay
        audio.playCoinKeng();

        const tipText = tip > 0 ? ` (Tip +${tip.toLocaleString('vi-VN')}đ)` : '';
        this.floatingTexts.push({
            x: cust.x,
            y: cust.y - 45,
            text: `+${totalEarned.toLocaleString('vi-VN')}đ${tipText}  +${expGained} EXP`,
            color: cust.variant === 'vip' ? '#fbbf24' : '#22c55e',
            alpha: 1.0,
            vy: 0.9
        });

        // 6. Khách hàng vui vẻ rời đi (Khách VIP có 35% cơ hội thách thức bóc rong biển)
        cust.status = 'leaving_happy';
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

        // 2. VẼ TỪNG KHÁCH HÀNG NPC BẰNG CharacterRenderer
        this.customers.forEach(cust => {
            const bounce = (cust.status === 'walking_in' || cust.status === 'leaving_happy' || cust.status === 'leaving_angry')
                ? Math.abs(Math.sin(cust.stepCycle)) * 3 : 0;

            // Vẽ sprite + phụ kiện vector chuẩn chỉ
            characterRenderer.render(ctx, {
                x: cust.x,
                y: cust.y,
                facing: cust.facing,
                bounce: bounce,
                variant: cust.variant,
                nearKitchen: false
            });

            // Vẽ bong bóng yêu cầu và thanh kiên nhẫn khi đang xếp hàng
            if (cust.status === 'waiting' || cust.status === 'walking_in') {
                this.drawCustomerBubble(ctx, cust);
            } else if (cust.status === 'leaving_happy') {
                // Biểu tượng trái tim / nụ cười vui sướng khi mua được cơm
                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('❤️ 🍙', cust.x, cust.y - 42);
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

    // Vẽ bong bóng gọi món & Thanh kiên nhẫn trên đầu NPC
    drawCustomerBubble(ctx, cust) {
        const bubbleX = cust.x;
        const bubbleY = cust.y - 46;
        const fillingConfig = FILLINGS[cust.recipeId] || FILLINGS.crab_egg_mayo;

        const isVip = (cust.variant === 'vip');
        const bubbleW = isVip ? 76 : 68;
        const bubbleH = 26;

        ctx.save();

        // Khung bong bóng nền trắng bo góc
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        this.safeRoundRect(ctx, bubbleX - bubbleW / 2, bubbleY - bubbleH / 2, bubbleW, bubbleH, 8);
        ctx.fill();
        ctx.strokeStyle = isVip ? '#eab308' : '#cbd5e1';
        ctx.lineWidth = isVip ? 2.2 : 1.5;
        ctx.stroke();

        // Mũi nhọn tam giác chỉ xuống đầu khách
        ctx.beginPath();
        ctx.moveTo(bubbleX - 4, bubbleY + bubbleH / 2);
        ctx.lineTo(bubbleX, bubbleY + bubbleH / 2 + 5);
        ctx.lineTo(bubbleX + 4, bubbleY + bubbleH / 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Nội dung bong bóng: Icon + Tên viết tắt
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const shortNames = {
            crab_mayo: 'Cua Mayo',
            chicken_teriyaki: 'Teriyaki',
            beef_cheese: 'Bò Cheese'
        };

        const iconX = bubbleX - bubbleW / 2 + 6;
        ctx.fillText(fillingConfig.icon, iconX, bubbleY);

        ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
        ctx.fillText(shortNames[cust.recipeId] || 'Cơm nắm', iconX + 16, bubbleY);

        if (isVip) {
            ctx.fillStyle = '#ca8a04';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('⭐', bubbleX + bubbleW / 2 - 14, bubbleY);
        }

        // Thanh kiên nhẫn (Patience Bar)
        const barW = 44;
        const barH = 4;
        const barX = bubbleX - barW / 2;
        const barY = bubbleY + bubbleH / 2 + 7;

        // Nền thanh
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
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
