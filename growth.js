import { state } from './state.js';

export function calculateGrowth(cropData, solarTerms) {
    if (state.stageIndex >= cropData.stages.length) return 0;

    const optimal = cropData.optimal;

    const withinWater = state.water >= optimal.water[0] && state.water <= optimal.water[1];
    const withinLight = state.light >= optimal.light[0] && state.light <= optimal.light[1];
    
    // 1. 计算参数适配度 (0 - 1)
    // 简单逻辑：在区间内为1，偏离越远越低
    const getFactor = (val, range) => {
        if (val >= range[0] && val <= range[1]) return 1;
        const dist = Math.min(Math.abs(val - range[0]), Math.abs(val - range[1]));
        return Math.max(0, 1 - dist / 30); // 偏离30以上归零
    };

    const waterFactor = getFactor(state.water, optimal.water);
    const lightFactor = getFactor(state.light, optimal.light);
    const envFactor = (waterFactor + lightFactor) / 2;

    // 连击逻辑：同时满足最佳区间才增加
    const STREAK_TICKS_REQUIRED = 10; // 10 * 100ms = 1s
    if (withinWater && withinLight) {
        const currentTicks = (state.streakTicks || 0) + 1;
        state.streakTicks = currentTicks;
        if (currentTicks >= STREAK_TICKS_REQUIRED) {
            const gained = Math.floor(currentTicks / STREAK_TICKS_REQUIRED);
            state.streak += gained;
            state.streakTicks = currentTicks % STREAK_TICKS_REQUIRED;
            if (state.streak > state.maxStreak) {
                state.maxStreak = state.streak;
            }
        }
    } else {
        state.streak = 0;
        state.streakTicks = 0;
    }

    // 挑战进度
    const REQUIRED_TICKS = 10; // 10 * 100ms = 1秒

    if (state.challenge && !state.challenge.completed && state.challenge.cropId === state.crop.id && state.challenge.stageIndex === state.stageIndex) {
        if (state.challenge.currentTicks === undefined) {
            state.challenge.currentTicks = 0;
        }
        let success = false;
        switch (state.challenge.focus) {
            case 'water':
                success = withinWater;
                break;
            case 'light':
                success = withinLight;
                break;
            default:
                success = withinWater && withinLight;
        }

        if (success) {
            state.challenge.currentTicks += 1;
            if (state.challenge.currentTicks >= REQUIRED_TICKS) {
                const gained = Math.floor(state.challenge.currentTicks / REQUIRED_TICKS);
                state.challenge.progress = Math.min(state.challenge.target, state.challenge.progress + gained);
                state.challenge.currentTicks = state.challenge.currentTicks % REQUIRED_TICKS;
            }

            if (state.challenge.progress >= state.challenge.target) {
                state.challenge.completed = true;
                state.buffs += state.challenge.reward;
                if (!state.achievements.includes(state.challenge.id)) {
                    state.achievements.push(state.challenge.id);
                }
            }
        } else {
            state.challenge.currentTicks = 0;
        }
    }

    // 2. 节气 Buff
    const term = solarTerms[state.solarTermIndex];
    const termBuff = term ? term.buff : 0;

    const weatherEffects = (state.weather && state.weather.effects) ? state.weather.effects : {};
    const weatherBonus = weatherEffects.bonus || 0;
    const weatherPenalty = weatherEffects.penalty || 0;

    // 3. 综合计算
    // 基础速率 * 环境系数 * (1 + 节气 + 答题奖励) * (1 - 惩罚)
    const streakBonus = Math.min(state.streak * 0.01, 0.25);

    const totalBonus = Math.max(0, 1 + termBuff + state.buffs + streakBonus + weatherBonus);
    const totalPenalty = Math.max(0, Math.min(0.8, (state.penalty || 0) + weatherPenalty));

    let rate = cropData.baseRate * envFactor * totalBonus * (1 - totalPenalty);
    
    return Math.max(0, rate);
}

export function advanceDay(solarTerms) {
    state.day++;
    // 简单节气循环：每 5 天换一个节气
    state.solarTermIndex = Math.floor((state.day - 1) / 5) % solarTerms.length;
}
