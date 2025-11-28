import { state, loadState, saveState, resetState, fullReset } from './state.js';
import { initUI, updateUI, showKnowledgeCard, showQR, showStartScreen, showJournal, showHarvestCelebration } from './ui.js';
import { calculateGrowth, advanceDay } from './growth.js';
import { checkRandomEvent } from './events.js';

let cropsData = [];
let knowledgeData = [];
let solarTermsData = [];

const CHALLENGE_REWARD = 0.08; // 8% 额外成长

const WEATHER_TYPES = [
    {
        id: 'sunny',
        name: '晴空微风',
        icon: '☀️',
        desc: '阳光稳定，蒸发稍快，生长略有提升',
        duration: [2, 3],
        effects: {
            waterDrift: -0.12,
            lightDrift: 0.06,
            bonus: 0.04,
            penalty: 0
        }
    },
    {
        id: 'rainy',
        name: '连续小雨',
        icon: '🌧️',
        desc: '空气湿润，水分自然回升，但光照偏低',
        duration: [1, 2],
        effects: {
            waterDrift: 0.28,
            lightDrift: -0.12,
            bonus: 0,
            penalty: 0.04
        }
    },
    {
        id: 'cloudy',
        name: '多云间阴',
        icon: '⛅',
        desc: '光照波动较大，需要及时补光',
        duration: [2, 3],
        effects: {
            waterDrift: 0.02,
            lightDrift: -0.08,
            bonus: 0.01,
            penalty: 0
        }
    },
    {
        id: 'bloom',
        name: '花朵盛期风',
        icon: '🌸',
        desc: '和风催花，授粉效率提升，生长加速',
        duration: [1, 2],
        effects: {
            waterDrift: -0.05,
            lightDrift: 0.02,
            bonus: 0.08,
            penalty: 0
        }
    },
    {
        id: 'heatwave',
        name: '热浪侵袭',
        icon: '🔥',
        desc: '高温干燥，水分快速蒸发，需要密切调节',
        duration: [1, 1],
        effects: {
            waterDrift: -0.35,
            lightDrift: 0.12,
            bonus: 0.05,
            penalty: 0.05
        }
    }
];

function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, value));
}

function cloneWeather(template) {
    return {
        id: template.id,
        name: template.name,
        icon: template.icon,
        desc: template.desc,
        daysLeft: template.duration ? template.duration[0] : 2,
        effects: { ...(template.effects || {}) }
    };
}

function randomIntInRange(min, max) {
    const low = Math.ceil(min);
    const high = Math.floor(max);
    return Math.floor(Math.random() * (high - low + 1)) + low;
}

function rollWeather(prevId) {
    const candidates = WEATHER_TYPES.filter(w => w.id !== prevId);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] || WEATHER_TYPES[0];
    const weather = cloneWeather(chosen);
    if (chosen.duration && chosen.duration.length === 2) {
        weather.daysLeft = randomIntInRange(chosen.duration[0], chosen.duration[1]);
    }
    return weather;
}

function applyWeatherDrift() {
    if (!state.weather || !state.crop) return;
    const effects = state.weather.effects || {};
    if (effects.waterDrift) {
        state.water = clamp(state.water + effects.waterDrift);
    }
    if (effects.lightDrift) {
        state.light = clamp(state.light + effects.lightDrift);
    }
}

function tickWeatherDay() {
    if (!state.weather) {
        state.weather = rollWeather();
        saveState();
        return;
    }

    state.weather.daysLeft = Math.max(0, (state.weather.daysLeft || 1) - 1);
    if (state.weather.daysLeft <= 0) {
        const nextWeather = rollWeather(state.weather.id);
        state.weather = nextWeather;
    }
    saveState();
}

function normalizeWeather() {
    const currentId = state.weather && state.weather.id;
    const template = WEATHER_TYPES.find(w => w.id === currentId) || WEATHER_TYPES[0];
    const weather = cloneWeather(template);
    if (state.weather && typeof state.weather.daysLeft === 'number' && state.weather.daysLeft > 0) {
        weather.daysLeft = state.weather.daysLeft;
    } else if (template.duration && template.duration.length === 2) {
        weather.daysLeft = randomIntInRange(template.duration[0], template.duration[1]);
    }
    state.weather = weather;
}

function createChallenge(crop, stageIndex) {
    const focusOptions = ['both', 'water', 'light'];
    const focus = focusOptions[Math.floor(Math.random() * focusOptions.length)];
    const target = focus === 'both' ? 50 : 40; // 100ms 计数 -> 约 5 秒

    let focusText = '';
    switch (focus) {
        case 'water':
            focusText = '让水分保持在最佳区间';
            break;
        case 'light':
            focusText = '让光照保持在最佳区间';
            break;
        default:
            focusText = '让水分和光照同时保持最佳';
            break;
    }

    return {
        id: `${crop.id}-s${stageIndex}-${focus}-${Date.now()}`,
        cropId: crop.id,
        stageIndex,
        focus,
        target,
        progress: 0,
        completed: false,
        reward: CHALLENGE_REWARD,
        description: `${focusText}${target} 次以解锁成长加速`,
        currentTicks: 0
    };
}

function ensureChallenge(force = false) {
    if (!state.crop) return;

    if (state.stageIndex >= state.crop.stages.length) {
        state.challenge = null;
        return;
    }

    const current = state.challenge;
    const needsNew =
        force ||
        !current ||
        current.cropId !== state.crop.id ||
        current.stageIndex !== state.stageIndex;

    if (needsNew) {
        state.challenge = createChallenge(state.crop, state.stageIndex);
        state.challenge.progress = 0;
        state.challenge.completed = false;
        state.challenge.currentTicks = 0;
        saveState();
    }
}

function buildHarvestDetails() {
    const cropName = state.crop?.name || '作物';
    const cropId = state.crop?.id || '';
    const emoji = state.crop?.emoji || '🎉';
    const days = Math.max(1, state.day || 1);
    const maxStreak = state.maxStreak || 0;
    const knowledgeCount = state.correctCount || 0;
    const challengeCount = Array.isArray(state.achievements) ? state.achievements.length : 0;

    const baseScore = Math.max(0, Math.round(maxStreak * 8 + knowledgeCount * 12 + challengeCount * 25));
    state.score = baseScore;

    const shareUrl = window.location.href;
    const stageCount = state.crop?.stages ? state.crop.stages.length : 0;
    const harvestStageIdx = stageCount > 0 ? Math.max(0, stageCount - 1) : 0;
    const cropImageUrl = cropId ? `./assets/${cropId}_stage_${harvestStageIdx}.png` : '';
    const summaryLines = [
        `历经 ${days} 天的细心照料，你成功收获了 ${cropName}。`,
        `最高连击 ${maxStreak} 轮，完成挑战 ${challengeCount} 次，答对 ${knowledgeCount} 道知识题。`,
        `最终积分 ${baseScore} 分，继续挑战更多作物吧！`
    ];

    const shareText = [
        `我在 GreenGarden Lite 收获了 ${cropName}!`,
        `用时 ${days} 天，保持 ${maxStreak} 轮连击`,
        `知识问答正确 ${knowledgeCount} 道，挑战完成 ${challengeCount} 项`,
        `总积分 ${baseScore} 分，快来一起种植吧！`,
        `入口：${shareUrl}`
    ].join('\n');

    return {
        cropName,
        emoji,
        cropId,
        days,
        maxStreak,
        knowledgeCount,
        challengeCount,
        score: baseScore,
        summaryLines,
        shareText,
        shareUrl,
        cropImageUrl
    };
}

function showHarvestIfReady() {
    if (!state.crop) return;
    if (state.stageIndex < state.crop.stages.length) return;
    if (state.harvestShown) return;

    const details = buildHarvestDetails();
    showHarvestCelebration(details);
    state.harvestShown = true;
    saveState();
}

async function init() {
    // 加载数据
    try {
        const [c, k, s] = await Promise.all([
            fetch('./data/crops.json').then(r => r.json()),
            fetch('./data/knowledge.json').then(r => r.json()),
            fetch('./data/solar_terms.json').then(r => r.json())
        ]);
        cropsData = c;
        knowledgeData = k;
        solarTermsData = s;
    } catch (e) {
        console.error("Failed to load data", e);
        alert("数据加载失败，请检查网络或本地服务配置");
        return;
    }

    // 绑定按钮
    document.getElementById('share-btn').addEventListener('click', () => {
        showQR(window.location.href);
    });
    
    document.getElementById('journal-btn-start').addEventListener('click', () => {
        showJournal(knowledgeData);
    });
    
    document.getElementById('journal-btn-game').addEventListener('click', () => {
        showJournal(knowledgeData);
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        if(confirm("确定要重新开始吗？当前进度将丢失。")) {
            fullReset();
            location.reload();
        }
    });

    // 初始化状态
    if (loadState() && state.crop) {
        // 恢复 crop 引用 (因为 localStorage 存的是副本)
        state.crop = cropsData.find(c => c.id === state.crop.id) || cropsData[0];
        startGame();
    } else {
        // 显示选种界面
        showStartScreen(cropsData, (selectedCrop) => {
            state.crop = selectedCrop;
            resetState(); // 初始化数值
            startGame();
        });
    }
}

function startGame() {
    normalizeWeather();
    saveState();
    initUI(state.crop);
    ensureChallenge();
    showHarvestIfReady();
    startGameLoop();
}

function startGameLoop() {
    // 逻辑循环：每秒 1 次 (模拟 1 天 = 10秒，则 100ms = 0.1天? 不，方案说 10秒=1天)
    // 方案：每 10 秒表示一个“游戏日”。
    // 意味着每 1000ms，day 增加 0.1 ? 或者直接每 10s 增加 1 day。
    // 为了流畅感，进度条应该每帧更新，但 day 更新可以慢点。
    
    // 设定：Tick 每 100ms 运行一次
    setInterval(() => {
        if (state.isPaused) return;
        if (!state.crop || state.stageIndex >= state.crop.stages.length) return; // 已结束

        applyWeatherDrift();

        // 1. 计算生长
        // baseRate 是每秒增量? 假设 baseRate = 1.5 (每秒 1.5%)
        // 100ms 增量 = rate / 10
        const growthRate = calculateGrowth(state.crop, solarTermsData);
        state.progress += growthRate / 10;

        // 2. 检查阶段升级
        if (state.progress >= 100) {
            state.progress = 0;
            const currentStageIdx = state.stageIndex;
            
            // 查找是否有该阶段的知识卡 (匹配 cropId)
            // 随机选择一个未解锁的卡片，或者随机选择一个
            const availableCards = knowledgeData.filter(k => k.stage === currentStageIdx && (k.cropId === state.crop.id || !k.cropId));
            
            if (availableCards.length > 0) {
                // 优先选择未解锁的
                const unlockedIds = state.unlockedCards || [];
                let card = availableCards.find(k => !unlockedIds.includes(k.id));
                
                // 如果都解锁了，随机选一个
                if (!card) {
                    card = availableCards[Math.floor(Math.random() * availableCards.length)];
                }

                state.isPaused = true;
                showKnowledgeCard(card, (success) => {
                    state.isPaused = false;
                    // 答题结束后才正式进入下一阶段
                    state.stageIndex++;
                    ensureChallenge(true);
                    saveState();
                    showHarvestIfReady();
                });
            } else {
                state.stageIndex++;
                ensureChallenge(true);
                showHarvestIfReady();
            }
            
            showHarvestIfReady();
        }

        // 3. 随机事件
        checkRandomEvent();

        saveState();
    }, 100);

    // 时间循环：每 10 秒增加一天
    setInterval(() => {
        if (!state.isPaused && state.crop && state.stageIndex < state.crop.stages.length) {
            advanceDay(solarTermsData);
            tickWeatherDay();
        }
    }, 10000);

    // 渲染循环
    function render() {
        if (state.crop) {
            updateUI(state.crop, solarTermsData);
        }
        requestAnimationFrame(render);
    }
    render();
}

// 启动
init();
