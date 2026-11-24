// src/deliveryMode.js - Kiểu chơi 1: Giao Hàng Hỏa Tốc 60s, Mũi Tên Chỉ Đường & Vùng Phát Sáng Điểm Giao

import { state, FILLINGS, resolveFillingId } from './state.js';
import { audio } from './audio.js';

export class DeliveryManager {
    constructor() {
        this.activeOrder = null;
        this.timer = 0;
        this.duration = 60; // 60 giây
        this.lastUpdateTime = Date.now();
        this.arrowPulseAngle = 0;
        this.beaconPulse = 0;

        // Danh sách các điểm đến tiềm năng trên bản đồ TP.HCM (tọa độ trung tâm)
        this.destinations = [
            { id: 'school_hoamai', name: 'Tiểu học Hoa Mai', x: 1000, y: 550, icon: '🏫' },
            { id: 'school_nguyendu', name: 'THCS Nguyễn Du', x: 2900, y: 550, icon: '🎒' },
            { id: 'school_lequydon', name: 'THPT Lê Quý Đôn', x: 1000, y: 2400, icon: '🎓' },
            { id: 'university_town', name: 'Làng Đại Học', x: 2900, y: 2400, icon: '📚' },
            { id: 'office_q1', name: 'Văn Phòng Quận 1', x: 2800, y: 1400, icon: '🏢' },
            { id: 'walking_street', name: 'Phố Đi Bộ Nguyễn Huệ', x: 2000, y: 1400, icon: '🚶' }
        ];

        // 3 đơn hàng mẫu luôn sẵn sàng nhận
        this.availableOrders = [];
        this.refreshAvailableOrders();
    }

    refreshAvailableOrders() {
        const candidateFillings = [
            'crab_egg_mayo', 'chicken_teriyaki', 'salmon_mayo', 'beef_bbq', 'melting_beef_cheese'
        ];

        this.availableOrders = [0, 1, 2].map((idx) => {
            const dest = this.destinations[(idx * 2 + Math.floor(Math.random() * 2)) % this.destinations.length];
            const fillingKey = candidateFillings[Math.floor(Math.random() * candidateFillings.length)];
            const fillingCfg = FILLINGS[fillingKey] || FILLINGS.crab_egg_mayo;
            const count = 2 + (idx % 3); // 2 đến 4 nắm
            const baseRetailPrice = fillingCfg.price * count;
            const bonusMoney = Math.round(baseRetailPrice * 1.5); // Thưởng +50% so với bán lẻ

            return {
                id: 'express_' + Date.now() + '_' + idx,
                destId: dest.id,
                destName: dest.name,
                destIcon: dest.icon,
                destX: dest.x,
                destY: dest.y,
                fillingId: fillingKey,
                fillingName: fillingCfg.name,
                count: count,
                rewardMoney: bonusMoney,
                rewardExp: count * 35,
                durationSeconds: 60
            };
        });
    }

    // Nhận đơn giao hàng hỏa tốc
    acceptOrder(orderId) {
        const order = this.availableOrders.find(o => o.id === orderId);
        if (!order) return false;

        this.activeOrder = { ...order };
        const extraTime = state.permanentBuffs?.expressTimeBonus || 0;
        this.timer = (order.durationSeconds || 60) + extraTime;
        this.lastUpdateTime = Date.now();
        audio.playLevelUp();

        // Làm mới danh sách đơn chờ
        this.refreshAvailableOrders();
        state.notify();
        return true;
    }

    // Hủy hoặc hết hạn đơn hàng
    cancelOrder(isExpired = false) {
        if (!this.activeOrder) return;
        this.activeOrder = null;
        this.timer = 0;
        if (isExpired) {
            audio.playError();
        }
        state.notify();
    }

    // Cập nhật đếm ngược mỗi frame
    update(player) {
        if (!this.activeOrder) return;

        const now = Date.now();
        const delta = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        this.timer -= delta;
        this.arrowPulseAngle += 0.08;
        this.beaconPulse += 0.05;

        // Hết thời gian giao hàng 60s
        if (this.timer <= 0) {
            this.cancelOrder(true);
        }
    }

    // Kiểm tra xem người chơi có đang đứng trong vùng phát sáng giao hàng không
    isPlayerAtDeliveryZone(player) {
        if (!this.activeOrder) return false;
        const dx = player.x - this.activeOrder.destX;
        const dy = player.y - this.activeOrder.destY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist <= 90; // Bán kính nhận diện 90px
    }

    // Thử giao hàng khi người chơi nhấn phím E tại điểm giao
    tryDeliver(player) {
        if (!this.activeOrder) return { success: false, reason: 'no_order' };

        if (!this.isPlayerAtDeliveryZone(player)) {
            return { success: false, reason: 'not_in_zone' };
        }

        const requiredCount = this.activeOrder.count;
        const targetFilling = resolveFillingId(this.activeOrder.fillingId);
        const currentCount = state.getFillingCount(targetFilling);

        if (currentCount < requiredCount) {
            audio.playError();
            return {
                success: false,
                reason: 'missing_rice',
                current: currentCount,
                needed: requiredCount,
                fillingName: this.activeOrder.fillingName
            };
        }

        // Đủ cơm: Tiến hành giao đơn hỏa tốc
        for (let i = 0; i < requiredCount; i++) {
            state.removeRiceBallByFilling(targetFilling);
        }

        // Thưởng tiền (+50% bán lẻ) & EXP
        state.addMoney(this.activeOrder.rewardMoney);
        state.addExp(this.activeOrder.rewardExp);
        if (typeof state.recordSideQuestDone === 'function') {
            state.recordSideQuestDone();
        } else if (typeof state.recordSideQuestCompleted === 'function') {
            state.recordSideQuestCompleted();
        }
        audio.playMoneyChime();

        const completedInfo = {
            rewardMoney: this.activeOrder.rewardMoney,
            rewardExp: this.activeOrder.rewardExp,
            destName: this.activeOrder.destName
        };

        // Biến mất ngay lập tức mũi tên và vùng sáng
        this.activeOrder = null;
        this.timer = 0;
        state.notify();

        return { success: true, ...completedInfo };
    }

    // Vẽ Vùng Phát Sáng tại điểm đến & Mũi Tên Chỉ Hướng quanh nhân vật
    render(ctx, camera, player) {
        if (!this.activeOrder) return;

        const targetX = this.activeOrder.destX;
        const targetY = this.activeOrder.destY;

        // 1. VẼ VÙNG PHÁT SÁNG TẠI ĐIỂM GIAO (World Space)
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        // Vòng tròn hào quang nhấp nháy
        const pulseR = 75 + Math.sin(this.beaconPulse) * 12;
        const grad = ctx.createRadialGradient(targetX, targetY, 15, targetX, targetY, pulseR);
        grad.addColorStop(0, 'rgba(250, 204, 21, 0.6)');
        grad.addColorStop(0.6, 'rgba(234, 88, 12, 0.3)');
        grad.addColorStop(1, 'rgba(234, 88, 12, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(targetX, targetY, pulseR, 0, Math.PI * 2);
        ctx.fill();

        // Vòng beacon xoay
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(targetX, targetY, 65, this.arrowPulseAngle, this.arrowPulseAngle + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Icon điểm giao hàng
        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📦', targetX, targetY - 10);

        // Chữ nhấp nháy "ĐIỂM GIAO HỎA TỐC"
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
        ctx.strokeText(`ĐIỂM GIAO: ${this.activeOrder.destName}`, targetX, targetY + 28);
        ctx.fillText(`ĐIỂM GIAO: ${this.activeOrder.destName}`, targetX, targetY + 28);

        ctx.restore();

        // 2. VẼ MŨI TÊN CHỈ HƯỚNG QUANH NHÂN VẬT (Orbiting Arrow in World Space)
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const angleToTarget = Math.atan2(dy, dx);
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Chỉ hiển thị mũi tên nếu người chơi cách xa điểm giao > 80px
        if (dist > 80) {
            ctx.save();
            ctx.translate(-camera.x, -camera.y);

            const orbitRadius = 55 + Math.sin(this.arrowPulseAngle * 2) * 5;
            const arrowX = player.x + Math.cos(angleToTarget) * orbitRadius;
            const arrowY = player.y + Math.sin(angleToTarget) * orbitRadius;

            ctx.translate(arrowX, arrowY);
            ctx.rotate(angleToTarget);

            // Vẽ mũi tên tam giác phát sáng Neon
            ctx.fillStyle = '#facc15';
            ctx.strokeStyle = '#ea580c';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.moveTo(14, 0);       // Đỉnh mũi tên
            ctx.lineTo(-10, -9);     // Cánh trên
            ctx.lineTo(-5, 0);       // Khuyết giữa
            ctx.lineTo(-10, 9);      // Cánh dưới
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }

        // 3. VẼ ĐỒNG HỒ ĐẾM NGƯỢC HUD GIAO HỎA TỐC (Screen Space)
        const screenW = window.innerWidth;
        const hudX = screenW / 2;
        const hudY = 75;

        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = this.timer <= 15 ? '#ef4444' : '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(hudX - 140, hudY - 20, 280, 42, 10);
        } else {
            ctx.rect(hudX - 140, hudY - 20, 280, 42);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.timer <= 15 ? '#ef4444' : '#facc15';
        ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const timerFormatted = Math.max(0, Math.ceil(this.timer));
        ctx.fillText(`⚡ HỎA TỐC: ${this.activeOrder.count} nắm ${this.activeOrder.fillingName} (${timerFormatted}s)`, hudX, hudY - 4);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px "Be Vietnam Pro", sans-serif';
        ctx.fillText(`Đến ${this.activeOrder.destName} • Cách ${Math.round(dist)}m`, hudX, hudY + 12);

        ctx.restore();
    }
}

export const deliveryManager = new DeliveryManager();
