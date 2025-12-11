/**
 * 🍽️ 美食分类数据库
 * 
 * 包含:
 * - 食物主分类 (中餐、西餐、日韩料理等)
 * - 子分类 (八大菜系、快餐品牌等)
 * - 预设食物选项
 * - 标签系统 (口味、价格、场景等)
 */

// ===========================================
// 类型定义
// ===========================================

/** 食物分类 */
export interface FoodCategory {
    id: string;
    name: string;
    emoji: string;
    description: string;
    subCategories?: SubCategory[];
}

/** 子分类 */
export interface SubCategory {
    id: string;
    name: string;
    emoji: string;
}

/** 预设食物选项 */
export interface PresetFood {
    name: string;
    emoji: string;
    category: string;
    subCategory?: string;
    tags: string[];
}

/** 食物标签 */
export interface FoodTag {
    id: string;
    name: string;
    emoji: string;
    group: 'taste' | 'price' | 'scene' | 'diet';
}

// ===========================================
// 主分类定义
// ===========================================

export const FOOD_CATEGORIES: FoodCategory[] = [
    // ===== 中式美食 =====
    {
        id: 'chinese',
        name: '中餐',
        emoji: '🍜',
        description: '博大精深的中国美食',
        subCategories: [
            { id: 'sichuan', name: '川菜', emoji: '🌶️' },
            { id: 'cantonese', name: '粤菜', emoji: '🦐' },
            { id: 'shandong', name: '鲁菜', emoji: '🐟' },
            { id: 'jiangsu', name: '苏菜', emoji: '🦀' },
            { id: 'zhejiang', name: '浙菜', emoji: '🍵' },
            { id: 'fujian', name: '闽菜', emoji: '🥣' },
            { id: 'hunan', name: '湘菜', emoji: '🔥' },
            { id: 'anhui', name: '徽菜', emoji: '🏔️' },
            { id: 'northeastern', name: '东北菜', emoji: '🥟' },
            { id: 'beijing', name: '京菜', emoji: '🦆' },
            { id: 'shaanxi', name: '陕西菜', emoji: '🍝' },
            { id: 'yunnan', name: '云南菜', emoji: '🍄' },
            { id: 'xinjiang', name: '新疆菜', emoji: '🐑' },
        ],
    },

    // ===== 日韩料理 =====
    {
        id: 'japanese',
        name: '日料',
        emoji: '🍣',
        description: '精致的日本料理',
        subCategories: [
            { id: 'sushi', name: '寿司', emoji: '🍣' },
            { id: 'ramen', name: '拉面', emoji: '🍜' },
            { id: 'sashimi', name: '刺身', emoji: '🐟' },
            { id: 'izakaya', name: '居酒屋', emoji: '🍶' },
            { id: 'tempura', name: '天妇罗', emoji: '🍤' },
            { id: 'donburi', name: '丼饭', emoji: '🍚' },
            { id: 'udon', name: '乌冬面', emoji: '🥢' },
        ],
    },
    {
        id: 'korean',
        name: '韩餐',
        emoji: '🍲',
        description: '韩国特色美食',
        subCategories: [
            { id: 'kbbq', name: '韩式烤肉', emoji: '🥩' },
            { id: 'kimchi', name: '韩式泡菜', emoji: '🥬' },
            { id: 'bibimbap', name: '石锅拌饭', emoji: '🍚' },
            { id: 'fried_chicken', name: '韩式炸鸡', emoji: '🍗' },
            { id: 'stew', name: '韩式锅物', emoji: '🍲' },
        ],
    },

    // ===== 西式美食 =====
    {
        id: 'western',
        name: '西餐',
        emoji: '🍝',
        description: '欧美风味餐饮',
        subCategories: [
            { id: 'steak', name: '牛排', emoji: '🥩' },
            { id: 'pasta', name: '意面', emoji: '🍝' },
            { id: 'pizza', name: '披萨', emoji: '🍕' },
            { id: 'french', name: '法餐', emoji: '🥐' },
            { id: 'brunch', name: '早午餐', emoji: '🥞' },
            { id: 'salad', name: '沙拉', emoji: '🥗' },
        ],
    },

    // ===== 快餐 =====
    {
        id: 'fastfood',
        name: '快餐',
        emoji: '🍔',
        description: '快捷便利的快餐',
        subCategories: [
            { id: 'burger', name: '汉堡', emoji: '🍔' },
            { id: 'fried_chicken', name: '炸鸡', emoji: '🍗' },
            { id: 'fries', name: '薯条', emoji: '🍟' },
            { id: 'sandwich', name: '三明治', emoji: '🥪' },
            { id: 'chinese_fast', name: '中式快餐', emoji: '🍱' },
        ],
    },

    // ===== 火锅 =====
    {
        id: 'hotpot',
        name: '火锅',
        emoji: '🍲',
        description: '热气腾腾的火锅',
        subCategories: [
            { id: 'sichuan_hotpot', name: '川味火锅', emoji: '🌶️' },
            { id: 'beijing_hotpot', name: '老北京涮锅', emoji: '🥬' },
            { id: 'chaoshan', name: '潮汕牛肉锅', emoji: '🐂' },
            { id: 'fish_hotpot', name: '鱼火锅', emoji: '🐟' },
            { id: 'mushroom', name: '菌菇锅', emoji: '🍄' },
            { id: 'malatang', name: '麻辣烫', emoji: '🥢' },
        ],
    },

    // ===== 烧烤 =====
    {
        id: 'bbq',
        name: '烧烤',
        emoji: '🍢',
        description: '美味的烧烤串串',
        subCategories: [
            { id: 'skewers', name: '烤串', emoji: '🍢' },
            { id: 'grilled_fish', name: '烤鱼', emoji: '🐟' },
            { id: 'yakiniku', name: '日式烤肉', emoji: '🥩' },
            { id: 'lamb', name: '烤羊肉', emoji: '🐑' },
            { id: 'seafood_bbq', name: '海鲜烧烤', emoji: '🦐' },
        ],
    },

    // ===== 小吃 =====
    {
        id: 'snacks',
        name: '小吃',
        emoji: '🥟',
        description: '各地特色小吃',
        subCategories: [
            { id: 'dumplings', name: '饺子馄饨', emoji: '🥟' },
            { id: 'noodles', name: '面食', emoji: '🍜' },
            { id: 'rice_noodle', name: '米粉', emoji: '🍝' },
            { id: 'pancake', name: '煎饼烙饼', emoji: '🥞' },
            { id: 'fried', name: '油炸小吃', emoji: '🍟' },
            { id: 'shaxian', name: '沙县小吃', emoji: '🥡' },
            { id: 'lanzhou', name: '兰州拉面', emoji: '🍜' },
        ],
    },

    // ===== 东南亚 =====
    {
        id: 'southeast_asian',
        name: '东南亚',
        emoji: '🍛',
        description: '东南亚风味',
        subCategories: [
            { id: 'thai', name: '泰国菜', emoji: '🍜' },
            { id: 'vietnamese', name: '越南菜', emoji: '🥖' },
            { id: 'indian', name: '印度菜', emoji: '🍛' },
            { id: 'malaysian', name: '马来西亚', emoji: '🍢' },
            { id: 'singapore', name: '新加坡', emoji: '🦀' },
        ],
    },

    // ===== 甜点饮品 =====
    {
        id: 'dessert',
        name: '甜点饮品',
        emoji: '🧋',
        description: '甜品和饮料',
        subCategories: [
            { id: 'milk_tea', name: '奶茶', emoji: '🧋' },
            { id: 'coffee', name: '咖啡', emoji: '☕' },
            { id: 'cake', name: '蛋糕', emoji: '🍰' },
            { id: 'ice_cream', name: '冰淇淋', emoji: '🍦' },
            { id: 'fruit_tea', name: '果茶', emoji: '🍹' },
            { id: 'bakery', name: '面包烘焙', emoji: '🥐' },
        ],
    },

    // ===== 海鲜 =====
    {
        id: 'seafood',
        name: '海鲜',
        emoji: '🦞',
        description: '新鲜海产',
        subCategories: [
            { id: 'crab', name: '螃蟹', emoji: '🦀' },
            { id: 'shrimp', name: '虾', emoji: '🦐' },
            { id: 'lobster', name: '龙虾', emoji: '🦞' },
            { id: 'fish', name: '鱼', emoji: '🐟' },
            { id: 'shellfish', name: '贝类', emoji: '🦪' },
        ],
    },

    // ===== 素食 =====
    {
        id: 'vegetarian',
        name: '素食',
        emoji: '🥗',
        description: '健康素食',
        subCategories: [
            { id: 'vegan', name: '纯素', emoji: '🌱' },
            { id: 'buddhist', name: '素斋', emoji: '🧘' },
            { id: 'salad', name: '沙拉', emoji: '🥗' },
            { id: 'light', name: '轻食', emoji: '🥒' },
        ],
    },
];

// ===========================================
// 标签系统
// ===========================================

export const FOOD_TAGS: FoodTag[] = [
    // 口味标签
    { id: 'spicy', name: '辣', emoji: '🌶️', group: 'taste' },
    { id: 'mild', name: '清淡', emoji: '🥬', group: 'taste' },
    { id: 'sweet', name: '甜', emoji: '🍯', group: 'taste' },
    { id: 'sour', name: '酸', emoji: '🍋', group: 'taste' },
    { id: 'salty', name: '咸', emoji: '🧂', group: 'taste' },
    { id: 'savory', name: '鲜', emoji: '🍖', group: 'taste' },
    { id: 'numbing', name: '麻', emoji: '⚡', group: 'taste' },

    // 价格标签
    { id: 'cheap', name: '实惠', emoji: '💰', group: 'price' },
    { id: 'moderate', name: '中等', emoji: '💵', group: 'price' },
    { id: 'expensive', name: '奢华', emoji: '💎', group: 'price' },

    // 场景标签
    { id: 'dating', name: '约会', emoji: '💕', group: 'scene' },
    { id: 'family', name: '家庭聚餐', emoji: '👨‍👩‍👧', group: 'scene' },
    { id: 'friends', name: '朋友聚会', emoji: '🎉', group: 'scene' },
    { id: 'solo', name: '一人食', emoji: '🧑', group: 'scene' },
    { id: 'business', name: '商务', emoji: '💼', group: 'scene' },
    { id: 'late_night', name: '夜宵', emoji: '🌙', group: 'scene' },
    { id: 'brunch', name: '早午餐', emoji: '☀️', group: 'scene' },

    // 饮食偏好
    { id: 'healthy', name: '健康', emoji: '💪', group: 'diet' },
    { id: 'low_cal', name: '低卡', emoji: '🥗', group: 'diet' },
    { id: 'high_protein', name: '高蛋白', emoji: '🥩', group: 'diet' },
    { id: 'gluten_free', name: '无麸质', emoji: '🌾', group: 'diet' },
    { id: 'halal', name: '清真', emoji: '☪️', group: 'diet' },
];

// ===========================================
// 预设食物选项 (常见餐厅/菜品)
// ===========================================

export const PRESET_FOODS: PresetFood[] = [
    // ========== 快餐品牌 ==========
    { name: '麦当劳', emoji: '🍟', category: 'fastfood', subCategory: 'burger', tags: ['cheap', 'fast'] },
    { name: '肯德基', emoji: '🍗', category: 'fastfood', subCategory: 'fried_chicken', tags: ['cheap', 'fast'] },
    { name: '必胜客', emoji: '🍕', category: 'fastfood', subCategory: 'pizza', tags: ['moderate', 'dating'] },
    { name: '汉堡王', emoji: '🍔', category: 'fastfood', subCategory: 'burger', tags: ['cheap', 'fast'] },
    { name: '德克士', emoji: '🍗', category: 'fastfood', subCategory: 'fried_chicken', tags: ['cheap', 'fast'] },
    { name: '华莱士', emoji: '🍔', category: 'fastfood', subCategory: 'burger', tags: ['cheap', 'fast'] },
    { name: '赛百味', emoji: '🥪', category: 'fastfood', subCategory: 'sandwich', tags: ['healthy', 'moderate'] },
    { name: '塔斯汀', emoji: '🍔', category: 'fastfood', subCategory: 'burger', tags: ['cheap', 'fast'] },
    { name: '派乐汉堡', emoji: '🍔', category: 'fastfood', subCategory: 'burger', tags: ['cheap', 'fast'] },
    { name: '正新鸡排', emoji: '🍗', category: 'fastfood', subCategory: 'fried_chicken', tags: ['cheap', 'late_night'] },
    { name: '叫了只炸鸡', emoji: '🍗', category: 'fastfood', subCategory: 'fried_chicken', tags: ['cheap', 'late_night'] },

    // ========== 奶茶咖啡 ==========
    { name: '喜茶', emoji: '🧋', category: 'dessert', subCategory: 'milk_tea', tags: ['moderate', 'dating'] },
    { name: '奈雪的茶', emoji: '🧋', category: 'dessert', subCategory: 'milk_tea', tags: ['moderate', 'dating'] },
    { name: '瑞幸咖啡', emoji: '☕', category: 'dessert', subCategory: 'coffee', tags: ['cheap', 'fast'] },
    { name: '星巴克', emoji: '☕', category: 'dessert', subCategory: 'coffee', tags: ['moderate', 'business'] },
    { name: '蜜雪冰城', emoji: '🍦', category: 'dessert', subCategory: 'milk_tea', tags: ['cheap', 'fast'] },
    { name: 'CoCo都可', emoji: '🧋', category: 'dessert', subCategory: 'milk_tea', tags: ['cheap'] },
    { name: '一点点', emoji: '🧋', category: 'dessert', subCategory: 'milk_tea', tags: ['cheap'] },
    { name: '茶百道', emoji: '🧋', category: 'dessert', subCategory: 'milk_tea', tags: ['moderate'] },
    { name: '霸王茶姬', emoji: '🍵', category: 'dessert', subCategory: 'milk_tea', tags: ['moderate'] },
    { name: '古茗', emoji: '🧋', category: 'dessert', subCategory: 'milk_tea', tags: ['cheap'] },
    { name: '书亦烧仙草', emoji: '🧋', category: 'dessert', subCategory: 'milk_tea', tags: ['cheap'] },
    { name: '沪上阿姨', emoji: '🧋', category: 'dessert', subCategory: 'milk_tea', tags: ['cheap'] },
    { name: '益禾堂', emoji: '🧋', category: 'dessert', subCategory: 'milk_tea', tags: ['cheap'] },
    { name: 'Manner咖啡', emoji: '☕', category: 'dessert', subCategory: 'coffee', tags: ['moderate'] },
    { name: '库迪咖啡', emoji: '☕', category: 'dessert', subCategory: 'coffee', tags: ['cheap'] },
    { name: 'Tims咖啡', emoji: '☕', category: 'dessert', subCategory: 'coffee', tags: ['moderate'] },

    // ========== 火锅品牌 ==========
    { name: '海底捞', emoji: '🍲', category: 'hotpot', subCategory: 'sichuan_hotpot', tags: ['moderate', 'friends', 'spicy'] },
    { name: '小龙坎', emoji: '🌶️', category: 'hotpot', subCategory: 'sichuan_hotpot', tags: ['moderate', 'spicy', 'numbing'] },
    { name: '呷哺呷哺', emoji: '🍲', category: 'hotpot', subCategory: 'beijing_hotpot', tags: ['cheap', 'solo'] },
    { name: '大龙燚', emoji: '🔥', category: 'hotpot', subCategory: 'sichuan_hotpot', tags: ['moderate', 'spicy'] },
    { name: '谭鸭血', emoji: '🦆', category: 'hotpot', subCategory: 'sichuan_hotpot', tags: ['moderate', 'spicy'] },
    { name: '楠火锅', emoji: '🍲', category: 'hotpot', subCategory: 'sichuan_hotpot', tags: ['moderate', 'spicy'] },
    { name: '巴奴毛肚火锅', emoji: '🥩', category: 'hotpot', subCategory: 'sichuan_hotpot', tags: ['expensive', 'spicy'] },
    { name: '蜀大侠', emoji: '🌶️', category: 'hotpot', subCategory: 'sichuan_hotpot', tags: ['moderate', 'spicy'] },
    { name: '凑凑火锅', emoji: '🍲', category: 'hotpot', subCategory: 'sichuan_hotpot', tags: ['moderate'] },
    { name: '电台巷火锅', emoji: '🔥', category: 'hotpot', subCategory: 'sichuan_hotpot', tags: ['moderate', 'spicy'] },
    { name: '捞王锅物', emoji: '🍲', category: 'hotpot', subCategory: 'fish_hotpot', tags: ['moderate', 'mild'] },
    { name: '周师兄火锅', emoji: '🌶️', category: 'hotpot', subCategory: 'sichuan_hotpot', tags: ['moderate', 'spicy'] },

    // ========== 烧烤品牌 ==========
    { name: '木屋烧烤', emoji: '🍢', category: 'bbq', subCategory: 'skewers', tags: ['moderate', 'friends', 'late_night'] },
    { name: '很久以前羊肉串', emoji: '🐑', category: 'bbq', subCategory: 'lamb', tags: ['moderate', 'friends'] },
    { name: '丰茂烤串', emoji: '🍢', category: 'bbq', subCategory: 'skewers', tags: ['moderate', 'late_night'] },
    { name: '九田家', emoji: '🥩', category: 'bbq', subCategory: 'yakiniku', tags: ['moderate', 'dating'] },
    { name: '汉拿山', emoji: '🥩', category: 'korean', subCategory: 'kbbq', tags: ['moderate', 'friends'] },
    { name: '聚点串吧', emoji: '🍢', category: 'bbq', subCategory: 'skewers', tags: ['cheap', 'late_night'] },
    { name: '烤肉自助', emoji: '🥩', category: 'bbq', subCategory: 'yakiniku', tags: ['moderate', 'friends'] },
    { name: '新疆烧烤', emoji: '🐑', category: 'bbq', subCategory: 'lamb', tags: ['cheap', 'late_night', 'halal'] },

    // ========== 日韩料理 ==========
    { name: '寿司', emoji: '🍣', category: 'japanese', subCategory: 'sushi', tags: ['moderate', 'healthy'] },
    { name: '日式拉面', emoji: '🍜', category: 'japanese', subCategory: 'ramen', tags: ['cheap', 'savory'] },
    { name: '刺身', emoji: '🐟', category: 'japanese', subCategory: 'sashimi', tags: ['expensive', 'healthy'] },
    { name: '烤肉', emoji: '🥩', category: 'korean', subCategory: 'kbbq', tags: ['moderate', 'friends'] },
    { name: '石锅拌饭', emoji: '🍚', category: 'korean', subCategory: 'bibimbap', tags: ['cheap'] },
    { name: '韩式炸鸡', emoji: '🍗', category: 'korean', subCategory: 'fried_chicken', tags: ['moderate', 'friends'] },
    { name: '天妇罗', emoji: '🍤', category: 'japanese', subCategory: 'tempura', tags: ['moderate'] },
    { name: '烧鸟', emoji: '🍢', category: 'japanese', subCategory: 'izakaya', tags: ['moderate', 'late_night'] },
    { name: '牛丼', emoji: '🍚', category: 'japanese', subCategory: 'donburi', tags: ['cheap', 'solo'] },
    { name: '亲子丼', emoji: '🍚', category: 'japanese', subCategory: 'donburi', tags: ['cheap', 'solo'] },
    { name: '咖喱饭', emoji: '🍛', category: 'japanese', subCategory: 'donburi', tags: ['cheap', 'solo'] },
    { name: '日式定食', emoji: '🍱', category: 'japanese', subCategory: 'donburi', tags: ['moderate', 'healthy'] },
    { name: '味增汤', emoji: '🍲', category: 'japanese', subCategory: 'ramen', tags: ['cheap', 'healthy'] },
    { name: '章鱼小丸子', emoji: '🐙', category: 'japanese', subCategory: 'izakaya', tags: ['cheap'] },
    { name: '大阪烧', emoji: '🥞', category: 'japanese', subCategory: 'izakaya', tags: ['moderate'] },
    { name: '韩式部队锅', emoji: '🍲', category: 'korean', subCategory: 'stew', tags: ['moderate', 'friends'] },
    { name: '泡菜汤', emoji: '🍲', category: 'korean', subCategory: 'stew', tags: ['cheap', 'spicy'] },
    { name: '炸酱面', emoji: '🍜', category: 'korean', subCategory: 'bibimbap', tags: ['cheap'] },
    { name: '冷面', emoji: '🍜', category: 'korean', subCategory: 'bibimbap', tags: ['cheap', 'mild'] },
    { name: '参鸡汤', emoji: '🍲', category: 'korean', subCategory: 'stew', tags: ['moderate', 'healthy'] },
    { name: '烤五花肉', emoji: '🥓', category: 'korean', subCategory: 'kbbq', tags: ['moderate', 'friends'] },
    { name: '紫菜包饭', emoji: '🍙', category: 'korean', subCategory: 'bibimbap', tags: ['cheap', 'solo'] },

    // ========== 川菜 ==========
    { name: '麻婆豆腐', emoji: '🌶️', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'numbing', 'cheap'] },
    { name: '宫保鸡丁', emoji: '🍗', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'moderate'] },
    { name: '水煮鱼', emoji: '🐟', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'moderate'] },
    { name: '回锅肉', emoji: '🥓', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'savory'] },
    { name: '酸菜鱼', emoji: '🐟', category: 'chinese', subCategory: 'sichuan', tags: ['sour', 'spicy', 'moderate'] },
    { name: '毛血旺', emoji: '🌶️', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'numbing', 'moderate'] },
    { name: '夫妻肺片', emoji: '🥩', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'numbing'] },
    { name: '口水鸡', emoji: '🍗', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'numbing'] },
    { name: '担担面', emoji: '🍜', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'numbing', 'cheap'] },
    { name: '钵钵鸡', emoji: '🍢', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'numbing', 'cheap'] },
    { name: '干锅', emoji: '🍲', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'moderate'] },
    { name: '重庆小面', emoji: '🍜', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'cheap'] },
    { name: '串串香', emoji: '🍢', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'cheap', 'friends'] },
    { name: '辣子鸡', emoji: '🍗', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'moderate'] },
    { name: '鱼香肉丝', emoji: '🥓', category: 'chinese', subCategory: 'sichuan', tags: ['sweet', 'sour', 'cheap'] },
    { name: '水煮肉片', emoji: '🥩', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'moderate'] },

    // ========== 粤菜 ==========
    { name: '白切鸡', emoji: '🍗', category: 'chinese', subCategory: 'cantonese', tags: ['mild', 'savory'] },
    { name: '烧鹅', emoji: '🦆', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'moderate'] },
    { name: '虾饺', emoji: '🥟', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'moderate'] },
    { name: '叉烧', emoji: '🍖', category: 'chinese', subCategory: 'cantonese', tags: ['sweet', 'savory'] },
    { name: '煲仔饭', emoji: '🍚', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'cheap'] },
    { name: '肠粉', emoji: '🥡', category: 'chinese', subCategory: 'cantonese', tags: ['mild', 'cheap'] },
    { name: '早茶', emoji: '🍵', category: 'chinese', subCategory: 'cantonese', tags: ['brunch', 'family'] },
    { name: '烧腊双拼', emoji: '🦆', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'moderate'] },
    { name: '干炒牛河', emoji: '🍜', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'cheap'] },
    { name: '老火靓汤', emoji: '🍲', category: 'chinese', subCategory: 'cantonese', tags: ['mild', 'healthy'] },
    { name: '蒸排骨', emoji: '🍖', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'moderate'] },
    { name: '豉汁蒸凤爪', emoji: '🐔', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'moderate'] },
    { name: '烧鸭', emoji: '🦆', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'moderate'] },
    { name: '盐焗鸡', emoji: '🍗', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'moderate'] },

    // ========== 湘菜 ==========
    { name: '剁椒鱼头', emoji: '🐟', category: 'chinese', subCategory: 'hunan', tags: ['spicy', 'moderate'] },
    { name: '辣椒炒肉', emoji: '🌶️', category: 'chinese', subCategory: 'hunan', tags: ['spicy', 'cheap'] },
    { name: '农家小炒肉', emoji: '🥓', category: 'chinese', subCategory: 'hunan', tags: ['spicy', 'cheap'] },
    { name: '毛氏红烧肉', emoji: '🍖', category: 'chinese', subCategory: 'hunan', tags: ['savory', 'moderate'] },
    { name: '湘西腊肉', emoji: '🥓', category: 'chinese', subCategory: 'hunan', tags: ['savory', 'moderate'] },
    { name: '臭豆腐', emoji: '🧈', category: 'chinese', subCategory: 'hunan', tags: ['savory', 'cheap'] },
    { name: '口味虾', emoji: '🦐', category: 'chinese', subCategory: 'hunan', tags: ['spicy', 'moderate'] },

    // ========== 东北菜 ==========
    { name: '锅包肉', emoji: '🍖', category: 'chinese', subCategory: 'northeastern', tags: ['sweet', 'sour'] },
    { name: '小鸡炖蘑菇', emoji: '🍗', category: 'chinese', subCategory: 'northeastern', tags: ['savory', 'family'] },
    { name: '东北大拉皮', emoji: '🥒', category: 'chinese', subCategory: 'northeastern', tags: ['mild', 'cheap'] },
    { name: '杀猪菜', emoji: '🥬', category: 'chinese', subCategory: 'northeastern', tags: ['savory', 'family'] },
    { name: '东北烤冷面', emoji: '🥞', category: 'chinese', subCategory: 'northeastern', tags: ['cheap', 'late_night'] },
    { name: '铁锅炖', emoji: '🍲', category: 'chinese', subCategory: 'northeastern', tags: ['savory', 'family'] },
    { name: '地三鲜', emoji: '🍆', category: 'chinese', subCategory: 'northeastern', tags: ['mild', 'cheap'] },
    { name: '酸菜白肉', emoji: '🥬', category: 'chinese', subCategory: 'northeastern', tags: ['sour', 'savory'] },
    { name: '溜肉段', emoji: '🍖', category: 'chinese', subCategory: 'northeastern', tags: ['sweet', 'savory'] },
    { name: '红烧排骨', emoji: '🍖', category: 'chinese', subCategory: 'northeastern', tags: ['savory', 'moderate'] },

    // ========== 北京菜/京菜 ==========
    { name: '北京烤鸭', emoji: '🦆', category: 'chinese', subCategory: 'beijing', tags: ['savory', 'expensive', 'dating'] },
    { name: '炸酱面', emoji: '🍜', category: 'chinese', subCategory: 'beijing', tags: ['savory', 'cheap'] },
    { name: '卤煮火烧', emoji: '🍲', category: 'chinese', subCategory: 'beijing', tags: ['savory', 'cheap'] },
    { name: '爆肚', emoji: '🥩', category: 'chinese', subCategory: 'beijing', tags: ['savory', 'cheap'] },
    { name: '涮羊肉', emoji: '🐑', category: 'chinese', subCategory: 'beijing', tags: ['mild', 'moderate'] },
    { name: '豆汁焦圈', emoji: '🥤', category: 'chinese', subCategory: 'beijing', tags: ['mild', 'cheap', 'brunch'] },

    // ========== 江浙菜 ==========
    { name: '西湖醋鱼', emoji: '🐟', category: 'chinese', subCategory: 'zhejiang', tags: ['sour', 'sweet', 'moderate'] },
    { name: '东坡肉', emoji: '🍖', category: 'chinese', subCategory: 'zhejiang', tags: ['sweet', 'savory', 'moderate'] },
    { name: '龙井虾仁', emoji: '🦐', category: 'chinese', subCategory: 'zhejiang', tags: ['mild', 'expensive'] },
    { name: '糖醋里脊', emoji: '🍖', category: 'chinese', subCategory: 'jiangsu', tags: ['sweet', 'sour', 'cheap'] },
    { name: '狮子头', emoji: '🍖', category: 'chinese', subCategory: 'jiangsu', tags: ['savory', 'moderate'] },
    { name: '扬州炒饭', emoji: '🍚', category: 'chinese', subCategory: 'jiangsu', tags: ['mild', 'cheap'] },
    { name: '蟹黄豆腐', emoji: '🦀', category: 'chinese', subCategory: 'jiangsu', tags: ['savory', 'expensive'] },

    // ========== 小吃类 ==========
    { name: '饺子', emoji: '🥟', category: 'snacks', subCategory: 'dumplings', tags: ['cheap', 'family'] },
    { name: '馄饨', emoji: '🥟', category: 'snacks', subCategory: 'dumplings', tags: ['cheap', 'mild'] },
    { name: '生煎包', emoji: '🥟', category: 'snacks', subCategory: 'dumplings', tags: ['cheap', 'savory'] },
    { name: '煎饼果子', emoji: '🥞', category: 'snacks', subCategory: 'pancake', tags: ['cheap', 'brunch'] },
    { name: '肉夹馍', emoji: '🥙', category: 'snacks', subCategory: 'shaanxi', tags: ['cheap', 'savory'] },
    { name: '凉皮', emoji: '🍜', category: 'snacks', subCategory: 'shaanxi', tags: ['cheap', 'spicy'] },
    { name: '兰州拉面', emoji: '🍜', category: 'snacks', subCategory: 'lanzhou', tags: ['cheap', 'halal'] },
    { name: '沙县小吃', emoji: '🥡', category: 'snacks', subCategory: 'shaxian', tags: ['cheap'] },
    { name: '黄焖鸡米饭', emoji: '🍗', category: 'snacks', subCategory: 'chinese_fast', tags: ['cheap', 'solo'] },
    { name: '麻辣烫', emoji: '🥢', category: 'hotpot', subCategory: 'malatang', tags: ['cheap', 'spicy', 'solo'] },
    { name: '冒菜', emoji: '🌶️', category: 'hotpot', subCategory: 'malatang', tags: ['cheap', 'spicy', 'solo'] },
    { name: '手抓饼', emoji: '🥞', category: 'snacks', subCategory: 'pancake', tags: ['cheap', 'brunch'] },
    { name: '鸡蛋灌饼', emoji: '🥚', category: 'snacks', subCategory: 'pancake', tags: ['cheap', 'brunch'] },
    { name: '锅贴', emoji: '🥟', category: 'snacks', subCategory: 'dumplings', tags: ['cheap', 'savory'] },
    { name: '小笼包', emoji: '🥟', category: 'snacks', subCategory: 'dumplings', tags: ['cheap', 'savory'] },
    { name: '汤包', emoji: '🥟', category: 'snacks', subCategory: 'dumplings', tags: ['cheap', 'savory'] },
    { name: '烧麦', emoji: '🥟', category: 'snacks', subCategory: 'dumplings', tags: ['cheap', 'savory'] },
    { name: '炒面', emoji: '🍜', category: 'snacks', subCategory: 'noodles', tags: ['cheap', 'savory'] },
    { name: '炒饭', emoji: '🍚', category: 'snacks', subCategory: 'chinese_fast', tags: ['cheap', 'savory'] },
    { name: '盖浇饭', emoji: '🍚', category: 'snacks', subCategory: 'chinese_fast', tags: ['cheap', 'solo'] },
    { name: '蛋炒饭', emoji: '🍳', category: 'snacks', subCategory: 'chinese_fast', tags: ['cheap', 'solo'] },
    { name: '烤冷面', emoji: '🥞', category: 'snacks', subCategory: 'pancake', tags: ['cheap', 'late_night'] },
    { name: '鸡蛋仔', emoji: '🥚', category: 'snacks', subCategory: 'fried', tags: ['cheap'] },
    { name: '葱油饼', emoji: '🥞', category: 'snacks', subCategory: 'pancake', tags: ['cheap', 'brunch'] },
    { name: '臭豆腐', emoji: '🧈', category: 'snacks', subCategory: 'fried', tags: ['savory', 'cheap', 'late_night'] },
    { name: '油条豆浆', emoji: '🥖', category: 'snacks', subCategory: 'pancake', tags: ['cheap', 'brunch'] },

    // ========== 面食类 ==========
    { name: '刀削面', emoji: '🍜', category: 'snacks', subCategory: 'noodles', tags: ['cheap', 'savory'] },
    { name: '油泼面', emoji: '🍜', category: 'snacks', subCategory: 'noodles', tags: ['cheap', 'spicy'] },
    { name: 'biangbiang面', emoji: '🍜', category: 'snacks', subCategory: 'noodles', tags: ['cheap', 'savory'] },
    { name: '牛肉面', emoji: '🍜', category: 'snacks', subCategory: 'noodles', tags: ['cheap', 'savory'] },
    { name: '热干面', emoji: '🍜', category: 'snacks', subCategory: 'noodles', tags: ['cheap', 'savory'] },
    { name: '炸酱面', emoji: '🍜', category: 'snacks', subCategory: 'noodles', tags: ['cheap', 'savory'] },
    { name: '酸辣粉', emoji: '🍜', category: 'snacks', subCategory: 'rice_noodle', tags: ['cheap', 'spicy', 'sour'] },
    { name: '螺蛳粉', emoji: '🍜', category: 'snacks', subCategory: 'rice_noodle', tags: ['cheap', 'spicy', 'late_night'] },
    { name: '桂林米粉', emoji: '🍜', category: 'snacks', subCategory: 'rice_noodle', tags: ['cheap', 'mild'] },
    { name: '过桥米线', emoji: '🍜', category: 'snacks', subCategory: 'rice_noodle', tags: ['cheap', 'mild'] },
    { name: '河粉', emoji: '🍜', category: 'snacks', subCategory: 'rice_noodle', tags: ['cheap', 'mild'] },
    { name: '砂锅粉', emoji: '🍲', category: 'snacks', subCategory: 'rice_noodle', tags: ['cheap', 'savory'] },
    { name: '肥肠粉', emoji: '🍜', category: 'snacks', subCategory: 'rice_noodle', tags: ['cheap', 'spicy'] },

    // ========== 西餐 ==========
    { name: '牛排', emoji: '🥩', category: 'western', subCategory: 'steak', tags: ['expensive', 'dating'] },
    { name: '意大利面', emoji: '🍝', category: 'western', subCategory: 'pasta', tags: ['moderate', 'dating'] },
    { name: '披萨', emoji: '🍕', category: 'western', subCategory: 'pizza', tags: ['moderate', 'friends'] },
    { name: '沙拉', emoji: '🥗', category: 'western', subCategory: 'salad', tags: ['healthy', 'low_cal'] },
    { name: '汉堡', emoji: '🍔', category: 'western', subCategory: 'burger', tags: ['cheap', 'fast'] },
    { name: '炸鱼薯条', emoji: '🐟', category: 'western', subCategory: 'brunch', tags: ['moderate'] },
    { name: '意式烩饭', emoji: '🍚', category: 'western', subCategory: 'pasta', tags: ['moderate'] },
    { name: '法式焗蜗牛', emoji: '🐌', category: 'western', subCategory: 'french', tags: ['expensive', 'dating'] },
    { name: '奶油蘑菇汤', emoji: '🍲', category: 'western', subCategory: 'french', tags: ['moderate'] },
    { name: '凯撒沙拉', emoji: '🥗', category: 'western', subCategory: 'salad', tags: ['moderate', 'healthy'] },
    { name: '班尼迪克蛋', emoji: '🥚', category: 'western', subCategory: 'brunch', tags: ['moderate', 'brunch'] },
    { name: '煎三文鱼', emoji: '🐟', category: 'western', subCategory: 'steak', tags: ['moderate', 'healthy'] },

    // ========== 东南亚 ==========
    { name: '冬阴功', emoji: '🍲', category: 'southeast_asian', subCategory: 'thai', tags: ['spicy', 'sour'] },
    { name: '泰式炒河粉', emoji: '🍜', category: 'southeast_asian', subCategory: 'thai', tags: ['moderate'] },
    { name: '越南粉', emoji: '🍜', category: 'southeast_asian', subCategory: 'vietnamese', tags: ['mild', 'healthy'] },
    { name: '咖喱饭', emoji: '🍛', category: 'southeast_asian', subCategory: 'indian', tags: ['spicy', 'moderate'] },
    { name: '印度飞饼', emoji: '🥞', category: 'southeast_asian', subCategory: 'indian', tags: ['cheap'] },
    { name: '芒果糯米饭', emoji: '🥭', category: 'southeast_asian', subCategory: 'thai', tags: ['sweet', 'cheap'] },
    { name: '青木瓜沙拉', emoji: '🥗', category: 'southeast_asian', subCategory: 'thai', tags: ['spicy', 'sour', 'healthy'] },
    { name: '越南春卷', emoji: '🥟', category: 'southeast_asian', subCategory: 'vietnamese', tags: ['mild', 'healthy'] },
    { name: '叻沙', emoji: '🍜', category: 'southeast_asian', subCategory: 'malaysian', tags: ['spicy', 'moderate'] },
    { name: '海南鸡饭', emoji: '🍗', category: 'southeast_asian', subCategory: 'singapore', tags: ['mild', 'moderate'] },
    { name: '肉骨茶', emoji: '🍲', category: 'southeast_asian', subCategory: 'singapore', tags: ['savory', 'moderate'] },
    { name: '印度咖喱', emoji: '🍛', category: 'southeast_asian', subCategory: 'indian', tags: ['spicy', 'moderate'] },
    { name: '黄咖喱', emoji: '🍛', category: 'southeast_asian', subCategory: 'thai', tags: ['spicy', 'moderate'] },
    { name: '绿咖喱', emoji: '🍛', category: 'southeast_asian', subCategory: 'thai', tags: ['spicy', 'moderate'] },
    { name: '红咖喱', emoji: '🍛', category: 'southeast_asian', subCategory: 'thai', tags: ['spicy', 'moderate'] },

    // ========== 海鲜 ==========
    { name: '大闸蟹', emoji: '🦀', category: 'seafood', subCategory: 'crab', tags: ['expensive', 'seasonal'] },
    { name: '小龙虾', emoji: '🦞', category: 'seafood', subCategory: 'lobster', tags: ['moderate', 'friends', 'spicy'] },
    { name: '蒜蓉虾', emoji: '🦐', category: 'seafood', subCategory: 'shrimp', tags: ['moderate', 'savory'] },
    { name: '清蒸鱼', emoji: '🐟', category: 'seafood', subCategory: 'fish', tags: ['mild', 'healthy'] },
    { name: '生蚝', emoji: '🦪', category: 'seafood', subCategory: 'shellfish', tags: ['moderate', 'dating'] },
    { name: '椒盐皮皮虾', emoji: '🦐', category: 'seafood', subCategory: 'shrimp', tags: ['savory', 'moderate'] },
    { name: '白灼虾', emoji: '🦐', category: 'seafood', subCategory: 'shrimp', tags: ['mild', 'healthy'] },
    { name: '蒜蓉扇贝', emoji: '🦪', category: 'seafood', subCategory: 'shellfish', tags: ['savory', 'moderate'] },
    { name: '香辣蟹', emoji: '🦀', category: 'seafood', subCategory: 'crab', tags: ['spicy', 'moderate'] },
    { name: '烤鱼', emoji: '🐟', category: 'seafood', subCategory: 'fish', tags: ['spicy', 'moderate', 'friends'] },
    { name: '酸菜鱼', emoji: '🐟', category: 'seafood', subCategory: 'fish', tags: ['sour', 'spicy', 'moderate'] },
    { name: '水煮鱼', emoji: '🐟', category: 'seafood', subCategory: 'fish', tags: ['spicy', 'numbing', 'moderate'] },

    // ========== 甜品 ==========
    { name: '提拉米苏', emoji: '🍰', category: 'dessert', subCategory: 'cake', tags: ['sweet', 'dating'] },
    { name: '芝士蛋糕', emoji: '🧀', category: 'dessert', subCategory: 'cake', tags: ['sweet', 'dating'] },
    { name: '冰淇淋', emoji: '🍦', category: 'dessert', subCategory: 'ice_cream', tags: ['sweet', 'cheap'] },
    { name: '双皮奶', emoji: '🥛', category: 'dessert', subCategory: 'cake', tags: ['sweet', 'cheap'] },
    { name: '杨枝甘露', emoji: '🥭', category: 'dessert', subCategory: 'fruit_tea', tags: ['sweet', 'moderate'] },
    { name: '红豆沙', emoji: '🫘', category: 'dessert', subCategory: 'cake', tags: ['sweet', 'cheap'] },
    { name: '芒果班戟', emoji: '🥭', category: 'dessert', subCategory: 'cake', tags: ['sweet', 'moderate'] },
    { name: '牛角包', emoji: '🥐', category: 'dessert', subCategory: 'bakery', tags: ['sweet', 'brunch'] },
    { name: '马卡龙', emoji: '🧁', category: 'dessert', subCategory: 'cake', tags: ['sweet', 'dating'] },

    // ========== 新疆/西北菜 ==========
    { name: '大盘鸡', emoji: '🍗', category: 'chinese', subCategory: 'xinjiang', tags: ['spicy', 'family'] },
    { name: '羊肉串', emoji: '🍢', category: 'chinese', subCategory: 'xinjiang', tags: ['savory', 'late_night', 'halal'] },
    { name: '新疆炒米粉', emoji: '🍜', category: 'chinese', subCategory: 'xinjiang', tags: ['spicy', 'cheap'] },
    { name: '手抓饭', emoji: '🍚', category: 'chinese', subCategory: 'xinjiang', tags: ['savory', 'halal'] },
    { name: '烤馕', emoji: '🥖', category: 'chinese', subCategory: 'xinjiang', tags: ['cheap', 'halal'] },
    { name: '羊肉泡馍', emoji: '🍲', category: 'chinese', subCategory: 'shaanxi', tags: ['savory', 'halal'] },
    { name: '牛羊肉泡馍', emoji: '🍲', category: 'chinese', subCategory: 'shaanxi', tags: ['savory', 'cheap', 'halal'] },

    // ========== 素食/轻食 ==========
    { name: '素食自助', emoji: '🥗', category: 'vegetarian', subCategory: 'vegan', tags: ['healthy', 'moderate'] },
    { name: '轻食沙拉', emoji: '🥗', category: 'vegetarian', subCategory: 'salad', tags: ['healthy', 'low_cal'] },
    { name: '素斋', emoji: '🧘', category: 'vegetarian', subCategory: 'buddhist', tags: ['mild', 'healthy'] },
    { name: '粥', emoji: '🥣', category: 'vegetarian', subCategory: 'light', tags: ['mild', 'healthy', 'cheap'] },
    { name: '健康轻食', emoji: '🥒', category: 'vegetarian', subCategory: 'light', tags: ['healthy', 'low_cal'] },

    // ========== 更多北京小吃 ==========
    { name: '驴打滚', emoji: '🍡', category: 'chinese', subCategory: 'beijing', tags: ['sweet', 'cheap'] },
    { name: '艾窝窝', emoji: '🍡', category: 'chinese', subCategory: 'beijing', tags: ['sweet', 'cheap'] },
    { name: '炒肝', emoji: '🍲', category: 'chinese', subCategory: 'beijing', tags: ['savory', 'cheap', 'brunch'] },
    { name: '炸灌肠', emoji: '🍖', category: 'chinese', subCategory: 'beijing', tags: ['savory', 'cheap'] },
    { name: '白水羊头', emoji: '🐑', category: 'chinese', subCategory: 'beijing', tags: ['savory', 'moderate'] },
    { name: '茶汤', emoji: '🍵', category: 'chinese', subCategory: 'beijing', tags: ['sweet', 'cheap'] },
    { name: '褡裢火烧', emoji: '🥟', category: 'chinese', subCategory: 'beijing', tags: ['savory', 'cheap'] },

    // ========== 天津小吃 ==========
    { name: '狗不理包子', emoji: '🥟', category: 'chinese', subCategory: 'snacks', tags: ['savory', 'moderate'] },
    { name: '耳朵眼炸糕', emoji: '🍩', category: 'chinese', subCategory: 'snacks', tags: ['sweet', 'cheap'] },
    { name: '大麻花', emoji: '🥨', category: 'chinese', subCategory: 'snacks', tags: ['sweet', 'cheap'] },
    { name: '锅巴菜', emoji: '🍲', category: 'chinese', subCategory: 'snacks', tags: ['savory', 'cheap', 'brunch'] },
    { name: '锅塌里脊', emoji: '🥩', category: 'chinese', subCategory: 'snacks', tags: ['savory', 'moderate'] },

    // ========== 山西面食 ==========
    { name: '过油肉', emoji: '🍖', category: 'chinese', subCategory: 'shanxi', tags: ['savory', 'moderate'] },
    { name: '莜面栲栳栳', emoji: '🍜', category: 'chinese', subCategory: 'shanxi', tags: ['mild', 'cheap'] },
    { name: '平遥牛肉', emoji: '🥩', category: 'chinese', subCategory: 'shanxi', tags: ['savory', 'moderate'] },

    // ========== 山东鲁菜 ==========
    { name: '葱烧海参', emoji: '🦐', category: 'chinese', subCategory: 'shandong', tags: ['savory', 'expensive'] },
    { name: '糖醋鲤鱼', emoji: '🐟', category: 'chinese', subCategory: 'shandong', tags: ['sweet', 'sour', 'moderate'] },
    { name: '九转大肠', emoji: '🍖', category: 'chinese', subCategory: 'shandong', tags: ['savory', 'moderate'] },
    { name: '德州扒鸡', emoji: '🍗', category: 'chinese', subCategory: 'shandong', tags: ['savory', 'moderate'] },

    // ========== 福建闽菜 ==========
    { name: '佛跳墙', emoji: '🍲', category: 'chinese', subCategory: 'fujian', tags: ['expensive', 'savory'] },
    { name: '沙茶面', emoji: '🍜', category: 'chinese', subCategory: 'fujian', tags: ['savory', 'cheap'] },
    { name: '海蛎煎', emoji: '🦪', category: 'chinese', subCategory: 'fujian', tags: ['savory', 'cheap'] },
    { name: '土笋冻', emoji: '🥡', category: 'chinese', subCategory: 'fujian', tags: ['mild', 'cheap'] },
    { name: '姜母鸭', emoji: '🦆', category: 'chinese', subCategory: 'fujian', tags: ['savory', 'moderate'] },

    // ========== 云南菜 ==========
    { name: '汽锅鸡', emoji: '🍗', category: 'chinese', subCategory: 'yunnan', tags: ['mild', 'moderate'] },
    { name: '宣威火腿', emoji: '🥓', category: 'chinese', subCategory: 'yunnan', tags: ['savory', 'moderate'] },
    { name: '饵丝', emoji: '🍜', category: 'chinese', subCategory: 'yunnan', tags: ['mild', 'cheap'] },
    { name: '野生菌火锅', emoji: '🍄', category: 'chinese', subCategory: 'yunnan', tags: ['savory', 'moderate'] },
    { name: '鲜花饼', emoji: '🌸', category: 'chinese', subCategory: 'yunnan', tags: ['sweet', 'cheap'] },

    // ========== 贵州菜 ==========
    { name: '酸汤鱼', emoji: '🐟', category: 'chinese', subCategory: 'guizhou', tags: ['sour', 'spicy', 'moderate'] },
    { name: '丝娃娃', emoji: '🥗', category: 'chinese', subCategory: 'guizhou', tags: ['mild', 'cheap'] },
    { name: '肠旺面', emoji: '🍜', category: 'chinese', subCategory: 'guizhou', tags: ['spicy', 'cheap'] },
    { name: '糯米饭', emoji: '🍚', category: 'chinese', subCategory: 'guizhou', tags: ['mild', 'cheap'] },

    // ========== 江西菜 ==========
    { name: '瓦罐煨汤', emoji: '🍲', category: 'chinese', subCategory: 'jiangxi', tags: ['mild', 'healthy', 'moderate'] },
    { name: '藜蒿炒腊肉', emoji: '🥓', category: 'chinese', subCategory: 'jiangxi', tags: ['savory', 'moderate'] },

    // ========== 湖北菜 ==========
    { name: '武昌鱼', emoji: '🐟', category: 'chinese', subCategory: 'hubei', tags: ['mild', 'moderate'] },
    { name: '精武鸭脖', emoji: '🦆', category: 'chinese', subCategory: 'hubei', tags: ['spicy', 'cheap', 'late_night'] },
    { name: '豆皮', emoji: '🥡', category: 'chinese', subCategory: 'hubei', tags: ['savory', 'cheap', 'brunch'] },
    { name: '排骨藕汤', emoji: '🍲', category: 'chinese', subCategory: 'hubei', tags: ['mild', 'healthy'] },

    // ========== 更多家常菜 ==========
    { name: '番茄炒蛋', emoji: '🍅', category: 'chinese', subCategory: 'homestyle', tags: ['mild', 'cheap', 'family'] },
    { name: '酸辣土豆丝', emoji: '🥔', category: 'chinese', subCategory: 'homestyle', tags: ['sour', 'spicy', 'cheap'] },
    { name: '青椒肉丝', emoji: '🌶️', category: 'chinese', subCategory: 'homestyle', tags: ['mild', 'cheap'] },
    { name: '红烧肉', emoji: '🍖', category: 'chinese', subCategory: 'homestyle', tags: ['sweet', 'savory', 'family'] },
    { name: '红烧排骨', emoji: '🍖', category: 'chinese', subCategory: 'homestyle', tags: ['savory', 'family'] },
    { name: '可乐鸡翅', emoji: '🍗', category: 'chinese', subCategory: 'homestyle', tags: ['sweet', 'cheap'] },
    { name: '土豆炖牛肉', emoji: '🥔', category: 'chinese', subCategory: 'homestyle', tags: ['savory', 'family'] },
    { name: '蒜苔炒肉', emoji: '🧄', category: 'chinese', subCategory: 'homestyle', tags: ['mild', 'cheap'] },
    { name: '醋溜白菜', emoji: '🥬', category: 'chinese', subCategory: 'homestyle', tags: ['sour', 'cheap'] },
    { name: '干煸四季豆', emoji: '🫛', category: 'chinese', subCategory: 'homestyle', tags: ['spicy', 'cheap'] },
    { name: '蒜蓉西兰花', emoji: '🥦', category: 'chinese', subCategory: 'homestyle', tags: ['mild', 'healthy'] },
    { name: '蚂蚁上树', emoji: '🍜', category: 'chinese', subCategory: 'homestyle', tags: ['spicy', 'cheap'] },
    { name: '孜然牛肉', emoji: '🥩', category: 'chinese', subCategory: 'homestyle', tags: ['spicy', 'moderate'] },
    { name: '香菇滑鸡', emoji: '🍄', category: 'chinese', subCategory: 'homestyle', tags: ['mild', 'moderate'] },
    { name: '京酱肉丝', emoji: '🥓', category: 'chinese', subCategory: 'homestyle', tags: ['sweet', 'savory'] },
    { name: '木须肉', emoji: '🥚', category: 'chinese', subCategory: 'homestyle', tags: ['mild', 'cheap'] },
    { name: '香干炒肉', emoji: '🥓', category: 'chinese', subCategory: 'homestyle', tags: ['savory', 'cheap'] },
    { name: '腐竹炒肉', emoji: '🥡', category: 'chinese', subCategory: 'homestyle', tags: ['savory', 'cheap'] },
    { name: '白菜炖粉条', emoji: '🥬', category: 'chinese', subCategory: 'homestyle', tags: ['mild', 'cheap', 'family'] },
    { name: '排骨汤', emoji: '🍲', category: 'chinese', subCategory: 'homestyle', tags: ['mild', 'healthy'] },
    { name: '莲藕排骨汤', emoji: '🍲', category: 'chinese', subCategory: 'homestyle', tags: ['mild', 'healthy'] },
    { name: '紫菜蛋花汤', emoji: '🥚', category: 'chinese', subCategory: 'homestyle', tags: ['mild', 'cheap'] },
    { name: '鸡蛋羹', emoji: '🥚', category: 'chinese', subCategory: 'homestyle', tags: ['mild', 'cheap', 'healthy'] },

    // ========== 更多早餐 ==========
    { name: '皮蛋瘦肉粥', emoji: '🥣', category: 'snacks', subCategory: 'brunch', tags: ['mild', 'cheap', 'brunch'] },
    { name: '小米粥', emoji: '🥣', category: 'snacks', subCategory: 'brunch', tags: ['mild', 'cheap', 'healthy', 'brunch'] },
    { name: '豆腐脑', emoji: '🥣', category: 'snacks', subCategory: 'brunch', tags: ['mild', 'cheap', 'brunch'] },
    { name: '茶叶蛋', emoji: '🥚', category: 'snacks', subCategory: 'brunch', tags: ['savory', 'cheap'] },
    { name: '粢饭糕', emoji: '🍚', category: 'snacks', subCategory: 'brunch', tags: ['savory', 'cheap', 'brunch'] },
    { name: '糯米鸡', emoji: '🍚', category: 'snacks', subCategory: 'brunch', tags: ['savory', 'cheap'] },
    { name: '包子', emoji: '🥟', category: 'snacks', subCategory: 'brunch', tags: ['savory', 'cheap', 'brunch'] },
    { name: '馒头', emoji: '🍞', category: 'snacks', subCategory: 'brunch', tags: ['mild', 'cheap', 'brunch'] },
    { name: '花卷', emoji: '🍞', category: 'snacks', subCategory: 'brunch', tags: ['mild', 'cheap', 'brunch'] },

    // ========== 更多夜宵 ==========
    { name: '炒河粉', emoji: '🍜', category: 'snacks', subCategory: 'noodles', tags: ['savory', 'cheap', 'late_night'] },
    { name: '炒年糕', emoji: '🍡', category: 'snacks', subCategory: 'noodles', tags: ['sweet', 'cheap', 'late_night'] },
    { name: '铁板炒饭', emoji: '🍚', category: 'snacks', subCategory: 'chinese_fast', tags: ['savory', 'cheap', 'late_night'] },
    { name: '鸡蛋炒饼', emoji: '🥚', category: 'snacks', subCategory: 'pancake', tags: ['savory', 'cheap', 'late_night'] },
    { name: '卤味', emoji: '🍖', category: 'snacks', subCategory: 'fried', tags: ['savory', 'cheap', 'late_night'] },
    { name: '鸭脖', emoji: '🦆', category: 'snacks', subCategory: 'fried', tags: ['spicy', 'cheap', 'late_night'] },
    { name: '凤爪', emoji: '🐔', category: 'snacks', subCategory: 'fried', tags: ['savory', 'cheap', 'late_night'] },
    { name: '卤蛋', emoji: '🥚', category: 'snacks', subCategory: 'fried', tags: ['savory', 'cheap'] },
    { name: '关东煮', emoji: '🍢', category: 'snacks', subCategory: 'fried', tags: ['mild', 'cheap', 'late_night'] },
    { name: '炸串', emoji: '🍢', category: 'snacks', subCategory: 'fried', tags: ['savory', 'cheap', 'late_night'] },
    { name: '炸鸡柳', emoji: '🍗', category: 'snacks', subCategory: 'fried', tags: ['savory', 'cheap', 'late_night'] },
    { name: '炸年糕', emoji: '🍡', category: 'snacks', subCategory: 'fried', tags: ['sweet', 'cheap'] },
    { name: '烤肠', emoji: '🌭', category: 'snacks', subCategory: 'fried', tags: ['savory', 'cheap', 'late_night'] },

    // ========== 更多连锁品牌 ==========
    { name: '真功夫', emoji: '🍚', category: 'fastfood', subCategory: 'chinese_fast', tags: ['cheap', 'fast'] },
    { name: '永和大王', emoji: '🥣', category: 'fastfood', subCategory: 'chinese_fast', tags: ['cheap', 'brunch'] },
    { name: '老乡鸡', emoji: '🍗', category: 'fastfood', subCategory: 'chinese_fast', tags: ['cheap', 'fast'] },
    { name: '大米先生', emoji: '🍚', category: 'fastfood', subCategory: 'chinese_fast', tags: ['cheap', 'fast'] },
    { name: '乡村基', emoji: '🍚', category: 'fastfood', subCategory: 'chinese_fast', tags: ['cheap', 'fast'] },
    { name: '老娘舅', emoji: '🍚', category: 'fastfood', subCategory: 'chinese_fast', tags: ['cheap', 'fast'] },
    { name: '吉野家', emoji: '🍚', category: 'japanese', subCategory: 'donburi', tags: ['cheap', 'fast'] },
    { name: '食其家', emoji: '🍚', category: 'japanese', subCategory: 'donburi', tags: ['cheap', 'fast'] },
    { name: '味千拉面', emoji: '🍜', category: 'japanese', subCategory: 'ramen', tags: ['moderate'] },
    { name: '一风堂', emoji: '🍜', category: 'japanese', subCategory: 'ramen', tags: ['moderate'] },
    { name: '元气寿司', emoji: '🍣', category: 'japanese', subCategory: 'sushi', tags: ['moderate'] },
    { name: '争鲜回转寿司', emoji: '🍣', category: 'japanese', subCategory: 'sushi', tags: ['cheap'] },
    { name: '萨莉亚', emoji: '🍝', category: 'western', subCategory: 'pasta', tags: ['cheap', 'dating'] },
    { name: '太二酸菜鱼', emoji: '🐟', category: 'chinese', subCategory: 'sichuan', tags: ['sour', 'spicy', 'moderate'] },
    { name: '鱼你在一起', emoji: '🐟', category: 'chinese', subCategory: 'sichuan', tags: ['sour', 'spicy', 'cheap'] },
    { name: '杨国福麻辣烫', emoji: '🥢', category: 'hotpot', subCategory: 'malatang', tags: ['spicy', 'cheap', 'solo'] },
    { name: '张亮麻辣烫', emoji: '🥢', category: 'hotpot', subCategory: 'malatang', tags: ['spicy', 'cheap', 'solo'] },
    { name: '绝味鸭脖', emoji: '🦆', category: 'snacks', subCategory: 'fried', tags: ['spicy', 'cheap', 'late_night'] },
    { name: '周黑鸭', emoji: '🦆', category: 'snacks', subCategory: 'fried', tags: ['spicy', 'cheap', 'late_night'] },
    { name: '煌上煌', emoji: '🦆', category: 'snacks', subCategory: 'fried', tags: ['savory', 'cheap', 'late_night'] },
    { name: '紫燕百味鸡', emoji: '🍗', category: 'snacks', subCategory: 'fried', tags: ['savory', 'cheap'] },
    { name: '廖记棒棒鸡', emoji: '🍗', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'cheap'] },

    // ========== 更多粤式点心 ==========
    { name: '凤爪', emoji: '🐔', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'moderate'] },
    { name: '排骨', emoji: '🍖', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'moderate'] },
    { name: '牛肉球', emoji: '🍖', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'moderate'] },
    { name: '烧卖', emoji: '🥟', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'moderate'] },
    { name: '萝卜糕', emoji: '🥡', category: 'chinese', subCategory: 'cantonese', tags: ['savory', 'moderate'] },
    { name: '马蹄糕', emoji: '🥡', category: 'chinese', subCategory: 'cantonese', tags: ['sweet', 'moderate'] },
    { name: '蛋挞', emoji: '🥧', category: 'chinese', subCategory: 'cantonese', tags: ['sweet', 'moderate'] },
    { name: '艇仔粥', emoji: '🥣', category: 'chinese', subCategory: 'cantonese', tags: ['mild', 'cheap'] },

    // ========== 更多川味小吃 ==========
    { name: '龙抄手', emoji: '🥟', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'cheap'] },
    { name: '钟水饺', emoji: '🥟', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'sweet', 'cheap'] },
    { name: '甜水面', emoji: '🍜', category: 'chinese', subCategory: 'sichuan', tags: ['sweet', 'spicy', 'cheap'] },
    { name: '冰粉', emoji: '🍧', category: 'chinese', subCategory: 'sichuan', tags: ['sweet', 'cheap'] },
    { name: '凉粉', emoji: '🥡', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'cheap'] },
    { name: '红油抄手', emoji: '🥟', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'cheap'] },
    { name: '蛋烘糕', emoji: '🥞', category: 'chinese', subCategory: 'sichuan', tags: ['sweet', 'cheap'] },
    { name: '肥肠粉', emoji: '🍜', category: 'chinese', subCategory: 'sichuan', tags: ['spicy', 'cheap'] },

    // ========== 更多长沙小吃 ==========
    { name: '糖油粑粑', emoji: '🍡', category: 'chinese', subCategory: 'hunan', tags: ['sweet', 'cheap'] },
    { name: '刮凉粉', emoji: '🥡', category: 'chinese', subCategory: 'hunan', tags: ['spicy', 'cheap'] },
    { name: '口味虾', emoji: '🦐', category: 'chinese', subCategory: 'hunan', tags: ['spicy', 'moderate', 'friends'] },

    // ========== 更多日料 ==========
    { name: '炸猪排', emoji: '🍖', category: 'japanese', subCategory: 'donburi', tags: ['savory', 'moderate'] },
    { name: '猪排咖喱饭', emoji: '🍛', category: 'japanese', subCategory: 'donburi', tags: ['savory', 'cheap'] },
    { name: '抹茶甜品', emoji: '🍵', category: 'japanese', subCategory: 'izakaya', tags: ['sweet', 'moderate'] },
    { name: '铜锣烧', emoji: '🥞', category: 'japanese', subCategory: 'izakaya', tags: ['sweet', 'cheap'] },
    { name: '乌冬面', emoji: '🍜', category: 'japanese', subCategory: 'udon', tags: ['mild', 'cheap'] },
    { name: '日式涮涮锅', emoji: '🍲', category: 'japanese', subCategory: 'izakaya', tags: ['mild', 'moderate'] },
    { name: '天丼', emoji: '🍚', category: 'japanese', subCategory: 'donburi', tags: ['savory', 'moderate'] },
    { name: '饭团', emoji: '🍙', category: 'japanese', subCategory: 'sushi', tags: ['mild', 'cheap'] },

    // ========== 更多甜品饮品 ==========
    { name: '芋圆', emoji: '🍡', category: 'dessert', subCategory: 'cake', tags: ['sweet', 'cheap'] },
    { name: '烧仙草', emoji: '🧋', category: 'dessert', subCategory: 'milk_tea', tags: ['sweet', 'cheap'] },
    { name: '绿豆沙', emoji: '🫘', category: 'dessert', subCategory: 'cake', tags: ['sweet', 'cheap'] },
    { name: '糖水', emoji: '🍵', category: 'dessert', subCategory: 'cake', tags: ['sweet', 'cheap'] },
    { name: '腐竹白果糖水', emoji: '🍵', category: 'dessert', subCategory: 'cake', tags: ['sweet', 'cheap'] },
    { name: '冰沙', emoji: '🧊', category: 'dessert', subCategory: 'ice_cream', tags: ['sweet', 'cheap'] },
    { name: '奶昔', emoji: '🥤', category: 'dessert', subCategory: 'ice_cream', tags: ['sweet', 'moderate'] },
    { name: '水果捞', emoji: '🍓', category: 'dessert', subCategory: 'fruit_tea', tags: ['sweet', 'healthy'] },
    { name: '杨枝甘露', emoji: '🥭', category: 'dessert', subCategory: 'fruit_tea', tags: ['sweet', 'moderate'] },
    { name: '鲜榨果汁', emoji: '🧃', category: 'dessert', subCategory: 'fruit_tea', tags: ['sweet', 'healthy'] },
];

// ===========================================
// 快速分类模板 (一键导入)
// ===========================================

export const QUICK_TEMPLATES = {
    // 快餐套餐
    fastFood: ['麦当劳', '肯德基', '汉堡王', '必胜客', '德克士', '华莱士'],

    // 奶茶饮品
    milkTea: ['喜茶', '奈雪的茶', '瑞幸咖啡', '蜜雪冰城', 'CoCo都可', '一点点', '茶百道', '霸王茶姬', '古茗'],

    // 火锅
    hotpot: ['海底捞', '小龙坎', '呷哺呷哺', '大龙燚', '谭鸭血', '巴奴毛肚火锅'],

    // 外卖常点
    delivery: ['麻辣烫', '黄焖鸡米饭', '兰州拉面', '沙县小吃', '饺子', '炒饭炒面'],

    // 约会餐厅
    date: ['日料', '西餐厅', '意大利餐', '韩式烤肉', '火锅', '咖啡厅'],

    // 深夜食堂
    lateNight: ['烧烤', '小龙虾', '麻辣烫', '炸鸡', '煎饼', '螺蛳粉'],

    // 健康轻食
    healthy: ['沙拉', '轻食', '越南粉', '日式定食', '素食', '粥'],
};

// ===========================================
// 辅助函数
// ===========================================

/**
 * 获取分类按 ID
 */
export function getCategoryById(id: string): FoodCategory | undefined {
    return FOOD_CATEGORIES.find(c => c.id === id);
}

/**
 * 获取分类的所有食物
 */
export function getFoodsByCategory(categoryId: string): PresetFood[] {
    return PRESET_FOODS.filter(f => f.category === categoryId);
}

/**
 * 按标签筛选食物
 */
export function getFoodsByTag(tagId: string): PresetFood[] {
    return PRESET_FOODS.filter(f => f.tags.includes(tagId));
}

/**
 * 获取随机食物
 */
export function getRandomFood(foods: PresetFood[] = PRESET_FOODS): PresetFood {
    return foods[Math.floor(Math.random() * foods.length)];
}

/**
 * 获取标签分组
 */
export function getTagsByGroup(group: FoodTag['group']): FoodTag[] {
    return FOOD_TAGS.filter(t => t.group === group);
}
