// src/player.js - Điều khiển nhân vật chính linh vật Onigiri (WASD / Mũi tên) & Phương tiện

import { characterRenderer } from './characterRenderer.js';
import { state } from './state.js';

export class Player {
    constructor(x = 500, y = 1200) {
        this.x = x;
        this.y = y;
        this.baseSpeed = 3.8;
        this.speed = this.baseSpeed;
        this.radius = 18; // Bán kính va chạm chuẩn
        this.angle = 0;
        this.stepCycle = 0;
        this.isMoving = false;
        this.facing = 1; // 1: quay phải, -1: quay trái (flip)
        this.isNearKitchen = false; // Trạng thái ở gần Xưởng Bếp (để đội mũ đầu bếp)
        this.canMove = true; // Trạng thái cho phép di chuyển (không bị khóa cứng)
        this.virtualDx = 0; // Trục ảo từ Virtual Joystick (Mobile / Tablet)
        this.virtualDy = 0;
    }

    // Đặt vector điều hướng từ Joystick ảo
    setVirtualAxis(vx = 0, vy = 0) {
        this.virtualDx = typeof vx === 'number' && !isNaN(vx) ? vx : 0;
        this.virtualDy = typeof vy === 'number' && !isNaN(vy) ? vy : 0;
    }

    // Dừng ngay lập tức vector ảo khi nhấc tay (chống kẹt phím chạy trôi)
    resetVirtualAxis() {
        this.virtualDx = 0;
        this.virtualDy = 0;
    }

    update(keys, world, isStallOpen = false, isFrozen = false) {
        // [KỸ SƯ CẢM ỨNG & BÀN PHÍM ẢO] Không di chuyển khi phím bị khóa hoặc đang tương tác văn bản
        if (!keys) return;

        // Cập nhật tốc độ di chuyển kết hợp giữa Cấp độ RPG (+5%/cấp), Phương tiện (+30%, +60%, +100%) và Buff Vĩnh Viễn
        const moveBuff = state.permanentBuffs?.moveSpeedBonus || 0;
        this.speed = this.baseSpeed * state.getSpeedMultiplier() * state.getVehicleSpeedMultiplier() * (1 + moveBuff);

        // Nếu điện thoại đang mở (isFrozen) hoặc canMove bị khóa, tạm khóa di chuyển
        if (!this.canMove || isFrozen) {
            this.isMoving = false;
            return;
        }

        let dx = 0;
        let dy = 0;

        if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

        // Kết hợp tín hiệu từ cần gạt ảo Joystick
        if (this.virtualDx !== 0 || this.virtualDy !== 0) {
            dx += this.virtualDx;
            dy += this.virtualDy;
        }

        if (dx !== 0 || dy !== 0) {
            // Chuẩn hóa vector di chuyển để đi chéo không bị nhanh gấp đôi
            const len = Math.sqrt(dx * dx + dy * dy);
            const normFactor = len > 1 ? (1 / len) : 1;
            this.x += dx * normFactor * this.speed;
            this.y += dy * normFactor * this.speed;
            this.angle = Math.atan2(dy, dx);
            this.stepCycle += 0.22;
            this.isMoving = true;

            // Tự động lật ngang (flip) khi di chuyển trái / phải
            if (dx < 0) {
                this.facing = -1;
            } else if (dx > 0) {
                this.facing = 1;
            }
        } else {
            this.isMoving = false;
        }

        // Kiểm tra vị trí gần Xưởng Bếp để tự động hiển thị mũ đầu bếp
        const nearby = world.getNearbyRegion(this.x, this.y);
        this.isNearKitchen = Boolean(nearby && nearby.id === 'kitchen');

        // Giữ nhân vật trong giới hạn an toàn của bản đồ
        this.x = Math.max(30, Math.min(world.width - 30, this.x));
        this.y = Math.max(30, Math.min(world.height - 30, this.y));
    }

    render(ctx) {
        // Độ nhún nhảy nhẹ nhàng đồng bộ theo bước chân (nếu đi xe thì giảm độ nảy để xe lăn êm hơn)
        const isVehicle = state.currentVehicle && state.currentVehicle !== 'walk';
        const bounceFactor = isVehicle ? 1.2 : 3.5;
        const bounce = this.isMoving ? Math.abs(Math.sin(this.stepCycle)) * bounceFactor : 0;

        // Vẽ nhân vật thông qua module chuyên biệt CharacterRenderer (kèm xe và hướng lật)
        characterRenderer.render(ctx, {
            x: this.x,
            y: this.y,
            facing: this.facing,
            bounce: bounce,
            variant: 'player',
            nearKitchen: this.isNearKitchen,
            vehicle: state.currentVehicle,
            evolutionTier: state.getEvolutionTier ? state.getEvolutionTier() : 1,
            skin: state.equippedSkin || 'skin_default'
        });
    }
}