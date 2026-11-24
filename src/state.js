// src/state.js - Trạng thái trò chơi: Tiền, Level, EXP, Kho hàng, Nhiệm vụ, Phương tiện, Sức chứa thùng xe, Chợ Đầu Mối & Tycoon

export const FILLINGS = {
    // === NHÓM 20.000đ (11 VỊ) ===
    crab_egg_mayo: {
        id: 'crab_egg_mayo',
        name: 'Thanh cua trứng mayo',
        icon: '🦀',
        color: '#fb7185',
        desc: 'Thanh cua tươi ngọt quyện xốt mayo và trứng béo ngậy.',
        price: 20000,
        priceGroup: '20k',
        baseExp: 15
    },
    baked_cheese_shrimp: {
        id: 'baked_cheese_shrimp',
        name: 'Tôm phô mai đút lò',
        icon: '🦐',
        color: '#f97316',
        desc: 'Tôm ngọt thịt phủ ngập phô mai đút lò thơm lừng nức mũi.',
        price: 20000,
        priceGroup: '20k',
        baseExp: 15
    },
    fish_cake: {
        id: 'fish_cake',
        name: 'Chả cá',
        icon: '🐟',
        color: '#38bdf8',
        desc: 'Chả cá dai ngon đậm đà truyền thống kèm tiêu sọ thơm nồng.',
        price: 20000,
        priceGroup: '20k',
        baseExp: 15
    },
    tuna_mayo: {
        id: 'tuna_mayo',
        name: 'Cá ngừ mayo',
        icon: '🐟',
        color: '#0284c7',
        desc: 'Cá ngừ đại dương hảo hạng ngập trong xốt mayonnaise thơm dịu.',
        price: 20000,
        priceGroup: '20k',
        baseExp: 15
    },
    egg_sausage_mayo: {
        id: 'egg_sausage_mayo',
        name: 'Trứng xúc xích mayo',
        icon: '🍳',
        color: '#facc15',
        desc: 'Xúc xích xắt hạt lựu, trứng rán thơm xốp quyện xốt mayo béo thơm.',
        price: 20000,
        priceGroup: '20k',
        baseExp: 15
    },
    cowboy_sausage: {
        id: 'cowboy_sausage',
        name: 'Heo cao bồi xúc xích',
        icon: '🤠',
        color: '#ea580c',
        desc: 'Xúc xích heo cao bồi đậm đà chuẩn vị bùng nổ hương vị.',
        price: 20000,
        priceGroup: '20k',
        baseExp: 15
    },
    chicken_teriyaki: {
        id: 'chicken_teriyaki',
        name: 'Gà Teriyaki',
        icon: '🍗',
        color: '#b45309',
        desc: 'Thịt gà áp chảo sốt Teriyaki Nhật Bản mặn ngọt đậm đà.',
        price: 20000,
        priceGroup: '20k',
        baseExp: 15
    },
    chicken_tomyum: {
        id: 'chicken_tomyum',
        name: 'Gà Tomyum',
        icon: '🍲',
        color: '#ef4444',
        desc: 'Gà xé vị Tomyum Thái Lan chua cay the the kích thích vị giác.',
        price: 20000,
        priceGroup: '20k',
        baseExp: 15
    },
    super_cheese_sausage: {
        id: 'super_cheese_sausage',
        name: 'Xúc xích siêu phô mai',
        icon: '🧀',
        color: '#f59e0b',
        desc: 'Xúc xích giòn rụm bọc nhân phô mai kéo sợi thơm ngậy.',
        price: 20000,
        priceGroup: '20k',
        baseExp: 15
    },
    pate_cheese: {
        id: 'pate_cheese',
        name: 'Pate phô mai',
        icon: '🥪',
        color: '#a16207',
        desc: 'Pate gan béo bùi kết hợp lát phô mai tan chảy mịn màng.',
        price: 20000,
        priceGroup: '20k',
        baseExp: 15
    },
    grilled_pork_kimchi: {
        id: 'grilled_pork_kimchi',
        name: 'Heo nướng kim chi',
        icon: '🥓',
        color: '#dc2626',
        desc: 'Thịt heo nướng thơm lừng kết hợp vị chua cay giòn giòn của kim chi.',
        price: 20000,
        priceGroup: '20k',
        baseExp: 15
    },

    // === NHÓM 22.000đ (3 VỊ) ===
    salmon_mayo: {
        id: 'salmon_mayo',
        name: 'cá hồi mayo',
        icon: '🍣',
        color: '#fb923c',
        desc: 'Cá hồi tươi xé nhuyễn quyện xốt mayo béo thanh sang trọng.',
        price: 22000,
        priceGroup: '22k',
        baseExp: 20
    },
    beef_bbq: {
        id: 'beef_bbq',
        name: 'Bò BBQ',
        icon: '🥩',
        color: '#854d0e',
        desc: 'Thịt bò xào sốt thịt nướng BBQ khói thơm lừng chuẩn vị.',
        price: 22000,
        priceGroup: '22k',
        baseExp: 20
    },
    cheese_chicken_roll: {
        id: 'cheese_chicken_roll',
        name: 'Gà cuộn phô mai',
        icon: '🍗',
        color: '#d97706',
        desc: 'Lườn gà mềm cuốn chặt phô mai béo ngậy thơm lừng.',
        price: 22000,
        priceGroup: '22k',
        baseExp: 20
    },

    // === NHÓM 25.000đ (1 VỊ) ===
    melting_beef_cheese: {
        id: 'melting_beef_cheese',
        name: 'Bò phô mai tan chảy',
        icon: '🧀',
        color: '#eab308',
        desc: 'Bò tiêu đen thượng hạng phủ đẫm phô mai Mozzarella tan chảy kéo sợi.',
        price: 25000,
        priceGroup: '25k',
        baseExp: 25
    }
};

// Bản đồ tương thích ngược cho các file save cũ (Bước 1, 2, 3 và các mã tên khác)
export const FILLING_ALIASES = {
    crab_mayo: 'crab_egg_mayo',
    thanh_cua_trung_mayo: 'crab_egg_mayo',
    basic_mayo: 'crab_egg_mayo',
    basic: 'crab_egg_mayo',
    pork_floss: 'cowboy_sausage',
    heo_cao_boi_xuc_xich: 'cowboy_sausage',
    cowboy_pork_sausage: 'cowboy_sausage',
    cheese_egg: 'egg_sausage_mayo',
    trung_xuc_xich_mayo: 'egg_sausage_mayo',
    shrimp_cheese: 'baked_cheese_shrimp',
    tom_pho_mai: 'baked_cheese_shrimp',
    baked_shrimp_cheese: 'baked_cheese_shrimp',
    cha_ca: 'fish_cake',
    ca_ngu_mayo: 'tuna_mayo',
    ca_hoi_mayo: 'salmon_mayo',
    bo_bbq: 'beef_bbq',
    beef_cheese: 'melting_beef_cheese',
    bo_pho_mai: 'melting_beef_cheese',
    bo_pho_mai_tan_chay: 'melting_beef_cheese',
    melting_beef: 'melting_beef_cheese',
    ga_cuon_pho_mai: 'cheese_chicken_roll',
    chicken_cheese_roll: 'cheese_chicken_roll',
    ga_teriyaki: 'chicken_teriyaki',
    ga_tomyum: 'chicken_tomyum',
    xuc_xich_sieu_pho_mai: 'super_cheese_sausage'
};

export function resolveFillingId(id) {
    if (!id) return 'crab_egg_mayo';
    const cleanId = FILLING_ALIASES[id] || id;
    return FILLINGS[cleanId] ? cleanId : 'crab_egg_mayo';
}

export const VEHICLES = {
    walk: {
        id: 'walk',
        level: 1,
        name: 'Đi bộ',
        icon: '🚶',
        price: 0,
        speedBonus: 0,
        speedMultiplier: 1.0,
        capacity: 10,
        desc: 'Đôi chân thoăn thoắt khám phá từng góc phố Sài Gòn (Chở tối đa 10 nắm).'
    },
    bike: {
        id: 'bike',
        level: 2,
        name: 'Xe đạp giỏ trước',
        icon: '🚲',
        price: 300000,
        speedBonus: 30,
        speedMultiplier: 1.3,
        capacity: 25,
        desc: 'Xe đạp thể thao nhẹ nhàng, giỏ trước chở cơm nắm (+30% tốc độ, chở tối đa 25 nắm).'
    },
    ebike: {
        id: 'ebike',
        level: 3,
        name: 'Xe đạp điện trợ lực',
        icon: '⚡',
        price: 750000,
        speedBonus: 45,
        speedMultiplier: 1.45,
        capacity: 40,
        desc: 'Động cơ điện êm ái, di chuyển bền bỉ qua các con dốc (+45% tốc độ, chở tối đa 40 nắm).'
    },
    cub: {
        id: 'cub',
        level: 4,
        name: 'Xe Cub 50cc bền bỉ',
        icon: '🛵',
        price: 1800000,
        speedBonus: 55,
        speedMultiplier: 1.55,
        capacity: 55,
        desc: 'Huyền thoại đường phố tiết kiệm xăng, baga chở hàng chắc chắn (+55% tốc độ, chở 55 nắm).'
    },
    motorcycle: {
        id: 'motorcycle',
        level: 5,
        name: 'Xe máy thùng giữ nhiệt',
        icon: '🏍️',
        price: 4500000,
        speedBonus: 70,
        speedMultiplier: 1.7,
        capacity: 75,
        desc: 'Xe tay ga có thùng giữ nhiệt nóng hổi phía sau (+70% tốc độ, chở tối đa 75 nắm).'
    },
    tricycle: {
        id: 'tricycle',
        level: 6,
        name: 'Xe ba gác điện hiện đại',
        icon: '🛺',
        price: 11000000,
        speedBonus: 85,
        speedMultiplier: 1.85,
        capacity: 105,
        desc: 'Thùng hàng rộng rãi, có mái che bảo vệ cơm (+85% tốc độ, chở tối đa 105 nắm).'
    },
    van: {
        id: 'van',
        level: 7,
        name: 'Xe bán tải mini tiện dụng',
        icon: '🚐',
        price: 28000000,
        speedBonus: 100,
        speedMultiplier: 2.0,
        capacity: 145,
        desc: 'Khoang sau điều hòa mát mẻ, chở hàng đường dài (+100% tốc độ, chở 145 nắm).'
    },
    truck: {
        id: 'truck',
        level: 8,
        name: 'Xe tải lạnh bảo ôn',
        icon: '🚚',
        price: 70000000,
        speedBonus: 120,
        speedMultiplier: 2.2,
        capacity: 200,
        desc: 'Xe tải chuyên dụng bảo ôn nhiệt độ lý tưởng (+120% tốc độ, chở tối đa 200 nắm).'
    },
    reefer_truck: {
        id: 'reefer_truck',
        level: 9,
        name: 'Xe tải đông lạnh siêu tốc',
        icon: '🚛',
        price: 175000000,
        speedBonus: 150,
        speedMultiplier: 2.5,
        capacity: 300,
        desc: 'Hệ thống làm lạnh kép chuẩn quốc tế (+150% tốc độ, chở tối đa 300 nắm).'
    },
    hyper_truck: {
        id: 'hyper_truck',
        level: 10,
        name: 'Siêu container ẩm thực 4.0',
        icon: '🚆',
        price: 450000000,
        speedBonus: 180,
        speedMultiplier: 2.8,
        capacity: 500,
        desc: 'Tổng hành dinh di động điều hòa nhiệt độ tự động (+180% tốc độ, chở 500 nắm).'
    }
};

export const VEHICLE_ORDER = ['walk', 'bike', 'ebike', 'cub', 'motorcycle', 'tricycle', 'van', 'truck', 'reefer_truck', 'hyper_truck'];

export const KITCHEN_MANUAL_TIERS = {
    1: {
        tier: 1,
        name: 'Nồi cơm điện nắp gài',
        price: 0,
        batchSize: 1,
        desc: 'Nồi cơm cơ bản ban đầu, mỗi lần nấu thủ công ra 1 nắm cơm.'
    },
    2: {
        tier: 2,
        name: 'Nồi áp suất điện tử',
        price: 500000,
        batchSize: 2,
        desc: 'Gia nhiệt đa chiều, mỗi lần nấu ra 2 nắm cơm.'
    },
    3: {
        tier: 3,
        name: 'Tủ hấp khay lớn công nghiệp',
        price: 1200000,
        batchSize: 3,
        desc: 'Tủ hấp hơi nước công suất lớn, mỗi lần nấu ra 3 nắm cơm.'
    },
    4: {
        tier: 4,
        name: 'Khuôn ép trợ lực 4 ngăn',
        price: 2800000,
        batchSize: 4,
        desc: 'Khuôn dập bán tự động, mỗi lần nấu ra 4 nắm cơm.'
    },
    5: {
        tier: 5,
        name: 'Khuôn ép đa năng 5 ngăn',
        price: 6000000,
        batchSize: 5,
        desc: 'Khuôn ép tạo hình chuẩn công nghệ, mỗi lần nấu ra 5 nắm cơm.'
    },
    6: {
        tier: 6,
        name: 'Hệ thống định hình 6 hộc',
        price: 12000000,
        batchSize: 6,
        desc: 'Bộ định lượng điện tử, mỗi lần nấu ra 6 nắm cơm.'
    },
    7: {
        tier: 7,
        name: 'Dàn tủ hấp băng chuyền 7 ngăn',
        price: 25000000,
        batchSize: 7,
        desc: 'Dàn nhiệt tuần hoàn kín, mỗi lần nấu ra 7 nắm cơm.'
    },
    8: {
        tier: 8,
        name: 'Trạm chế biến công suất 8 nắm',
        price: 50000000,
        batchSize: 8,
        desc: 'Dây chuyền bán tự động hiện đại, mỗi lần nấu ra 8 nắm cơm.'
    },
    9: {
        tier: 9,
        name: 'Dàn nấu hấp cao áp 9 ngăn',
        price: 100000000,
        batchSize: 9,
        desc: 'Công nghệ giữ nhiệt chân không, mỗi lần nấu ra 9 nắm cơm.'
    },
    10: {
        tier: 10,
        name: 'Tổ hợp Xưởng Bếp Siêu Năng Suất',
        price: 200000000,
        batchSize: 10,
        desc: 'Đỉnh cao xưởng chế biến thủ công, mỗi lần nấu ra 10 nắm cơm.'
    }
};

export const KITCHEN_TIERS = KITCHEN_MANUAL_TIERS; // Alias tương thích ngược

export const KITCHEN_AUTO_CONFIG = {
    1: {
        level: 1,
        name: 'Máy trộn & ép khuôn sơ cấp',
        price: 800000,
        ratePer10s: 1,
        ratePer15s: 1,
        desc: 'Tự động định lượng, trộn gạo và ép khuôn 1 nắm cơm mỗi 15 giây.'
    },
    2: {
        level: 2,
        name: 'Máy đóng gói màng tam giác',
        price: 2000000,
        ratePer10s: 2,
        ratePer15s: 2,
        desc: 'Bọc màng tự động, tăng lên 2 nắm cơm mỗi 15 giây.'
    },
    3: {
        level: 3,
        name: 'Băng chuyền trộn gia vị tự động',
        price: 5000000,
        ratePer10s: 3,
        ratePer15s: 3,
        desc: 'Rải đều nhân và gia vị, tăng lên 3 nắm cơm mỗi 15 giây.'
    },
    4: {
        level: 4,
        name: 'Máy ép khuôn thủy lực đa năng',
        price: 12000000,
        ratePer10s: 4,
        ratePer15s: 4,
        desc: 'Ép chặt định hình tam giác, tăng lên 4 nắm cơm mỗi 15 giây.'
    },
    5: {
        level: 5,
        name: 'Dây chuyền bọc rong biển tự động',
        price: 25000000,
        ratePer10s: 5,
        ratePer15s: 5,
        desc: 'Tự động dán tem và bọc rong biển, tăng lên 5 nắm cơm mỗi 15 giây.'
    },
    6: {
        level: 6,
        name: 'Trạm khử khuẩn UV & làm mát nhanh',
        price: 55000000,
        ratePer10s: 6,
        ratePer15s: 6,
        desc: 'Khử khuẩn chuẩn ATVSTP, tăng lên 6 nắm cơm mỗi 15 giây.'
    },
    7: {
        level: 7,
        name: 'Hệ thống định lượng AI đa luồng',
        price: 120000000,
        ratePer10s: 7,
        ratePer15s: 7,
        desc: 'Cân đo vi lượng siêu chính xác, tăng lên 7 nắm cơm mỗi 15 giây.'
    },
    8: {
        level: 8,
        name: 'Băng chuyền robot đóng hộp tự động',
        price: 250000000,
        ratePer10s: 8,
        ratePer15s: 8,
        desc: 'Cánh tay robot xếp khay liên tục, tăng lên 8 nắm cơm mỗi 15 giây.'
    },
    9: {
        level: 9,
        name: 'Dây chuyền sản xuất vô trùng khép kín',
        price: 500000000,
        ratePer10s: 9,
        ratePer15s: 9,
        desc: 'Tiêu chuẩn phòng sạch quốc tế, tăng lên 9 nắm cơm mỗi 15 giây.'
    },
    10: {
        level: 10,
        name: 'Siêu nhà máy sản xuất tự động tương lai',
        price: 1000000000,
        ratePer10s: 10,
        ratePer15s: 10,
        desc: 'Tối ưu hóa hoàn toàn 10 nắm cơm mỗi 15 giây.'
    }
};

export const BRANCH_CONFIGS = {
    branch_hcm: {
        id: 'branch_hcm',
        name: 'Chi nhánh TP.HCM',
        subtitle: 'Trụ sở chính Miền Nam',
        icon: '🏙️',
        unlockPrice: 0,
        minLevel: 1,
        levels: {
            1: { upgradeCost: 0, incomePer10s: 10000, incomePer15s: 10000 },
            2: { upgradeCost: 500000, incomePer10s: 25000, incomePer15s: 25000 },
            3: { upgradeCost: 1500000, incomePer10s: 55000, incomePer15s: 55000 },
            4: { upgradeCost: 3500000, incomePer10s: 110000, incomePer15s: 110000 },
            5: { upgradeCost: 8000000, incomePer10s: 200000, incomePer15s: 200000 },
            6: { upgradeCost: 18000000, incomePer10s: 350000, incomePer15s: 350000 },
            7: { upgradeCost: 38000000, incomePer10s: 600000, incomePer15s: 600000 },
            8: { upgradeCost: 80000000, incomePer10s: 1000000, incomePer15s: 1000000 },
            9: { upgradeCost: 160000000, incomePer10s: 1600000, incomePer15s: 1600000 },
            10: { upgradeCost: 320000000, incomePer10s: 2500000, incomePer15s: 2500000 }
        }
    },
    branch_daklak: {
        id: 'branch_daklak',
        name: 'Chi nhánh Đắk Lắk',
        subtitle: 'Thủ phủ Tây Nguyên',
        icon: '☕',
        unlockPrice: 15000000,
        minLevel: 8,
        levels: {
            1: { upgradeCost: 0, incomePer10s: 30000, incomePer15s: 30000 },
            2: { upgradeCost: 2000000, incomePer10s: 70000, incomePer15s: 70000 },
            3: { upgradeCost: 4500000, incomePer10s: 140000, incomePer15s: 140000 },
            4: { upgradeCost: 9000000, incomePer10s: 260000, incomePer15s: 260000 },
            5: { upgradeCost: 18000000, incomePer10s: 450000, incomePer15s: 450000 },
            6: { upgradeCost: 35000000, incomePer10s: 750000, incomePer15s: 750000 },
            7: { upgradeCost: 70000000, incomePer10s: 1200000, incomePer15s: 1200000 },
            8: { upgradeCost: 140000000, incomePer10s: 1900000, incomePer15s: 1900000 },
            9: { upgradeCost: 280000000, incomePer10s: 2900000, incomePer15s: 2900000 },
            10: { upgradeCost: 550000000, incomePer10s: 4200000, incomePer15s: 4200000 }
        }
    },
    branch_vinh: {
        id: 'branch_vinh',
        name: 'Chi nhánh TP. Vinh',
        subtitle: 'Cửa ngõ Miền Trung',
        icon: '🌊',
        unlockPrice: 40000000,
        minLevel: 15,
        levels: {
            1: { upgradeCost: 0, incomePer10s: 80000, incomePer15s: 80000 },
            2: { upgradeCost: 4000000, incomePer10s: 180000, incomePer15s: 180000 },
            3: { upgradeCost: 9000000, incomePer10s: 350000, incomePer15s: 350000 },
            4: { upgradeCost: 18000000, incomePer10s: 600000, incomePer15s: 600000 },
            5: { upgradeCost: 36000000, incomePer10s: 1000000, incomePer15s: 1000000 },
            6: { upgradeCost: 70000000, incomePer10s: 1600000, incomePer15s: 1600000 },
            7: { upgradeCost: 140000000, incomePer10s: 2500000, incomePer15s: 2500000 },
            8: { upgradeCost: 280000000, incomePer10s: 3800000, incomePer15s: 3800000 },
            9: { upgradeCost: 550000000, incomePer10s: 5600000, incomePer15s: 5600000 },
            10: { upgradeCost: 1100000000, incomePer10s: 8000000, incomePer15s: 8000000 }
        }
    },
    branch_hanoi: {
        id: 'branch_hanoi',
        name: 'Chi nhánh Hà Nội',
        subtitle: 'Thủ đô Nghìn Năm Văn Hiến',
        icon: '🏛️',
        unlockPrice: 100000000,
        minLevel: 25,
        levels: {
            1: { upgradeCost: 0, incomePer10s: 180000, incomePer15s: 180000 },
            2: { upgradeCost: 10000000, incomePer10s: 400000, incomePer15s: 400000 },
            3: { upgradeCost: 22000000, incomePer10s: 800000, incomePer15s: 800000 },
            4: { upgradeCost: 45000000, incomePer10s: 1400000, incomePer15s: 1400000 },
            5: { upgradeCost: 90000000, incomePer10s: 2300000, incomePer15s: 2300000 },
            6: { upgradeCost: 180000000, incomePer10s: 3600000, incomePer15s: 3600000 },
            7: { upgradeCost: 360000000, incomePer10s: 5500000, incomePer15s: 5500000 },
            8: { upgradeCost: 700000000, incomePer10s: 8200000, incomePer15s: 8200000 },
            9: { upgradeCost: 1400000000, incomePer10s: 12000000, incomePer15s: 12000000 },
            10: { upgradeCost: 2800000000, incomePer10s: 18000000, incomePer15s: 18000000 }
        }
    }
};

export const BRANCH_ORDER = ['branch_hcm', 'branch_daklak', 'branch_vinh', 'branch_hanoi'];

export const STAFF_CONFIG = {
    basePrice: 400000,
    priceIncrement: 200000,
    passiveIncomePerCycle: 12000, // 12.000đ mỗi 15 giây
    cycleIntervalMs: 15000 // Chu kỳ 15 giây chuẩn
};

// Danh mục sạp hàng và gói nguyên liệu tại Chợ Đầu Mối
export const MARKET_STALLS = {
    rice_seaweed: {
        id: 'rice_seaweed',
        name: 'Gói Gạo ST25 & Lá Rong Biển',
        stallId: 'stall_rice',
        stallName: 'Sạp Gạo & Rong Biển',
        icon: '🌾',
        packSize: 10,
        price: 30000,
        desc: '10 phần gạo tiến vua ST25 dẻo thơm & lá rong biển Nori giòn rụm.'
    },
    meat_seafood: {
        id: 'meat_seafood',
        name: 'Gói Thịt & Hải Sản Tươi',
        stallId: 'stall_meat',
        stallName: 'Sạp Thịt & Hải Sản',
        icon: '🥩',
        packSize: 10,
        price: 50000,
        desc: '10 phần tôm tươi, cá ngừ, cá hồi, thịt bò, gà và xúc xích thơm ngon.'
    },
    cheese_sauce: {
        id: 'cheese_sauce',
        name: 'Gói Phô Mai Kéo Sợi & Sốt',
        stallId: 'stall_cheese',
        stallName: 'Sạp Phô Mai & Sốt',
        icon: '🧀',
        packSize: 10,
        price: 40000,
        desc: '10 phần phô mai Mozzarella béo ngậy cùng các loại xốt Mayo, BBQ, Teriyaki, Tomyum.'
    }
};

// =============================================================================
// BẢNG 12 THÀNH TỰU & DANH HIỆU KÈM BUFF VĨNH VIỄN (PERMANENT BUFFS)
// =============================================================================
export const ACHIEVEMENTS_CONFIG = {
    ach_asmr_master: {
        id: 'ach_asmr_master',
        title: 'Bàn Tay Vàng ASMR',
        icon: '🍙',
        desc: 'Nấu thủ công đạt 50 nắm cơm tại Bếp ASMR.',
        buffText: '+5% Tốc độ làm cơm',
        target: 50,
        getProgress: (s) => ({ current: Math.min(50, s.stats?.cookedCount || 0), target: 50 }),
        isUnlocked: (s) => (s.stats?.cookedCount || 0) >= 50,
        buff: { cookSpeed: 0.05 }
    },
    ach_zero_penalty: {
        id: 'ach_zero_penalty',
        title: 'Không Một Lỗi Phạt',
        icon: '🛡️',
        desc: 'Vượt qua 3 ngày kinh doanh không bị phạt trật tự đô thị.',
        buffText: '-15% Tốc độ tăng cảnh báo đô thị',
        target: 3,
        getProgress: (s) => ({ current: Math.min(3, s.stats?.cleanDaysCount || 0), target: 3 }),
        isUnlocked: (s) => (s.stats?.cleanDaysCount || 0) >= 3,
        buff: { heatRateReduce: 0.15 }
    },
    ach_rush_hour_king: {
        id: 'ach_rush_hour_king',
        title: 'Vua Giờ Cao Điểm',
        icon: '⏰',
        desc: 'Phục vụ 30 lượt khách trong khung giờ vàng cao điểm.',
        buffText: '+5% Tiền bán lẻ mọi phân khúc',
        target: 30,
        getProgress: (s) => ({ current: Math.min(30, s.stats?.rushHourServed || 0), target: 30 }),
        isUnlocked: (s) => (s.stats?.rushHourServed || 0) >= 30,
        buff: { retailBonus: 0.05 }
    },
    ach_four_provinces: {
        id: 'ach_four_provinces',
        title: 'Ông Trùm 4 Tỉnh Thành',
        icon: '👑',
        desc: 'Mở khóa thành công toàn bộ 4 chi nhánh toàn quốc.',
        buffText: '+10% Doanh thu thụ động toàn quốc',
        target: 4,
        getProgress: (s) => {
            const cnt = ['branch_hcm', 'branch_daklak', 'branch_vinh', 'branch_hanoi'].filter(b => s.branches && s.branches[b] && s.branches[b].unlocked).length;
            return { current: cnt, target: 4 };
        },
        isUnlocked: (s) => ['branch_hcm', 'branch_daklak', 'branch_vinh', 'branch_hanoi'].every(b => s.branches && s.branches[b] && s.branches[b].unlocked),
        buff: { branchIncomeBonus: 0.10 }
    },
    ach_packaging_guru: {
        id: 'ach_packaging_guru',
        title: 'Bậc Thầy Đóng Gói',
        icon: '📦',
        desc: 'Nâng cấp Dây chuyền sản xuất tự động đạt Cấp 5.',
        buffText: '+10% Tốc độ xưởng tự động',
        target: 5,
        getProgress: (s) => ({ current: Math.min(5, s.kitchenAutoLevel || 0), target: 5 }),
        isUnlocked: (s) => (s.kitchenAutoLevel || 0) >= 5,
        buff: { autoKitchenSpeed: 0.10 }
    },
    ach_party_contractor: {
        id: 'ach_party_contractor',
        title: 'Thợ Săn Hợp Đồng',
        icon: '📑',
        desc: 'Hoàn thành 3 Hợp Đồng Đặt Tiệc Lớn.',
        buffText: '+8% Tiền thưởng hợp đồng tiệc',
        target: 3,
        getProgress: (s) => ({ current: Math.min(3, s.stats?.contractsCompleted || 0), target: 3 }),
        isUnlocked: (s) => (s.stats?.contractsCompleted || 0) >= 3,
        buff: { contractBonus: 0.08 }
    },
    ach_express_racer: {
        id: 'ach_express_racer',
        title: 'Vua Hỏa Tốc',
        icon: '⚡',
        desc: 'Hoàn thành 10 đơn giao hàng hỏa tốc.',
        buffText: '+10s Thời gian gia hạn đơn hỏa tốc',
        target: 10,
        getProgress: (s) => ({ current: Math.min(10, (s.stats?.expressCompletedCount || 0) + (s.stats?.sideQuestsCompleted || 0)), target: 10 }),
        isUnlocked: (s) => ((s.stats?.expressCompletedCount || 0) + (s.stats?.sideQuestsCompleted || 0)) >= 10,
        buff: { expressTimeBonus: 10 }
    },
    ach_revenue_tycoon: {
        id: 'ach_revenue_tycoon',
        title: 'Vua Doanh Thu',
        icon: '💰',
        desc: 'Tích lũy tổng doanh thu đạt 100.000.000đ.',
        buffText: '+5% EXP nhận được từ mọi nguồn',
        target: 100000000,
        getProgress: (s) => ({ current: Math.min(100000000, s.stats?.totalRevenue || s.money || 0), target: 100000000, isMoney: true }),
        isUnlocked: (s) => ((s.stats?.totalRevenue || 0) >= 100000000 || (s.money || 0) >= 100000000),
        buff: { expBonus: 0.05 }
    },
    ach_super_speed: {
        id: 'ach_super_speed',
        title: 'Tốc Độ Bàn Thờ',
        icon: '🛵',
        desc: 'Sở hữu phương tiện có tốc độ từ +100% trở lên.',
        buffText: '+10% Tốc độ di chuyển mọi phương tiện',
        target: 1,
        getProgress: (s) => {
            const hasHighSpeed = (s.unlockedVehicles || []).some(v => VEHICLES[v] && VEHICLES[v].speedBonus >= 100);
            return { current: hasHighSpeed ? 1 : 0, target: 1 };
        },
        isUnlocked: (s) => (s.unlockedVehicles || []).some(v => VEHICLES[v] && VEHICLES[v].speedBonus >= 100),
        buff: { moveSpeedBonus: 0.10 }
    },
    ach_iso_perfection: {
        id: 'ach_iso_perfection',
        title: 'Uy Tín Đỉnh Cao',
        icon: '⭐',
        desc: 'Đạt Uy tín ISO ATVSTP tối đa 100 điểm.',
        buffText: '+15% Thời gian giữ độ tươi cơm nắm',
        target: 100,
        getProgress: (s) => ({ current: Math.min(100, s.reputation || 0), target: 100 }),
        isUnlocked: (s) => (s.reputation || 0) >= 100,
        buff: { freshnessHoldBonus: 0.15 }
    },
    ach_market_investor: {
        id: 'ach_market_investor',
        title: 'Nhà Đầu Tư Chợ Lớn',
        icon: '🏪',
        desc: 'Thực hiện 20 lần mua hàng tại Chợ Đầu Mối.',
        buffText: '-5% Giá nhập nguyên liệu ở Chợ',
        target: 20,
        getProgress: (s) => ({ current: Math.min(20, s.stats?.marketBuyCount || 0), target: 20 }),
        isUnlocked: (s) => (s.stats?.marketBuyCount || 0) >= 20,
        buff: { marketDiscount: 0.05 }
    },
    ach_empire_legend: {
        id: 'ach_empire_legend',
        title: 'Đại Đế Chế Cơm Nắm',
        icon: '🏆',
        desc: 'Hoàn thành toàn bộ 20 Nhiệm Vụ Cốt Truyện.',
        buffText: '+10% Toàn bộ các chỉ số & Danh xưng Huyền Thoại',
        target: 20,
        getProgress: (s) => ({ current: Math.min(20, (s.quests?.completedIds || []).length), target: 20 }),
        isUnlocked: (s) => (s.quests?.completedIds || []).length >= 20,
        buff: { allBonus: 0.10 }
    }
};

export const ACHIEVEMENT_ORDER = [
    'ach_asmr_master',
    'ach_zero_penalty',
    'ach_rush_hour_king',
    'ach_four_provinces',
    'ach_packaging_guru',
    'ach_party_contractor',
    'ach_express_racer',
    'ach_revenue_tycoon',
    'ach_super_speed',
    'ach_iso_perfection',
    'ach_market_investor',
    'ach_empire_legend'
];

class GameState {
    constructor() {
        this.saveKey = 'de_che_com_nam_save_v4';
        this.reset();
        this.listeners = [];
    }

    reset() {
        this.money = 50000;
        this.level = 1;
        this.exp = 0;
        this.reputation = 100;
        this.brandName = 'Tiệm Cơm Nắm Sài Gòn';
        this.onlineStats = {
            wins1v1: 0,
            losses1v1: 0,
            coopContributedTotal: 0
        };
        this.gameTimeMinutes = 420; // Khởi đầu lúc 07:00 sáng
        
        // Khởi đầu với 3 nắm cơm thuộc 3 nhóm giá
        this.inventory = [
            { id: 'init_1', filling: 'crab_egg_mayo', stars: 5, freshness: 100, name: 'Cơm Nắm Thanh cua trứng mayo' },
            { id: 'init_2', filling: 'chicken_teriyaki', stars: 4, freshness: 100, name: 'Cơm Nắm Gà Teriyaki' },
            { id: 'init_3', filling: 'melting_beef_cheese', stars: 5, freshness: 100, name: 'Cơm Nắm Bò phô mai tan chảy' }
        ];

        // Độ tươi, Hóa đơn cuối ngày & Trạng thái tài chính
        this.dailyRevenue = 0;
        this.dailyTips = 0;
        this.dailyOperatingCost = 0;
        this.unpaidDebt = 0;
        this.isOperatingHalted = false;
        this.lastSettledDay = -1;
        this.gameDay = 1;
        this.pendingBillSummary = null;

        // Nguyên liệu tồn kho (mỗi lần làm cơm sẽ tiêu hao nguyên liệu)
        this.ingredients = {
            rice_seaweed: 20, // 20 phần ban đầu
            meat_seafood: 20,
            cheese_sauce: 20
        };

        // Thống kê tiến trình nhiệm vụ & Thành tựu
        this.stats = {
            cookedCount: 0,
            marketBuyCount: 0,
            soldPriceGroups: { '20k': 0, '22k': 0, '25k': 0 },
            cleanDaysCount: 0,
            penaltiesCount: 0,
            penaltiesToday: 0,
            totalRevenue: 0,
            expressCompletedCount: 0,
            contractsCompleted: 0,
            rushHourServed: 0,
            soldSchool: 0,
            soldOfficeDelivery: 0,
            soldHoaMai20k: 0,
            servedUni: 0,
            soldLequydon22k: 0,
            soldWalkStreetVip: 0,
            sideQuestsCompleted: 0
        };

        // Tuyến nhiệm vụ
        this.quests = {
            activeId: 'nv1',
            completedIds: [],
            claiming: false,
            nv3: {
                status: 'not_started',
                startTime: null,
                durationSeconds: 90,
                delivered: 0,
                target: 5
            }
        };

        // Hệ thống Hợp Đồng Đặt Tiệc (Party Contracts)
        this.contracts = {
            available: [],
            lastRefreshTime: Date.now(),
            refreshIntervalMs: 180000 // 3 phút
        };

        // Hệ thống Thành Tựu & Danh Hiệu
        this.achievements = {
            unlockedIds: [],
            claimedIds: []
        };

        // Các chỉ số Buff Vĩnh Viễn (Permanent Buffs)
        this.permanentBuffs = {
            cookSpeed: 0,
            heatRateReduce: 0,
            retailBonus: 0,
            branchIncomeBonus: 0,
            autoKitchenSpeed: 0,
            contractBonus: 0,
            expressTimeBonus: 0,
            expBonus: 0,
            moveSpeedBonus: 0,
            freshnessHoldBonus: 0,
            marketDiscount: 0,
            allBonus: 0
        };
        this.initContracts();

        // Phương tiện
        this.currentVehicle = 'walk';
        this.unlockedVehicles = ['walk'];

        // Đế chế Tycoon - Xưởng Bếp & Sản Xuất Tự Động
        this.kitchenTier = 1;
        this.kitchenManualTier = 1; // 1 -> 4 (1, 3, 6, 10 nắm)
        this.kitchenAutoLevel = 0;  // 0 (tắt), 1 (máy trộn ép 1 nắm/10s), 2 (máy đóng màng 3 nắm/10s)
        this.kitchenStock = [];     // Kho chứa cơm sản xuất tự động (tối đa 300 nắm)
        this.staffCount = 0;

        // Quản lý 4 Chi Nhánh Liên Tỉnh Toàn Quốc
        this.currentCity = 'branch_hcm';
        this.branches = {
            branch_hcm: { unlocked: true, level: 1 },
            branch_daklak: { unlocked: false, level: 1 },
            branch_vinh: { unlocked: false, level: 1 },
            branch_hanoi: { unlocked: false, level: 1 }
        };

        // Hệ thống Tự động lưu định kỳ mỗi 5 giây (Auto-save timer 5s)
        this.autoSaveTimer = null;
        if (typeof setInterval !== 'undefined') {
            this.autoSaveTimer = setInterval(() => {
                this.save();
            }, 5000);
        }

        // [KẾT BẠN & TRÒ CHUYỆN] Danh sách bạn bè & Lịch sử tin nhắn riêng tư
        this.friends = []; // [{ id, name, level, city, addedAt }]
        this.privateMessages = {}; // { [friendId]: [{ from, text, time, unread }] }
        this.unreadMessagesCount = 0;
    }

    onUpdate(fn) {
        this.listeners.push(fn);
    }

    notify(extraData = null) {
        if (!Array.isArray(this.listeners)) return;
        this.listeners.forEach(fn => {
            try {
                if (typeof fn === 'function') {
                    fn(this, extraData);
                }
            } catch (err) {
                console.error('[GameState] Error in update listener:', err);
            }
        });
    }

    // Sức chứa tối đa của thùng xe theo phương tiện đang dùng
    getMaxCapacity() {
        const v = VEHICLES[this.currentVehicle];
        return v && typeof v.capacity === 'number' ? v.capacity : 10;
    }

    get maxCapacity() {
        return this.getMaxCapacity();
    }

    // Tỷ lệ tăng giá bán theo Level (+10% mỗi cấp trên cấp 1)
    getPriceMultiplier() {
        return 1 + (this.level - 1) * 0.10;
    }

    // Tỷ lệ tăng tốc độ di chuyển theo Level (+5% mỗi cấp trên cấp 1)
    getSpeedMultiplier() {
        return 1 + (this.level - 1) * 0.05;
    }

    // Hệ số tốc độ từ phương tiện đang sử dụng
    getVehicleSpeedMultiplier() {
        const v = VEHICLES[this.currentVehicle];
        return v ? v.speedMultiplier : 1.0;
    }

    getExpNeeded() {
        return Math.floor(100 * Math.pow(1.3, this.level - 1));
    }

    // Tích lũy EXP và bảo lưu chính xác số EXP dư sang cấp tiếp theo (Overflow Retention)
    addExp(amount) {
        if (amount <= 0) return false;
        this.exp += amount;
        let leveledUp = false;
        let startLevel = this.level;

        while (this.exp >= this.getExpNeeded()) {
            this.exp -= this.getExpNeeded();
            this.level += 1;
            leveledUp = true;
        }

        this.notify({ leveledUp, oldLevel: startLevel, newLevel: this.level });
        this.save();
        return leveledUp;
    }

    addMoney(amount) {
        if (amount <= 0) return;
        this.money += amount;
        this.notify();
        this.save();
    }

    // Trừ tiền an toàn: Tuyệt đối không trừ khi không đủ tiền (Chống âm tiền)
    deductMoney(amount) {
        if (amount <= 0) return true;
        if (this.money < amount) {
            return false;
        }
        this.money -= amount;
        this.notify();
        this.save();
        return true;
    }

    // Tiến hành bước thời gian (1 giây thực = 5 phút trong game)
    advanceTime(deltaSeconds) {
        if (typeof deltaSeconds !== 'number' || isNaN(deltaSeconds) || deltaSeconds <= 0) return;
        const deltaMins = deltaSeconds * 5;
        const prevMins = this.gameTimeMinutes || 0;
        this.gameTimeMinutes = (prevMins + deltaMins) % 1440;
        if (this.gameTimeMinutes < 0) {
            this.gameTimeMinutes = (this.gameTimeMinutes + 1440) % 1440;
        }

        // Tăng ngày khi qua mốc 00:00 và kiểm tra ngày không bị phạt
        if (prevMins > 1300 && this.gameTimeMinutes < 120) {
            this.gameDay = (this.gameDay || 1) + 1;
            if (!this.stats) this.stats = {};
            if ((this.stats.penaltiesToday || 0) === 0) {
                this.stats.cleanDaysCount = (this.stats.cleanDaysCount || 0) + 1;
            }
            this.stats.penaltiesToday = 0;
        }

        // Tự động kiểm tra làm mới hợp đồng tiệc mỗi 3 phút (180.000 ms)
        if (this.contracts && this.contracts.lastRefreshTime) {
            if (Date.now() - this.contracts.lastRefreshTime >= (this.contracts.refreshIntervalMs || 180000)) {
                this.generateContracts();
            }
        }

        // 1. Cập nhật suy giảm độ tươi theo phương tiện
        this.updateFreshness(deltaMins);

        // 2. Kiểm tra hóa đơn vận hành cuối ngày 23:55 (1435 phút)
        this.checkDailySettlement(prevMins, this.gameTimeMinutes);
    }

    // Ghi nhận doanh thu trong ngày cho hóa đơn tổng kết & thống kê tích lũy
    recordRevenue(baseAmount, tipAmount = 0) {
        if (typeof baseAmount === 'number' && baseAmount > 0) {
            this.dailyRevenue = (this.dailyRevenue || 0) + baseAmount;
            if (!this.stats) this.stats = {};
            this.stats.totalRevenue = (this.stats.totalRevenue || 0) + baseAmount;
        }
        if (typeof tipAmount === 'number' && tipAmount > 0) {
            this.dailyTips = (this.dailyTips || 0) + tipAmount;
            if (!this.stats) this.stats = {};
            this.stats.totalRevenue = (this.stats.totalRevenue || 0) + tipAmount;
        }
    }

    // Cơ chế suy giảm độ tươi cơm theo thời gian & phương tiện bảo quản
    updateFreshness(deltaMinutes) {
        if (typeof deltaMinutes !== 'number' || isNaN(deltaMinutes) || deltaMinutes <= 0) return;
        const v = VEHICLES[this.currentVehicle];
        let rate = 0.15; // Mặc định đi bộ: 0.15% / phút
        if (v) {
            if (v.level >= 8) rate = 0.015; // Xe tải lạnh & Siêu container: giảm cực chậm
            else if (v.level >= 6) rate = 0.035; // Ba gác, xe bán tải mini
            else if (v.level >= 4) rate = 0.06; // Cub, Xe máy thùng giữ nhiệt
            else if (v.level >= 2) rate = 0.11; // Xe đạp, xe đạp điện
            else rate = 0.15; // Đi bộ
        }

        // Áp dụng Buff Vĩnh Viễn giữ độ tươi (Permanent Buff)
        const freshnessBuff = this.permanentBuffs?.freshnessHoldBonus || 0;
        if (freshnessBuff > 0) {
            rate = rate * Math.max(0.1, 1 - freshnessBuff);
        }

        const loss = deltaMinutes * rate;

        if (Array.isArray(this.inventory)) {
            for (const item of this.inventory) {
                if (typeof item.freshness !== 'number') item.freshness = 100;
                item.freshness = Math.max(0, Math.round((item.freshness - loss) * 10) / 10);
            }
        }

        if (Array.isArray(this.kitchenStock)) {
            for (const item of this.kitchenStock) {
                if (typeof item.freshness !== 'number') item.freshness = 100;
                // Kho xưởng có bảo quản mát: 0.01% / phút
                item.freshness = Math.max(0, Math.round((item.freshness - deltaMinutes * 0.01) * 10) / 10);
            }
        }
    }

    // Nút "Thanh lý / Hủy hàng cũ": Loại bỏ toàn bộ cơm dưới ngưỡng quy định (<40% hoặc tùy chọn)
    discardSpoiledRice(threshold = 40) {
        if (!Array.isArray(this.inventory)) return 0;
        const initialCount = this.inventory.length;
        this.inventory = this.inventory.filter(item => {
            const f = typeof item.freshness === 'number' ? item.freshness : 100;
            return f >= threshold;
        });
        const discarded = initialCount - this.inventory.length;
        if (discarded > 0) {
            this.notify({ discardedRice: discarded });
            this.save();
        }
        return discarded;
    }

    // Tính toán tổng chi phí vận hành cố định cuối ngày
    getOperatingBillCost() {
        // 1. Phí nhân viên AI đang thuê (35.000đ / người)
        const staffCost = (this.staffCount || 0) * 35000;

        // 2. Phí duy trì các chi nhánh đang mở
        let branchCost = 0;
        if (this.branches) {
            for (const bId of Object.keys(this.branches)) {
                if (this.branches[bId] && this.branches[bId].unlocked) {
                    const lvl = this.branches[bId].level || 1;
                    branchCost += 40000 + (lvl - 1) * 15000;
                }
            }
        }

        // 3. Phí bảo dưỡng phương tiện (theo cấp độ xe)
        const v = VEHICLES[this.currentVehicle];
        const vehicleCost = v ? (v.level || 1) * 20000 : 15000;

        return staffCost + branchCost + vehicleCost;
    }

    // Kiểm tra và kích hoạt tổng kết 23:55 (1435 phút)
    checkDailySettlement(prevMins, curMins) {
        const currentDay = this.gameDay || 1;
        // Kích hoạt khi đồng hồ chạm hoặc vượt qua 23:55 (1435 phút) trong ngày
        const reached2355 = (prevMins < 1435 && curMins >= 1435) || (curMins >= 1435 && this.lastSettledDay !== currentDay);
        if (reached2355 && this.lastSettledDay !== currentDay) {
            this.settleDailyOperatingCost();
        }
    }

    // Khấu trừ chi phí vận hành cuối ngày minh bạch & không bao giờ làm âm tiền
    settleDailyOperatingCost() {
        const currentDay = this.gameDay || 1;
        this.lastSettledDay = currentDay;

        const totalCost = this.getOperatingBillCost();
        const curMoney = this.money;
        let paid = 0;
        let deficit = 0;

        if (curMoney >= totalCost) {
            paid = totalCost;
            this.money -= totalCost;
            deficit = 0;
            if (this.unpaidDebt <= 0) {
                this.isOperatingHalted = false;
            }
        } else {
            paid = curMoney;
            this.money = 0; // Trừ hết nhưng TUYỆT ĐỐI KHÔNG ÂM TIỀN!
            deficit = totalCost - paid;
            this.unpaidDebt = (this.unpaidDebt || 0) + deficit;
            this.isOperatingHalted = true; // Tạm ngưng máy móc & nhân viên do nợ
        }

        const netProfit = (this.dailyRevenue || 0) + (this.dailyTips || 0) - totalCost;
        const summary = {
            day: currentDay,
            totalCost,
            paid,
            deficit,
            unpaidDebt: this.unpaidDebt,
            dailyRevenue: this.dailyRevenue || 0,
            dailyTips: this.dailyTips || 0,
            netProfit,
            isHalted: this.isOperatingHalted
        };

        this.pendingBillSummary = summary;
        // Đặt lại doanh thu của ngày mới
        this.dailyRevenue = 0;
        this.dailyTips = 0;
        this.dailyOperatingCost = totalCost;

        this.notify({ billSettled: summary });
        this.save();
        return summary;
    }

    // Trả nợ chi phí vận hành bằng tiền bán hàng
    payOperatingDebt(amount) {
        if (!this.unpaidDebt || this.unpaidDebt <= 0 || amount <= 0) return 0;
        const pay = Math.min(this.unpaidDebt, amount, this.money);
        if (pay > 0) {
            this.money -= pay;
            this.unpaidDebt -= pay;
            if (this.unpaidDebt <= 0) {
                this.unpaidDebt = 0;
                this.isOperatingHalted = false; // Phục hồi vận hành khi đã hết nợ!
            }
            this.notify();
            this.save();
        }
        return pay;
    }

    // Lấy chuỗi định dạng HH:MM chuẩn 24h
    getTimeString() {
        const rawMins = Math.floor(this.gameTimeMinutes || 0) % 1440;
        const normalized = rawMins < 0 ? rawMins + 1440 : rawMins;
        const h = Math.floor(normalized / 60);
        const m = Math.floor(normalized % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    // Lấy thông tin chi tiết khung giờ, giờ cao điểm & trạng thái ngày đêm
    getTimePeriodInfo() {
        const rawMins = Math.floor(this.gameTimeMinutes || 0) % 1440;
        const normalized = rawMins < 0 ? rawMins + 1440 : rawMins;
        const timeStr = this.getTimeString();

        let statusLabel = 'Giờ Hành Chính';
        if (normalized >= 330 && normalized < 390) { // 05:30 - 06:30
            statusLabel = 'Bình Minh Đô Thị';
        } else if (normalized >= 390 && normalized <= 480) { // 06:30 - 08:00
            statusLabel = 'Giờ Vàng Cổng Trường';
        } else if (normalized > 480 && normalized < 690) { // 08:00 - 11:30
            statusLabel = 'Giờ Học & Làm Việc';
        } else if (normalized >= 690 && normalized <= 810) { // 11:30 - 13:30
            statusLabel = 'Cao Điểm Văn Phòng';
        } else if (normalized > 810 && normalized < 990) { // 13:30 - 16:30
            statusLabel = 'Buổi Chiều Yên Tĩnh';
        } else if (normalized >= 990 && normalized <= 1080) { // 16:30 - 18:00
            statusLabel = 'Giờ Tan Trường Rộn Ràng';
        } else if (normalized > 1080 && normalized < 1110) { // 18:00 - 18:30
            statusLabel = 'Hoàng Hôn Thành Phố';
        } else if (normalized >= 1110 && normalized <= 1320) { // 18:30 - 22:00
            statusLabel = 'Phố Đi Bộ Lên Đèn';
        } else { // 22:00 - 05:30
            statusLabel = 'Đêm Muộn Sài Gòn';
        }

        // Trời chuyển tối từ 18:00 đến 05:30 (1080 phút đến 330 phút)
        const isNight = (normalized >= 1080 || normalized < 330);

        // Giờ cao điểm Cổng trường: 06:30–08:00 (390-480) và 16:30–18:00 (990-1080)
        const isSchoolRush = ((normalized >= 390 && normalized <= 480) || (normalized >= 990 && normalized <= 1080));

        // Quá 30 phút sau khi hết giờ cao điểm tại cổng trường
        // Sáng hết lúc 08:00 -> quá 30p là sau 08:30 (510). Đến 16:30 (990)
        // Chiều hết lúc 18:00 -> quá 30p là sau 18:30 (1110). Đến sáng hôm sau 06:30 (390)
        const isSchoolOvertime = (
            (normalized > 510 && normalized < 990) ||
            (normalized > 1110 || normalized < 390)
        );

        // Giờ cao điểm Văn phòng: 11:30–13:30 (690-810)
        const isOfficeRush = (normalized >= 690 && normalized <= 810);

        // Giờ cao điểm Phố đi bộ: 18:30–22:00 (1110-1320)
        const isWalkingStreetRush = (normalized >= 1110 && normalized <= 1320);

        return {
            timeStr,
            minutes: normalized,
            statusLabel,
            isNight,
            isSchoolRush,
            isSchoolOvertime,
            isOfficeRush,
            isWalkingStreetRush
        };
    }

    // Xử phạt Trật Tự Đô Thị: Trừ đúng 150.000đ, không để tiền âm. Nếu thiếu tiền trừ về 0đ và trừ 20 Danh vọng.
    applyUrbanPenalty() {
        try {
            const penaltyAmount = 150000;
            let deductedMoney = 0;
            let reputationPenalty = 0;

            const curMoney = typeof this.money === 'number' && !isNaN(this.money) ? this.money : 0;
            if (curMoney >= penaltyAmount) {
                this.money = curMoney - penaltyAmount;
                deductedMoney = penaltyAmount;
            } else {
                deductedMoney = Math.max(0, curMoney);
                this.money = 0;
                const currentRep = typeof this.reputation === 'number' && !isNaN(this.reputation) ? this.reputation : 100;
                this.reputation = Math.max(0, currentRep - 20);
                reputationPenalty = 20;
            }

            if (!this.stats || typeof this.stats !== 'object') this.stats = {};
            this.stats.penaltiesCount = (this.stats.penaltiesCount || 0) + 1;
            this.stats.penaltiesToday = (this.stats.penaltiesToday || 0) + 1;

            this.notify({ urbanPenalty: true, deductedMoney, reputationPenalty });
            this.save();
            return { deductedMoney, reputationPenalty, money: this.money, reputation: this.reputation };
        } catch (errPenalty) {
            console.error('[State] applyUrbanPenalty exception:', errPenalty);
            return { deductedMoney: 0, reputationPenalty: 0, money: this.money || 0, reputation: this.reputation || 0 };
        }
    }

    // Kiểm tra đủ nguyên liệu để nấu số lượng nắm cơm
    hasIngredients(count = 1) {
        if (!this.ingredients) return false;
        return (
            (this.ingredients.rice_seaweed || 0) >= count &&
            (this.ingredients.meat_seafood || 0) >= count &&
            (this.ingredients.cheese_sauce || 0) >= count
        );
    }

    // Tiêu hao nguyên liệu khi làm cơm
    consumeIngredients(count = 1) {
        if (!this.hasIngredients(count)) return false;
        this.ingredients.rice_seaweed -= count;
        this.ingredients.meat_seafood -= count;
        this.ingredients.cheese_sauce -= count;
        this.notify();
        this.save();
        return true;
    }

    // Mua gói nguyên liệu từ Chợ Đầu Mối
    buyIngredient(key) {
        const item = MARKET_STALLS[key];
        if (!item) return { success: false, reason: 'not_found', item: null };

        const discount = this.permanentBuffs?.marketDiscount || 0;
        const finalPrice = Math.round(item.price * Math.max(0.5, 1 - discount));

        if (this.money < finalPrice) {
            return { success: false, reason: 'not_enough_money', item, price: finalPrice };
        }

        if (this.deductMoney(finalPrice)) {
            if (!this.ingredients) {
                this.ingredients = { rice_seaweed: 0, meat_seafood: 0, cheese_sauce: 0 };
            }
            this.ingredients[key] = (this.ingredients[key] || 0) + item.packSize;
            this.recordMarketPurchase(item.packSize);
            this.notify();
            this.save();
            return { success: true, item, count: item.packSize, pricePaid: finalPrice };
        }
        return { success: false, reason: 'deduct_failed', item };
    }

    // Nấu cơm: Thêm số lượng cơm theo batchSize của Kitchen Tier vào kho xe
    addRiceBall(fillingId, stars = 4) {
        if (this.inventory.length >= this.getMaxCapacity()) {
            return false;
        }

        const resolvedId = resolveFillingId(fillingId);
        const filling = FILLINGS[resolvedId] || FILLINGS.crab_egg_mayo;
        const item = {
            id: 'rice_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            filling: filling.id,
            stars: Math.max(3, Math.min(5, stars)),
            freshness: 100,
            name: `Cơm Nắm ${filling.name}`,
            timestamp: Date.now()
        };

        this.inventory.push(item);
        this.notify();
        this.save();
        return true;
    }

    // Lấy số lượng nắm cơm sản xuất mỗi lần nấu thủ công (1 -> 3 -> 6 -> 10 nắm)
    getKitchenBatchSize() {
        const tier = this.kitchenManualTier || this.kitchenTier || 1;
        const config = KITCHEN_MANUAL_TIERS[tier];
        return config ? config.batchSize : 1;
    }

    // Ghi nhận nấu cơm xong (cho NV 1)
    recordCooked(count = 1) {
        this.stats.cookedCount += count;
        this.notify();
        this.save();
    }

    setBrandName(name) {
        if (typeof name === 'string' && name.trim().length > 0) {
            this.brandName = name.trim().slice(0, 30);
            this.notify({ brandNameUpdated: this.brandName });
            this.save();
            return true;
        }
        return false;
    }

    // [BẢNG XẾP HẠNG TỶ PHÚ] Tính Tổng Tài Sản Ròng = Tiền mặt + Giá trị Xưởng, Xe và Chi nhánh
    getNetWorth() {
        let total = typeof this.money === 'number' && !isNaN(this.money) ? this.money : 0;

        // Giá trị tài sản phương tiện
        const vehicleValues = {
            walk: 0,
            bicycle: 500000,
            scooter: 3000000,
            van: 15000000
        };
        const vehicles = Array.isArray(this.unlockedVehicles) ? this.unlockedVehicles : ['walk'];
        vehicles.forEach(v => {
            total += vehicleValues[v] || 0;
        });

        // Giá trị Xưởng bếp & Dây chuyền tự động
        total += (this.kitchenTier || 1) * 2000000;
        total += (this.kitchenAutoLevel || 0) * 5000000;

        // Giá trị các Chi nhánh toàn quốc
        const branchBaseValues = {
            branch_hcm: 5000000,
            branch_daklak: 20000000,
            branch_vinh: 50000000,
            branch_hanoi: 100000000
        };
        for (const [bKey, bData] of Object.entries(this.branches || {})) {
            if (bData && bData.unlocked) {
                total += (branchBaseValues[bKey] || 5000000) + ((bData.level || 1) * 3000000);
            }
        }

        return total;
    }

    // [KẾT BẠN] Thêm bạn bè vào danh sách lưu trữ
    addFriend(friendData) {
        if (!friendData || !friendData.name) return false;
        if (!Array.isArray(this.friends)) this.friends = [];

        const cleanName = String(friendData.name).trim();
        const existingIdx = this.friends.findIndex(f => f.id === friendData.id || f.name.toLowerCase() === cleanName.toLowerCase());
        if (existingIdx !== -1) {
            this.friends[existingIdx] = {
                ...this.friends[existingIdx],
                ...friendData,
                name: cleanName
            };
            this.save();
            this.notify({ friendsUpdated: true });
            return true;
        }

        this.friends.push({
            id: friendData.id || 'f_' + Date.now(),
            name: cleanName,
            level: Number(friendData.level) || 1,
            city: friendData.city || 'hcm',
            addedAt: Date.now()
        });

        this.save();
        this.notify({ friendsUpdated: true });
        return true;
    }

    removeFriend(friendId) {
        if (!Array.isArray(this.friends)) return false;
        this.friends = this.friends.filter(f => f.id !== friendId && f.name !== friendId);
        this.save();
        this.notify({ friendsUpdated: true });
        return true;
    }

    isFriend(targetIdOrName) {
        if (!Array.isArray(this.friends) || !targetIdOrName) return false;
        const targetClean = String(targetIdOrName).trim().toLowerCase();
        return this.friends.some(f => f.id === targetIdOrName || f.name.toLowerCase() === targetClean);
    }

    addPrivateMessage(friendId, msg) {
        if (!this.privateMessages) this.privateMessages = {};
        if (!Array.isArray(this.privateMessages[friendId])) {
            this.privateMessages[friendId] = [];
        }
        this.privateMessages[friendId].push({
            from: msg.from || 'friend',
            senderName: msg.senderName || '',
            text: msg.text || '',
            time: msg.time || Date.now(),
            unread: msg.unread !== undefined ? msg.unread : true
        });
        if (msg.unread) {
            this.unreadMessagesCount = (this.unreadMessagesCount || 0) + 1;
        }
        this.save();
        this.notify({ messageReceived: true, friendId });
    }

    markMessagesAsRead(friendId) {
        if (!this.privateMessages || !Array.isArray(this.privateMessages[friendId])) return;
        let readCount = 0;
        this.privateMessages[friendId].forEach(m => {
            if (m.unread) {
                m.unread = false;
                readCount++;
            }
        });
        this.unreadMessagesCount = Math.max(0, (this.unreadMessagesCount || 0) - readCount);
        this.save();
        this.notify({ messagesRead: true, friendId });
    }

    record1v1Win() {
        if (!this.onlineStats) this.onlineStats = { wins1v1: 0, losses1v1: 0, coopContributedTotal: 0 };
        this.onlineStats.wins1v1 = (this.onlineStats.wins1v1 || 0) + 1;
        this.notify();
        this.save();
    }

    record1v1Loss() {
        if (!this.onlineStats) this.onlineStats = { wins1v1: 0, losses1v1: 0, coopContributedTotal: 0 };
        this.onlineStats.losses1v1 = (this.onlineStats.losses1v1 || 0) + 1;
        this.notify();
        this.save();
    }

    recordCoopContributed(count = 1) {
        if (!this.onlineStats) this.onlineStats = { wins1v1: 0, losses1v1: 0, coopContributedTotal: 0 };
        this.onlineStats.coopContributedTotal = (this.onlineStats.coopContributedTotal || 0) + Math.max(0, count);
        this.notify();
        this.save();
    }

    // Ghi nhận bán thành công tại Cổng Trường Học (cho NV 2)
    recordSoldSchool() {
        this.stats.soldSchool += 1;
        this.notify();
        this.save();
    }

    // Ghi nhận giao cơm tại Khu Văn Phòng (cho NV 3)
    recordSoldOfficeDelivery() {
        if (this.quests.activeId === 'nv3' && this.quests.nv3.status === 'in_progress') {
            this.quests.nv3.delivered += 1;
            if (this.quests.nv3.delivered >= this.quests.nv3.target) {
                this.quests.nv3.status = 'completed';
            }
            this.notify();
            this.save();
        }
    }

    // Ghi nhận bán vị 20k tại Tiểu học Hoa Mai (cho NV 5)
    recordSoldHoaMai20k() {
        this.stats.soldHoaMai20k = (this.stats.soldHoaMai20k || 0) + 1;
        this.stats.soldSchool = (this.stats.soldSchool || 0) + 1;
        this.notify();
        this.save();
    }

    // Ghi nhận phục vụ sinh viên tại Làng Đại Học (cho NV 6)
    recordServedUni() {
        this.stats.servedUni = (this.stats.servedUni || 0) + 1;
        this.notify();
        this.save();
    }

    // Ghi nhận bán vị 22k tại THPT Lê Quý Đôn (cho NV 7)
    recordSoldLequydon22k() {
        this.stats.soldLequydon22k = (this.stats.soldLequydon22k || 0) + 1;
        this.stats.soldSchool = (this.stats.soldSchool || 0) + 1;
        this.notify();
        this.save();
    }

    // Ghi nhận bán Bò phô mai tan chảy cho khách VIP tại Phố Đi Bộ (cho NV 8)
    recordSoldWalkStreetVip() {
        this.stats.soldWalkStreetVip = (this.stats.soldWalkStreetVip || 0) + 1;
        this.notify();
        this.save();
    }

    // Ghi nhận hoàn thành Nhiệm vụ phụ ngẫu nhiên GTA / Hỏa Tốc
    recordSideQuestDone() {
        if (!this.stats) this.stats = {};
        this.stats.sideQuestsCompleted = (this.stats.sideQuestsCompleted || 0) + 1;
        this.stats.expressCompletedCount = (this.stats.expressCompletedCount || 0) + 1;
        this.notify();
        this.save();
    }

    recordSideQuestCompleted() {
        return this.recordSideQuestDone();
    }

    // Ghi nhận mua hàng ở Chợ Đầu Mối (cho NV 2 & Thành tựu)
    recordMarketPurchase(count = 10) {
        if (!this.stats) this.stats = {};
        this.stats.marketBuyCount = (this.stats.marketBuyCount || 0) + 1;
        this.notify();
        this.save();
    }

    // Ghi nhận bán phân khúc giá (cho NV 3: đủ 20k, 22k, 25k)
    recordSoldPriceGroup(group) {
        if (!this.stats) this.stats = {};
        if (!this.stats.soldPriceGroups) {
            this.stats.soldPriceGroups = { '20k': 0, '22k': 0, '25k': 0 };
        }
        if (this.stats.soldPriceGroups[group] !== undefined) {
            this.stats.soldPriceGroups[group] += 1;
        }
        this.notify();
        this.save();
    }

    // Ghi nhận phục vụ khách giờ cao điểm (cho Thành tựu)
    recordRushHourCustomer() {
        if (!this.stats) this.stats = {};
        this.stats.rushHourServed = (this.stats.rushHourServed || 0) + 1;
        this.notify();
        this.save();
    }

    // Ghi nhận hoàn thành đơn giao hỏa tốc (cho NV 11 & Thành tựu)
    recordExpressCompleted() {
        if (!this.stats) this.stats = {};
        this.stats.expressCompletedCount = (this.stats.expressCompletedCount || 0) + 1;
        this.notify();
        this.save();
    }

    // Tìm và lấy ra 1 nắm cơm theo vị (ưu tiên cơm 5 sao để nhận thêm tip)
    removeRiceBallByFilling(fillingId) {
        if (!this.inventory || this.inventory.length === 0) {
            return null;
        }

        const resolvedTarget = resolveFillingId(fillingId);
        const matchingIndices = [];
        for (let i = 0; i < this.inventory.length; i++) {
            if (resolveFillingId(this.inventory[i].filling) === resolvedTarget) {
                matchingIndices.push(i);
            }
        }

        if (matchingIndices.length === 0) {
            return null;
        }

        let selectedIndex = matchingIndices[0];
        for (const idx of matchingIndices) {
            if (this.inventory[idx].stars === 5) {
                selectedIndex = idx;
                break;
            }
        }

        const [removedItem] = this.inventory.splice(selectedIndex, 1);
        this.notify();
        this.save();
        return removedItem;
    }

    getFillingCount(fillingId) {
        const resolvedTarget = resolveFillingId(fillingId);
        return this.inventory.filter(item => resolveFillingId(item.filling) === resolvedTarget).length;
    }

    getTotalRiceCount() {
        return this.inventory.length;
    }

    // Nâng cấp Phương tiện
    getNextVehicleToBuy() {
        const curIdx = VEHICLE_ORDER.indexOf(this.currentVehicle);
        if (curIdx >= 0 && curIdx < VEHICLE_ORDER.length - 1) {
            const nextKey = VEHICLE_ORDER[curIdx + 1];
            return VEHICLES[nextKey];
        }
        return null;
    }

    buyNextVehicle() {
        const nextVehicle = this.getNextVehicleToBuy();
        if (!nextVehicle) return false;

        if (this.deductMoney(nextVehicle.price)) {
            this.currentVehicle = nextVehicle.id;
            if (!this.unlockedVehicles.includes(nextVehicle.id)) {
                this.unlockedVehicles.push(nextVehicle.id);
            }
            this.notify();
            this.save();
            return true;
        }
        return false;
    }

    // --- 1. NHÁNH NĂNG SUẤT THỦ CÔNG (1 -> 3 -> 6 -> 10 NẮM) ---
    getNextKitchenManualTier() {
        const curTier = this.kitchenManualTier || this.kitchenTier || 1;
        return KITCHEN_MANUAL_TIERS[curTier + 1] || null;
    }

    getNextKitchenTier() {
        return this.getNextKitchenManualTier();
    }

    upgradeKitchenManual() {
        const nextTier = this.getNextKitchenManualTier();
        if (!nextTier) return false;

        if (this.deductMoney(nextTier.price)) {
            this.kitchenManualTier = nextTier.tier;
            this.kitchenTier = nextTier.tier;
            this.notify();
            this.save();
            return true;
        }
        return false;
    }

    upgradeKitchen() {
        return this.upgradeKitchenManual();
    }

    // --- 2. NHÁNH DÂY CHUYỀN TỰ ĐỘNG (AUTO-PRODUCTION MỖI 10S) ---
    getNextKitchenAutoConfig() {
        const nextLevel = (this.kitchenAutoLevel || 0) + 1;
        return KITCHEN_AUTO_CONFIG[nextLevel] || null;
    }

    upgradeKitchenAuto() {
        const nextCfg = this.getNextKitchenAutoConfig();
        if (!nextCfg) return false;

        if (this.deductMoney(nextCfg.price)) {
            this.kitchenAutoLevel = nextCfg.level;
            this.notify();
            this.save();
            return true;
        }
        return false;
    }

    // Sản xuất cơm tự động mỗi 15 giây (dừng lại an toàn khi nợ hóa đơn hoặc hết nguyên liệu)
    processAutoProduction() {
        if (!this.kitchenAutoLevel || this.kitchenAutoLevel <= 0) {
            return { produced: 0, reason: 'inactive' };
        }

        // Tạm ngưng nếu chưa trả đủ hóa đơn vận hành cuối ngày
        if (this.isOperatingHalted) {
            return { produced: 0, reason: 'halted_debt' };
        }

        const autoCfg = KITCHEN_AUTO_CONFIG[this.kitchenAutoLevel];
        if (!autoCfg) return { produced: 0, reason: 'invalid_level' };

        const desiredCount = autoCfg.ratePer15s || autoCfg.ratePer10s || 1;

        // Kiểm tra nguyên liệu hiện có (tuyệt đối không để âm nguyên liệu)
        const canProduce = Math.min(
            desiredCount,
            Math.max(0, (this.ingredients && this.ingredients.rice_seaweed) || 0),
            Math.max(0, (this.ingredients && this.ingredients.meat_seafood) || 0),
            Math.max(0, (this.ingredients && this.ingredients.cheese_sauce) || 0)
        );

        if (canProduce <= 0) {
            return { produced: 0, reason: 'out_of_ingredients' };
        }

        // Trừ nguyên liệu an toàn
        this.consumeIngredients(canProduce);

        if (!Array.isArray(this.kitchenStock)) {
            this.kitchenStock = [];
        }

        const candidateFillings = ['crab_egg_mayo', 'chicken_teriyaki', 'salmon_mayo', 'melting_beef_cheese'];
        let directToVehicle = 0;
        let toKitchenStock = 0;

        for (let i = 0; i < canProduce; i++) {
            const fillingKey = candidateFillings[i % candidateFillings.length];
            const fillingCfg = FILLINGS[fillingKey] || FILLINGS.crab_egg_mayo;
            const riceItem = {
                id: 'auto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                filling: fillingKey,
                stars: 4,
                freshness: 100, // Cơm mới sản xuất tươi 100%
                name: `Cơm Nắm ${fillingCfg.name}`,
                timestamp: Date.now()
            };

            // Nếu thùng xe của người chơi còn chỗ, ưu tiên đưa thẳng vào xe
            if (this.inventory.length < this.getMaxCapacity()) {
                this.inventory.push(riceItem);
                directToVehicle++;
            } else if (this.kitchenStock.length < 300) {
                // Kho xưởng chứa tối đa 300 nắm
                this.kitchenStock.push(riceItem);
                toKitchenStock++;
            }
        }

        this.notify();
        this.save();

        return {
            produced: canProduce,
            directToVehicle,
            toKitchenStock,
            totalStock: this.kitchenStock.length
        };
    }

    // Chuyển cơm từ Kho Xưởng sang Thùng Xe
    transferKitchenStockToVehicle(amount = 999) {
        if (!Array.isArray(this.kitchenStock) || this.kitchenStock.length === 0) {
            return 0;
        }

        const maxCap = this.getMaxCapacity();
        const availableSpace = Math.max(0, maxCap - this.inventory.length);
        if (availableSpace <= 0) return 0;

        const transferCount = Math.min(amount, availableSpace, this.kitchenStock.length);
        const transferred = this.kitchenStock.splice(0, transferCount);
        this.inventory.push(...transferred);

        this.notify();
        this.save();
        return transferCount;
    }

    // --- 3. QUẢN LÝ 4 CHI NHÁNH TOÀN QUỐC ---
    unlockBranch(branchId) {
        const config = BRANCH_CONFIGS[branchId];
        if (!config) return false;

        if (!this.branches) {
            this.branches = {};
        }
        if (!this.branches[branchId]) {
            this.branches[branchId] = { unlocked: false, level: 1 };
        }

        if (this.branches[branchId].unlocked) return false;

        // Kiểm tra điều kiện Level yêu cầu
        const reqLevel = config.minLevel || 1;
        if (this.level < reqLevel) {
            return false;
        }

        if (this.deductMoney(config.unlockPrice)) {
            this.branches[branchId].unlocked = true;
            this.branches[branchId].level = 1;
            this.notify();
            this.save();
            return true;
        }
        return false;
    }

    upgradeBranch(branchId) {
        const config = BRANCH_CONFIGS[branchId];
        if (!config) return false;

        const currentBranch = this.branches && this.branches[branchId];
        if (!currentBranch || !currentBranch.unlocked) return false;

        const curLevel = currentBranch.level || 1;
        if (curLevel >= 10) return false; // Mở rộng tối đa Level 10

        const nextLevel = curLevel + 1;
        const levelConfig = config.levels[nextLevel];
        if (!levelConfig) return false;

        if (this.deductMoney(levelConfig.upgradeCost)) {
            currentBranch.level = nextLevel;
            this.notify();
            this.save();
            return true;
        }
        return false;
    }

    // Kiểm tra cấp độ của một chi nhánh
    getBranchLevel(cityId) {
        if (!this.branches || !this.branches[cityId]) return 1;
        return this.branches[cityId].level || 1;
    }

    // Kiểm tra chi nhánh đã được mở khóa chưa
    isBranchUnlocked(cityId) {
        if (cityId === 'branch_hcm') return true;
        return Boolean(this.branches && this.branches[cityId] && this.branches[cityId].unlocked);
    }

    // Dịch chuyển sang bản đồ thành phố khác (giữ nguyên toàn bộ tài sản, kho cơm, phương tiện)
    switchCity(cityId) {
        const validCities = ['branch_hcm', 'branch_daklak', 'branch_vinh', 'branch_hanoi'];
        if (!validCities.includes(cityId)) return false;
        if (!this.isBranchUnlocked(cityId)) return false;

        this.currentCity = cityId;
        this.notify({ citySwitched: true, cityId });
        this.save();
        return true;
    }

    // Số điểm bán mở khóa theo cấp độ đô thị hóa: Cấp 1 -> 2 điểm; Cấp 2-3 -> 4 điểm; Cấp 4-5 -> 6 điểm
    getUnlockedSellingSpotsCount(cityId = this.currentCity) {
        const lvl = this.getBranchLevel(cityId);
        if (lvl <= 1) return 2;
        if (lvl <= 3) return 4;
        return 6;
    }

    // Hệ số cộng thưởng chuỗi chi nhánh (+10% cho mỗi chi nhánh mở thêm: 0%, 10%, 20%, 30%)
    getBranchChainSynergy() {
        if (!this.branches) return 0;
        let unlockedCount = 0;
        for (const bState of Object.values(this.branches)) {
            if (bState && bState.unlocked) unlockedCount++;
        }
        return Math.max(0, unlockedCount - 1) * 10;
    }

    getBranchTotalIncomePer10s() {
        if (!this.branches) return 0;
        let baseTotal = 0;
        for (const [bId, bState] of Object.entries(this.branches)) {
            if (bState && bState.unlocked) {
                const config = BRANCH_CONFIGS[bId];
                if (config && config.levels) {
                    const lvlCfg = config.levels[bState.level || 1];
                    if (lvlCfg) {
                        baseTotal += (lvlCfg.incomePer10s || 0);
                    }
                }
            }
        }
        const synergyPercent = this.getBranchChainSynergy();
        const multiplier = 1.0 + synergyPercent / 100;
        return Math.round(baseTotal * multiplier);
    }

    processBranchIncome() {
        if (this.isOperatingHalted) {
            return { totalIncome: 0, reason: 'halted_debt' };
        }
        let total = this.getBranchTotalIncomePer10s();
        const branchBonus = this.permanentBuffs?.branchIncomeBonus || 0;
        if (branchBonus > 0) {
            total = Math.round(total * (1 + branchBonus));
        }
        if (total > 0) {
            const hasRice = Boolean(this.ingredients && this.ingredients.rice_seaweed >= 1);
            if (!hasRice) {
                return { totalIncome: 0, reason: 'out_of_ingredients' };
            }
            this.ingredients.rice_seaweed = Math.max(0, this.ingredients.rice_seaweed - 1);
            this.addMoney(total);
            this.recordRevenue(total);
            return { totalIncome: total };
        }
        return { totalIncome: 0 };
    }

    // Thuê Nhân viên
    getStaffHirePrice() {
        return STAFF_CONFIG.basePrice + this.staffCount * STAFF_CONFIG.priceIncrement;
    }

    hireStaff() {
        const price = this.getStaffHirePrice();
        if (this.deductMoney(price)) {
            this.staffCount += 1;
            this.notify();
            this.save();
            return true;
        }
        return false;
    }

    // Kiểm tra xem có chấm đỏ thông báo không
    hasNotificationBadge() {
        if (this.canClaimCurrentQuest()) {
            return true;
        }

        // Kiểm tra Thành tựu có thể nhận
        if (this.achievements && Array.isArray(ACHIEVEMENT_ORDER)) {
            const claimed = this.achievements.claimedIds || [];
            for (const aId of ACHIEVEMENT_ORDER) {
                const ach = ACHIEVEMENTS_CONFIG[aId];
                if (ach && !claimed.includes(aId) && ach.isUnlocked(this)) {
                    return true;
                }
            }
        }

        // Kiểm tra Hợp đồng tiệc có thể giao
        if (this.contracts && Array.isArray(this.contracts.available)) {
            for (const c of this.contracts.available) {
                if (!c.fulfilled && this.checkContractDeliverable(c).deliverable) {
                    return true;
                }
            }
        }

        const nextVeh = this.getNextVehicleToBuy();
        if (nextVeh && this.money >= nextVeh.price) {
            return true;
        }

        const nextKitchen = this.getNextKitchenTier();
        if (nextKitchen && this.money >= nextKitchen.price) {
            return true;
        }

        const staffPrice = this.getStaffHirePrice();
        if (this.money >= staffPrice) {
            return true;
        }

        return false;
    }

    // Kiểm tra điều kiện hoàn thành cho 20 Nhiệm Vụ Cốt Truyện
    isQuestReady(qId) {
        if (!this.quests) return false;
        const stats = this.stats || {};
        switch (qId) {
            case 'nv1':
                return (stats.cookedCount || 0) >= 5;
            case 'nv2':
                return (stats.marketBuyCount || 0) >= 1;
            case 'nv3': {
                const p = stats.soldPriceGroups || {};
                return Boolean(p['20k'] > 0 && p['22k'] > 0 && p['25k'] > 0);
            }
            case 'nv4':
                return (this.unlockedVehicles || []).includes('bike') ||
                       Boolean(VEHICLES[this.currentVehicle] && VEHICLES[this.currentVehicle].level >= 2);
            case 'nv5':
                return (stats.cleanDaysCount || 0) >= 1 || (this.gameDay >= 2 && (stats.penaltiesCount || 0) === 0);
            case 'nv6':
                return (this.unlockedVehicles || []).includes('motorcycle') ||
                       Boolean(VEHICLES[this.currentVehicle] && VEHICLES[this.currentVehicle].level >= 5);
            case 'nv7':
                return (this.reputation || 0) >= 90;
            case 'nv8':
                return (stats.totalRevenue || 0) >= 5000000 || (this.money || 0) >= 5000000;
            case 'nv9':
                return (this.kitchenAutoLevel || 0) >= 2;
            case 'nv10':
                return this.getBranchLevel('branch_hcm') >= 3;
            case 'nv11':
                return ((stats.expressCompletedCount || 0) + (stats.sideQuestsCompleted || 0)) >= 5;
            case 'nv12':
                return (this.unlockedVehicles || []).includes('truck') ||
                       Boolean(VEHICLES[this.currentVehicle] && VEHICLES[this.currentVehicle].level >= 8);
            case 'nv13':
                return (this.reputation || 0) >= 500;
            case 'nv14':
                return (stats.contractsCompleted || 0) >= 1;
            case 'nv15':
                return (this.money || 0) >= 50000000;
            case 'nv16':
                return Boolean(this.branches?.branch_daklak?.unlocked);
            case 'nv17':
                return this.getBranchLevel('branch_daklak') >= 3;
            case 'nv18':
                return Boolean(this.branches?.branch_vinh?.unlocked);
            case 'nv19':
                return Boolean(this.branches?.branch_hanoi?.unlocked);
            case 'nv20':
                return this.getBranchLevel('branch_hanoi') >= 5;
            default:
                return false;
        }
    }

    canClaimCurrentQuest() {
        if (!this.quests) return false;
        const completed = Array.isArray(this.quests.completedIds) ? this.quests.completedIds : [];
        if (completed.includes(this.quests.activeId)) return false;
        return this.isQuestReady(this.quests.activeId);
    }

    // --- HỆ THỐNG HỢP ĐỒNG ĐẶT TIỆC (PARTY CONTRACTS) ---
    initContracts() {
        if (!this.contracts || !Array.isArray(this.contracts.available) || this.contracts.available.length === 0) {
            this.generateContracts();
        }
    }

    generateContracts() {
        const now = Date.now();
        this.contracts = {
            lastRefreshTime: now,
            refreshIntervalMs: 180000, // 3 phút
            available: [
                {
                    id: 'contract_easy_' + now,
                    tier: 'easy',
                    tierLabel: 'Dễ',
                    tierColor: '#10b981',
                    title: 'Hội Nghị Khối Văn Phòng',
                    desc: 'Đơn đặt tiệc buffet trưa cho khối văn phòng Quận 1.',
                    items: [
                        { fillingId: 'crab_egg_mayo', name: 'Thanh cua trứng mayo', count: 6 },
                        { fillingId: 'salmon_mayo', name: 'Cá hồi mayo', count: 6 }
                    ],
                    minFreshness: 75,
                    rewardMoney: 600000,
                    rewardExp: 150,
                    rewardFame: 10,
                    fulfilled: false
                },
                {
                    id: 'contract_med_' + now,
                    tier: 'medium',
                    tierLabel: 'Trung Bình',
                    tierColor: '#f59e0b',
                    title: 'Đại Tiệc Trường Học Ngoại Khóa',
                    desc: 'Phục vụ dã ngoại học sinh - sinh viên với hương vị đa dạng.',
                    items: [
                        { fillingId: 'chicken_teriyaki', name: 'Gà sốt Teriyaki', count: 8 },
                        { fillingId: 'beef_bbq', name: 'Bò BBQ', count: 8 },
                        { fillingId: 'pate_cheese', name: 'Pate phô mai', count: 6 }
                    ],
                    minFreshness: 80,
                    rewardMoney: 1600000,
                    rewardExp: 300,
                    rewardFame: 20,
                    fulfilled: false
                },
                {
                    id: 'contract_hard_' + now,
                    tier: 'hard',
                    tierLabel: 'Khó',
                    tierColor: '#ef4444',
                    title: 'Gala VIP Tập Đoàn Đa Quốc Gia',
                    desc: 'Tiệc thượng hạng đón tiếp đối tác quốc tế, tiêu chuẩn độ tươi khắt khe.',
                    items: [
                        { fillingId: 'chicken_teriyaki', name: 'Gà sốt Teriyaki', count: 8 },
                        { fillingId: 'salmon_mayo', name: 'Cá hồi mayo', count: 8 },
                        { fillingId: 'crab_egg_mayo', name: 'Thanh cua trứng mayo', count: 10 },
                        { fillingId: 'melting_beef_cheese', name: 'Bò phô mai tan chảy', count: 6 }
                    ],
                    minFreshness: 85,
                    rewardMoney: 4000000,
                    rewardExp: 600,
                    rewardFame: 40,
                    fulfilled: false
                }
            ]
        };
        this.notify();
        this.save();
    }

    checkContractDeliverable(contract) {
        if (!contract || !Array.isArray(contract.items)) {
            return { deliverable: false, reasons: ['Hợp đồng không hợp lệ'] };
        }
        const reasons = [];
        let deliverable = true;

        for (const item of contract.items) {
            const inStock = this.getFillingCount(item.fillingId);
            if (inStock < item.count) {
                deliverable = false;
                reasons.push(`Thiếu ${item.count - inStock} nắm ${item.name}`);
            } else {
                // Kiểm tra độ tươi trung bình
                const matching = (this.inventory || []).filter(r => resolveFillingId(r.filling) === resolveFillingId(item.fillingId));
                const sumFresh = matching.reduce((acc, r) => acc + (typeof r.freshness === 'number' ? r.freshness : 100), 0);
                const avgFresh = matching.length > 0 ? (sumFresh / matching.length) : 0;
                if (avgFresh < contract.minFreshness) {
                    deliverable = false;
                    reasons.push(`${item.name} độ tươi ${Math.round(avgFresh)}% < ${contract.minFreshness}%`);
                }
            }
        }

        return { deliverable, reasons };
    }

    deliverContract(contractId) {
        if (!this.contracts || !Array.isArray(this.contracts.available)) return { success: false, reason: 'no_contracts' };
        const contract = this.contracts.available.find(c => c.id === contractId);
        if (!contract) return { success: false, reason: 'not_found' };
        if (contract.fulfilled) return { success: false, reason: 'already_fulfilled' };

        const check = this.checkContractDeliverable(contract);
        if (!check.deliverable) {
            return { success: false, reason: 'requirements_not_met', details: check.reasons };
        }

        // Khấu trừ số lượng cơm tương ứng
        for (const item of contract.items) {
            for (let i = 0; i < item.count; i++) {
                this.removeRiceBallByFilling(item.fillingId);
            }
        }

        // Tính tiền thưởng có kèm Buff Vĩnh Viễn
        const contractBonus = this.permanentBuffs?.contractBonus || 0;
        const finalMoney = Math.round(contract.rewardMoney * (1 + contractBonus));
        const expBonus = this.permanentBuffs?.expBonus || 0;
        const finalExp = Math.round(contract.rewardExp * (1 + expBonus));

        this.addMoney(finalMoney);
        this.addExp(finalExp);
        if (typeof contract.rewardFame === 'number' && contract.rewardFame > 0) {
            this.reputation = Math.min(1000, (this.reputation || 0) + contract.rewardFame);
        }

        contract.fulfilled = true;
        if (!this.stats) this.stats = {};
        this.stats.contractsCompleted = (this.stats.contractsCompleted || 0) + 1;

        this.notify({ contractFulfilled: true, contractId, money: finalMoney, exp: finalExp });
        this.save();
        return { success: true, contract, finalMoney, finalExp };
    }

    // --- HỆ THỐNG THÀNH TỰU & BUFF VĨNH VIỄN ---
    claimAchievement(achId) {
        const ach = ACHIEVEMENTS_CONFIG[achId];
        if (!ach) return { success: false, reason: 'not_found' };
        if (!this.achievements) this.achievements = { unlockedIds: [], claimedIds: [] };
        if (this.achievements.claimedIds.includes(achId)) {
            return { success: false, reason: 'already_claimed' };
        }
        if (!ach.isUnlocked(this)) {
            return { success: false, reason: 'not_unlocked' };
        }

        this.achievements.claimedIds.push(achId);
        if (!this.achievements.unlockedIds.includes(achId)) {
            this.achievements.unlockedIds.push(achId);
        }

        // Kích hoạt buff vĩnh viễn
        if (ach.buff && typeof ach.buff === 'object') {
            if (!this.permanentBuffs) this.permanentBuffs = {};
            for (const [key, val] of Object.entries(ach.buff)) {
                this.permanentBuffs[key] = (this.permanentBuffs[key] || 0) + val;
            }
        }

        this.notify({ achievementClaimed: true, achId });
        this.save();
        return { success: true, achievement: ach };
    }

    save() {
        try {
            if (typeof localStorage === 'undefined') return;
            const data = {
                brandName: (typeof this.brandName === 'string' && this.brandName.trim()) ? this.brandName.trim().slice(0, 30) : 'Tiệm Cơm Nắm Sài Gòn',
                money: this.money,
                level: this.level,
                exp: this.exp,
                reputation: this.reputation !== undefined ? this.reputation : 100,
                gameTimeMinutes: this.gameTimeMinutes !== undefined ? this.gameTimeMinutes : 420,
                inventory: this.inventory,
                ingredients: this.ingredients,
                stats: this.stats,
                quests: {
                    activeId: this.quests.activeId,
                    completedIds: this.quests.completedIds,
                    nv3: {
                        status: this.quests.nv3.status,
                        startTime: this.quests.nv3.startTime,
                        durationSeconds: this.quests.nv3.durationSeconds,
                        delivered: this.quests.nv3.delivered,
                        target: this.quests.nv3.target
                    }
                },
                contracts: this.contracts,
                achievements: this.achievements,
                permanentBuffs: this.permanentBuffs,
                currentVehicle: this.currentVehicle,
                unlockedVehicles: this.unlockedVehicles,
                kitchenTier: this.kitchenManualTier || this.kitchenTier || 1,
                kitchenManualTier: this.kitchenManualTier || this.kitchenTier || 1,
                kitchenAutoLevel: this.kitchenAutoLevel || 0,
                kitchenStock: Array.isArray(this.kitchenStock) ? this.kitchenStock : [],
                currentCity: this.currentCity || 'branch_hcm',
                branches: this.branches,
                staffCount: this.staffCount,
                unpaidDebt: this.unpaidDebt || 0,
                isOperatingHalted: Boolean(this.isOperatingHalted),
                dailyRevenue: this.dailyRevenue || 0,
                dailyTips: this.dailyTips || 0,
                gameDay: this.gameDay || 1,
                friends: Array.isArray(this.friends) ? this.friends : [],
                privateMessages: this.privateMessages || {}
            };
            localStorage.setItem(this.saveKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Lỗi lưu LocalStorage:', e);
        }
    }

    load() {
        try {
            if (typeof localStorage === 'undefined') return false;
            let raw = localStorage.getItem(this.saveKey);
            if (!raw) {
                raw = localStorage.getItem('de_che_com_nam_save_v3');
            }
            if (!raw) {
                raw = localStorage.getItem('de_che_com_nam_save_v2');
            }
            if (!raw) return false;

            const data = JSON.parse(raw);
            this.brandName = (typeof data.brandName === 'string' && data.brandName.trim())
                ? data.brandName.trim().slice(0, 30) : 'Tiệm Cơm Nắm Sài Gòn';
            this.money = typeof data.money === 'number' && !isNaN(data.money) ? data.money : 50000;
            this.level = typeof data.level === 'number' && data.level >= 1 ? data.level : 1;
            this.exp = typeof data.exp === 'number' && data.exp >= 0 ? data.exp : 0;
            this.reputation = typeof data.reputation === 'number' && !isNaN(data.reputation) ? Math.max(0, Math.min(100, data.reputation)) : 100;
            this.gameTimeMinutes = typeof data.gameTimeMinutes === 'number' && !isNaN(data.gameTimeMinutes) ? (data.gameTimeMinutes % 1440) : 420;
            this.currentCity = typeof data.currentCity === 'string' && ['branch_hcm', 'branch_daklak', 'branch_vinh', 'branch_hanoi'].includes(data.currentCity)
                ? data.currentCity : 'branch_hcm';
            this.unpaidDebt = typeof data.unpaidDebt === 'number' && data.unpaidDebt >= 0 ? data.unpaidDebt : 0;
            this.isOperatingHalted = Boolean(data.isOperatingHalted);
            this.dailyRevenue = typeof data.dailyRevenue === 'number' ? data.dailyRevenue : 0;
            this.dailyTips = typeof data.dailyTips === 'number' ? data.dailyTips : 0;
            this.gameDay = typeof data.gameDay === 'number' && data.gameDay >= 1 ? data.gameDay : 1;

            if (Array.isArray(data.inventory)) {
                this.inventory = data.inventory;
                this.inventory.forEach(item => {
                    if (typeof item.freshness !== 'number') item.freshness = 100;
                });
            }

            if (data.ingredients && typeof data.ingredients === 'object') {
                this.ingredients = {
                    rice_seaweed: typeof data.ingredients.rice_seaweed === 'number' ? data.ingredients.rice_seaweed : 20,
                    meat_seafood: typeof data.ingredients.meat_seafood === 'number' ? data.ingredients.meat_seafood : 20,
                    cheese_sauce: typeof data.ingredients.cheese_sauce === 'number' ? data.ingredients.cheese_sauce : 20
                };
            }

            if (data.stats && typeof data.stats === 'object') {
                this.stats = {
                    cookedCount: data.stats.cookedCount || 0,
                    marketBuyCount: data.stats.marketBuyCount || 0,
                    soldPriceGroups: data.stats.soldPriceGroups || { '20k': 0, '22k': 0, '25k': 0 },
                    cleanDaysCount: data.stats.cleanDaysCount || 0,
                    penaltiesCount: data.stats.penaltiesCount || 0,
                    penaltiesToday: data.stats.penaltiesToday || 0,
                    totalRevenue: data.stats.totalRevenue || 0,
                    expressCompletedCount: data.stats.expressCompletedCount || 0,
                    contractsCompleted: data.stats.contractsCompleted || 0,
                    rushHourServed: data.stats.rushHourServed || 0,
                    soldSchool: data.stats.soldSchool || 0,
                    soldOfficeDelivery: data.stats.soldOfficeDelivery || 0,
                    soldHoaMai20k: data.stats.soldHoaMai20k || 0,
                    servedUni: data.stats.servedUni || 0,
                    soldLequydon22k: data.stats.soldLequydon22k || 0,
                    soldWalkStreetVip: data.stats.soldWalkStreetVip || 0,
                    sideQuestsCompleted: data.stats.sideQuestsCompleted || 0
                };
            }

            if (data.quests && typeof data.quests === 'object') {
                this.quests.activeId = data.quests.activeId || 'nv1';
                this.quests.completedIds = Array.isArray(data.quests.completedIds) ? data.quests.completedIds : [];
                if (data.quests.nv3) {
                    this.quests.nv3.status = data.quests.nv3.status || 'not_started';
                    this.quests.nv3.startTime = data.quests.nv3.startTime || null;
                    this.quests.nv3.delivered = data.quests.nv3.delivered || 0;
                }
            }

            if (data.contracts && typeof data.contracts === 'object') {
                this.contracts = data.contracts;
            }
            if (data.achievements && typeof data.achievements === 'object') {
                this.achievements = data.achievements;
            }
            if (data.permanentBuffs && typeof data.permanentBuffs === 'object') {
                this.permanentBuffs = data.permanentBuffs;
            }

            if (data.currentVehicle) {
                this.currentVehicle = VEHICLES[data.currentVehicle] ? data.currentVehicle : 'walk';
            }
            if (Array.isArray(data.unlockedVehicles)) {
                this.unlockedVehicles = data.unlockedVehicles;
            }
            if (typeof data.kitchenManualTier === 'number' && KITCHEN_MANUAL_TIERS[data.kitchenManualTier]) {
                this.kitchenManualTier = data.kitchenManualTier;
                this.kitchenTier = data.kitchenManualTier;
            } else if (typeof data.kitchenTier === 'number' && KITCHEN_MANUAL_TIERS[data.kitchenTier]) {
                this.kitchenTier = data.kitchenTier;
                this.kitchenManualTier = data.kitchenTier;
            }
            if (typeof data.kitchenAutoLevel === 'number') {
                this.kitchenAutoLevel = Math.max(0, Math.min(10, data.kitchenAutoLevel));
            }
            if (Array.isArray(data.kitchenStock)) {
                this.kitchenStock = data.kitchenStock;
            }
            if (data.branches && typeof data.branches === 'object') {
                this.branches = data.branches;
            } else if (data.branches === null) {
                this.branches = null;
            }
            if (typeof data.staffCount === 'number' && data.staffCount >= 0) {
                this.staffCount = data.staffCount;
            }

            if (Array.isArray(data.friends)) {
                this.friends = data.friends;
            }
            if (data.privateMessages && typeof data.privateMessages === 'object') {
                this.privateMessages = data.privateMessages;
            }

            this.ensureIntegrity();
            this.notify();
            return true;
        } catch (e) {
            console.error('Lỗi nạp LocalStorage, phục hồi mặc định an toàn:', e);
            this.money = 50000;
            this.level = 1;
            this.exp = 0;
            this.inventory = [];
            this.ensureIntegrity();
            return false;
        }
    }

    // Thiết lập lại toàn bộ dữ liệu game về mốc ban đầu (kèm hộp thoại xác nhận an toàn)
    resetGame(force = false) {
        if (!force && typeof window !== 'undefined' && typeof window.confirm === 'function') {
            const confirmed = window.confirm(
                '⚠️ BẠN CÓ CHẮC CHẮN MUỐN CHƠI LẠI TỪ ĐẦU?\n\n' +
                'Toàn bộ tiền tích lũy, cấp độ RPG, kho cơm nắm và tiến trình 4 chi nhánh sẽ được thiết lập lại từ đầu!'
            );
            if (!confirmed) return false;
        }

        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(this.saveKey);
                localStorage.removeItem('de_che_com_nam_save_v3');
                localStorage.removeItem('de_che_com_nam_save_v2');
            }
        } catch (e) {
            console.warn('Lỗi xóa LocalStorage khi reset game:', e);
        }

        // Đặt lại các giá trị cốt lõi
        this.money = 50000;
        this.level = 1;
        this.exp = 0;
        this.reputation = 100;
        this.gameTimeMinutes = 420;
        this.inventory = [];
        this.ingredients = { rice_seaweed: 20, meat_seafood: 20, cheese_sauce: 20 };
        this.stats = {
            cookedCount: 0,
            marketBuyCount: 0,
            soldPriceGroups: { '20k': 0, '22k': 0, '25k': 0 },
            cleanDaysCount: 0,
            penaltiesCount: 0,
            penaltiesToday: 0,
            totalRevenue: 0,
            expressCompletedCount: 0,
            contractsCompleted: 0,
            rushHourServed: 0,
            soldSchool: 0,
            soldOfficeDelivery: 0,
            soldHoaMai20k: 0,
            servedUni: 0,
            soldLequydon22k: 0,
            soldWalkStreetVip: 0,
            sideQuestsCompleted: 0
        };
        this.quests = {
            activeId: 'nv1',
            completedIds: [],
            claiming: false,
            nv3: {
                status: 'not_started',
                startTime: null,
                durationSeconds: 90,
                delivered: 0,
                target: 5
            }
        };
        this.contracts = {
            available: [],
            lastRefreshTime: Date.now(),
            refreshIntervalMs: 180000
        };
        this.achievements = {
            unlockedIds: [],
            claimedIds: []
        };
        this.permanentBuffs = {
            cookSpeed: 0,
            heatRateReduce: 0,
            retailBonus: 0,
            branchIncomeBonus: 0,
            autoKitchenSpeed: 0,
            contractBonus: 0,
            expressTimeBonus: 0,
            expBonus: 0,
            moveSpeedBonus: 0,
            freshnessHoldBonus: 0,
            marketDiscount: 0,
            allBonus: 0
        };
        this.initContracts();
        this.currentVehicle = 'walk';
        this.unlockedVehicles = ['walk'];
        this.kitchenTier = 1;
        this.kitchenManualTier = 1;
        this.kitchenAutoLevel = 0;
        this.kitchenStock = [];
        this.staffCount = 0;
        this.currentCity = 'branch_hcm';
        this.branches = {
            branch_hcm: { unlocked: true, level: 1 },
            branch_daklak: { unlocked: false, level: 1 },
            branch_vinh: { unlocked: false, level: 1 },
            branch_hanoi: { unlocked: false, level: 1 }
        };

        this.ensureIntegrity();
        this.save();
        this.notify({ reset: true });

        if (typeof window !== 'undefined' && window.location && typeof window.location.reload === 'function') {
            window.location.reload();
        }
        return true;
    }

    ensureIntegrity() {
        if (typeof this.money !== 'number' || isNaN(this.money)) this.money = 50000;
        if (typeof this.level !== 'number' || this.level < 1) this.level = 1;
        if (typeof this.exp !== 'number' || this.exp < 0) this.exp = 0;
        if (typeof this.reputation !== 'number' || isNaN(this.reputation)) this.reputation = 100;
        this.reputation = Math.max(0, Math.min(100, Math.round(this.reputation)));
        if (typeof this.brandName !== 'string' || !this.brandName.trim()) {
            this.brandName = 'Tiệm Cơm Nắm Sài Gòn';
        }
        if (!this.onlineStats || typeof this.onlineStats !== 'object') {
            this.onlineStats = { wins1v1: 0, losses1v1: 0, coopContributedTotal: 0 };
        } else {
            this.onlineStats.wins1v1 = typeof this.onlineStats.wins1v1 === 'number' ? this.onlineStats.wins1v1 : 0;
            this.onlineStats.losses1v1 = typeof this.onlineStats.losses1v1 === 'number' ? this.onlineStats.losses1v1 : 0;
            this.onlineStats.coopContributedTotal = typeof this.onlineStats.coopContributedTotal === 'number' ? this.onlineStats.coopContributedTotal : 0;
        }
        if (!Array.isArray(this.inventory)) {
            this.inventory = [];
        } else {
            // Tự động chuyển đổi các mã vị cũ sang mã vị chuẩn 15 vị
            this.inventory.forEach(item => {
                if (item && item.filling) {
                    item.filling = resolveFillingId(item.filling);
                    const cfg = FILLINGS[item.filling];
                    if (cfg) {
                        item.name = `Cơm Nắm ${cfg.name}`;
                    }
                }
            });
        }

        if (!this.ingredients || typeof this.ingredients !== 'object') {
            this.ingredients = { rice_seaweed: 20, meat_seafood: 20, cheese_sauce: 20 };
        } else {
            if (typeof this.ingredients.rice_seaweed !== 'number') this.ingredients.rice_seaweed = 20;
            if (typeof this.ingredients.meat_seafood !== 'number') this.ingredients.meat_seafood = 20;
            if (typeof this.ingredients.cheese_sauce !== 'number') this.ingredients.cheese_sauce = 20;
        }

        if (!this.stats || typeof this.stats !== 'object') {
            this.stats = {
                cookedCount: 0,
                marketBuyCount: 0,
                soldPriceGroups: { '20k': 0, '22k': 0, '25k': 0 },
                cleanDaysCount: 0,
                penaltiesCount: 0,
                penaltiesToday: 0,
                totalRevenue: 0,
                expressCompletedCount: 0,
                contractsCompleted: 0,
                rushHourServed: 0,
                soldSchool: 0,
                soldOfficeDelivery: 0,
                soldHoaMai20k: 0,
                servedUni: 0,
                soldLequydon22k: 0,
                soldWalkStreetVip: 0,
                sideQuestsCompleted: 0
            };
        } else {
            this.stats.cookedCount = typeof this.stats.cookedCount === 'number' ? this.stats.cookedCount : 0;
            this.stats.marketBuyCount = typeof this.stats.marketBuyCount === 'number' ? this.stats.marketBuyCount : 0;
            if (!this.stats.soldPriceGroups || typeof this.stats.soldPriceGroups !== 'object') {
                this.stats.soldPriceGroups = { '20k': 0, '22k': 0, '25k': 0 };
            }
            this.stats.cleanDaysCount = typeof this.stats.cleanDaysCount === 'number' ? this.stats.cleanDaysCount : 0;
            this.stats.penaltiesCount = typeof this.stats.penaltiesCount === 'number' ? this.stats.penaltiesCount : 0;
            this.stats.penaltiesToday = typeof this.stats.penaltiesToday === 'number' ? this.stats.penaltiesToday : 0;
            this.stats.totalRevenue = typeof this.stats.totalRevenue === 'number' ? this.stats.totalRevenue : 0;
            this.stats.expressCompletedCount = typeof this.stats.expressCompletedCount === 'number' ? this.stats.expressCompletedCount : 0;
            this.stats.contractsCompleted = typeof this.stats.contractsCompleted === 'number' ? this.stats.contractsCompleted : 0;
            this.stats.rushHourServed = typeof this.stats.rushHourServed === 'number' ? this.stats.rushHourServed : 0;
            this.stats.soldSchool = typeof this.stats.soldSchool === 'number' ? this.stats.soldSchool : 0;
            this.stats.soldOfficeDelivery = typeof this.stats.soldOfficeDelivery === 'number' ? this.stats.soldOfficeDelivery : 0;
            this.stats.soldHoaMai20k = typeof this.stats.soldHoaMai20k === 'number' ? this.stats.soldHoaMai20k : 0;
            this.stats.servedUni = typeof this.stats.servedUni === 'number' ? this.stats.servedUni : 0;
            this.stats.soldLequydon22k = typeof this.stats.soldLequydon22k === 'number' ? this.stats.soldLequydon22k : 0;
            this.stats.soldWalkStreetVip = typeof this.stats.soldWalkStreetVip === 'number' ? this.stats.soldWalkStreetVip : 0;
            this.stats.sideQuestsCompleted = typeof this.stats.sideQuestsCompleted === 'number' ? this.stats.sideQuestsCompleted : 0;
        }

        if (!this.quests || typeof this.quests !== 'object') {
            this.quests = {
                activeId: 'nv1',
                completedIds: [],
                claiming: false,
                nv3: {
                    status: 'not_started',
                    startTime: null,
                    durationSeconds: 90,
                    delivered: 0,
                    target: 5
                }
            };
        } else {
            const validIds = [
                'nv1', 'nv2', 'nv3', 'nv4', 'nv5',
                'nv6', 'nv7', 'nv8', 'nv9', 'nv10',
                'nv11', 'nv12', 'nv13', 'nv14', 'nv15',
                'nv16', 'nv17', 'nv18', 'nv19', 'nv20',
                'all_done'
            ];
            this.quests.activeId = typeof this.quests.activeId === 'string' && validIds.includes(this.quests.activeId)
                ? this.quests.activeId : 'nv1';
            this.quests.completedIds = Array.isArray(this.quests.completedIds) ? this.quests.completedIds : [];
            this.quests.claiming = false;

            if (!this.quests.nv3 || typeof this.quests.nv3 !== 'object') {
                this.quests.nv3 = {
                    status: 'not_started',
                    startTime: null,
                    durationSeconds: 90,
                    delivered: 0,
                    target: 5
                };
            } else {
                this.quests.nv3.status = typeof this.quests.nv3.status === 'string' ? this.quests.nv3.status : 'not_started';
                this.quests.nv3.startTime = typeof this.quests.nv3.startTime === 'number' ? this.quests.nv3.startTime : null;
                this.quests.nv3.durationSeconds = 90;
                this.quests.nv3.delivered = typeof this.quests.nv3.delivered === 'number' ? this.quests.nv3.delivered : 0;
                this.quests.nv3.target = 5;
            }
        }

        if (!this.contracts || typeof this.contracts !== 'object' || !Array.isArray(this.contracts.available) || this.contracts.available.length === 0) {
            this.initContracts();
        }

        if (!this.achievements || typeof this.achievements !== 'object') {
            this.achievements = { unlockedIds: [], claimedIds: [] };
        } else {
            if (!Array.isArray(this.achievements.unlockedIds)) this.achievements.unlockedIds = [];
            if (!Array.isArray(this.achievements.claimedIds)) this.achievements.claimedIds = [];
        }

        if (!this.permanentBuffs || typeof this.permanentBuffs !== 'object') {
            this.permanentBuffs = {
                cookSpeed: 0,
                heatRateReduce: 0,
                retailBonus: 0,
                branchIncomeBonus: 0,
                autoKitchenSpeed: 0,
                contractBonus: 0,
                expressTimeBonus: 0,
                expBonus: 0,
                moveSpeedBonus: 0,
                freshnessHoldBonus: 0,
                marketDiscount: 0,
                allBonus: 0
            };
        }

        if (!this.currentVehicle || !VEHICLES[this.currentVehicle]) {
            this.currentVehicle = 'walk';
        }
        if (!Array.isArray(this.unlockedVehicles) || !this.unlockedVehicles.includes('walk')) {
            this.unlockedVehicles = ['walk'];
        }
        if (typeof this.kitchenManualTier !== 'number' || !KITCHEN_MANUAL_TIERS[this.kitchenManualTier]) {
            this.kitchenManualTier = (typeof this.kitchenTier === 'number' && KITCHEN_MANUAL_TIERS[this.kitchenTier]) ? this.kitchenTier : 1;
        }
        this.kitchenTier = this.kitchenManualTier;

        if (typeof this.kitchenAutoLevel !== 'number' || this.kitchenAutoLevel < 0 || this.kitchenAutoLevel > 10) {
            this.kitchenAutoLevel = 0;
        }

        if (!Array.isArray(this.kitchenStock)) {
            this.kitchenStock = [];
        }

        const branchIds = ['branch_hcm', 'branch_daklak', 'branch_vinh', 'branch_hanoi'];
        if (!this.branches || typeof this.branches !== 'object') {
            this.branches = {};
        }
        branchIds.forEach(bId => {
            if (!this.branches[bId] || typeof this.branches[bId] !== 'object') {
                this.branches[bId] = { unlocked: bId === 'branch_hcm', level: 1 };
            } else {
                this.branches[bId].unlocked = bId === 'branch_hcm' ? true : Boolean(this.branches[bId].unlocked);
                const lvl = this.branches[bId].level;
                this.branches[bId].level = (typeof lvl === 'number' && lvl >= 1 && lvl <= 10) ? Math.floor(lvl) : 1;
            }
        });

        if (typeof this.staffCount !== 'number' || this.staffCount < 0) {
            this.staffCount = 0;
        }
    }
}

export const state = new GameState();
