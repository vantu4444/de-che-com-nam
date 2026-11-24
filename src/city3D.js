// src/city3D.js - Phân hệ Mỹ Thuật 3D Phong Cách Hóa (Three.js Stylized 3D) & Canvas 2.5D Isometric Saigon
// Đạt chuẩn Enterprise Studio: Chợ Bến Thành, Phố Đi Bộ Nguyễn Huệ, Bitexco, Landmark 81, Xưởng ISO, Ánh sáng 24h & Mưa rào Sài Gòn

export class City3DManager {
    constructor() {
        this.isThreeSupported = false;
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Quản lý hạt mưa rào Sài Gòn & khói cơm nóng & đồng xu 3D
        this.rainParticles = [];
        this.steamParticles = [];
        this.coinParticles = [];
        this.isRaining = false;
        this.rainCycleTimer = 0;

        // Khởi tạo các hạt mưa rơi tự nhiên
        for (let i = 0; i < 90; i++) {
            this.rainParticles.push({
                x: Math.random() * 4000,
                y: Math.random() * 3200,
                length: 12 + Math.random() * 16,
                speed: 18 + Math.random() * 14,
                alpha: 0.25 + Math.random() * 0.45
            });
        }

        // Kiểm tra khả năng hỗ trợ WebGL
        this.checkThreeCapability();
    }

    checkThreeCapability() {
        try {
            if (typeof window !== 'undefined' && window.THREE) {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (gl) {
                    this.isThreeSupported = true;
                }
            }
        } catch (e) {
            this.isThreeSupported = false;
        }
    }

    // Sinh hạt khói cơm nóng bốc lên từ Xưởng Bếp hoặc Thùng xe
    spawnSteam(x, y) {
        if (this.steamParticles.length > 60) return;
        this.steamParticles.push({
            x: x + (Math.random() * 20 - 10),
            y: y,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -1.2 - Math.random() * 1.5,
            radius: 4 + Math.random() * 6,
            alpha: 0.6,
            maxRadius: 18 + Math.random() * 10
        });
    }

    // Sinh hiệu ứng đồng xu vàng 3D bay hút về phía ví tiền HUD
    spawnCoinEffect(startX, startY, targetScreenX = 140, targetScreenY = 30) {
        for (let i = 0; i < 5; i++) {
            this.coinParticles.push({
                x: startX,
                y: startY,
                targetScreenX: targetScreenX + (Math.random() * 20 - 10),
                targetScreenY: targetScreenY + (Math.random() * 10 - 5),
                progress: 0,
                speed: 0.035 + Math.random() * 0.02,
                arcOffset: (Math.random() - 0.5) * 120,
                rotAngle: Math.random() * Math.PI * 2,
                rotSpeed: 0.2 + Math.random() * 0.3,
                scale: 1.0 + Math.random() * 0.4
            });
        }
    }

    // Cập nhật các hạt vật lý & thời tiết mỗi khung hình
    update(dt = 0.016, timeInfo = {}) {
        // 1. Chu kỳ mưa rào Sài Gòn bất chợt: Mỗi 10 phút game có xác suất mưa 2 phút
        this.rainCycleTimer += dt;
        if (this.rainCycleTimer > 180) { // Mỗi 3 phút đổi thời tiết
            this.rainCycleTimer = 0;
            this.isRaining = Math.random() < 0.4; // 40% xuất hiện mưa rào
        }

        // Cập nhật hạt mưa
        if (this.isRaining) {
            this.rainParticles.forEach(p => {
                p.y += p.speed;
                p.x -= p.speed * 0.25; // Mưa rơi nghiêng theo gió mùa Tây Nam
                if (p.y > 3200) {
                    p.y = 0;
                    p.x = Math.random() * 4000;
                }
                if (p.x < 0) p.x = 4000;
            });
        }

        // Cập nhật khói cơm nóng
        for (let i = this.steamParticles.length - 1; i >= 0; i--) {
            const s = this.steamParticles[i];
            s.x += s.vx;
            s.y += s.vy;
            s.radius += 0.22;
            s.alpha -= 0.012;
            if (s.alpha <= 0 || s.radius >= s.maxRadius) {
                this.steamParticles.splice(i, 1);
            }
        }

        // Cập nhật đồng xu vàng bay về HUD
        for (let i = this.coinParticles.length - 1; i >= 0; i--) {
            const c = this.coinParticles[i];
            c.progress += c.speed;
            c.rotAngle += c.rotSpeed;
            if (c.progress >= 1.0) {
                this.coinParticles.splice(i, 1);
            }
        }
    }

    /**
     * VẼ ĐẠI CẢNH 3D PHONG CÁCH HÓA TP. HỒ CHÍ MINH
     * Bao gồm: Chợ Bến Thành, Phố Đi Bộ Nguyễn Huệ, Bitexco, Landmark 81, Xưởng Bếp ISO/ATVSTP
     */
    renderStylizedSaigon(ctx, camera, timeInfo = {}) {
        if (!ctx) return;

        const isNight = timeInfo.isNight || false;
        const mins = typeof timeInfo.minutes === 'number' ? timeInfo.minutes : 720; // Mặc định 12:00

        // 1. ĐƯỜNG CHÂN TRỜI SKYLINE: BITEXCO & LANDMARK 81 (Vùng phía Bắc bản đồ y: 120-350)
        this.renderSkylineBuildings(ctx, isNight, mins);

        // 2. CHỢ BẾN THÀNH (Biểu tượng di sản Quận 1 tại x: 1950, y: 1250)
        this.renderBenThanhMarket(ctx, isNight);

        // 3. PHỐ ĐI BỘ NGUYỄN HUỆ & ĐÀI PHUN SEN (x: 3200, y: 1350)
        this.renderNguyenHueWalkingStreet(ctx, isNight);

        // 4. XƯỞNG BẾP TRUNG TÂM CHUẨN ISO & ATVSTP (x: 450, y: 2350)
        this.renderKitchenISOFactory(ctx, isNight);

        // 5. HIỆU ỨNG KHÓI CƠM NÓNG BỐC LÊN TỪ XƯỞNG BẾP
        this.renderSteam(ctx);

        // 6. HIỆU ỨNG CƠN MƯA RÀO SÀI GÒN BẤT CHỢT
        if (this.isRaining) {
            this.renderRain(ctx, camera);
        }
    }

    // Vẽ Đường Chân Trời Skyline với Tháp Bitexco & Landmark 81
    renderSkylineBuildings(ctx, isNight, mins) {
        ctx.save();
        const baseSkylineY = 320;

        // Bầu không khí chân trời đổi màu theo thời gian
        let skyGradientColor = 'rgba(147, 197, 253, 0.25)'; // Ban ngày xanh mát
        if (mins >= 1020 && mins < 1140) { // Hoàng hôn cam rực
            skyGradientColor = 'rgba(251, 146, 60, 0.4)';
        } else if (isNight) { // Đêm tím thẫm
            skyGradientColor = 'rgba(30, 27, 75, 0.6)';
        }

        // --- TÒA THÁP BITEXCO FINANCIAL TOWER (x: 2380) ---
        const bx = 2380;
        const bH = 260;
        const bW = 68;

        // Bóng tháp Bitexco đổ nghiêng
        ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
        ctx.beginPath();
        ctx.moveTo(bx - bW / 2, baseSkylineY);
        ctx.lineTo(bx - bW / 2 - 80, baseSkylineY + 30);
        ctx.lineTo(bx + bW / 2 - 40, baseSkylineY + 30);
        ctx.lineTo(bx + bW / 2, baseSkylineY);
        ctx.closePath();
        ctx.fill();

        // Thân tháp kính cong 3D (Búp sen vươn cao)
        const bitexcoGrad = ctx.createLinearGradient(bx - bW / 2, baseSkylineY - bH, bx + bW / 2, baseSkylineY);
        if (isNight) {
            bitexcoGrad.addColorStop(0, '#1e293b');
            bitexcoGrad.addColorStop(0.5, '#0f172a');
            bitexcoGrad.addColorStop(1, '#020617');
        } else {
            bitexcoGrad.addColorStop(0, '#93c5fd');
            bitexcoGrad.addColorStop(0.5, '#60a5fa');
            bitexcoGrad.addColorStop(1, '#2563eb');
        }

        ctx.fillStyle = bitexcoGrad;
        ctx.beginPath();
        // Chân tháp uốn cong lên đỉnh tháp vát nhọn
        ctx.moveTo(bx - bW / 2, baseSkylineY);
        if (typeof ctx.quadraticCurveTo === 'function') {
            ctx.quadraticCurveTo(bx - bW / 3, baseSkylineY - bH * 0.6, bx - 14, baseSkylineY - bH);
            ctx.lineTo(bx + 14, baseSkylineY - bH);
            ctx.quadraticCurveTo(bx + bW / 3, baseSkylineY - bH * 0.6, bx + bW / 2, baseSkylineY);
        } else {
            ctx.lineTo(bx - 14, baseSkylineY - bH);
            ctx.lineTo(bx + 14, baseSkylineY - bH);
            ctx.lineTo(bx + bW / 2, baseSkylineY);
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = isNight ? '#38bdf8' : '#bfdbfe';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sân đỗ trực thăng Helipad vươn ra ở tầng 52 (đặc trưng bất hủ của Bitexco)
        const heliY = baseSkylineY - bH * 0.65;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(bx + 32, heliY, 22, 7, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ký hiệu chữ H trên bãi đỗ
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', bx + 32, heliY);

        // Đèn chớp cảnh báo hàng không trên đỉnh tháp
        const blink = (Date.now() % 1000) > 500;
        ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(bx, baseSkylineY - bH - 4, 3, 0, Math.PI * 2);
        ctx.fill();

        // --- TÒA THÁP LANDMARK 81 (x: 2540) ---
        const lx = 2540;
        const lH = 340;
        const lW = 80;

        // Thân tháp 81 bậc vươn cao (Bó tre biểu trưng cho sức mạnh Việt Nam)
        const lmGrad = ctx.createLinearGradient(lx - lW / 2, baseSkylineY - lH, lx + lW / 2, baseSkylineY);
        if (isNight) {
            lmGrad.addColorStop(0, '#0369a1');
            lmGrad.addColorStop(0.5, '#075985');
            lmGrad.addColorStop(1, '#0c4a6e');
        } else {
            lmGrad.addColorStop(0, '#e0f2fe');
            lmGrad.addColorStop(0.5, '#7dd3fc');
            lmGrad.addColorStop(1, '#0284c7');
        }

        ctx.fillStyle = lmGrad;
        // Bó 9 cột ống giật cấp 3D
        const stepWidths = [lW, lW * 0.8, lW * 0.6, lW * 0.4, 18];
        const stepHeights = [baseSkylineY - 70, baseSkylineY - 140, baseSkylineY - 210, baseSkylineY - 280, baseSkylineY - lH];

        stepWidths.forEach((sw, idx) => {
            const sh = stepHeights[idx];
            ctx.fillRect(lx - sw / 2, sh, sw, baseSkylineY - sh);
            ctx.strokeStyle = isNight ? '#38bdf8' : '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(lx - sw / 2, sh, sw, baseSkylineY - sh);
        });

        // Chóp ăng ten Landmark 81 vút nhọn lên bầu trời
        ctx.strokeStyle = isNight ? '#38bdf8' : '#e2e8f0';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(lx, baseSkylineY - lH);
        ctx.lineTo(lx, baseSkylineY - lH - 35);
        ctx.stroke();

        ctx.fillStyle = blink ? '#38bdf8' : '#0284c7';
        ctx.beginPath();
        ctx.arc(lx, baseSkylineY - lH - 35, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Bảng tên Skyline
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(bx - 30, baseSkylineY + 12, 230, 24);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx - 30, baseSkylineY + 12, 230, 24);

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏙️ SKYLINE BITEXCO & LANDMARK 81', bx + 85, baseSkylineY + 24);

        ctx.restore();
    }

    // Vẽ Di Sản Chợ Bến Thành (Mái ngói đỏ, Tháp đồng hồ 4 mặt, Cửa Nam)
    renderBenThanhMarket(ctx, isNight) {
        ctx.save();
        const mx = 2000;
        const my = 1260;

        // Bóng chợ Bến Thành
        ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
        ctx.beginPath();
        ctx.ellipse(mx, my + 55, 120, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tòa nhà chính: Thân màu vàng đất di sản Sài Gòn
        ctx.fillStyle = isNight ? '#78350f' : '#f59e0b';
        ctx.fillRect(mx - 110, my - 20, 220, 75);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3;
        ctx.strokeRect(mx - 110, my - 20, 220, 75);

        // Mái ngói đỏ tam cấp truyền thống
        ctx.fillStyle = isNight ? '#7f1d1d' : '#dc2626';
        ctx.beginPath();
        ctx.moveTo(mx - 125, my - 20);
        ctx.lineTo(mx - 95, my - 45);
        ctx.lineTo(mx + 95, my - 45);
        ctx.lineTo(mx + 125, my - 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // THÁP ĐỒNG HỒ CHỢ BẾN THÀNH VƯƠN CAO Ở CỬA NAM
        const towerW = 54;
        const towerH = 75;
        const towerX = mx - towerW / 2;
        const towerY = my - 45 - towerH;

        // Thân tháp đồng hồ
        ctx.fillStyle = isNight ? '#92400e' : '#fbbf24';
        ctx.fillRect(towerX, towerY, towerW, towerH);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(towerX, towerY, towerW, towerH);

        // Mái ngói chóp tháp đồng hồ
        ctx.fillStyle = isNight ? '#991b1b' : '#ef4444';
        ctx.beginPath();
        ctx.moveTo(towerX - 8, towerY);
        ctx.lineTo(mx, towerY - 24);
        ctx.lineTo(towerX + towerW + 8, towerY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Mặt đồng hồ Chợ Bến Thành 4 mặt (Mặt tròn trắng, viền vàng)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mx, towerY + 34, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Kim đồng hồ (chỉ 07:00 giờ mở chợ)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx, towerY + 34);
        ctx.lineTo(mx, towerY + 23); // Kim phút
        ctx.moveTo(mx, towerY + 34);
        ctx.lineTo(mx - 7, towerY + 39); // Kim giờ
        ctx.stroke();

        // Chữ "CHỢ BẾN THÀNH" phía dưới đồng hồ
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(mx - 48, my - 8, 96, 20);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(mx - 48, my - 8, 96, 20);

        ctx.fillStyle = '#b91c1c';
        ctx.font = 'bold 9px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CHỢ BẾN THÀNH', mx, my + 2);

        // 3 Cửa vòm cuốn truyền thống
        [-65, 0, 65].forEach(ox => {
            ctx.fillStyle = '#451a03';
            ctx.beginPath();
            ctx.arc(mx + ox, my + 35, 14, Math.PI, 0);
            ctx.lineTo(mx + ox + 14, my + 55);
            ctx.lineTo(mx + ox - 14, my + 55);
            ctx.closePath();
            ctx.fill();
        });

        ctx.restore();
    }

    // Vẽ Phố Đi Bộ Nguyễn Huệ (Trục hoa văn, Đài sen nước, Hàng cây sao/me)
    renderNguyenHueWalkingStreet(ctx, isNight) {
        ctx.save();
        const px = 3200;
        const py = 1350;

        // Trục đường hoa văn lát đá hoa cương
        ctx.fillStyle = isNight ? '#1e293b' : '#e2e8f0';
        ctx.fillRect(px - 140, py - 60, 280, 140);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(px - 140, py - 60, 280, 140);

        // Lát gạch ziczac hoa văn phố đi bộ
        ctx.strokeStyle = isNight ? '#334155' : '#cbd5e1';
        ctx.lineWidth = 1;
        for (let x = px - 120; x <= px + 120; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, py - 60);
            ctx.lineTo(x, py + 80);
            ctx.stroke();
        }

        // Hàng cây sao đen & cây me xanh mướt 2 bên phố
        [-110, 110].forEach(ox => {
            [-40, 10, 60].forEach(oy => {
                // Thân cây
                ctx.fillStyle = '#78350f';
                ctx.fillRect(px + ox - 3, py + oy, 6, 12);
                // Tán cây me
                ctx.fillStyle = isNight ? '#065f46' : '#10b981';
                ctx.beginPath();
                ctx.arc(px + ox, py + oy - 6, 14, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // ĐÀI PHUN NƯỚC HOA SEN PHÁT SÁNG NỔI TIẾNG
        ctx.fillStyle = isNight ? '#0284c7' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(px, py + 10, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Cánh hoa sen hồng phát sáng
        const pulse = Math.sin(Date.now() / 300) * 3;
        ctx.fillStyle = '#f472b6';
        ctx.font = `${20 + pulse}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪷', px, py + 10);

        ctx.restore();
    }

    // Vẽ Xưởng Bếp Trung Tâm Chuẩn ISO & ATVSTP (x: 450, y: 2350)
    renderKitchenISOFactory(ctx, isNight) {
        ctx.save();
        const kx = 450 + 130;
        const ky = 2350 + 110;

        // Tấm huy hiệu vàng ISO & ATVSTP gắn trên mặt tiền xưởng
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(kx - 95, ky - 95, 190, 26, 6) : ctx.rect(kx - 95, ky - 95, 190, 26);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#713f12';
        ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐ CHUẨN ISO & ATVSTP 100% ⭐', kx, ky - 82);

        // Ống khói bếp công nghiệp bốc hơi cơm
        ctx.fillStyle = '#64748b';
        ctx.fillRect(kx + 75, ky - 105, 18, 30);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(kx + 75, ky - 105, 18, 30);

        // Sinh hạt khói tự động mỗi 0.2s
        if (Math.random() < 0.25) {
            this.spawnSteam(kx + 84, ky - 105);
        }

        ctx.restore();
    }

    // Vẽ hiệu ứng khói cơm nóng bốc lên
    renderSteam(ctx) {
        ctx.save();
        this.steamParticles.forEach(s => {
            ctx.fillStyle = `rgba(248, 250, 252, ${s.alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    // Vẽ hiệu ứng cơn mưa rào Sài Gòn bất chợt
    renderRain(ctx, camera) {
        ctx.save();
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
        ctx.lineWidth = 1.4;

        this.rainParticles.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.length * 0.25, p.y + p.length);
            ctx.stroke();
        });

        // Bầu không khí mưa mờ ảo
        ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
        ctx.fillRect(camera.x, camera.y, window.innerWidth, window.innerHeight);

        ctx.restore();
    }

    // Vẽ các đồng xu vàng 3D bay hút về phía ví tiền HUD
    renderCoinEffects(ctx) {
        if (this.coinParticles.length === 0) return;
        ctx.save();

        this.coinParticles.forEach(c => {
            // Tọa độ cong Bezier bậc 2 bay hút về HUD
            const t = c.progress;
            const midX = (c.x + c.targetScreenX) / 2 + c.arcOffset;
            const midY = Math.min(c.y, c.targetScreenY) - 80;

            const curX = (1 - t) * (1 - t) * c.x + 2 * (1 - t) * t * midX + t * t * c.targetScreenX;
            const curY = (1 - t) * (1 - t) * c.y + 2 * (1 - t) * t * midY + t * t * c.targetScreenY;

            // Đồng xu vàng kim xoay tròn 3D
            const rx = 8 * c.scale * Math.abs(Math.cos(c.rotAngle));
            const ry = 8 * c.scale;

            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.ellipse(curX, curY, Math.max(2, rx), ry, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Vệt lấp lánh ánh vàng
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(curX - 2, curY - 2, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

export const city3D = new City3DManager();
