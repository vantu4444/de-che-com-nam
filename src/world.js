// src/world.js - Bản đồ TP.HCM thu nhỏ & 4 Bản Đồ Thành Phố Liên Tỉnh: HCM, Buôn Ma Thuột, TP. Vinh, Hà Nội

import { state } from './state.js';
import { city3D } from './city3D.js';
import { network } from './network.js';

// =============================================================================
// NGUỒN TỌA ĐỘ DUY NHẤT (SINGLE SOURCE OF TRUTH) CÁC Ô VẠCH XANH HỢP PHÁP
// Bao gồm đầy đủ: Ô Vạch Xanh Trường Học, Công Viên, Chợ Bến Thành, Phố Đi Bộ
// =============================================================================
export const LEGAL_SELLING_ZONES = [
    // -------------------------------------------------------------
    // CHI NHÁNH 1: TP. HỒ CHÍ MINH (branch_hcm)
    // -------------------------------------------------------------
    { id: 'spot_school_hoamai', name: 'Ô Vạch Xanh Trường Học (Tiểu Học Hoa Mai)', cityId: 'branch_hcm', regionId: 'school_hoamai', type: 'school', x: 720, y: 580, w: 140, h: 90 },
    { id: 'spot_school_nguyendu', name: 'Ô Vạch Xanh Trường THCS Nguyễn Du', cityId: 'branch_hcm', regionId: 'school_nguyendu', type: 'school', x: 1920, y: 580, w: 140, h: 90 },
    { id: 'spot_school_lequydon', name: 'Ô Vạch Xanh Trường THPT Lê Quý Đôn', cityId: 'branch_hcm', regionId: 'school_lequydon', type: 'school', x: 3120, y: 580, w: 140, h: 90 },
    { id: 'spot_university_town', name: 'Ô Vạch Xanh Công Viên (Làng Đại Học)', cityId: 'branch_hcm', regionId: 'university_town', type: 'park', x: 780, y: 1500, w: 140, h: 90 },
    { id: 'spot_office_q1', name: 'Ô Vạch Xanh Chợ Bến Thành (Văn Phòng Q1)', cityId: 'branch_hcm', regionId: 'office_q1', type: 'market', x: 2180, y: 1500, w: 140, h: 90 },
    { id: 'spot_walking_street', name: 'Ô Vạch Xanh Phố Đi Bộ Nguyễn Huệ', cityId: 'branch_hcm', regionId: 'walking_street', type: 'walking_street', x: 3280, y: 1500, w: 140, h: 90 },

    // -------------------------------------------------------------
    // CHI NHÁNH 2: BUÔN MA THUỘT - ĐẮK LẮK (branch_daklak)
    // -------------------------------------------------------------
    { id: 'spot_school_ntranglong', name: 'Ô Vạch Xanh Trường Tiểu Học N\'Trang Lơng', cityId: 'branch_daklak', regionId: 'school_ntranglong', type: 'school', x: 720, y: 580, w: 140, h: 90 },
    { id: 'spot_school_phanchutrinh', name: 'Ô Vạch Xanh Trường THCS Phan Chu Trinh', cityId: 'branch_daklak', regionId: 'school_phanchutrinh', type: 'school', x: 1920, y: 580, w: 140, h: 90 },
    { id: 'spot_school_bmt_nguyendu', name: 'Ô Vạch Xanh Trường THPT Chuyên Nguyễn Du', cityId: 'branch_daklak', regionId: 'school_bmt_nguyendu', type: 'school', x: 3120, y: 580, w: 140, h: 90 },
    { id: 'spot_university_taynguyen', name: 'Ô Vạch Xanh Công Viên (Đại Học Tây Nguyên)', cityId: 'branch_daklak', regionId: 'university_taynguyen', type: 'park', x: 780, y: 1500, w: 140, h: 90 },
    { id: 'spot_office_bmt_ngasau', name: 'Ô Vạch Xanh Chợ BMT & Khu VP Ngã Sáu', cityId: 'branch_daklak', regionId: 'office_bmt_ngasau', type: 'market', x: 2180, y: 1500, w: 140, h: 90 },
    { id: 'spot_square_10_3', name: 'Ô Vạch Xanh Phố Đi Bộ Quảng Trường 10/3', cityId: 'branch_daklak', regionId: 'square_10_3', type: 'walking_street', x: 3280, y: 1500, w: 140, h: 90 },

    // -------------------------------------------------------------
    // CHI NHÁNH 3: TP. VINH - NGHỆ AN (branch_vinh)
    // -------------------------------------------------------------
    { id: 'spot_school_lemao', name: 'Ô Vạch Xanh Trường Tiểu Học Lê Mao', cityId: 'branch_vinh', regionId: 'school_lemao', type: 'school', x: 720, y: 580, w: 140, h: 90 },
    { id: 'spot_school_dangthaimai', name: 'Ô Vạch Xanh Trường THCS Đặng Thai Mai', cityId: 'branch_vinh', regionId: 'school_dangthaimai', type: 'school', x: 1920, y: 580, w: 140, h: 90 },
    { id: 'spot_school_huynhthuckhang', name: 'Ô Vạch Xanh Trường THPT Huỳnh Thúc Kháng', cityId: 'branch_vinh', regionId: 'school_huynhthuckhang', type: 'school', x: 3120, y: 580, w: 140, h: 90 },
    { id: 'spot_university_vinh', name: 'Ô Vạch Xanh Công Viên (Đại Học Vinh)', cityId: 'branch_vinh', regionId: 'university_vinh', type: 'park', x: 780, y: 1500, w: 140, h: 90 },
    { id: 'spot_office_lenin', name: 'Ô Vạch Xanh Chợ Vinh & Khu VP Đại Lộ Lê Nin', cityId: 'branch_vinh', regionId: 'office_lenin', type: 'market', x: 2180, y: 1500, w: 140, h: 90 },
    { id: 'spot_square_songlam', name: 'Ô Vạch Xanh Phố Đi Bộ Quảng Trường Sông Lam', cityId: 'branch_vinh', regionId: 'square_songlam', type: 'walking_street', x: 3280, y: 1500, w: 140, h: 90 },

    // -------------------------------------------------------------
    // CHI NHÁNH 4: THỦ ĐÔ HÀ NỘI (branch_hanoi)
    // -------------------------------------------------------------
    { id: 'spot_school_thanglong', name: 'Ô Vạch Xanh Trường Tiểu Học Thăng Long', cityId: 'branch_hanoi', regionId: 'school_thanglong', type: 'school', x: 720, y: 580, w: 140, h: 90 },
    { id: 'spot_school_trungvuong', name: 'Ô Vạch Xanh Trường THCS Trưng Vương', cityId: 'branch_hanoi', regionId: 'school_trungvuong', type: 'school', x: 1920, y: 580, w: 140, h: 90 },
    { id: 'spot_school_chuvanan', name: 'Ô Vạch Xanh Trường THPT Chu Văn An', cityId: 'branch_hanoi', regionId: 'school_chuvanan', type: 'school', x: 3120, y: 580, w: 140, h: 90 },
    { id: 'spot_university_dhqghn', name: 'Ô Vạch Xanh Công Viên (Đại Học Quốc Gia Hà Nội)', cityId: 'branch_hanoi', regionId: 'university_dhqghn', type: 'park', x: 780, y: 1500, w: 140, h: 90 },
    { id: 'spot_office_caugiay', name: 'Ô Vạch Xanh Chợ Đồng Xuân & Khu VP Cầu Giấy', cityId: 'branch_hanoi', regionId: 'office_caugiay', type: 'market', x: 2180, y: 1500, w: 140, h: 90 },
    { id: 'spot_walking_street_hoguom', name: 'Ô Vạch Xanh Phố Đi Bộ Hồ Gươm', cityId: 'branch_hanoi', regionId: 'walking_street_hoguom', type: 'walking_street', x: 3280, y: 1500, w: 140, h: 90 }
];

// Hàm kiểm tra vị trí có nằm trong Ô Vạch Xanh Hợp Pháp không (+20px biên độ an toàn)
export function isInsideLegalZone(x, y, cityId = null) {
    if (typeof x !== 'number' || typeof y !== 'number') return null;
    const margin = 20; // Mở rộng vùng nhận diện hợp lệ thêm +20px biên độ an toàn tính từ tâm nhân vật/xe
    for (const zone of LEGAL_SELLING_ZONES) {
        if (cityId && zone.cityId && zone.cityId !== cityId) continue;
        if (
            x >= zone.x - margin &&
            x <= zone.x + zone.w + margin &&
            y >= zone.y - margin &&
            y <= zone.y + zone.h + margin
        ) {
            return zone;
        }
    }
    return null;
}

export const CITY_DATA = {
    branch_hcm: {
        id: 'branch_hcm',
        name: 'TP. Hồ Chí Minh',
        subtitle: 'Đại Đô Thị Sầm Uất',
        grassColor: '#bbf7d0',
        gridColor: '#86efac',
        centerLandmark: 'hcm_centre',
        kitchen: { name: 'Xưởng Bếp HCM', x: 450, y: 2350, w: 260, h: 220, radius: 160 },
        market: { name: 'Chợ Đầu Mối', x: 3200, y: 2350, w: 280, h: 220, radius: 160 },
        spots: [
            { id: 'school_hoamai', name: 'Tiểu học Hoa Mai', color: '#ec4899', borderColor: '#db2777', x: 650, y: 450, w: 290, h: 210, radius: 160, icon: '🌸', type: 'school', prefPrice: '20k', parkX: 720, parkY: 580, parkW: 140, parkH: 90 },
            { id: 'school_nguyendu', name: 'THCS Nguyễn Du', color: '#3b82f6', borderColor: '#1d4ed8', x: 1850, y: 450, w: 290, h: 210, radius: 160, icon: '📚', type: 'school', prefPrice: '20k-22k', parkX: 1920, parkY: 580, parkW: 140, parkH: 90 },
            { id: 'school_lequydon', name: 'THPT Lê Quý Đôn', color: '#8b5cf6', borderColor: '#6d28d9', x: 3050, y: 450, w: 290, h: 210, radius: 160, icon: '🎓', type: 'school', prefPrice: '22k', parkX: 3120, parkY: 580, parkW: 140, parkH: 90 },
            { id: 'university_town', name: 'Làng Đại Học', color: '#06b6d4', borderColor: '#0891b2', x: 700, y: 1350, w: 320, h: 230, radius: 170, icon: '🏛️', type: 'school', prefPrice: 'all', parkX: 780, parkY: 1500, parkW: 140, parkH: 90 },
            { id: 'office_q1', name: 'Văn Phòng Quận 1', color: '#475569', borderColor: '#334155', x: 2100, y: 1350, w: 300, h: 230, radius: 160, icon: '🏢', type: 'office', prefPrice: '22k-25k', parkX: 2180, parkY: 1500, parkW: 140, parkH: 90 },
            { id: 'walking_street', name: 'Phố Đi Bộ', color: '#f59e0b', borderColor: '#d97706', x: 3200, y: 1350, w: 310, h: 230, radius: 160, icon: '🚶‍♂️', type: 'walking_street', prefPrice: '25k', parkX: 3280, parkY: 1500, parkW: 140, parkH: 90 }
        ]
    },
    branch_daklak: {
        id: 'branch_daklak',
        name: 'TP. Buôn Ma Thuột',
        subtitle: 'Thủ Phủ Cà Phê Tây Nguyên',
        grassColor: '#bbf7d0',
        soilColor: '#c2410c', // Đất đỏ bazan
        gridColor: '#86efac',
        centerLandmark: 'daklak_monument', // Tượng đài Ngã Sáu Ban Mê
        kitchen: { name: 'Xưởng Bếp BMT', x: 450, y: 2350, w: 260, h: 220, radius: 160 },
        market: { name: 'Chợ Trung Tâm BMT', x: 3200, y: 2350, w: 280, h: 220, radius: 160 },
        spots: [
            { id: 'school_ntranglong', name: 'Tiểu học N\'Trang Lơng', color: '#ec4899', borderColor: '#db2777', x: 650, y: 450, w: 290, h: 210, radius: 160, icon: '🌸', type: 'school', prefPrice: '20k', parkX: 720, parkY: 580, parkW: 140, parkH: 90 },
            { id: 'school_phanchutrinh', name: 'THCS Phan Chu Trinh', color: '#3b82f6', borderColor: '#1d4ed8', x: 1850, y: 450, w: 290, h: 210, radius: 160, icon: '📚', type: 'school', prefPrice: '20k-22k', parkX: 1920, parkY: 580, parkW: 140, parkH: 90 },
            { id: 'school_bmt_nguyendu', name: 'THPT Chuyên Nguyễn Du', color: '#8b5cf6', borderColor: '#6d28d9', x: 3050, y: 450, w: 290, h: 210, radius: 160, icon: '🎓', type: 'school', prefPrice: '22k', parkX: 3120, parkY: 580, parkW: 140, parkH: 90 },
            { id: 'university_taynguyen', name: 'Đại Học Tây Nguyên', color: '#06b6d4', borderColor: '#0891b2', x: 700, y: 1350, w: 320, h: 230, radius: 170, icon: '🏛️', type: 'school', prefPrice: 'all', parkX: 780, parkY: 1500, parkW: 140, parkH: 90 },
            { id: 'office_bmt_ngasau', name: 'Khu VP Ngã Sáu', color: '#475569', borderColor: '#334155', x: 2100, y: 1350, w: 300, h: 230, radius: 160, icon: '🏢', type: 'office', prefPrice: '22k-25k', parkX: 2180, parkY: 1500, parkW: 140, parkH: 90 },
            { id: 'square_10_3', name: 'Quảng Trường 10/3', color: '#f59e0b', borderColor: '#d97706', x: 3200, y: 1350, w: 310, h: 230, radius: 160, icon: '🚶‍♂️', type: 'walking_street', prefPrice: '25k', parkX: 3280, parkY: 1500, parkW: 140, parkH: 90 }
        ]
    },
    branch_vinh: {
        id: 'branch_vinh',
        name: 'TP. Vinh - Nghệ An',
        subtitle: 'Thành Phố Đỏ Sông Lam',
        grassColor: '#bbf7d0',
        gridColor: '#86efac',
        centerLandmark: 'vinh_square', // Quảng trường Hồ Chí Minh
        kitchen: { name: 'Xưởng Bếp Vinh', x: 450, y: 2350, w: 260, h: 220, radius: 160 },
        market: { name: 'Chợ Vinh', x: 3200, y: 2350, w: 280, h: 220, radius: 160 },
        spots: [
            { id: 'school_lemao', name: 'Tiểu học Lê Mao', color: '#ec4899', borderColor: '#db2777', x: 650, y: 450, w: 290, h: 210, radius: 160, icon: '🌸', type: 'school', prefPrice: '20k', parkX: 720, parkY: 580, parkW: 140, parkH: 90 },
            { id: 'school_dangthaimai', name: 'THCS Đặng Thai Mai', color: '#3b82f6', borderColor: '#1d4ed8', x: 1850, y: 450, w: 290, h: 210, radius: 160, icon: '📚', type: 'school', prefPrice: '20k-22k', parkX: 1920, parkY: 580, parkW: 140, parkH: 90 },
            { id: 'school_huynhthuckhang', name: 'THPT Huỳnh Thúc Kháng', color: '#8b5cf6', borderColor: '#6d28d9', x: 3050, y: 450, w: 290, h: 210, radius: 160, icon: '🎓', type: 'school', prefPrice: '22k', parkX: 3120, parkY: 580, parkW: 140, parkH: 90 },
            { id: 'university_vinh', name: 'Đại Học Vinh', color: '#06b6d4', borderColor: '#0891b2', x: 700, y: 1350, w: 320, h: 230, radius: 170, icon: '🏛️', type: 'school', prefPrice: 'all', parkX: 780, parkY: 1500, parkW: 140, parkH: 90 },
            { id: 'office_lenin', name: 'Khu VP Đại Lộ Lê Nin', color: '#475569', borderColor: '#334155', x: 2100, y: 1350, w: 300, h: 230, radius: 160, icon: '🏢', type: 'office', prefPrice: '22k-25k', parkX: 2180, parkY: 1500, parkW: 140, parkH: 90 },
            { id: 'square_songlam', name: 'Quảng Trường Sông Lam', color: '#f59e0b', borderColor: '#d97706', x: 3200, y: 1350, w: 310, h: 230, radius: 160, icon: '🚶‍♂️', type: 'walking_street', prefPrice: '25k', parkX: 3280, parkY: 1500, parkW: 140, parkH: 90 }
        ]
    },
    branch_hanoi: {
        id: 'branch_hanoi',
        name: 'TP. Hà Nội',
        subtitle: 'Thủ Đô Nghìn Năm Văn Hiến',
        grassColor: '#bbf7d0',
        gridColor: '#86efac',
        centerLandmark: 'hanoi_hoguom', // Hồ Gươm Xanh Ngọc
        kitchen: { name: 'Xưởng Bếp Hà Nội', x: 450, y: 2350, w: 260, h: 220, radius: 160 },
        market: { name: 'Chợ Đồng Xuân', x: 3200, y: 2350, w: 280, h: 220, radius: 160 },
        spots: [
            { id: 'school_thanglong', name: 'Tiểu học Thăng Long', color: '#ec4899', borderColor: '#db2777', x: 650, y: 450, w: 290, h: 210, radius: 160, icon: '🌸', type: 'school', prefPrice: '20k', parkX: 720, parkY: 580, parkW: 140, parkH: 90 },
            { id: 'school_trungvuong', name: 'THCS Trưng Vương', color: '#3b82f6', borderColor: '#1d4ed8', x: 1850, y: 450, w: 290, h: 210, radius: 160, icon: '📚', type: 'school', prefPrice: '20k-22k', parkX: 1920, parkY: 580, parkW: 140, parkH: 90 },
            { id: 'school_chuvanan', name: 'THPT Chu Văn An', color: '#8b5cf6', borderColor: '#6d28d9', x: 3050, y: 450, w: 290, h: 210, radius: 160, icon: '🎓', type: 'school', prefPrice: '22k', parkX: 3120, parkY: 580, parkW: 140, parkH: 90 },
            { id: 'university_dhqghn', name: 'Đại Học Quốc Gia', color: '#06b6d4', borderColor: '#0891b2', x: 700, y: 1350, w: 320, h: 230, radius: 170, icon: '🏛️', type: 'school', prefPrice: 'all', parkX: 780, parkY: 1500, parkW: 140, parkH: 90 },
            { id: 'office_caugiay', name: 'Khu VP Cầu Giấy', color: '#475569', borderColor: '#334155', x: 2100, y: 1350, w: 300, h: 230, radius: 160, icon: '🏢', type: 'office', prefPrice: '22k-25k', parkX: 2180, parkY: 1500, parkW: 140, parkH: 90 },
            { id: 'walking_street_hoguom', name: 'Phố Đi Bộ Hồ Gươm', color: '#f59e0b', borderColor: '#d97706', x: 3200, y: 1350, w: 310, h: 230, radius: 160, icon: '🚶‍♂️', type: 'walking_street', prefPrice: '25k', parkX: 3280, parkY: 1500, parkW: 140, parkH: 90 }
        ]
    }
};

export class World {
    constructor() {
        this.width = 4000;
        this.height = 3200;

        this.currentCityId = 'branch_hcm';
        this.cityName = 'TP. Hồ Chí Minh';
        this.currentCityLevel = 1;

        this.validSellingSpots = [];
        this.regions = [];
        this.roads = [];
        this.trees = [];
        this.streetLights = [];
        this.trafficVehicles = [];
        this.competitorCarts = [];

        // Logo thương hiệu cho Xưởng Bếp
        this.logoImg = new Image();
        this.logoLoaded = false;
        this.logoImg.onload = () => {
            this.logoLoaded = true;
        };
        this.logoImg.onerror = () => {
            this.logoLoaded = false;
        };
        this.logoImg.src = 'assets/Bản sao logo.JPG';

        // Nạp cấu hình thành phố ban đầu
        this.loadCity(this.currentCityId, 1);
    }

    // Nạp bản đồ thành phố độc lập & cập nhật hạ tầng đô thị hóa (Level 1 -> Level 5)
    loadCity(cityId = 'branch_hcm', cityLevel = 1) {
        const cityCfg = CITY_DATA[cityId] || CITY_DATA.branch_hcm;
        this.currentCityId = cityCfg.id;
        this.cityName = cityCfg.name;
        this.currentCityLevel = Math.max(1, Math.min(10, Number(cityLevel) || 1));
        this.centerLandmark = cityCfg.centerLandmark;
        this.grassColor = cityCfg.grassColor || '#bbf7d0';
        this.soilColor = cityCfg.soilColor || null;
        this.gridColor = cityCfg.gridColor || '#86efac';

        // Xác định số điểm bán mở khóa theo cấp độ đô thị hóa: Cấp 1 -> 2; Cấp 2-3 -> 4; Cấp 4-5 -> 6
        const unlockedCount = state.getUnlockedSellingSpotsCount
            ? state.getUnlockedSellingSpotsCount(cityCfg.id)
            : (this.currentCityLevel <= 1 ? 2 : (this.currentCityLevel <= 3 ? 4 : 6));

        // 1. Thiết lập Xưởng Bếp & Chợ độc lập của từng tỉnh
        this.regions = [
            {
                id: 'kitchen',
                name: cityCfg.kitchen.name,
                color: '#f97316',
                borderColor: '#ea580c',
                x: cityCfg.kitchen.x,
                y: cityCfg.kitchen.y,
                w: cityCfg.kitchen.w,
                h: cityCfg.kitchen.h,
                radius: cityCfg.kitchen.radius,
                icon: '🏠',
                type: 'kitchen',
                isLocked: false
            },
            {
                id: 'market',
                name: cityCfg.market.name,
                color: '#16a34a',
                borderColor: '#15803d',
                x: cityCfg.market.x,
                y: cityCfg.market.y,
                w: cityCfg.market.w,
                h: cityCfg.market.h,
                radius: cityCfg.market.radius,
                icon: '🏪',
                type: 'market',
                isLocked: false
            }
        ];

        this.validSellingSpots = [];

        // 2. Nạp 6 điểm bán theo trạng thái mở khóa đô thị hóa
        cityCfg.spots.forEach((sp, idx) => {
            const isUnlocked = idx < unlockedCount;
            const unlockReq = idx < 4 ? 'Cần Chi Nhánh Cấp 2' : 'Cần Chi Nhánh Cấp 4';

            this.regions.push({
                ...sp,
                isLocked: !isUnlocked,
                unlockRequirement: unlockReq
            });

            this.validSellingSpots.push({
                id: `spot_${sp.id}`,
                name: `Ô Vạch Xanh ${sp.name}`,
                regionId: sp.id,
                x: sp.parkX,
                y: sp.parkY,
                w: sp.parkW,
                h: sp.parkH,
                isLocked: !isUnlocked,
                unlockRequirement: unlockReq
            });
        });

        // 3. Hạ tầng đường xá: Level 1 (đường 2 làn 110px), Level 2-3 (đường 4 làn 140px), Level 4-5 (đại lộ hiện đại 160px)
        const roadW = this.currentCityLevel <= 1 ? 110 : (this.currentCityLevel <= 3 ? 140 : 160);
        this.roads = [
            { x: 0, y: 820, w: this.width, h: roadW, isH: true },
            { x: 0, y: 1780, w: this.width, h: roadW, isH: true },
            { x: 0, y: 2740, w: this.width, h: roadW, isH: true },
            { x: 1350, y: 0, w: roadW, h: this.height, isH: false },
            { x: 2650, y: 0, w: roadW, h: this.height, isH: false }
        ];

        // 4. Khởi tạo cây xanh, đèn đường, xe cộ giao thông và xe đối thủ cạnh tranh
        this.generateTrees();
        this.generateStreetLights();
        this.initTraffic();
        this.initCompetitors(cityCfg);
    }

    generateTrees() {
        const treeCoords = [
            // Quanh các điểm trường học
            { x: 500, y: 400 }, { x: 580, y: 480 }, { x: 980, y: 420 }, { x: 1060, y: 520 },
            { x: 1700, y: 400 }, { x: 2180, y: 420 }, { x: 2900, y: 400 }, { x: 3380, y: 420 },
            // Quanh Làng Đại Học & Công Viên Trung Tâm
            { x: 560, y: 1300 }, { x: 1060, y: 1320 }, { x: 1120, y: 1420 }, { x: 620, y: 1620 },
            { x: 1600, y: 1200 }, { x: 1750, y: 1300 }, { x: 1650, y: 1450 }, { x: 1800, y: 1550 },
            // Quanh Phố Đi Bộ & Quận 1
            { x: 2450, y: 1300 }, { x: 2520, y: 1450 }, { x: 3550, y: 1320 }, { x: 3620, y: 1480 },
            // Quanh Xưởng Bếp & Chợ Đầu Mối
            { x: 320, y: 2300 }, { x: 760, y: 2320 }, { x: 400, y: 2620 },
            { x: 3080, y: 2300 }, { x: 3520, y: 2320 }, { x: 3120, y: 2620 }, { x: 3560, y: 2620 }
        ];

        this.trees = treeCoords;
    }

    generateStreetLights() {
        this.streetLights = [];
        // Đèn dọc theo vỉa hè các trục đại lộ ngang
        [820, 1780, 2740].forEach(roadY => {
            for (let x = 80; x < this.width; x += 320) {
                if ((x >= 1260 && x <= 1600) || (x >= 2560 && x <= 2900)) continue;
                this.streetLights.push({ x: x, y: roadY - 14 });
                this.streetLights.push({ x: x + 160, y: roadY + 160 + 14 });
            }
        });
        // Đèn dọc theo vỉa hè các trục đại lộ dọc
        [1350, 2650].forEach(roadX => {
            for (let y = 100; y < this.height; y += 320) {
                if ((y >= 730 && y <= 1070) || (y >= 1690 && y <= 2030) || (y >= 2650 && y <= 2990)) continue;
                this.streetLights.push({ x: roadX - 14, y: y });
                this.streetLights.push({ x: roadX + 160 + 14, y: y + 160 });
            }
        });
    }

    // Kiểm tra xem vị trí người chơi có nằm trong Ô Vạch Xanh Lá hợp lệ không (+20px biên độ an toàn, loại trừ các điểm đang khóa)
    isInValidSellingSpot(px, py) {
        // 1. Kiểm tra nhanh qua Single Source of Truth duy nhất (có sẵn +20px margin an toàn)
        const matchedZone = isInsideLegalZone(px, py, this.currentCityId);
        if (matchedZone) {
            // Kiểm tra trạng thái khóa của điểm bán tại thành phố hiện tại
            if (Array.isArray(this.validSellingSpots)) {
                const liveSpot = this.validSellingSpots.find(s => s.id === matchedZone.id || s.regionId === matchedZone.regionId);
                if (liveSpot && liveSpot.isLocked) return null;
                return liveSpot || matchedZone;
            }
            return matchedZone;
        }

        // 2. Fallback duyệt mảng validSellingSpots với biên độ an toàn +20px
        if (!Array.isArray(this.validSellingSpots)) return null;
        const margin = 20;
        for (const spot of this.validSellingSpots) {
            if (!spot.isLocked &&
                px >= (spot.x - margin) && px <= (spot.x + spot.w + margin) &&
                py >= (spot.y - margin) && py <= (spot.y + spot.h + margin)) {
                return spot;
            }
        }
        return null;
    }

    initTraffic() {
        // Khởi tạo 14 xe cộ giao thông AI đa dạng (Xe hơi, Taxi, Bus, Xe máy)
        const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#e11d48', '#0284c7'];
        const types = ['car', 'taxi', 'bus', 'scooter'];

        // Xe chạy trên đường ngang 1 (y = 820)
        this.trafficVehicles.push(
            { x: 300, y: 845, w: 48, h: 26, speed: 2.8, dirX: 1, dirY: 0, color: '#f59e0b', type: 'taxi' },
            { x: 1600, y: 845, w: 70, h: 32, speed: 2.2, dirX: 1, dirY: 0, color: '#3b82f6', type: 'bus' },
            { x: 2800, y: 915, w: 46, h: 24, speed: -3.2, dirX: -1, dirY: 0, color: '#ef4444', type: 'car' },
            { x: 1100, y: 915, w: 44, h: 24, speed: -2.9, dirX: -1, dirY: 0, color: '#10b981', type: 'car' }
        );

        // Xe chạy trên đường ngang 2 (y = 1780)
        this.trafficVehicles.push(
            { x: 500, y: 1805, w: 48, h: 26, speed: 3.0, dirX: 1, dirY: 0, color: '#6366f1', type: 'car' },
            { x: 2200, y: 1805, w: 46, h: 24, speed: 3.3, dirX: 1, dirY: 0, color: '#f59e0b', type: 'taxi' },
            { x: 3400, y: 1875, w: 72, h: 32, speed: -2.0, dirX: -1, dirY: 0, color: '#0284c7', type: 'bus' },
            { x: 1500, y: 1875, w: 46, h: 24, speed: -3.1, dirX: -1, dirY: 0, color: '#e11d48', type: 'car' }
        );

        // Xe chạy trên đường ngang 3 (y = 2740)
        this.trafficVehicles.push(
            { x: 800, y: 2765, w: 48, h: 26, speed: 2.7, dirX: 1, dirY: 0, color: '#10b981', type: 'car' },
            { x: 2600, y: 2835, w: 48, h: 26, speed: -2.8, dirX: -1, dirY: 0, color: '#f59e0b', type: 'taxi' }
        );

        // Xe chạy trên đường dọc 1 (x = 1350)
        this.trafficVehicles.push(
            { x: 1375, y: 400, w: 26, h: 48, speed: 2.8, dirX: 0, dirY: 1, color: '#3b82f6', type: 'car' },
            { x: 1445, y: 2200, w: 26, h: 48, speed: -3.0, dirX: 0, dirY: -1, color: '#ef4444', type: 'car' }
        );

        // Xe chạy trên đường dọc 2 (x = 2650)
        this.trafficVehicles.push(
            { x: 2675, y: 600, w: 30, h: 68, speed: 2.2, dirX: 0, dirY: 1, color: '#0284c7', type: 'bus' },
            { x: 2745, y: 2500, w: 26, h: 48, speed: -3.2, dirX: 0, dirY: -1, color: '#f59e0b', type: 'taxi' }
        );
    }

    // Khởi tạo 1-2 xe hàng đối thủ (AI) di chuyển và đỗ gần cổng trường/văn phòng
    initCompetitors(cityCfg) {
        this.competitorCarts = [];
        const spot1 = (cityCfg && cityCfg.spots && cityCfg.spots[0]) || null;
        const spot2 = (cityCfg && cityCfg.spots && cityCfg.spots[1]) || null;

        this.competitorCarts.push({
            id: 'comp_1',
            name: 'Xe Cơm Nắm Shin (Đối Thủ AI)',
            x: spot1 ? spot1.parkX + 75 : 680,
            y: spot1 ? spot1.parkY + 25 : 880,
            w: 44,
            h: 34,
            targetSpot: spot1,
            color: '#ec4899',
            awningColor: '#be185d',
            speed: 0.8
        });

        this.competitorCarts.push({
            id: 'comp_2',
            name: 'Tokyo Rice Express (Đối Thủ AI)',
            x: spot2 ? spot2.parkX + 75 : 1780,
            y: spot2 ? spot2.parkY + 25 : 1280,
            w: 44,
            h: 34,
            targetSpot: spot2,
            color: '#8b5cf6',
            awningColor: '#6d28d9',
            speed: 0.9
        });
    }

    // Cập nhật di chuyển & va chạm xe cộ giao thông tự động
    updateTraffic(player, dt = 0.016) {
        // Cập nhật hiệu ứng thời tiết, khói cơm & hạt 3D
        try {
            city3D.update(dt, state.getTimePeriodInfo ? state.getTimePeriodInfo() : {});
        } catch (e) {}

        // Cập nhật vị trí xe đối thủ AI quanh các điểm bán nóng
        if (Array.isArray(this.competitorCarts)) {
            this.competitorCarts.forEach(c => {
                if (c.targetSpot) {
                    const targetX = c.targetSpot.parkX + 75;
                    const targetY = c.targetSpot.parkY + 25;
                    c.x += (targetX - c.x) * 0.02;
                    c.y += (targetY - c.y) * 0.02;
                }
            });
        }
        for (const v of this.trafficVehicles) {
            // Di chuyển xe
            v.x += v.speed * (v.dirX !== 0 ? 1 : 0);
            v.y += v.speed * (v.dirY !== 0 ? 1 : 0);

            // Giữ xe AI chạy tuần hoàn trong lòng đường nhựa, không bao giờ leo lề
            if (v.dirX > 0 && v.x > this.width + 100) v.x = -100;
            if (v.dirX < 0 && v.x < -100) v.x = this.width + 100;
            if (v.dirY > 0 && v.y > this.height + 100) v.y = -100;
            if (v.dirY < 0 && v.y < -100) v.y = this.height + 100;

            // Kiểm tra va chạm nhẹ với người chơi (Soft Pushback Collision)
            if (player) {
                const px = player.x;
                const py = player.y;
                const vx = v.x;
                const vy = v.y;
                const vw = v.w;
                const vh = v.h;

                // Hitbox mở rộng kiểm tra
                if (
                    px >= vx - 18 && px <= vx + vw + 18 &&
                    py >= vy - 18 && py <= vy + vh + 18
                ) {
                    // Đẩy nhân vật lùi lại theo hướng va chạm, không đi xuyên qua xe
                    if (v.dirX !== 0) {
                        const pushDir = v.dirX > 0 ? 1 : -1;
                        player.x += pushDir * 8;
                        player.y += (py > vy + vh / 2 ? 8 : -8);
                    } else if (v.dirY !== 0) {
                        const pushDir = v.dirY > 0 ? 1 : -1;
                        player.y += pushDir * 8;
                        player.x += (px > vx + vw / 2 ? 8 : -8);
                    }
                }
            }
        }
    }

    render(ctx, camera) {
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        // 1. Nền cỏ đô thị rộng lớn
        ctx.fillStyle = this.grassColor || '#bbf7d0';
        ctx.fillRect(0, 0, this.width, this.height);

        // Vạt đất đỏ bazan vùng ven đặc trưng (Đắk Lắk)
        if (this.soilColor) {
            ctx.fillStyle = this.soilColor;
            ctx.fillRect(0, 0, 350, this.height);
            ctx.fillRect(this.width - 350, 0, 350, this.height);
        }

        // Grid nhẹ tạo chiều sâu quy hoạch
        ctx.strokeStyle = this.gridColor || '#86efac';
        ctx.lineWidth = 1;
        for (let x = 0; x <= this.width; x += 120) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = 0; y <= this.height; y += 120) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }

        // 2. Mạng lưới đường đại lộ & Vỉa hè
        this.roads.forEach(r => {
            // Vỉa hè gạch sáng (rộng 24px mỗi bên)
            ctx.fillStyle = '#cbd5e1';
            if (r.isH) {
                ctx.fillRect(r.x, r.y - 24, r.w, r.h + 48);
            } else {
                ctx.fillRect(r.x - 24, r.y, r.w + 48, r.h);
            }

            // Lòng đường nhựa xám than
            ctx.fillStyle = '#334155';
            ctx.fillRect(r.x, r.y, r.w, r.h);

            // Dải phân cách / Vạch kẻ tim đường trắng đứt quãng
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 4;
            ctx.setLineDash([28, 20]);
            ctx.beginPath();
            if (r.isH) {
                ctx.moveTo(r.x, r.y + r.h / 2);
                ctx.lineTo(r.x + r.w, r.y + r.h / 2);
            } else {
                ctx.moveTo(r.x + r.w / 2, r.y);
                ctx.lineTo(r.x + r.w / 2, r.y + r.h);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // 2b. Vẽ các Ô Vạch Xanh Lá (Khu vực bán hàng hợp lệ trên vỉa hè)
        const pulseGreen = Math.sin(Date.now() / 250) * 0.08 + 0.18;
        this.validSellingSpots.forEach(spot => {
            if (spot.isLocked) {
                // Điểm bán đang bị khóa do chưa đủ cấp độ chi nhánh
                ctx.fillStyle = 'rgba(71, 85, 105, 0.25)';
                ctx.fillRect(spot.x, spot.y, spot.w, spot.h);

                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 6]);
                ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);
                ctx.setLineDash([]);

                ctx.fillStyle = '#94a3b8';
                ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🔒 ĐIỂM BÁN KHÓA', spot.x + spot.w / 2, spot.y + spot.h / 2 - 8);
                ctx.font = '9px "Be Vietnam Pro", sans-serif';
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(spot.unlockRequirement || 'Nâng cấp chi nhánh', spot.x + spot.w / 2, spot.y + spot.h / 2 + 8);
                return;
            }

            // Nâng cấp Vùng Chiếu Hologram Công Nghệ Xanh Ngọc Cyber cho các Ô Vạch Xanh đã mở
            if (city3D && typeof city3D.renderCyberHologramZone === 'function') {
                city3D.renderCyberHologramZone(ctx, spot);
            } else {
                // Fallback truyền thống
                ctx.fillStyle = `rgba(34, 197, 94, ${pulseGreen})`;
                ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 3;
                ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);
            }

            // Dựng Tượng Linh Vật Cơm Nắm 3D Hologram Vàng Óng Ánh & Bảng Tên Chủ Tịch Khu Vực
            if (city3D && typeof city3D.renderTerritoryGoldenStatue === 'function') {
                const rulerInfo = (network && typeof network.getTerritoryInfo === 'function')
                    ? network.getTerritoryInfo(spot.id || spot.regionId)
                    : null;
                city3D.renderTerritoryGoldenStatue(ctx, spot, rulerInfo);
            }
        });

        // 3. Xe cộ giao thông AI chạy trên đường
        this.trafficVehicles.forEach(v => {
            // Bóng xe
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fillRect(v.x + 4, v.y + 4, v.w, v.h);

            // Thân xe
            ctx.fillStyle = v.color;
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(v.x, v.y, v.w, v.h, 6);
            } else {
                ctx.rect(v.x, v.y, v.w, v.h);
            }
            ctx.fill();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Kính chắn gió
            ctx.fillStyle = '#94a3b8';
            if (v.dirX !== 0) {
                const windX = v.dirX > 0 ? v.x + v.w - 14 : v.x + 4;
                ctx.fillRect(windX, v.y + 3, 10, v.h - 6);
                // Đèn trước
                ctx.fillStyle = '#fef08a';
                const lightX = v.dirX > 0 ? v.x + v.w - 3 : v.x;
                ctx.fillRect(lightX, v.y + 2, 3, 4);
                ctx.fillRect(lightX, v.y + v.h - 6, 3, 4);
            } else {
                const windY = v.dirY > 0 ? v.y + v.h - 14 : v.y + 4;
                ctx.fillRect(v.x + 3, windY, v.w - 6, 10);
                // Đèn trước
                ctx.fillStyle = '#fef08a';
                const lightY = v.dirY > 0 ? v.y + v.h - 3 : v.y;
                ctx.fillRect(v.x + 2, lightY, 4, 3);
                ctx.fillRect(v.x + v.w - 6, lightY, 4, 3);
            }
        });

        // 3b. Xe hàng cơm nắm đối thủ (AI Competitors ngoài phố)
        if (Array.isArray(this.competitorCarts)) {
            this.competitorCarts.forEach(c => {
                // Bóng xe đối thủ
                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.beginPath();
                ctx.ellipse(c.x + c.w / 2, c.y + c.h - 2, c.w / 2, 7, 0, 0, Math.PI * 2);
                ctx.fill();

                // Thân quầy xe đối thủ
                ctx.fillStyle = c.color;
                ctx.fillRect(c.x, c.y + 10, c.w, c.h - 10);
                ctx.strokeStyle = '#0f172a';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(c.x, c.y + 10, c.w, c.h - 10);

                // Mái che kẻ sọc quầy đối thủ
                ctx.fillStyle = c.awningColor;
                ctx.fillRect(c.x - 4, c.y, c.w + 8, 12);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(c.x + 6, c.y, 8, 12);
                ctx.fillRect(c.x + 22, c.y, 8, 12);

                // Bánh xe
                ctx.fillStyle = '#334155';
                ctx.beginPath();
                ctx.arc(c.x + 8, c.y + c.h - 2, 5, 0, Math.PI * 2);
                ctx.arc(c.x + c.w - 8, c.y + c.h - 2, 5, 0, Math.PI * 2);
                ctx.fill();

                // Biển hiệu "⚡ ĐỐI THỦ"
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⚡ ĐỐI THỦ', c.x + c.w / 2, c.y - 4);
            });
        }

        // 4. Cây xanh vỉa hè & Công viên
        this.trees.forEach(t => {
            // Bóng râm
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.beginPath();
            ctx.ellipse(t.x + 6, t.y + 8, 22, 11, 0, 0, Math.PI * 2);
            ctx.fill();

            // Thân cây
            ctx.fillStyle = '#78350f';
            ctx.fillRect(t.x - 4, t.y, 8, 16);

            // Tán cây xanh
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(t.x, t.y - 12, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(t.x - 5, t.y - 16, 17, 0, Math.PI * 2);
            ctx.fill();
        });

        // 5. Vẽ Biểu tượng Danh thắng Đặc trưng của từng Thành phố tại Trung tâm
        this.renderCityLandmark(ctx);

        // 6. Vẽ Biển quảng cáo LED hiện đại dọc Đại lộ nếu đạt Đô thị hóa Cấp 4-5
        if (this.currentCityLevel >= 4) {
            this.renderUrbanBillboards(ctx);
        }

        // 7. Vẽ 8 Khu vực đô thị trên bản đồ (Trường học, Công sở, Phố đi bộ, Chợ, Bếp)
        const pulse = Math.sin(Date.now() / 300) * 6;
        this.regions.forEach(reg => {
            const centerX = reg.x + reg.w / 2;
            const centerY = reg.y + reg.h / 2;

            if (reg.isLocked) {
                // Tòa nhà chưa mở khóa: hiển thị mờ với ký hiệu khóa và yêu cầu nâng cấp
                ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
                ctx.fillRect(reg.x, reg.y, reg.w, reg.h);
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 6]);
                ctx.strokeRect(reg.x, reg.y, reg.w, reg.h);
                ctx.setLineDash([]);

                // Biểu tượng ổ khóa và nhãn yêu cầu cấp
                ctx.fillStyle = '#f87171';
                ctx.font = 'bold 22px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🔒', centerX, centerY - 14);

                ctx.fillStyle = '#e2e8f0';
                ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
                ctx.fillText(reg.name.toUpperCase(), centerX, centerY + 12);
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
                ctx.fillText(`(${reg.unlockRequirement || 'Cần Nâng Cấp Chi Nhánh'})`, centerX, centerY + 30);
                return;
            }

            // Vòng hào quang tương tác phát sáng pulsing
            ctx.beginPath();
            ctx.arc(centerX, centerY, reg.radius + pulse, 0, Math.PI * 2);
            ctx.fillStyle = reg.color + '22';
            ctx.fill();
            ctx.strokeStyle = reg.color;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Bóng tòa nhà
            ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
            ctx.fillRect(reg.x + 12, reg.y + 12, reg.w, reg.h);

            // Khối nhà chính
            ctx.fillStyle = reg.color;
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(reg.x, reg.y, reg.w, reg.h, 14);
            } else {
                ctx.rect(reg.x, reg.y, reg.w, reg.h);
            }
            ctx.fill();
            ctx.strokeStyle = reg.borderColor;
            ctx.lineWidth = 5;
            ctx.stroke();

            // Sân mái trong
            ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(reg.x + 12, reg.y + 12, reg.w - 24, reg.h - 24, 8);
            } else {
                ctx.rect(reg.x + 12, reg.y + 12, reg.w - 24, reg.h - 24);
            }
            ctx.fill();

            // BIỂN TÊN KHU VỰC RÕ RÀNG TRÊN MÁI NHÀ
            const isKitchen = (reg.id === 'kitchen');
            const signW = Math.min(reg.w - 30, 240);
            const signH = 50;

            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(centerX - signW / 2, centerY - signH / 2, signW, signH, 10);
            } else {
                ctx.rect(centerX - signW / 2, centerY - signH / 2, signW, signH);
            }
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            if (isKitchen && this.logoLoaded && this.logoImg.naturalWidth > 0) {
                const logoSize = 34;
                const logoX = centerX - signW / 2 + 10;
                const logoY = centerY - logoSize / 2;

                ctx.save();
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(logoX, logoY, logoSize, logoSize, 6);
                } else {
                    ctx.rect(logoX, logoY, logoSize, logoSize);
                }
                ctx.clip();
                ctx.drawImage(this.logoImg, logoX, logoY, logoSize, logoSize);
                ctx.restore();

                ctx.strokeStyle = '#f97316';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(logoX, logoY, logoSize, logoSize);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 15px "Be Vietnam Pro", sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(reg.name.toUpperCase(), logoX + logoSize + 10, centerY);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px "Be Vietnam Pro", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${reg.icon} ${reg.name.toUpperCase()}`, centerX, centerY);
            }
        });

        // 6. Hệ thống Đèn đường đô thị & Quầng sáng ban đêm (18:00 - 05:30)
        const timeInfo = state.getTimePeriodInfo();
        const isNight = timeInfo && timeInfo.isNight;
        if (Array.isArray(this.streetLights)) {
            this.streetLights.forEach(light => {
                // Thân cột đèn
                ctx.fillStyle = '#475569';
                ctx.fillRect(light.x - 3, light.y - 12, 6, 12);
                ctx.fillStyle = '#cbd5e1';
                ctx.beginPath();
                ctx.arc(light.x, light.y - 12, 4, 0, Math.PI * 2);
                ctx.fill();

                // Ban đêm tỏa quầng sáng vàng ấm áp
                if (isNight) {
                    const glowGrad = ctx.createRadialGradient(light.x, light.y, 4, light.x, light.y, 75);
                    glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
                    glowGrad.addColorStop(0.4, 'rgba(253, 224, 71, 0.18)');
                    glowGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
                    ctx.fillStyle = glowGrad;
                    ctx.beginPath();
                    ctx.arc(light.x, light.y, 75, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        // 7. Lớp phủ Ánh sáng Chiều / Tối nhẹ lên bản đồ khi trời chuyển tối (18:00 - 05:30)
        if (isNight) {
            const mins = timeInfo.minutes;
            let nightAlpha = 0.38;
            if (mins >= 1080 && mins < 1170) { // 18:00 - 19:30: Hoàng hôn / chập tối
                nightAlpha = 0.15 + ((mins - 1080) / 90) * 0.23;
            } else if (mins >= 1170 || mins < 270) { // 19:30 - 04:30: Tối đêm sâu
                nightAlpha = 0.38;
            } else if (mins >= 270 && mins < 330) { // 04:30 - 05:30: Bình minh le lói
                nightAlpha = 0.38 * (1 - (mins - 270) / 60);
            }

            if (nightAlpha > 0.01) {
                ctx.fillStyle = `rgba(15, 23, 42, ${nightAlpha.toFixed(3)})`;
                ctx.fillRect(0, 0, this.width, this.height);
            }
        }

        // 8. Vẽ Đại Cảnh 3D Phong Cách Hóa TP.HCM (Chợ Bến Thành, Nguyễn Huệ, Bitexco, Landmark 81, Xưởng ISO, Mưa)
        if (this.currentCityId === 'branch_hcm') {
            try {
                city3D.renderStylizedSaigon(ctx, camera, timeInfo);
            } catch (err3D) {
                // An toàn tuyệt đối
            }
        }

        ctx.restore();
    }

    // Vẽ Biểu tượng danh thắng đặc trưng của từng thành phố tại trung tâm bản đồ
    renderCityLandmark(ctx) {
        const cx = 2000;
        const cy = 1300;

        ctx.save();

        if (this.currentCityId === 'branch_daklak') {
            // TƯỢNG ĐÀI NGÃ SÁU BAN MÊ (ĐẮK LẮK)
            // Vòng xoay đất đỏ Bazan
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.arc(cx, cy, 140, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#7f1d1d';
            ctx.lineWidth = 6;
            ctx.stroke();

            // Thảm cỏ trung tâm vòng xoay
            ctx.fillStyle = '#166534';
            ctx.beginPath();
            ctx.arc(cx, cy, 110, 0, Math.PI * 2);
            ctx.fill();

            // Các bụi cây cà phê trĩu quả đỏ quanh vòng xoay
            const coffeeAngles = [0, 60, 120, 180, 240, 300];
            coffeeAngles.forEach(deg => {
                const rad = (deg * Math.PI) / 180;
                const fx = cx + Math.cos(rad) * 85;
                const fy = cy + Math.sin(rad) * 85;
                // Tán lá cà phê
                ctx.fillStyle = '#14532d';
                ctx.beginPath();
                ctx.arc(fx, fy, 14, 0, Math.PI * 2);
                ctx.fill();
                // Hạt cà phê chín đỏ
                ctx.fillStyle = '#dc2626';
                ctx.beginPath();
                ctx.arc(fx - 4, fy - 3, 3, 0, Math.PI * 2);
                ctx.arc(fx + 3, fy + 4, 3, 0, Math.PI * 2);
                ctx.arc(fx + 4, fy - 3, 2.5, 0, Math.PI * 2);
                ctx.fill();
            });

            // Bệ tượng đài đá vững chắc
            ctx.fillStyle = '#334155';
            ctx.fillRect(cx - 36, cy - 20, 72, 40);
            ctx.fillStyle = '#475569';
            ctx.fillRect(cx - 28, cy - 35, 56, 18);

            // Cột tháp Tượng đài Ngã Sáu vút cao
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.moveTo(cx - 14, cy - 35);
            ctx.lineTo(cx, cy - 105);
            ctx.lineTo(cx + 14, cy - 35);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Ngôi sao vàng trên đỉnh tượng đài
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⭐', cx, cy - 110);

            // Tấm bảng tên Danh thắng
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(cx - 100, cy + 28, 200, 26);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(cx - 100, cy + 28, 200, 26);
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
            ctx.fillText('★ NGÃ SÁU BAN MÊ ★', cx, cy + 41);

        } else if (this.currentCityId === 'branch_vinh') {
            // QUẢNG TRƯỜNG HỒ CHÍ MINH (TP. VINH - NGHỆ AN)
            // Quảng trường đá hoa cương rộng lớn
            ctx.fillStyle = '#334155';
            ctx.fillRect(cx - 170, cy - 110, 340, 220);
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 4;
            ctx.strokeRect(cx - 170, cy - 110, 340, 220);

            // Ô hoa văn đá đỏ
            ctx.fillStyle = '#7f1d1d';
            ctx.fillRect(cx - 150, cy - 90, 300, 180);

            // Hồ sen 2 bên quảng trường
            [-110, 110].forEach(ox => {
                ctx.fillStyle = '#0f766e';
                ctx.beginPath();
                ctx.arc(cx + ox, cy + 10, 32, 0, Math.PI * 2);
                ctx.fill();
                // Lá sen
                ctx.fillStyle = '#10b981';
                ctx.beginPath();
                ctx.arc(cx + ox - 8, cy + 6, 12, 0, Math.PI * 2);
                ctx.arc(cx + ox + 10, cy + 14, 10, 0, Math.PI * 2);
                ctx.fill();
                // Hoa sen hồng
                ctx.fillStyle = '#f472b6';
                ctx.font = '14px sans-serif';
                ctx.fillText('🪷', cx + ox, cy + 10);
            });

            // Cột cờ Tổ quốc trang trọng ở trung tâm
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(cx - 3, cy - 80, 6, 75);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(cx + 3, cy - 80, 34, 22);
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', cx + 20, cy - 69);

            // Băng rôn đỏ Quảng Trường
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(cx - 130, cy + 65, 260, 28);
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - 130, cy + 65, 260, 28);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
            ctx.fillText('QUẢNG TRƯỜNG HỒ CHÍ MINH', cx, cy + 79);

        } else if (this.currentCityId === 'branch_hanoi') {
            // HỒ GƯƠM & THÁP RÙA & CẦU THÊ HÚC (HÀ NỘI)
            // Hồ Gươm nước xanh ngọc bích
            ctx.fillStyle = '#0d9488';
            ctx.beginPath();
            ctx.ellipse(cx, cy, 190, 125, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#115e59';
            ctx.lineWidth = 6;
            ctx.stroke();

            // Gợn sóng lăn tăn nhẹ trên mặt hồ
            ctx.strokeStyle = '#5eead4';
            ctx.lineWidth = 1.5;
            [-80, 0, 80].forEach((ox, i) => {
                ctx.beginPath();
                ctx.arc(cx + ox, cy - 30 + i * 25, 26, 0.2, Math.PI - 0.2);
                ctx.stroke();
            });

            // Đảo Ngọc & Cầu Thê Húc màu đỏ uốn cong
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.ellipse(cx + 105, cy - 25, 38, 26, 0, 0, Math.PI * 2);
            ctx.fill();

            // Cầu Thê Húc đỏ son
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(cx + 175, cy);
            ctx.quadraticCurveTo(cx + 140, cy - 28, cx + 125, cy - 25);
            ctx.stroke();

            // Đảo Rùa & Tháp Rùa cổ kính ở trung tâm hồ
            ctx.fillStyle = '#166534';
            ctx.beginPath();
            ctx.ellipse(cx, cy + 10, 36, 22, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tòa Tháp Rùa đá rêu phong 3 tầng
            ctx.fillStyle = '#78716c';
            ctx.fillRect(cx - 18, cy - 8, 36, 20); // Tầng 1
            ctx.fillStyle = '#a8a29e';
            ctx.fillRect(cx - 13, cy - 22, 26, 14); // Tầng 2
            ctx.fillStyle = '#d6d3d1';
            ctx.fillRect(cx - 8, cy - 32, 16, 10); // Tầng 3
            // Mái chóp cổ
            ctx.fillStyle = '#854d0e';
            ctx.beginPath();
            ctx.moveTo(cx - 10, cy - 32);
            ctx.lineTo(cx, cy - 40);
            ctx.lineTo(cx + 10, cy - 32);
            ctx.closePath();
            ctx.fill();

            // Cửa vòm Tháp Rùa
            ctx.fillStyle = '#292524';
            ctx.fillRect(cx - 4, cy + 2, 8, 10);

            // Rặng liễu rủ ven bờ hồ
            const willowPositions = [
                { x: cx - 160, y: cy - 40 },
                { x: cx - 140, y: cy + 60 },
                { x: cx + 140, y: cy + 60 },
                { x: cx + 160, y: cy - 40 }
            ];
            willowPositions.forEach(w => {
                ctx.fillStyle = '#713f12';
                ctx.fillRect(w.x - 3, w.y, 6, 18);
                ctx.fillStyle = '#15803d';
                ctx.beginPath();
                ctx.arc(w.x, w.y - 4, 16, 0, Math.PI * 2);
                ctx.fill();
                // Nhánh liễu rủ
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2;
                for (let i = -8; i <= 8; i += 4) {
                    ctx.beginPath();
                    ctx.moveTo(w.x + i, w.y - 2);
                    ctx.lineTo(w.x + i * 1.3, w.y + 12);
                    ctx.stroke();
                }
            });

            // Tấm bảng tên Danh thắng Hồ Gươm
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(cx - 110, cy + 90, 220, 26);
            ctx.strokeStyle = '#0d9488';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(cx - 110, cy + 90, 220, 26);
            ctx.fillStyle = '#5eead4';
            ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★ HỒ HOÀN KIẾM (HỒ GƯƠM) ★', cx, cy + 103);

        } else {
            // TP. HỒ CHÍ MINH: CÔNG VIÊN TRUNG TÂM & ĐÀI PHUN NƯỚC
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(cx, cy, 120, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#166534';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Đài phun nước trung tâm
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(cx, cy, 55, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Tia nước phun
            ctx.fillStyle = '#e0f2fe';
            ctx.beginPath();
            ctx.arc(cx, cy, 14, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(cx - 100, cy + 70, 200, 26);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(cx - 100, cy + 70, 200, 26);
            ctx.fillStyle = '#bae6fd';
            ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★ CÔNG VIÊN TRUNG TÂM ★', cx, cy + 83);
        }

        ctx.restore();
    }

    // Vẽ biển quảng cáo LED thương hiệu cao cấp dọc các Đại lộ (khi đạt Đô thị hóa Cấp 4-5)
    renderUrbanBillboards(ctx) {
        const billboards = [
            { x: 1050, y: 730 },
            { x: 2850, y: 730 },
            { x: 1050, y: 1690 },
            { x: 2850, y: 1690 }
        ];

        ctx.save();
        billboards.forEach(b => {
            // Trụ đỡ thép
            ctx.fillStyle = '#475569';
            ctx.fillRect(b.x + 82, b.y + 46, 16, 32);

            // Màn hình LED viền phát sáng Neon
            ctx.fillStyle = '#020617';
            ctx.fillRect(b.x, b.y, 180, 48);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(b.x, b.y, 180, 48);

            // Nội dung hiển thị trên LED
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🍙 ONIGIRI EMPIRE 2D', b.x + 90, b.y + 16);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
            ctx.fillText(`CHI NHÁNH ${this.cityName.toUpperCase()}`, b.x + 90, b.y + 34);
        });
        ctx.restore();
    }

    // Vẽ Bản đồ thu nhỏ Minimap (ở góc trên bên phải màn hình, co giãn linh hoạt theo mobile / tablet)
    drawMinimap(ctx, player, screenWidth, screenHeight) {
        if (!player) return;

        const isMobile = screenWidth <= 600;
        const isTablet = screenWidth > 600 && screenWidth <= 1024;
        const mapW = isMobile ? 120 : (isTablet ? 155 : 190);
        const mapH = isMobile ? 95 : (isTablet ? 120 : 150);
        const posX = screenWidth - mapW - (isMobile ? 12 : 18);

        // [KIẾN TRÚC SƯ UI/SAFE-AREA] Tính posY luôn nằm dưới nhãn Online (Hàng 2) với khoảng cách an toàn >= 10px
        let posY = isMobile ? 94 : 88;
        if (typeof document !== 'undefined') {
            const onlineCard = document.getElementById('hudOnlineCard');
            if (onlineCard && typeof onlineCard.getBoundingClientRect === 'function') {
                const rect = onlineCard.getBoundingClientRect();
                if (rect.bottom > 0) {
                    posY = Math.max(posY, Math.round(rect.bottom + 10));
                }
            }
        }

        // Lưu thông số hình học Minimap để phục vụ kiểm toán và tránh va chạm
        this.minimapBounds = {
            left: posX,
            top: posY,
            right: posX + mapW,
            bottom: posY + mapH,
            width: mapW,
            height: mapH
        };

        const scaleX = mapW / this.width;
        const scaleY = mapH / this.height;

        ctx.save();

        // Khung nền Minimap (Dark Glass viền neon)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(posX, posY, mapW, mapH, 12);
        } else {
            ctx.rect(posX, posY, mapW, mapH);
        }
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Header Minimap
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`📡 MINIMAP • ${(this.cityName || 'TP.HCM').toUpperCase()}`, posX + 10, posY + 14);

        // Vùng bản đồ bên trong
        const innerX = posX + 6;
        const innerY = posY + 20;
        const innerW = mapW - 12;
        const innerH = mapH - 26;

        ctx.save();
        ctx.beginPath();
        ctx.rect(innerX, innerY, innerW, innerH);
        ctx.clip();

        // Nền cỏ mini
        ctx.fillStyle = '#14532d';
        ctx.fillRect(innerX, innerY, innerW, innerH);

        // Vẽ các trục đường mini
        ctx.fillStyle = '#475569';
        this.roads.forEach(r => {
            const rx = innerX + r.x * scaleX;
            const ry = innerY + r.y * scaleY;
            const rw = Math.max(3, r.w * scaleX);
            const rh = Math.max(3, r.h * scaleY);
            ctx.fillRect(rx, ry, rw, rh);
        });

        // Vẽ các Ô Vạch Xanh Lá mini
        ctx.fillStyle = '#22c55e';
        if (Array.isArray(this.validSellingSpots)) {
            this.validSellingSpots.forEach(s => {
                const sx = innerX + s.x * scaleX;
                const sy = innerY + s.y * scaleY;
                const sw = Math.max(3, s.w * scaleX);
                const sh = Math.max(2, s.h * scaleY);
                ctx.fillRect(sx, sy, sw, sh);
            });
        }

        // Vẽ các khu vực mini
        this.regions.forEach(reg => {
            const rx = innerX + reg.x * scaleX;
            const ry = innerY + reg.y * scaleY;
            const rw = Math.max(8, reg.w * scaleX);
            const rh = Math.max(8, reg.h * scaleY);

            ctx.fillStyle = reg.color;
            ctx.fillRect(rx, ry, rw, rh);

            // Icon nhỏ
            ctx.fillStyle = '#ffffff';
            ctx.font = '8px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(reg.icon, rx + rw / 2, ry + rh / 2);
        });

        // Vị trí người chơi (Linh vật Onigiri)
        const playerMiniX = innerX + player.x * scaleX;
        const playerMiniY = innerY + player.y * scaleY;

        // Vòng quét radar nhấp nháy
        const pulseMini = (Date.now() % 1000) / 1000 * 8;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(playerMiniX, playerMiniY, pulseMini + 3, 0, Math.PI * 2);
        ctx.stroke();

        // Điểm chấm linh vật
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(playerMiniX, playerMiniY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        ctx.restore();
    }

    // Kiểm tra nhân vật đứng gần khu vực nào
    getNearbyRegion(px, py) {
        for (const reg of this.regions) {
            const centerX = reg.x + reg.w / 2;
            const centerY = reg.y + reg.h / 2;
            const dx = px - centerX;
            const dy = py - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= reg.radius) {
                return reg;
            }
        }
        return null;
    }
}
