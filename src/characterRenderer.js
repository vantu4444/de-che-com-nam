// src/characterRenderer.js - Hệ thống hóa trang nhân vật & phụ kiện vector từ linh vật gốc linh_vat_1

export class CharacterRenderer {
    constructor() {
        // Tỷ lệ gốc ảnh linh_vat_1.JPG (1811 x 2560 => WxH ~ 0.7074)
        this.baseHeight = 54;
        this.baseWidth = Math.round(this.baseHeight * (1811 / 2560)); // ~38px

        // Cấu hình tỷ lệ kích thước riêng cho từng biến thể
        this.variantScales = {
            player: 1.0,
            student: 0.8, // Kích thước nhỏ hơn 20%
            office: 1.0,
            market: 1.0,
            vip: 1.05,
            staff: 1.0
        };

        // Quản lý nạp sprite gốc linh_vat_1
        this.baseSprite = new Image();
        this.baseSpriteLoaded = false;
        this.baseSpriteError = false;
        this.loadBaseSprite();

        // Bộ đệm nạp ảnh sprite riêng cho từng biến thể (Cơ chế Override)
        // Ví dụ: assets/linh_vat_student.png, assets/linh_vat_office.png...
        this.overrideSprites = new Map();
        this.overrideLoaded = new Map();
        this.initVariantOverrides();
    }

    // Tự động tìm nạp sprite gốc với ưu tiên ảnh trong suốt PNG đã xử lý
    loadBaseSprite() {
        const candidatePaths = [
            'assets/linh_vat_1.png',
            'assets/linh_vat_1.PNG',
            'assets/linh_vat_1.webp',
            'assets/linh_vat_1.JPG',
            'assets/linh_vat_1.jpg'
        ];

        let index = 0;
        const tryNext = () => {
            if (index >= candidatePaths.length) {
                this.baseSpriteError = true;
                return;
            }
            const path = candidatePaths[index++];
            const img = new Image();
            img.onload = () => {
                this.baseSprite = img;
                this.baseSpriteLoaded = true;
                this.baseSpriteError = false;
                // Nếu nguồn là JPG, tiến hành lọc tách nền đen trên canvas đệm
                if (path.toLowerCase().endsWith('.jpg') || path.toLowerCase().endsWith('.jpeg')) {
                    this.processChromaKey(img);
                }
            };
            img.onerror = () => {
                tryNext();
            };
            img.src = path;
        };
        tryNext();
    }

    // Tự động tách nền đen trong bộ nhớ nếu nạp phải file JPG
    processChromaKey(img) {
        try {
            if (typeof document === 'undefined' || !document.createElement) return;
            const bufferCanvas = document.createElement('canvas');
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            if (!w || !h) return;
            bufferCanvas.width = w;
            bufferCanvas.height = h;
            const bCtx = bufferCanvas.getContext('2d');
            if (!bCtx || !bCtx.getImageData) return;
            bCtx.drawImage(img, 0, 0);
            const imgData = bCtx.getImageData(0, 0, w, h);
            const d = imgData.data;
            // Xóa màu đen nền viền ngoài
            for (let i = 0; i < d.length; i += 4) {
                const r = d[i], g = d[i+1], b = d[i+2];
                if (r < 30 && g < 30 && b < 30) {
                    d[i+3] = 0;
                }
            }
            bCtx.putImageData(imgData, 0, 0);
            this.baseSprite = bufferCanvas;
        } catch (e) {
            // Safe fallback
        }
    }

    // Khởi tạo cơ chế kiểm tra và ưu tiên nạp ảnh riêng nếu có trong assets/
    initVariantOverrides() {
        const variants = ['player', 'student', 'office', 'market', 'vip', 'staff'];

        variants.forEach(variant => {
            const customPath = `assets/linh_vat_${variant}.png`;
            const img = new Image();
            img.onload = () => {
                this.overrideSprites.set(variant, img);
                this.overrideLoaded.set(variant, true);
            };
            img.onerror = () => {
                // Không tìm thấy ảnh riêng -> mặc định dùng linh_vat_1 + phụ kiện vector
                this.overrideLoaded.set(variant, false);
            };
            img.src = customPath;
        });
    }

    // Cơ chế nâng cấp mở rộng: Cho phép đăng ký ảnh sprite riêng cho bất kỳ biến thể nào
    registerOverride(variant, imagePath) {
        const img = new Image();
        img.onload = () => {
            this.overrideSprites.set(variant, img);
            this.overrideLoaded.set(variant, true);
        };
        img.src = imagePath;
    }

    /**
     * Phương thức render cốt lõi của nhân vật
     * @param {CanvasRenderingContext2D} ctx - Context 2D của Canvas
     * @param {Object} options - Các thuộc tính vẽ:
     *   x: tọa độ X (mặc định 0)
     *   y: tọa độ Y (mặc định 0)
     *   facing: 1 (phải), -1 (trái) (mặc định 1)
     *   bounce: độ nảy bước chân tính bằng pixel (mặc định 0)
     *   variant: 'player' | 'student' | 'office' | 'market' | 'vip' | 'staff' (mặc định 'player')
     *   nearKitchen: boolean, cờ kiểm tra ở gần Xưởng Bếp (chỉ dành cho player)
     *   customScale: tỷ lệ co dãn thêm (mặc định 1.0)
     */
    render(ctx, options = {}) {
        const {
            x = 0,
            y = 0,
            facing = 1,
            bounce = 0,
            variant = 'player',
            nearKitchen = false,
            customScale = 1.0,
            vehicle = 'walk',
            colorVariation = 0,
            isHoldingOnigiri = false,
            evolutionTier = 1,
            skin = 'skin_default'
        } = options;

        const variantScale = (this.variantScales[variant] || 1.0) * customScale;

        ctx.save();
        ctx.translate(x, y);

        // 1. VẼ HÀO QUANG DƯỚI CHÂN (Dành riêng cho biến thể VIP)
        if (variant === 'vip') {
            this.drawVipAura(ctx, variantScale);
        }

        // 2. BÓNG ĐỔ TRÊN MẶT ĐẤT (Cố định dưới chân, không nảy theo bước chân)
        this.drawShadow(ctx, variantScale);

        // 3. TỊNH TIẾN ĐỘ NẢY BƯỚC CHÂN (Bounce Y)
        ctx.translate(0, -bounce);

        // 4. LẬT GƯƠNG NGANG THEO HƯỚNG MẶT & ĐIỀU CHỈNH SCALE
        ctx.scale(facing * variantScale, variantScale);

        // 5. NẾU CÓ PHƯƠNG TIỆN XE CỘ: VẼ PHƯƠNG TIỆN LỚP NỀN PHÍA SAU
        if (variant === 'player' && vehicle && vehicle !== 'walk') {
            this.drawVehicleBack(ctx, vehicle);
        }

        // 6. KIỂM TRA CƠ CHẾ NÂNG CẤP MỞ RỘNG (OVERRIDE SPRITE)
        const hasOverride = this.overrideLoaded.get(variant) && this.overrideSprites.get(variant)?.naturalWidth > 0;

        if (hasOverride) {
            // Trường hợp 1: Có ảnh riêng (ví dụ linh_vat_student.png), ưu tiên dùng trực tiếp
            const sprite = this.overrideSprites.get(variant);
            const drawX = -this.baseWidth / 2;
            const drawY = -this.baseHeight / 2 + 2;
            ctx.drawImage(sprite, drawX, drawY, this.baseWidth, this.baseHeight);
        } else if (this.baseSpriteLoaded && this.baseSprite.naturalWidth > 0) {
            // Trường hợp 2: Dùng linh vật gốc linh_vat_1 + Vẽ phụ kiện vector tương ứng
            const drawX = -this.baseWidth / 2;
            const drawY = -this.baseHeight / 2 + 2;
            ctx.drawImage(this.baseSprite, drawX, drawY, this.baseWidth, this.baseHeight);

            // Vẽ thêm phụ kiện vector chuyên biệt khớp 100% lên thân/đầu
            this.drawAccessories(ctx, variant, nearKitchen, colorVariation, evolutionTier, skin);
        } else {
            // Trường hợp 3: Fallback an toàn khi chưa nạp xong ảnh
            this.drawFallback(ctx);
            this.drawAccessories(ctx, variant, nearKitchen, colorVariation, evolutionTier, skin);
        }

        // 7. VẼ NẮM CƠM CẦM TAY NẾU ĐÃ MUA THÀNH CÔNG
        if (isHoldingOnigiri) {
            this.drawHandheldOnigiri(ctx);
        }

        // 8. VẼ PHƯƠNG TIỆN LỚP TRƯỚC (GHI ĐÔNG, BÁNH TRƯỚC, KHUNG XE)
        if (variant === 'player' && vehicle && vehicle !== 'walk') {
            this.drawVehicleFront(ctx, vehicle);
        }

        ctx.restore();
    }

    // Vẽ bóng đổ mềm mại dưới mặt đất (Soft Radial Gradient Shadow)
    drawShadow(ctx, scale) {
        ctx.save();
        const radX = 18 * scale;
        const radY = 8 * scale;
        const posY = 20 * scale;

        if (ctx.createRadialGradient) {
            try {
                const grad = ctx.createRadialGradient(0, posY, 2 * scale, 0, posY, radX);
                grad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
                grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.22)');
                grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
                ctx.fillStyle = grad;
            } catch (e) {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
            }
        } else {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        }

        ctx.beginPath();
        ctx.ellipse(0, posY, radX, radY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Vẽ hào quang vàng kim nhẹ nhàng dưới chân khách VIP
    drawVipAura(ctx, scale) {
        ctx.save();
        const pulse = Math.sin(Date.now() / 250) * 2;
        const radiusX = (24 + pulse) * scale;
        const radiusY = (11 + pulse * 0.5) * scale;

        // Vòng hào quang phát sáng
        const gradient = ctx.createRadialGradient(0, 20 * scale, 6 * scale, 0, 20 * scale, radiusX);
        gradient.addColorStop(0, 'rgba(250, 204, 21, 0.6)');
        gradient.addColorStop(0.6, 'rgba(234, 179, 8, 0.3)');
        gradient.addColorStop(1, 'rgba(234, 179, 8, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 20 * scale, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Vòng viền vàng kim sắc nét nhẹ
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.8)';
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.ellipse(0, 20 * scale, radiusX * 0.85, radiusY * 0.85, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    // Phân phối vẽ phụ kiện vector cho từng biến thể nhân vật
    drawAccessories(ctx, variant, nearKitchen, colorVariation = 0, evolutionTier = 1, skin = 'skin_default') {
        switch (variant) {
            case 'player':
                if (skin && skin !== 'skin_default') {
                    this.drawSkinAccessories(ctx, skin);
                } else {
                    this.drawEvolutionTierAccessories(ctx, evolutionTier, nearKitchen);
                }
                break;
            case 'student':
                this.drawStudentAccessories(ctx, colorVariation);
                break;
            case 'office':
                this.drawOfficeAccessories(ctx, colorVariation);
                break;
            case 'market':
                this.drawMarketAccessories(ctx);
                break;
            case 'vip':
                this.drawVipAccessories(ctx, colorVariation);
                break;
            case 'staff':
                this.drawStaffAccessories(ctx);
                break;
        }
    }

    // =========================================================================
    // HỆ THỐNG TIẾN HÓA SỰ NGHIỆP 4 BẬC (linh_vat_1)
    // =========================================================================
    drawEvolutionTierAccessories(ctx, tier = 1, nearKitchen = false) {
        ctx.save();

        if (tier === 1) {
            // --- BẬC 1: TÂN BINH KHỞI NGHIỆP ---
            // 1. Băng rôn trắng quấn trán chữ đỏ "QUYẾT THẮNG"
            ctx.fillStyle = '#f8fafc';
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            this.roundRect(ctx, -14, -18, 28, 5, 2);
            ctx.fill();
            ctx.stroke();

            // Chấm tròn đỏ mặt trời ở giữa băng rôn
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -15.5, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // 2. Dây đai túi vải thô đeo chéo
            ctx.strokeStyle = '#92400e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-12, -4);
            ctx.lineTo(12, 14);
            ctx.stroke();

            // Túi vải nhỏ bên hông
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            this.roundRect(ctx, 8, 10, 8, 7, 2);
            ctx.fill();

        } else if (tier === 2) {
            // --- BẬC 2: BẾP TRƯỞNG CHUẨN ISO & ATVSTP ---
            // 1. Mũ đầu bếp cao xếp nếp viền vàng
            this.drawChefHat(ctx);

            // 2. Áo bếp trắng hai hàng khuy viền vàng
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            this.roundRect(ctx, -12, 2, 24, 16, 4);
            ctx.fill();
            ctx.stroke();

            // 2 hàng cúc áo bếp
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.arc(-4, 6, 1.2, 0, Math.PI * 2);
            ctx.arc(-4, 11, 1.2, 0, Math.PI * 2);
            ctx.arc(4, 6, 1.2, 0, Math.PI * 2);
            ctx.arc(4, 11, 1.2, 0, Math.PI * 2);
            ctx.fill();

            // 3. Huy hiệu Khiên ISO & ATVSTP phát sáng trước ngực
            ctx.fillStyle = '#10b981';
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(8, 5);
            ctx.lineTo(13, 7);
            ctx.lineTo(10.5, 13);
            ctx.lineTo(8, 11);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Hiệu ứng khói ấm bốc lên từ đỉnh đầu
            const smokeShift = Math.sin(Date.now() / 300) * 3;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.beginPath();
            ctx.arc(-4 + smokeShift, -30, 3, 0, Math.PI * 2);
            ctx.arc(2 - smokeShift, -34, 4, 0, Math.PI * 2);
            ctx.fill();

        } else if (tier === 3) {
            // --- BẬC 3: TỔNG GIÁM ĐỐC CHUỖI TOÀN QUỐC ---
            // 1. Áo vest blazer xanh navy sang trọng
            ctx.fillStyle = '#1e3a8a';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            this.roundRect(ctx, -13, 0, 26, 18, 4);
            ctx.fill();
            ctx.stroke();

            // Cổ áo sơ mi trắng & Cà vạt đỏ
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-5, 0);
            ctx.lineTo(0, 5);
            ctx.lineTo(5, 0);
            ctx.closePath();
            ctx.fill();

            // Cà vạt đỏ son
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(-2, 4);
            ctx.lineTo(2, 4);
            ctx.lineTo(3, 12);
            ctx.lineTo(0, 15);
            ctx.lineTo(-3, 12);
            ctx.closePath();
            ctx.fill();

            // 2. Kính râm đen thời trang phong độ
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            this.roundRect(ctx, -12, -7, 10, 6, 2);
            this.roundRect(ctx, 2, -7, 10, 6, 2);
            ctx.fill();
            ctx.stroke();
            // Cầu nối kính
            ctx.beginPath();
            ctx.moveTo(-2, -5);
            ctx.lineTo(2, -5);
            ctx.stroke();

            // 3. Máy tính bảng điều hành chuỗi chi nhánh trên tay
            ctx.fillStyle = '#0284c7';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1;
            ctx.beginPath();
            this.roundRect(ctx, 9, 4, 9, 13, 2);
            ctx.fill();
            ctx.stroke();
            // Màn hình sáng
            ctx.fillStyle = '#e0f2fe';
            ctx.fillRect(10.5, 5.5, 6, 10);

        } else if (tier >= 4) {
            // --- BẬC 4: VUA CƠM NẮM CYBER FOOD-TECH ---
            const now = Date.now();
            const pulse = Math.sin(now / 200) * 0.2 + 0.8;

            // 1. Hào quang vàng kim xoay quanh thân
            ctx.strokeStyle = `rgba(250, 204, 21, ${pulse * 0.7})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 4, 22, 20, 0, 0, Math.PI * 2);
            ctx.stroke();

            // 2. Giáp ngực công nghệ Cyber Trắng - Xanh Ngọc
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            this.roundRect(ctx, -13, 0, 26, 18, 4);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Đèn LED lõi năng lượng ngực (Reactor Core)
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc(0, 8, 3.5, 0, Math.PI * 2);
            ctx.fill();

            // 3. Kính quét Laser Cyber Visor
            ctx.fillStyle = 'rgba(0, 240, 255, 0.95)';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            this.roundRect(ctx, -13, -8, 26, 6, 3);
            ctx.fill();
            ctx.stroke();

            // 4. Ba lô phản lực Jetpack sau lưng phun lửa Plasma
            ctx.fillStyle = '#334155';
            ctx.fillRect(-17, 4, 4, 12);
            ctx.fillRect(13, 4, 4, 12);

            // Tia lửa phản lực Cyan
            ctx.fillStyle = (now % 200 < 100) ? '#00f0ff' : '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(-17, 16);
            ctx.lineTo(-13, 16);
            ctx.lineTo(-15, 22 + Math.random() * 4);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(13, 16);
            ctx.lineTo(17, 16);
            ctx.lineTo(15, 22 + Math.random() * 4);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    // =========================================================================
    // BỘ SƯU TẬP TRANG PHỤC BIẾN HÓA (SKINS)
    // =========================================================================
    drawSkinAccessories(ctx, skinId) {
        ctx.save();

        if (skinId === 'skin_samurai') {
            // 1. Mũ giáp Samurai Kabuto đỏ sẫm sừng trăng khuyết vàng
            ctx.fillStyle = '#7f1d1d';
            ctx.strokeStyle = '#b91c1c';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            this.roundRect(ctx, -14, -22, 28, 8, 3);
            ctx.fill();
            ctx.stroke();

            // Sừng trăng khuyết vàng kim (Crescent Horn)
            ctx.fillStyle = '#ffd700';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, -22, 10, Math.PI * 1.1, Math.PI * 1.9);
            ctx.lineTo(0, -20);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // 2. Giáp vảy cá đỏ son
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            this.roundRect(ctx, -12, 1, 24, 16, 3);
            ctx.fill();

            // 3. Thanh kiếm Katana bên hông
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-16, 4);
            ctx.lineTo(-8, 18);
            ctx.stroke();
            // Chuôi kiếm
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(-17, 2);
            ctx.lineTo(-15, 5);
            ctx.stroke();

        } else if (skinId === 'skin_god_of_wealth') {
            // 1. Mũ cánh chuồn Thần Tài màu đỏ viền vàng
            ctx.fillStyle = '#dc2626';
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            this.roundRect(ctx, -10, -24, 20, 10, 3);
            ctx.fill();
            ctx.stroke();

            // 2 Cánh chuồn vươn sang hai bên
            ctx.fillStyle = '#b91c1c';
            ctx.beginPath();
            this.roundRect(ctx, -24, -20, 14, 4, 2);
            this.roundRect(ctx, 10, -20, 14, 4, 2);
            ctx.fill();
            ctx.stroke();

            // 2. Áo gấm đỏ thêu hoa văn
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            this.roundRect(ctx, -12, 1, 24, 16, 4);
            ctx.fill();

            // 3. Thỏi vàng kim Nguyên Bảo trên tay
            ctx.fillStyle = '#ffd700';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(10, 8, 5, 0, Math.PI);
            ctx.lineTo(14, 5);
            ctx.lineTo(6, 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Hạt xu vàng lấp lánh dưới chân
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(-8, 19, 2.5, 0, Math.PI * 2);
            ctx.arc(8, 19, 2.5, 0, Math.PI * 2);
            ctx.fill();

        } else if (skinId === 'skin_astronaut') {
            // 1. Mũ phi hành gia vòm kính tròn phản quang
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, -8, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Ánh sao phản chiếu trên kính
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-6, -14, 2, 0, Math.PI * 2);
            ctx.fill();

            // 2. Bình dưỡng khí kép sau lưng
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(-17, 2, 4, 14);
            ctx.fillRect(13, 2, 4, 14);

            // 3. Bộ giáp phi hành trắng tinh
            ctx.fillStyle = '#f8fafc';
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            this.roundRect(ctx, -12, 2, 24, 16, 4);
            ctx.fill();
            ctx.stroke();

        } else if (skinId === 'skin_mecha') {
            // 1. Giáp kim loại Titan xám bạc
            ctx.fillStyle = '#64748b';
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            this.roundRect(ctx, -13, 0, 26, 18, 2);
            ctx.fill();
            ctx.stroke();

            // Khớp nối cơ khí
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-9, 5, 18, 2);

            // 2. Kính Visor laser đỏ
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 6;
            ctx.fillRect(-11, -8, 22, 4);
            ctx.shadowBlur = 0;

            // 3. Ăng-ten radar mini nhô trên đỉnh đầu
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.lineTo(0, -25);
            ctx.stroke();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -25, 2, 0, Math.PI * 2);
            ctx.fill();

        } else if (skinId === 'skin_dj_neon') {
            const now = Date.now();
            const djColor = (now % 900 < 300) ? '#ec4899' : (now % 900 < 600 ? '#00f0ff' : '#a855f7');

            // 1. Tai nghe chụp tai DJ khổng lồ nhấp nháy 7 màu
            ctx.strokeStyle = djColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, -12, 16, Math.PI * 0.9, Math.PI * 2.1);
            ctx.stroke();

            // 2 ốp tai nghe
            ctx.fillStyle = djColor;
            ctx.shadowColor = djColor;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(-15, -8, 5, 0, Math.PI * 2);
            ctx.arc(15, -8, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // 2. Kính LED Equalizer sóng âm
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-12, -7, 24, 6);
            ctx.fillStyle = '#22c55e';
            // Các vạch led nhảy theo nhạc
            const h1 = (now % 300) / 100 * 2 + 1;
            const h2 = (now % 400) / 100 * 2 + 1;
            ctx.fillRect(-8, -4, 2, h1);
            ctx.fillRect(-4, -5, 2, h2);
            ctx.fillRect(0, -6, 2, h1 + 1);
            ctx.fillRect(4, -5, 2, h2);
            ctx.fillRect(8, -4, 2, h1);

            // 3. Áo khoác dạ quang Neon
            ctx.fillStyle = '#1e1b4b';
            ctx.strokeStyle = djColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            this.roundRect(ctx, -12, 1, 24, 16, 4);
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Vẽ xem trước nhân vật phóng to trên Canvas (Live Preview)
     */
    renderPreview(canvas, evolutionTier = 1, skinId = 'skin_default') {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const cw = canvas.width;
        const ch = canvas.height;
        ctx.clearRect(0, 0, cw, ch);

        this.render(ctx, {
            x: cw / 2,
            y: ch / 2 + 10,
            facing: 1,
            bounce: 0,
            variant: 'player',
            customScale: 2.2, // Phóng to 2.2 lần cho Live Preview sắc nét
            evolutionTier: evolutionTier,
            skin: skinId
        });
    }

    // Vẽ nắm cơm nhỏ Onigiri chuẩn ISO cầm trên tay khi khách mua xong
    drawHandheldOnigiri(ctx) {
        ctx.save();
        const ox = 12;
        const oy = 8;

        // Bóng đổ nhỏ dưới nắm cơm
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(ox, oy + 7, 6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nắm cơm tam giác trắng ngần thơm dẻo
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ox, oy - 7);
        ctx.lineTo(ox + 8, oy + 5);
        ctx.lineTo(ox - 8, oy + 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lá rong biển đen giòn rụm bọc ngang đáy
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        this.roundRect(ctx, ox - 4, oy + 1, 8, 4.5, 1);
        ctx.fill();

        // Đốm sáng lấp lánh biểu trưng độ tươi chuẩn ISO
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(ox - 2, oy - 2, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Vẽ hình chữ nhật bo góc an toàn trên mọi phiên bản trình duyệt
    roundRect(ctx, x, y, w, h, r) {
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, w, h, r);
        } else {
            ctx.rect(x, y, w, h);
        }
    }

    // 1. Phụ kiện: Mũ đầu bếp (Dành cho Player khi ở gần Xưởng Bếp)
    drawChefHat(ctx) {
        ctx.save();
        const hatBaseX = 0;
        const hatBaseY = -23;

        // Vành mũ đầu bếp
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        this.roundRect(ctx, hatBaseX - 11, hatBaseY - 5, 22, 7, 2);
        ctx.fill();
        ctx.stroke();

        // Đai vàng kim trang trí vành mũ
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(hatBaseX - 10, hatBaseY - 2, 20, 2.5);

        // Phần phồng xếp nếp của mũ đầu bếp
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(hatBaseX - 7, hatBaseY - 10, 6.5, 0, Math.PI * 2);
        ctx.arc(hatBaseX, hatBaseY - 14, 7.5, 0, Math.PI * 2);
        ctx.arc(hatBaseX + 7, hatBaseY - 10, 6.5, 0, Math.PI * 2);
        ctx.fill();

        // Viền nếp gấp mũ
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(hatBaseX - 7, hatBaseY - 10, 6.5, Math.PI * 0.8, Math.PI * 1.9);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(hatBaseX, hatBaseY - 14, 7.5, Math.PI * 0.7, Math.PI * 2.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(hatBaseX + 7, hatBaseY - 10, 6.5, Math.PI * 1.1, Math.PI * 2.2);
        ctx.stroke();

        ctx.restore();
    }

    // 2. Phụ kiện: Mũ lưỡi trai + Khăn quàng đỏ (Student)
    drawStudentAccessories(ctx, colorVariation = 0) {
        ctx.save();

        // --- Khăn quàng đỏ (Red Scarf) ---
        const scarfX = 0;
        const scarfY = 6;

        ctx.fillStyle = '#dc2626'; // Đỏ tươi thắm
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1;

        // Vòng quàng qua cổ
        ctx.beginPath();
        ctx.ellipse(scarfX, scarfY, 13, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Nút thắt và dải khăn rủ xuống phía trước
        ctx.beginPath();
        ctx.moveTo(scarfX - 3, scarfY + 2);
        ctx.lineTo(scarfX + 5, scarfY + 16);
        ctx.lineTo(scarfX + 1, scarfY + 17);
        ctx.lineTo(scarfX - 4, scarfY + 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Nút thắt khăn
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.arc(scarfX - 1, scarfY + 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // --- Mũ lưỡi trai (Baseball Cap - Đa dạng màu sắc) ---
        const capX = 0;
        const capY = -21;

        const capColors = ['#1d4ed8', '#ea580c', '#16a34a', '#8b5cf6'];
        const capDarkColors = ['#1e3a8a', '#c2410c', '#15803d', '#7c3aed'];
        const cIdx = Math.abs(colorVariation) % capColors.length;

        // Chóp mũ vòm tròn
        ctx.fillStyle = capColors[cIdx];
        ctx.strokeStyle = capDarkColors[cIdx];
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(capX, capY, 13, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Núm nhỏ trên đỉnh mũ
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(capX, capY - 13, 2, 0, Math.PI * 2);
        ctx.fill();

        // Vành lưỡi trai chìa ra phía trước (hướng theo facing dương)
        ctx.fillStyle = capDarkColors[cIdx];
        ctx.beginPath();
        ctx.moveTo(capX + 4, capY);
        ctx.quadraticCurveTo(capX + 18, capY - 1, capX + 19, capY + 4);
        ctx.quadraticCurveTo(capX + 11, capY + 5, capX - 4, capY + 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    // 3. Phụ kiện: Kính cận + Cà vạt (Office)
    drawOfficeAccessories(ctx, colorVariation = 0) {
        ctx.save();

        // --- Kính cận trí thức (Glasses) ---
        const eyeY = -4;
        const glassRadius = 5.2;

        ctx.strokeStyle = '#1e293b'; // Gọng kính đen than
        ctx.lineWidth = 1.8;
        ctx.fillStyle = 'rgba(224, 242, 254, 0.45)'; // Tròng kính phản quang nhẹ

        // Mắt kính trái
        ctx.beginPath();
        ctx.arc(-7, eyeY, glassRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Mắt kính phải
        ctx.beginPath();
        ctx.arc(7, eyeY, glassRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cầu nối giữa 2 mắt kính
        ctx.beginPath();
        ctx.moveTo(-1.8, eyeY - 1);
        ctx.lineTo(1.8, eyeY - 1);
        ctx.stroke();

        // Vệt sáng lóa trên tròng kính
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8.5, eyeY - 2.5);
        ctx.lineTo(-5.5, eyeY - 4.5);
        ctx.moveTo(5.5, eyeY - 2.5);
        ctx.lineTo(8.5, eyeY - 4.5);
        ctx.stroke();

        // --- Cà vạt công sở (Necktie - Đa dạng màu sắc) ---
        const tieX = 0;
        const tieY = 8;

        const tieColors = ['#1e3a8a', '#dc2626', '#059669', '#d97706'];
        const tIdx = Math.abs(colorVariation) % tieColors.length;

        // Cổ áo sơ mi trắng
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-7, tieY);
        ctx.lineTo(0, tieY + 3);
        ctx.lineTo(7, tieY);
        ctx.stroke();

        // Nút thắt cà vạt
        ctx.fillStyle = tieColors[tIdx];
        ctx.beginPath();
        ctx.moveTo(-3, tieY + 1);
        ctx.lineTo(3, tieY + 1);
        ctx.lineTo(2, tieY + 5);
        ctx.lineTo(-2, tieY + 5);
        ctx.closePath();
        ctx.fill();

        // Thân dải cà vạt
        ctx.beginPath();
        ctx.moveTo(-2.5, tieY + 5);
        ctx.lineTo(2.5, tieY + 5);
        ctx.lineTo(4, tieY + 15);
        ctx.lineTo(0, tieY + 19); // Mũi nhọn cà vạt
        ctx.lineTo(-4, tieY + 15);
        ctx.closePath();
        ctx.fill();

        // Sọc trang trí chéo trên cà vạt
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-2, tieY + 8);
        ctx.lineTo(2.5, tieY + 11);
        ctx.moveTo(-2.5, tieY + 12);
        ctx.lineTo(2.5, tieY + 15);
        ctx.stroke();

        ctx.restore();
    }

    // 4. Phụ kiện: Nón lá truyền thống (Market)
    drawMarketAccessories(ctx) {
        ctx.save();
        const hatX = 0;
        const hatY = -20;

        // Quai nón hồng thắm dưới cằm
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-11, hatY + 1);
        ctx.quadraticCurveTo(hatX, hatY + 23, 11, hatY + 1);
        ctx.stroke();

        // Thân nón lá hình nón chóp nhọn
        ctx.fillStyle = '#fef08a'; // Vàng rơm lá nón
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(hatX, hatY - 14); // Chóp nón
        ctx.lineTo(hatX + 21, hatY + 3); // Mép phải
        ctx.quadraticCurveTo(hatX, hatY + 7, hatX - 21, hatY + 3); // Vành cong dưới
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Các vành nan tre trang trí nón lá
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 0.9;
        for (let r = 0.25; r <= 0.75; r += 0.25) {
            ctx.beginPath();
            const leftX = hatX - 21 * r;
            const rightX = hatX + 21 * r;
            const midY = (hatY - 14) * (1 - r) + hatY * r;
            ctx.moveTo(leftX, midY);
            ctx.quadraticCurveTo(hatX, midY + 4 * r, rightX, midY);
            ctx.stroke();
        }

        ctx.restore();
    }

    // 5. Phụ kiện: Kính râm đen phong cách tài phiệt (VIP)
    drawVipAccessories(ctx) {
        ctx.save();
        const eyeY = -4;

        // Kính râm đen sành điệu
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = '#eab308'; // Viền mạ vàng
        ctx.lineWidth = 1.6;

        // Tròng kính trái
        ctx.beginPath();
        this.roundRect(ctx, -12, eyeY - 4, 10, 7.5, 2);
        ctx.fill();
        ctx.stroke();

        // Tròng kính phải
        ctx.beginPath();
        this.roundRect(ctx, 2, eyeY - 4, 10, 7.5, 2);
        ctx.fill();
        ctx.stroke();

        // Gọng ngang mạ vàng
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-12, eyeY - 4);
        ctx.lineTo(12, eyeY - 4);
        ctx.stroke();

        // Vệt phản quang ánh bạc sang trọng
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-10, eyeY - 2);
        ctx.lineTo(-4, eyeY + 2);
        ctx.moveTo(4, eyeY - 2);
        ctx.lineTo(10, eyeY + 2);
        ctx.stroke();

        ctx.restore();
    }

    // 6. Phụ kiện: Mũ bảo hiểm giao hàng + Tạp dề cam (Staff)
    drawStaffAccessories(ctx) {
        ctx.save();

        // --- Tạp dề nhân viên phục vụ (Apron) ---
        const apronY = 6;
        ctx.fillStyle = '#ea580c'; // Cam thương hiệu
        ctx.strokeStyle = '#c2410c';
        ctx.lineWidth = 1.2;

        // Thân tạp dề
        ctx.beginPath();
        ctx.moveTo(-7, apronY);
        ctx.lineTo(7, apronY);
        ctx.lineTo(9, apronY + 16);
        ctx.lineTo(-9, apronY + 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Túi trước tạp dề
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        this.roundRect(ctx, -5, apronY + 7, 10, 7, 2);
        ctx.fill();
        ctx.stroke();

        // Dây đeo cổ tạp dề
        ctx.strokeStyle = '#9a3412';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-5, apronY);
        ctx.quadraticCurveTo(0, apronY - 4, 5, apronY);
        ctx.stroke();

        // --- Mũ bảo hiểm giao hàng (Delivery Helmet) ---
        const helmetX = 0;
        const helmetY = -20;

        // Vòm mũ bảo hiểm đỏ/xanh
        ctx.fillStyle = '#ef4444'; // Đỏ nổi bật
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(helmetX, helmetY, 13.5, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Kính chắn gió trong suốt phủ phía trước
        ctx.fillStyle = 'rgba(191, 219, 254, 0.55)';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        this.roundRect(ctx, helmetX + 2, helmetY, 12, 7, 2);
        ctx.fill();
        ctx.stroke();

        // Quai cài cằm an toàn
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-11, helmetY + 2);
        ctx.quadraticCurveTo(helmetX, helmetY + 19, 11, helmetY + 2);
        ctx.stroke();

        ctx.restore();
    }

    // Vẽ hình dáng thay thế Onigiri nếu ảnh gốc chưa tải xong
    drawFallback(ctx) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Mắt mũi
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-4, -2, 2, 0, Math.PI * 2);
        ctx.arc(4, -2, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // --- HỆ THỐNG VẼ PHƯƠNG TIỆN XE CỘ TRỰC QUAN (BƯỚC 4) ---

    // 1. Lớp sau của phương tiện (Vẽ trước khi vẽ thân nhân vật)
    drawVehicleBack(ctx, vehicle) {
        ctx.save();
        const vType = (vehicle === 'bicycle' ? 'bike' : (vehicle === 'scooter' ? 'motorcycle' : (vehicle === 'van' ? 'truck' : vehicle)));
        switch (vType) {
            case 'bike':
                // Bánh xe sau
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(-16, 21, 7.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Nan hoa sau
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(-22, 21); ctx.lineTo(-10, 21);
                ctx.moveTo(-16, 15); ctx.lineTo(-16, 27);
                ctx.stroke();
                break;

            case 'motorcycle':
                // Bánh xe sau
                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(-19, 21, 8.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Thùng giữ nhiệt màu cam/đỏ phía sau lưng
                ctx.fillStyle = '#ea580c';
                ctx.strokeStyle = '#c2410c';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                this.roundRect(ctx, -32, 2, 17, 18, 3);
                ctx.fill();
                ctx.stroke();

                // Nắp thùng
                ctx.fillStyle = '#f97316';
                ctx.beginPath();
                this.roundRect(ctx, -33, 0, 19, 4, 1.5);
                ctx.fill();
                ctx.stroke();

                // Dải phản quang & Logo nắm cơm trên thùng
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(-31, 9, 15, 3);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 8px sans-serif';
                ctx.fillText('🍙', -28, 17);

                // Pô xe mạ crom
                ctx.fillStyle = '#94a3b8';
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1;
                ctx.beginPath();
                this.roundRect(ctx, -18, 23, 14, 4, 1.5);
                ctx.fill();
                ctx.stroke();
                break;

            case 'truck':
                // Bánh xe sau
                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(-22, 22, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Thùng xe đông lạnh bảo ôn lớn phía sau
                ctx.fillStyle = '#f8fafc';
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 2;
                ctx.beginPath();
                this.roundRect(ctx, -38, -6, 26, 26, 3);
                ctx.fill();
                ctx.stroke();

                // Dải decal lạnh & Icon bông tuyết + cơm nắm
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(-37, 7, 24, 3);
                ctx.fillStyle = '#0284c7';
                ctx.font = '9px sans-serif';
                ctx.fillText('❄️🍙', -34, 4);
                break;
        }
        ctx.restore();
    }

    // 2. Lớp trước của phương tiện (Vẽ sau khi vẽ thân nhân vật)
    drawVehicleFront(ctx, vehicle) {
        ctx.save();
        const vType = (vehicle === 'bicycle' ? 'bike' : (vehicle === 'scooter' ? 'motorcycle' : (vehicle === 'van' ? 'truck' : vehicle)));
        switch (vType) {
            case 'bike':
                // Bánh xe trước
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(17, 21, 7.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Nan hoa trước
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(11, 21); ctx.lineTo(23, 21);
                ctx.moveTo(17, 15); ctx.lineTo(17, 27);
                ctx.stroke();

                // Khung xe thể thao màu xanh ngọc
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                // Nối trục bánh sau -> trục giữa -> cổ phốt -> trục bánh trước
                ctx.moveTo(-16, 21);
                ctx.lineTo(-1, 20);
                ctx.lineTo(11, 10);
                ctx.lineTo(17, 21);
                ctx.moveTo(-1, 20);
                ctx.lineTo(-3, 13); // Cọc yên
                ctx.stroke();

                // Ghi đông & Tay lái
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(11, 10);
                ctx.lineTo(14, 6);
                ctx.lineTo(17, 7);
                ctx.stroke();

                // Giỏ xe kim loại phía trước đựng 1 nắm cơm nhỏ
                ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                this.roundRect(ctx, 14, 7, 10, 8, 1.5);
                ctx.fill();
                ctx.stroke();

                // Nắm cơm nhỏ trong giỏ
                ctx.font = '8px sans-serif';
                ctx.fillText('🍙', 15, 14);
                break;

            case 'motorcycle':
                // Bánh xe trước
                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(19, 21, 8.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Yếm xe máy trắng viền xanh
                ctx.fillStyle = '#f8fafc';
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(4, 18);
                ctx.lineTo(14, 10);
                ctx.lineTo(18, 18);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Đèn pha xe máy phát sáng
                ctx.fillStyle = '#fef08a';
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(18, 10, 3.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Ghi đông
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(14, 10);
                ctx.lineTo(16, 6);
                ctx.lineTo(19, 6);
                ctx.stroke();
                break;

            case 'truck':
                // Bánh xe trước
                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(22, 22, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Cabin đầu xe tải lạnh
                ctx.fillStyle = '#f8fafc';
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-12, 10);
                ctx.lineTo(12, 10);
                ctx.lineTo(26, 10);
                ctx.lineTo(28, 20);
                ctx.lineTo(-12, 20);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Kính chắn gió cabin
                ctx.fillStyle = 'rgba(147, 197, 253, 0.75)';
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 1;
                ctx.beginPath();
                this.roundRect(ctx, 14, 5, 11, 7, 2);
                ctx.fill();
                ctx.stroke();

                // Đèn pha LED trước xe
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(26, 14, 3, 4);
                break;
        }
        ctx.restore();
    }

    /**
     * Vẽ người chơi trực tuyến / Bot đối thủ lên Canvas bản đồ
     */
    renderNetworkPlayer(ctx, player, options = {}) {
        if (!ctx || !player) return;

        const x = typeof options.x === 'number' ? options.x : (player.x || 0);
        const y = typeof options.y === 'number' ? options.y : (player.y || 0);
        const brandName = player.brandName || player.name || 'Người chơi';
        const level = player.level || 1;
        const vehicleId = player.vehicleId || 'walking';
        const isStallOpen = !!player.isStallOpen;
        const isSelected = !!options.isSelected;

        ctx.save();
        ctx.translate(x, y);

        // Hiệu ứng vòng tròn nổi bật khi được chọn / tương tác
        if (isSelected) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(0, 0, 36, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Vẽ sạp hàng dã chiến nếu đang mở sạp
        if (isStallOpen) {
            ctx.fillStyle = '#f59e0b';
            ctx.strokeStyle = '#b45309';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            this.roundRect(ctx, 16, -15, 28, 22, 3);
            ctx.fill();
            ctx.stroke();

            // Dù che nắng sạp hàng
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(30, -22, 14, Math.PI, 0);
            ctx.fill();

            // Chữ sạp
            ctx.font = 'bold 9px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('🍙 SẠP', 30, -2);
        }

        // Vẽ nhân vật linh vật & phương tiện xe tương ứng
        const facing = (typeof player.facing === 'number') ? player.facing : ((player.vx && player.vx < 0) ? -1 : 1);
        this.render(ctx, {
            x: 0,
            y: 0,
            facing: facing,
            bounce: isStallOpen ? 0 : Math.sin(Date.now() / 200) * 2,
            variant: 'player',
            vehicle: vehicleId,
            evolutionTier: player.evolutionTier || 1,
            skin: player.equippedSkin || 'skin_default'
        });

        // Bảng tên thương hiệu + Cấp độ phía trên đầu
        const tagText = `${brandName} (Lv.${level})`;
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const textMetrics = ctx.measureText(tagText);
        const tagWidth = Math.max(80, textMetrics.width + 24);
        const tagHeight = 20;
        const tagY = -48;

        // Nền bảng tên bo góc
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        this.roundRect(ctx, -tagWidth / 2, tagY, tagWidth, tagHeight, 10);
        ctx.fill();
        ctx.stroke();

        // Chấm xanh trạng thái trực tuyến
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(-tagWidth / 2 + 10, tagY + tagHeight / 2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Chữ tên thương hiệu
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tagText, 4, tagY + tagHeight / 2);

        // Bong bóng biểu cảm Emote nếu đang hiển thị
        if (player.emote && player.emote.time && (Date.now() - player.emote.time < 3500)) {
            const emoteEmoji = player.emote.type === 'heart' ? '❤️' :
                               player.emote.type === 'cheer' ? '🍙🎉' : '👋';
            
            const bubbleY = tagY - 26;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, bubbleY, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Mũi nhọn bong bóng
            ctx.beginPath();
            ctx.moveTo(-4, bubbleY + 12);
            ctx.lineTo(0, bubbleY + 18);
            ctx.lineTo(4, bubbleY + 12);
            ctx.closePath();
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.font = '14px sans-serif';
            ctx.fillText(emoteEmoji, 0, bubbleY + 1);
        }

        ctx.restore();
    }
}

// Khởi tạo thực thể duy nhất (Singleton) dùng chung cho toàn bộ dự án
export const characterRenderer = new CharacterRenderer();
