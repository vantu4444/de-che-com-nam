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

    // Chuyển đổi tọa độ thế giới sang tọa độ màn hình (Hỗ trợ cả 3D Camera Projection lẫn 2D Offset)
    projectToScreen(worldX, worldY, camera = { x: 0, y: 0 }) {
        if (this.camera && this.renderer && typeof window !== 'undefined' && window.THREE) {
            try {
                const vec = new window.THREE.Vector3(worldX, 0, worldY);
                vec.project(this.camera);
                const halfW = (this.renderer.domElement?.width || window.innerWidth) / 2;
                const halfH = (this.renderer.domElement?.height || window.innerHeight) / 2;
                return {
                    x: (vec.x * halfW) + halfW,
                    y: -(vec.y * halfH) + halfH
                };
            } catch (e) {}
        }
        return {
            x: worldX - (camera.x || 0),
            y: worldY - (camera.y || 0)
        };
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

    /**
     * ĐỒNG BỘ HIỂN THỊ KHÁCH HÀNG NPC 3D TẠI SẠP CƠM NẮM
     * Tạo hình 3D Stylized sinh động: nhiều màu áo, bước chân nảy isometric, bóng đổ mềm mại dưới chân
     */
    renderCustomer3D(ctx, cust, camera = { x: 0, y: 0 }) {
        if (!ctx || !cust) return;

        const pScreen = this.projectToScreen(cust.x, cust.y, camera);
        const sx = pScreen.x;
        const sy = pScreen.y;

        const isMoving = (cust.status === 'walking_in' || cust.status === 'leaving_happy' || cust.status === 'leaving_angry');
        const bounce = isMoving ? Math.abs(Math.sin(cust.stepCycle || 0)) * 4 : 0;
        const facing = cust.facing || 1;

        ctx.save();

        // 1. Bóng đổ mềm mại dưới chân trên nền 3D
        ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 18, 16, 7, -0.15, 0, Math.PI * 2);
        ctx.fill();

        // 2. Chuyển động bước chân Isometric
        ctx.translate(sx, sy - bounce);

        // 3. Hiệu ứng Hào quang lấp lánh dưới chân Khách VIP
        if (cust.variant === 'vip') {
            const auraPulse = Math.sin(Date.now() / 200) * 3;
            ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
            ctx.beginPath();
            ctx.ellipse(0, 18, 22 + auraPulse, 9 + auraPulse * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // 4. Vẽ Tạo hình Nhân vật 3D Phong Cách Hóa
        ctx.scale(facing, 1);

        // Chân bước đi 3D
        const legSwing = isMoving ? Math.sin(cust.stepCycle * 2) * 4 : 0;
        ctx.fillStyle = '#334155';
        ctx.fillRect(-6 + legSwing, 10, 4.5, 9);
        ctx.fillRect(2 - legSwing, 10, 4.5, 9);

        // Thân áo nhiều màu sắc đa dạng
        const studentShirts = ['#f8fafc', '#fed7aa', '#bbf7d0', '#ddd6fe'];
        const officeShirts = ['#bae6fd', '#f1f5f9', '#fde68a', '#e2e8f0'];
        const shirtColor = cust.variant === 'vip' ? '#1e293b' :
            (cust.variant === 'office' ? officeShirts[Math.abs(cust.colorVariation || 0) % officeShirts.length] :
            studentShirts[Math.abs(cust.colorVariation || 0) % studentShirts.length]);

        ctx.fillStyle = shirtColor;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(-10, -4, 20, 16, 4);
        } else {
            ctx.rect(-10, -4, 20, 16);
        }
        ctx.fill();
        ctx.stroke();

        // Chi tiết riêng từng đối tượng
        if (cust.variant === 'student') {
            // Khăn quàng đỏ học sinh
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.moveTo(-5, -2);
            ctx.lineTo(0, 4);
            ctx.lineTo(5, -2);
            ctx.closePath();
            ctx.fill();

            // Ba lô sau lưng
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(-14, -2, 4.5, 12);
        } else if (cust.variant === 'office') {
            // Cà vạt công sở
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-1.5, -2, 3, 11);
        } else if (cust.variant === 'vip') {
            // Áo vest đen viền vàng kim
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(-10, -4, 20, 16);
            // Nơ cổ vàng kim
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(0, -1, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Đầu linh vật Onigiri đội mũ / tạo hình tròn mềm mại
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -14, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Mắt và nụ cười thân thiện
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(3, -15, 1.8, 0, Math.PI * 2);
        ctx.arc(8, -15, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Mũ lưỡi trai cho học sinh
        if (cust.variant === 'student') {
            ctx.fillStyle = '#1d4ed8';
            ctx.beginPath();
            ctx.arc(0, -20, 10, Math.PI, 0, false);
            ctx.fill();
            ctx.fillRect(2, -20, 11, 2.5); // Vành mũ
        } else if (cust.variant === 'vip') {
            // Kính râm đen sành điệu
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(1, -17, 10, 4);
        }

        // 5. Cầm nắm cơm 3D trên tay khi mua xong
        if (cust.isHoldingOnigiri) {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(9, 2);
            ctx.lineTo(15, 10);
            ctx.lineTo(3, 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Rong biển đen
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(6, 7, 6, 3);
            ctx.restore();
        }

        ctx.restore();
    }

    renderSellingCustomers(ctx, customers, camera) {
        if (!ctx || !Array.isArray(customers) || customers.length === 0) return;
        customers.forEach(cust => {
            this.renderCustomer3D(ctx, cust, camera);
        });
    }

    /**
     * NÂNG CẤP THỊ GIÁC CYBER FOOD-TECH TƯƠNG LAI
     * 1. Vùng Chiếu Hologram Công Nghệ Xanh Ngọc cho các Ô Vạch Xanh Hợp Pháp
     */
    renderCyberHologramZone(ctx, spot) {
        if (!ctx || !spot) return;

        const now = Date.now();
        const pulse = Math.sin(now / 350) * 0.08 + 0.22;
        const scanlineY = spot.y + ((now / 20) % spot.h);

        ctx.save();

        // 1. Nền Hologram Xanh Ngọc Cyber quét năng lượng
        const holoGrad = ctx.createLinearGradient(spot.x, spot.y, spot.x + spot.w, spot.y + spot.h);
        holoGrad.addColorStop(0, `rgba(0, 240, 255, ${pulse * 0.85})`);
        holoGrad.addColorStop(0.5, `rgba(16, 185, 129, ${pulse * 1.1})`);
        holoGrad.addColorStop(1, `rgba(6, 182, 212, ${pulse * 0.85})`);

        ctx.fillStyle = holoGrad;
        ctx.fillRect(spot.x, spot.y, spot.w, spot.h);

        // 2. Dòng quét năng lượng Hologram (Scanline)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(spot.x, scanlineY, spot.w, 3);

        // 3. Viền sáng Neon Cyber chuyển động
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.setLineDash([12, 6]);
        ctx.lineDashOffset = -(now / 40);
        ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // 4. Bốn góc định vị Cyber HUD sắc sảo
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3.5;
        const cLen = 14;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(spot.x, spot.y + cLen);
        ctx.lineTo(spot.x, spot.y);
        ctx.lineTo(spot.x + cLen, spot.y);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(spot.x + spot.w - cLen, spot.y);
        ctx.lineTo(spot.x + spot.w, spot.y);
        ctx.lineTo(spot.x + spot.w, spot.y + cLen);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(spot.x, spot.y + spot.h - cLen);
        ctx.lineTo(spot.x, spot.y + spot.h);
        ctx.lineTo(spot.x + cLen, spot.y + spot.h);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(spot.x + spot.w - cLen, spot.y + spot.h);
        ctx.lineTo(spot.x + spot.w, spot.y + spot.h);
        ctx.lineTo(spot.x + spot.w, spot.y + spot.h - cLen);
        ctx.stroke();

        // 5. Khiên ISO & ATVSTP xoay lơ lửng 3D phía trên
        const centerX = spot.x + spot.w / 2;
        const centerY = spot.y + spot.h / 2;
        const hoverY = centerY - 14 + Math.sin(now / 300) * 4;
        const shieldScaleX = Math.cos(now / 500); // Hiệu ứng xoay 3D quanh trục Y

        ctx.save();
        ctx.translate(centerX, hoverY);
        ctx.scale(Math.abs(shieldScaleX) < 0.15 ? 0.15 : shieldScaleX, 1);

        // Vẽ biểu tượng khiên bảo chứng ISO phát sáng
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(12, -8);
        ctx.lineTo(9, 6);
        ctx.lineTo(0, 14);
        ctx.lineTo(-9, 6);
        ctx.lineTo(-12, -8);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

        // 6. Nhãn Hologram phát sáng công nghệ
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fillText('CYBER FOOD-TECH ZONE', centerX, centerY + 10);
        ctx.font = '8px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = '#a7f3d0';
        ctx.fillText('🛡️ CHUẨN ISO 22000 & ATVSTP (HỢP PHÁP)', centerX, centerY + 22);

        ctx.restore();
    }

    /**
     * NÂNG CẤP THỊ GIÁC CYBER FOOD-TECH TƯƠNG LAI
     * 2. Xe Bán Hàng Công Nghệ Tương Lai (Cyber Food-Pod & Drone Giao Hàng)
     */
    renderCyberFoodPodAndDrone(ctx, player, currentVehicle = 'walk', kitchenTier = 1) {
        if (!ctx || !player) return;

        const now = Date.now();
        const px = player.x;
        const py = player.y;

        ctx.save();

        // Dải đèn LED Neon chạy dưới gầm xe hoặc chân nhân vật khi có xưởng/xe nâng cấp
        const isAdvanced = kitchenTier >= 2 || currentVehicle !== 'walk';
        if (isAdvanced) {
            const neonPulse = Math.sin(now / 200) * 0.15 + 0.45;
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(px, py + 14, 28, 10, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 240, 255, ${neonPulse})`;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 16;
            ctx.fill();
            ctx.restore();
        }

        // Drone Giao Hàng Tương Lai Mini lơ lửng phía trên bên phải nhân vật
        const droneAngle = (now / 600) % (Math.PI * 2);
        const droneHoverY = py - 48 + Math.sin(now / 250) * 5;
        const droneHoverX = px + 24 + Math.cos(now / 500) * 6;

        ctx.save();
        ctx.translate(droneHoverX, droneHoverY);

        // Đèn định vị Drone
        ctx.fillStyle = (now % 600 < 300) ? '#00f0ff' : '#ec4899';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, -6, 2, 0, Math.PI * 2);
        ctx.fill();

        // Thân Drone Cyber kim loại đen xám
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(-10, -4, 20, 8, 3);
        } else {
            ctx.rect(-10, -4, 20, 8);
        }
        ctx.fill();
        ctx.stroke();

        // 2 Cánh quạt Drone xoay tít mù
        const propBlur = Math.sin(now / 40) * 8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        // Cánh trái
        ctx.beginPath();
        ctx.moveTo(-14, -6);
        ctx.lineTo(-6 + propBlur * 0.2, -6);
        ctx.stroke();
        // Cánh phải
        ctx.beginPath();
        ctx.moveTo(6, -6);
        ctx.lineTo(14 - propBlur * 0.2, -6);
        ctx.stroke();

        // Hộp cơm nắm Onigiri phát sáng được Drone mang theo
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, 6);
        ctx.lineTo(5, 13);
        ctx.lineTo(-5, 13);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-2, 10, 4, 3);

        ctx.restore();

        ctx.restore();
    }

    /**
     * Dựng Tượng Linh Vật Cơm Nắm 3D Hologram Vàng Óng Ánh & Bảng Tên Chủ Tịch Khu Vực
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Object} spot - Ô Vạch Xanh trọng điểm
     * @param {Object} rulerInfo - Thông tin Chủ Tịch Khu Vực hiện tại ({ name, score, rulerId })
     */
    renderTerritoryGoldenStatue(ctx, spot, rulerInfo = null) {
        if (!ctx || !spot) return;

        const now = Date.now();
        const sx = spot.x - 38;
        const sy = spot.y + spot.h / 2;
        const pulse = Math.sin(now / 350) * 0.15 + 0.75;
        const floatY = Math.sin(now / 400) * 4;

        ctx.save();

        // 1. Cột ánh sáng vàng Hologram quét thẳng lên trời
        const beamGrad = ctx.createLinearGradient(sx, sy, sx, sy - 85);
        beamGrad.addColorStop(0, `rgba(255, 215, 0, ${pulse * 0.4})`);
        beamGrad.addColorStop(0.6, `rgba(245, 158, 11, ${pulse * 0.2})`);
        beamGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(sx - 20, sy + 6);
        ctx.lineTo(sx + 20, sy + 6);
        ctx.lineTo(sx + 14, sy - 85);
        ctx.lineTo(sx - 14, sy - 85);
        ctx.closePath();
        ctx.fill();

        // 2. Bệ đá Hologram Bát Giác Vàng Óng
        ctx.save();
        ctx.translate(sx, sy + 6);
        ctx.fillStyle = 'rgba(20, 20, 25, 0.9)';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 14;

        ctx.beginPath();
        const bRad = 22;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4 + (now / 2000);
            const bx = Math.cos(angle) * bRad;
            const by = Math.sin(angle) * (bRad * 0.45);
            if (i === 0) ctx.moveTo(bx, by);
            else ctx.lineTo(bx, by);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Vòng năng lượng quay dưới chân bệ đá
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -(now / 50);
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 12, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // 3. Tượng Linh Vật Cơm Nắm 3D Hologram Lơ Lửng (Golden Mascot Statue)
        ctx.save();
        ctx.translate(sx, sy - 18 + floatY);

        // Ánh sáng hào quang phát quang quanh tượng
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 18;

        // Thân Cơm Nắm Onigiri Vàng Kim 3D
        const mascotGrad = ctx.createLinearGradient(-16, -18, 16, 16);
        mascotGrad.addColorStop(0, '#fef08a');
        mascotGrad.addColorStop(0.5, '#ffd700');
        mascotGrad.addColorStop(1, '#d97706');

        ctx.fillStyle = mascotGrad;
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 2;

        ctx.beginPath();
        // Hình tam giác bo tròn đỉnh cao cấp
        ctx.moveTo(0, -18);
        ctx.quadraticCurveTo(18, -12, 16, 12);
        ctx.quadraticCurveTo(14, 16, -14, 16);
        ctx.quadraticCurveTo(-18, -12, 0, -18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Miếng Rong Biển Nori Vàng Đồng Đậm Đặc
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(-8, 5, 16, 11, 2);
        } else {
            ctx.rect(-8, 5, 16, 11);
        }
        ctx.fill();
        ctx.stroke();

        // Đôi Mắt Linh Vật Cơm Nắm Sáng Long Lanh
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(-5, -2, 2.2, 0, Math.PI * 2);
        ctx.arc(5, -2, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Điểm sáng trong mắt
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6, -3, 0.8, 0, Math.PI * 2);
        ctx.arc(4, -3, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Hai má hồng phát sáng
        ctx.fillStyle = 'rgba(244, 63, 94, 0.85)';
        ctx.beginPath();
        ctx.arc(-9, 2, 2, 0, Math.PI * 2);
        ctx.arc(9, 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Miệng cười tươi vui
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 1, 3, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // 4. Vương Miện Vàng 👑 Biểu Tượng Chủ Tịch Khu Vực
        ctx.save();
        ctx.translate(0, -20);
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(-11, 2);
        ctx.lineTo(-11, -8);
        ctx.lineTo(-5, -2);
        ctx.lineTo(0, -11); // Chóp giữa cao nhất
        ctx.lineTo(5, -2);
        ctx.lineTo(11, -8);
        ctx.lineTo(11, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Viên Hồng Ngọc Ruby trên đỉnh vương miện
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -11, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();

        // 5. Bảng Tên Hologram 3D Lơ Lửng Trên Đỉnh Tượng
        const rulerName = (rulerInfo && rulerInfo.name) || (rulerInfo && rulerInfo.rulerName) || 'Đang tranh đoạt';
        const rulerScore = (rulerInfo && (rulerInfo.score || rulerInfo.rulerScore)) || 0;

        ctx.save();
        const tagW = 148;
        const tagH = 46;
        const tagX = sx - tagW / 2;
        const tagY = sy - 74 + floatY * 0.6;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(tagX, tagY, tagW, tagH, 8);
        } else {
            ctx.rect(tagX, tagY, tagW, tagH);
        }
        ctx.fill();
        ctx.stroke();

        // Chóp nhọn trỏ xuống tượng
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(sx - 5, tagY + tagH);
        ctx.lineTo(sx + 5, tagY + tagH);
        ctx.lineTo(sx, tagY + tagH + 5);
        ctx.closePath();
        ctx.fill();

        // Chữ trên bảng tên
        ctx.shadowBlur = 0;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Dòng 1: Danh hiệu Chủ Tịch Khu Vực
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px "Be Vietnam Pro", sans-serif';
        ctx.fillText(`👑 CHỦ TỊCH KHU VỰC`, sx, tagY + 4);

        // Dòng 2: Tên Thương Hiệu
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11px "Be Vietnam Pro", sans-serif';
        const displayRulerName = rulerName.length > 18 ? rulerName.slice(0, 17) + '…' : rulerName;
        ctx.fillText(displayRulerName, sx, tagY + 16);

        // Dòng 3: Điểm thống trị & Đặc quyền
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 8.5px "Be Vietnam Pro", sans-serif';
        ctx.fillText(`⭐ ${rulerScore}đ • +15% Vàng • +5k Tip`, sx, tagY + 31);

        ctx.restore();

        ctx.restore();
    }
}

export const city3D = new City3DManager();
