function createDefaultWeather() {
    return {
        id: 'sunny',
        name: '晴空微风',
        icon: '☀️',
        desc: '阳光稳定，蒸发稍快',
        daysLeft: 2,
        effects: {
            waterDrift: -0.12,
            lightDrift: 0.06,
            bonus: 0.03,
            penalty: 0
        }
    };
}

export const state = {
    crop: null,
    stageIndex: 0,
    progress: 0,
    water: 50,
    light: 50,
    day: 1,
    solarTermIndex: 0,
    buffs: 0,
    penalty: 0,
    isPaused: false,
    eventActive: false,
    eventQuestion: null,
    score: 0,
    quizCount: 0,
    correctCount: 0,
    unlockedCards: [], // 存储已解锁的知识卡ID
    streak: 0,
    maxStreak: 0,
    streakTicks: 0,
    challenge: null,
    achievements: [],
    weather: createDefaultWeather(),
    harvestShown: false
};

const STORAGE_KEY = 'greengarden_lite_save';

export function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
            // 确保新字段存在
            if (!state.unlockedCards) state.unlockedCards = [];
            if (state.streak === undefined) state.streak = 0;
            if (state.maxStreak === undefined) state.maxStreak = 0;
            if (state.streakTicks === undefined) state.streakTicks = 0;
            if (state.challenge === undefined) state.challenge = null;
            if (!state.achievements) state.achievements = [];
            if (!state.weather) state.weather = createDefaultWeather();
            if (state.harvestShown === undefined) state.harvestShown = false;
            if (state.eventQuestion === undefined) state.eventQuestion = null;
            if (state.isPaused === undefined) state.isPaused = false;
            return true;
        } catch (e) {
            console.error("Save file corrupted", e);
            return false;
        }
    }
    return false;
}

export function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
    // 保留解锁的卡片和分数记录? 
    // 方案：重置当前种植状态，但保留图鉴
    state.stageIndex = 0;
    state.progress = 0;
    state.day = 1;
    state.buffs = 0;
    state.penalty = 0;
    state.isPaused = false;
    state.eventActive = false;
    state.eventType = null;
    state.eventQuestion = null;
    state.streak = 0;
    state.maxStreak = 0;
    state.streakTicks = 0;
    state.challenge = null;
    state.weather = createDefaultWeather();
    state.eventQuestion = null;
    state.harvestShown = false;
    state.score = 0;
    state.quizCount = 0;
    state.correctCount = 0;
    state.achievements = [];
    // state.score = 0; // 累积积分不重置? 或者单局结算
    // state.crop = null; // 让用户重新选择
    saveState();
}

export function fullReset() {
    state.crop = null;
    resetState();
}
