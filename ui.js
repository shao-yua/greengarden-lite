import { state } from './state.js';

const els = {
    day: document.getElementById('day-display'),
    term: document.getElementById('term-display'),
    cropVisual: document.getElementById('crop-visual'),
    stageName: document.getElementById('stage-name'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    waterVal: document.getElementById('water-val'),
    lightVal: document.getElementById('light-val'),
    waterDisplay: document.getElementById('water-display'),
    lightDisplay: document.getElementById('light-display'),
    waterOptimal: document.getElementById('water-optimal'),
    lightOptimal: document.getElementById('light-optimal'),
    hintWaterText: document.getElementById('hint-water-text'),
    hintLightText: document.getElementById('hint-light-text'),
    eventArea: document.getElementById('event-area'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modal-title'),
    traditionText: document.getElementById('tradition-text'),
    modernText: document.getElementById('modern-text'),
    quizSection: document.getElementById('quiz-section'),
    quizQuestion: document.getElementById('quiz-question'),
    quizOptions: document.getElementById('quiz-options'),
    feedbackSection: document.getElementById('feedback-section'),
    feedbackIcon: document.getElementById('feedback-icon'),
    feedbackTitle: document.getElementById('feedback-title'),
    feedbackText: document.getElementById('feedback-text'),
    feedbackBtn: document.getElementById('feedback-btn'),
    streakCurrent: document.getElementById('streak-current'),
    streakBest: document.getElementById('streak-best'),
    weatherCard: document.getElementById('weather-card'),
    weatherIcon: document.getElementById('weather-icon'),
    weatherName: document.getElementById('weather-name'),
    weatherTimer: document.getElementById('weather-timer'),
    challengeCard: document.getElementById('challenge-card'),
    challengeProgressBar: document.getElementById('challenge-progress-bar'),
    challengeProgressText: document.getElementById('challenge-progress-text'),
    challengeStatus: document.getElementById('challenge-status'),
    qrSection: document.getElementById('qr-section'),
    qrCanvas: document.getElementById('qr-canvas'),
    startScreen: document.getElementById('start-screen'),
    cropList: document.getElementById('crop-list'),
    knowledgeSection: document.getElementById('knowledge-section'),
    journalSection: document.getElementById('journal-section'),
    journalList: document.getElementById('journal-list'),
    journalFilters: document.getElementById('journal-filters'),
    journalDetail: document.getElementById('journal-detail'),
    journalDetailThumb: document.getElementById('journal-detail-thumb'),
    journalDetailStage: document.getElementById('journal-detail-stage'),
    journalDetailStatus: document.getElementById('journal-detail-status'),
    journalDetailTitle: document.getElementById('journal-detail-title'),
    journalDetailNote: document.getElementById('journal-detail-note'),
    journalDetailTradition: document.getElementById('journal-detail-tradition'),
    journalDetailModern: document.getElementById('journal-detail-modern'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    harvestSection: document.getElementById('harvest-section'),
    harvestVisual: document.getElementById('harvest-visual'),
    harvestTitle: document.getElementById('harvest-title'),
    harvestSummary: document.getElementById('harvest-summary'),
    harvestShareBtn: document.getElementById('harvest-share-btn'),
    waterMeterFill: document.getElementById('water-meter-fill'),
    lightMeterFill: document.getElementById('light-meter-fill'),
    harvestCardContainer: document.getElementById('harvest-card-container'),
    harvestCardPreview: document.getElementById('harvest-card-preview'),
    harvestCardDownload: document.getElementById('harvest-card-download'),
    detailCard: document.getElementById('detail-card'),
    detailCardTitle: document.getElementById('detail-card-title'),
    detailCardText: document.getElementById('detail-card-text'),
    detailCardClose: document.getElementById('detail-card-close')
};

function clampStageIndex(cropData, stageIndex) {
    if (!cropData || !Array.isArray(cropData.stages) || cropData.stages.length === 0) {
        return 0;
    }
    return Math.min(Math.max(stageIndex, 0), cropData.stages.length - 1);
}

function getStageImageUrl(cropData, stageIndex) {
    if (!cropData || !cropData.id) return '';
    const idx = clampStageIndex(cropData, stageIndex);
    return `./assets/${cropData.id}_stage_${idx}.png`;
}

function updateCropVisual(cropData) {
    if (!els.cropVisual || !cropData) return;
    const url = getStageImageUrl(cropData, state.stageIndex);
    els.cropVisual.textContent = '';
    if (url) {
        els.cropVisual.style.backgroundImage = `url('${url}')`;
    } else {
        els.cropVisual.style.backgroundImage = '';
    }
}

function getJournalThumbUrl(card) {
    if (!card || !card.cropId) return '';
    const stageIdx = Number.isFinite(card.stage) ? Math.max(0, Math.floor(card.stage)) : 0;
    const clampedStage = Math.min(stageIdx, 5); // 作物阶段素材数量固定为 6
    return `./assets/${card.cropId}_stage_${clampedStage}.png`;
}

const cropNameMap = {
    tomato: '番茄',
    cucumber: '黄瓜'
};

const cropSortOrder = {
    tomato: 0,
    cucumber: 1
};

let journalKnowledgeCache = [];
let journalCurrentFilter = 'all';
let journalSelectedId = null;
let detailCardTimer = null;

function getCropName(cropId) {
    return cropNameMap[cropId] || '未知作物';
}

function getStageLabel(stage) {
    const index = Number.isFinite(stage) ? Math.max(0, Math.floor(stage)) : 0;
    return `第 ${index + 1} 阶段`;
}

function renderJournalFilters() {
    if (!els.journalFilters) return;
    const uniqueCropIds = Array.from(new Set(journalKnowledgeCache.map(card => card.cropId).filter(Boolean)));
    if (journalCurrentFilter !== 'all' && !uniqueCropIds.includes(journalCurrentFilter)) {
        journalCurrentFilter = 'all';
    }

    const filters = [{ id: 'all', label: '全部' }, ...uniqueCropIds.map(id => ({ id, label: getCropName(id) }))];
    els.journalFilters.innerHTML = '';

    filters.forEach(filter => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'journal-filter-btn' + (journalCurrentFilter === filter.id ? ' active' : '');
        btn.textContent = filter.label;
        btn.addEventListener('click', () => {
            if (journalCurrentFilter === filter.id) return;
            journalCurrentFilter = filter.id;
            journalSelectedId = null;
            renderJournalFilters();
            renderJournalList();
        });
        els.journalFilters.appendChild(btn);
    });
}

function renderJournalList() {
    if (!els.journalList) return;

    els.journalList.innerHTML = '';

    const filtered = journalKnowledgeCache
        .filter(card => journalCurrentFilter === 'all' || card.cropId === journalCurrentFilter)
        .sort((a, b) => {
            const cropDiff = (cropSortOrder[a.cropId] ?? 99) - (cropSortOrder[b.cropId] ?? 99);
            if (cropDiff !== 0) return cropDiff;
            return (a.stage || 0) - (b.stage || 0);
        });

    if (!filtered.length) {
        const empty = document.createElement('div');
        empty.className = 'journal-empty';
        empty.textContent = '当前分类下暂无知识卡片，继续探索来解锁更多内容。';
        els.journalList.appendChild(empty);
        updateJournalDetail(null, false);
        return;
    }

    let selectedMeta = null;

    filtered.forEach(card => {
        const unlocked = state.unlockedCards.includes(card.id);
        const cardBtn = document.createElement('button');
        cardBtn.type = 'button';
        cardBtn.className = 'journal-card';
        if (!unlocked) cardBtn.classList.add('locked');
        if (journalSelectedId === card.id) cardBtn.classList.add('active');

        const thumb = document.createElement('div');
        thumb.className = 'journal-card-thumb';
        const thumbUrl = getJournalThumbUrl(card);
        if (thumbUrl) {
            thumb.style.backgroundImage = `url('${thumbUrl}')`;
        }
        cardBtn.appendChild(thumb);

        const info = document.createElement('div');
        info.className = 'journal-card-info';

        const stageLabel = document.createElement('span');
        stageLabel.className = 'journal-card-stage';
        stageLabel.textContent = `${getCropName(card.cropId)} · ${getStageLabel(card.stage)}`;
        info.appendChild(stageLabel);

        const title = document.createElement('h5');
        title.className = 'journal-card-title';
        title.textContent = card.title;
        info.appendChild(title);

        const status = document.createElement('span');
        status.className = 'journal-card-status' + (unlocked ? '' : ' waiting');
        status.textContent = unlocked ? '已解锁' : '待解锁';
        info.appendChild(status);

        cardBtn.appendChild(info);

        cardBtn.addEventListener('click', () => handleJournalSelect(card, unlocked, cardBtn));

        if (journalSelectedId === card.id) {
            selectedMeta = { card, unlocked, element: cardBtn };
        }

        els.journalList.appendChild(cardBtn);
    });

    if (selectedMeta) {
        selectedMeta.element.classList.add('active');
        updateJournalDetail(selectedMeta.card, selectedMeta.unlocked);
    } else {
        updateJournalDetail(null, false);
    }
}

function handleJournalSelect(card, unlocked, element) {
    journalSelectedId = card.id;
    updateJournalDetail(card, unlocked);
    if (!els.journalList) return;
    Array.from(els.journalList.querySelectorAll('.journal-card')).forEach(btn => {
        btn.classList.toggle('active', btn === element);
    });
}

function resetJournalDetail() {
    if (els.journalDetailThumb) {
        els.journalDetailThumb.style.backgroundImage = '';
        els.journalDetailThumb.classList.remove('locked');
    }
    if (els.journalDetailStage) {
        els.journalDetailStage.textContent = '阶段信息';
    }
    if (els.journalDetailStatus) {
        els.journalDetailStatus.textContent = '待选择';
        els.journalDetailStatus.classList.remove('unlocked');
    }
    if (els.journalDetailTitle) {
        els.journalDetailTitle.textContent = '选择知识卡查看详情';
    }
    if (els.journalDetailNote) {
        els.journalDetailNote.textContent = '成长旅程会揭示更多独家内容。';
    }
    if (els.journalDetailTradition) {
        els.journalDetailTradition.textContent = '从左侧选择一张卡片以回顾传统经验。';
    }
    if (els.journalDetailModern) {
        els.journalDetailModern.textContent = '完成对应阶段后即可解锁现代技术亮点。';
    }
}

function updateJournalDetail(card, unlocked) {
    if (!card) {
        resetJournalDetail();
        return;
    }

    if (els.journalDetailStage) {
        els.journalDetailStage.textContent = `${getCropName(card.cropId)} · ${getStageLabel(card.stage)}`;
    }

    if (els.journalDetailStatus) {
        els.journalDetailStatus.textContent = unlocked ? '已解锁' : '待解锁';
        els.journalDetailStatus.classList.toggle('unlocked', unlocked);
    }

    if (els.journalDetailTitle) {
        els.journalDetailTitle.textContent = unlocked ? card.title : '尚待解锁';
    }

    if (els.journalDetailNote) {
        els.journalDetailNote.textContent = unlocked ? '已收入图鉴，可随时回顾。' : '继续推进该阶段以解锁完整内容。';
    }

    if (els.journalDetailThumb) {
        const thumbUrl = getJournalThumbUrl(card);
        if (thumbUrl) {
            els.journalDetailThumb.style.backgroundImage = `url('${thumbUrl}')`;
        } else {
            els.journalDetailThumb.style.backgroundImage = '';
        }
        els.journalDetailThumb.classList.toggle('locked', !unlocked);
    }

    if (els.journalDetailTradition) {
        els.journalDetailTradition.textContent = unlocked ? card.tradition : '解锁后可查看传统技艺的详细描述。';
    }

    if (els.journalDetailModern) {
        els.journalDetailModern.textContent = unlocked ? card.modern : '解锁后可查看现代新质的关键亮点。';
    }
}

export function closeModal() {
    hideDetailCard();
    state.isPaused = false;
    els.modal.classList.add('hidden');
    if (els.knowledgeSection) els.knowledgeSection.classList.add('hidden');
    if (els.quizSection) els.quizSection.classList.add('hidden');
    if (els.feedbackSection) els.feedbackSection.classList.add('hidden');
    if (els.journalSection) els.journalSection.classList.add('hidden');
    if (els.qrSection) els.qrSection.classList.add('hidden');
    if (els.harvestSection) els.harvestSection.classList.add('hidden');
    if (els.harvestCardContainer) els.harvestCardContainer.classList.add('hidden');
    if (els.harvestCardPreview) els.harvestCardPreview.src = '';
    if (els.harvestCardDownload) els.harvestCardDownload.dataset.cardUrl = '';
    if (els.harvestVisual) {
        els.harvestVisual.style.backgroundImage = '';
        els.harvestVisual.textContent = '';
    }
    if (els.journalFilters) els.journalFilters.innerHTML = '';
    if (els.journalList) els.journalList.innerHTML = '';
    resetJournalDetail();
    journalKnowledgeCache = [];
    journalSelectedId = null;
    journalCurrentFilter = 'all';
}

function describeWaterRange(range) {
    if (!range || range.length < 2) return '根据需要调节水分';
    const [min, max] = range;
    if (min >= 70) return '需要大量浇水';
    if (max <= 40) return '保持偏干环境';
    if (min >= 55) return '保持湿润充足';
    if (max <= 60) return '维持适度湿润';
    return '保持适度湿润';
}

function describeLightRange(range) {
    if (!range || range.length < 2) return '保持稳定光照';
    const [min, max] = range;
    if (min >= 70) return '需要充足阳光';
    if (max <= 40) return '适合半阴环境';
    if (min >= 55) return '保持明亮散射光';
    if (max <= 60) return '避免强光直射';
    return '保持均衡光照';
}

function buildWeatherDetail(weather) {
    if (!weather) return '暂无天气信息，继续保持日常养护即可。';
    const lines = [];
    if (weather.desc) lines.push(weather.desc);
    const hints = [];
    const effects = weather.effects || {};
    if (typeof effects.waterDrift === 'number') {
        if (effects.waterDrift > 0) {
            hints.push('水分更容易积聚，注意防止积水');
        } else if (effects.waterDrift < 0) {
            hints.push('水分蒸发偏快，适当补水');
        }
    }
    if (typeof effects.lightDrift === 'number') {
        if (effects.lightDrift > 0) {
            hints.push('光照更强，留意遮阴');
        } else if (effects.lightDrift < 0) {
            hints.push('光照偏弱，可补充灯光');
        }
    }
    if (typeof effects.bonus === 'number' && effects.bonus > 0) {
        hints.push(`阶段成长加速 +${Math.round(effects.bonus * 1000) / 10}%`);
    }
    if (typeof effects.penalty === 'number' && effects.penalty > 0) {
        hints.push(`可能造成减益 ${Math.round(effects.penalty * 1000) / 10}%`);
    }
    if (hints.length) lines.push(hints.join('，'));
    return lines.join(' ');
}

function buildChallengeDetail(challenge) {
    if (!challenge) return '暂无挑战，保持稳定照料即可继续成长。';
    const lines = [];
    if (challenge.description) lines.push(challenge.description);
    if (challenge.target) {
        lines.push(`目标：完成 ${challenge.target} 次，当前 ${challenge.progress || 0} 次`);
    }
    if (typeof challenge.reward === 'number') {
        lines.push(`奖励：阶段成长加速 +${Math.round(challenge.reward * 1000) / 10}%`);
    }
    return lines.join(' ');
}

function showDetailCard(title, text) {
    if (!els.detailCard || !els.detailCardTitle || !els.detailCardText) return;
    els.detailCardTitle.textContent = title || '详细说明';
    els.detailCardText.textContent = text || '暂无详细介绍';
    els.detailCard.classList.remove('hidden');
    if (detailCardTimer) {
        clearTimeout(detailCardTimer);
    }
    detailCardTimer = setTimeout(() => {
        hideDetailCard();
    }, 8000);
}

function hideDetailCard() {
    if (!els.detailCard) return;
    els.detailCard.classList.add('hidden');
    if (detailCardTimer) {
        clearTimeout(detailCardTimer);
        detailCardTimer = null;
    }
}

function attachInfoCardInteraction(el, fallbackTitle) {
    if (!el || el.dataset.infoBound === 'true') return;
    const openDetail = () => {
        const title = el.dataset.detailTitle || fallbackTitle || '详细说明';
        const text = el.dataset.detailText || '暂无详细介绍';
        showDetailCard(title, text);
    };
    el.addEventListener('click', openDetail);
    el.addEventListener('keydown', evt => {
        if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            openDetail();
        }
    });
    el.dataset.infoBound = 'true';
}

if (els.modalCloseBtn) {
    els.modalCloseBtn.addEventListener('click', () => {
        closeModal();
    });
}

if (els.detailCardClose) {
    els.detailCardClose.addEventListener('click', () => {
        hideDetailCard();
    });
}

document.addEventListener('keydown', evt => {
    if (evt.key === 'Escape') {
        hideDetailCard();
    }
});

attachInfoCardInteraction(els.weatherCard, '当前天气');
attachInfoCardInteraction(els.challengeCard, '照料挑战');

export function showStartScreen(crops, onSelect) {
    // 确保元素存在
    const screen = els.startScreen || document.getElementById('start-screen');
    const list = els.cropList || document.getElementById('crop-list');
    
    screen.classList.remove('hidden');
    list.innerHTML = '';
    
    crops.forEach(crop => {
        const div = document.createElement('div');
        div.className = 'crop-card';
        const previewIdx = clampStageIndex(crop, (crop.stages?.length || 1) - 1);
        const previewUrl = crop.id ? `./assets/${crop.id}_stage_${previewIdx}.png` : '';
        div.innerHTML = `
            <div class="crop-thumbnail" style="background-image: url('${previewUrl}')"></div>
            <span class="crop-name">${crop.name}</span>
            <span class="start-hint">开始种植</span>
        `;
        div.onclick = () => {
            onSelect(crop);
            screen.classList.add('hidden');
        };
        list.appendChild(div);
    });
}

export function initUI(cropData) {
    // 设置最佳区间指示条 (简化视觉)
    const wOpt = cropData.optimal.water;
    const lOpt = cropData.optimal.light;
    
    if (els.waterOptimal) {
        els.waterOptimal.textContent = `最佳区间 ${wOpt[0]}% - ${wOpt[1]}%`;
    }
    if (els.lightOptimal) {
        els.lightOptimal.textContent = `最佳区间 ${lOpt[0]}% - ${lOpt[1]}%`;
    }

    // 更新提示文本
    if (els.hintWaterText) {
        els.hintWaterText.textContent = describeWaterRange(wOpt);
    }
    if (els.hintLightText) {
        els.hintLightText.textContent = describeLightRange(lOpt);
    }

    // 绑定微调按钮
    const controlButtons = document.querySelectorAll('.control-btn');
    controlButtons.forEach(btn => {
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const delta = parseFloat(btn.dataset.delta || '0');
            adjustControlValue(type, delta);
        });
    });
    
    updateCropVisual(cropData);
    updateControls();
}

export function updateUI(cropData, solarTerms) {
    els.day.textContent = `第 ${state.day} 天`;
    
    const term = solarTerms[state.solarTermIndex];
    els.term.textContent = `节气: ${term ? term.name : '--'}`;

    const weather = state.weather || null;
    if (weather && els.weatherIcon && els.weatherName && els.weatherTimer) {
        els.weatherIcon.textContent = weather.icon || '☀️';
        els.weatherName.textContent = weather.name || '当地气候';
        const daysLeft = weather.daysLeft != null ? weather.daysLeft : 0;
        const remaining = Math.max(0, Math.round(daysLeft));
        els.weatherTimer.textContent = remaining > 0 ? `剩余 ${remaining} 天` : '今日变更';
        if (els.weatherCard) {
            els.weatherCard.dataset.detailTitle = `${weather.name || '当前天气'} · 提示`;
            els.weatherCard.dataset.detailText = buildWeatherDetail(weather);
        }
    } else if (els.weatherCard) {
        els.weatherCard.dataset.detailTitle = '当前天气';
        els.weatherCard.dataset.detailText = '暂无天气数据，稍后再试。';
    }

    const stage = cropData.stages[state.stageIndex];
    els.stageName.textContent = stage ? stage.name : '已收获';
    
    // 更新进度条
    els.progressBar.style.width = `${Math.min(100, state.progress)}%`;
    els.progressText.textContent = `${Math.floor(state.progress)}%`;

    updateCropVisual(cropData);

    // 事件显示
    if (state.eventActive) {
        els.eventArea.classList.remove('hidden');
        const btn = document.getElementById('event-btn');
        switch(state.eventType) {
            case 'pruning':
                btn.textContent = "✂️ 枝叶过密!";
                btn.style.background = "#FF9800"; // Orange
                break;
            case 'pollination':
                btn.textContent = "🐝 花期授粉!";
                btn.style.background = "#E91E63"; // Pink
                break;
            case 'pest':
            default:
                btn.textContent = "⚠️ 发现病虫害!";
                btn.style.background = "#F44336"; // Red
                break;
        }
    } else {
        els.eventArea.classList.add('hidden');
    }

    updateControls();

    // 连击显示
    if (els.streakCurrent) {
        const currentStreak = typeof state.streak === 'number' ? state.streak : 0;
        els.streakCurrent.textContent = currentStreak;
    }
    if (els.streakBest) {
        const bestStreak = typeof state.maxStreak === 'number' ? state.maxStreak : 0;
        els.streakBest.textContent = bestStreak;
    }

    // 挑战信息
    if (els.challengeProgressBar && els.challengeProgressText && els.challengeStatus) {
        const challenge = (state.challenge && state.crop && state.challenge.cropId === state.crop.id && state.challenge.stageIndex === state.stageIndex)
            ? state.challenge
            : null;

        if (challenge) {
            const pct = challenge.target ? Math.min(100, (challenge.progress / challenge.target) * 100) : 0;
            els.challengeProgressBar.style.width = `${pct}%`;
            els.challengeProgressText.textContent = `${challenge.progress} / ${challenge.target}`;
            if (challenge.completed) {
                const rewardPct = Math.round(challenge.reward * 1000) / 10;
                els.challengeStatus.textContent = `✅ 已完成 +${rewardPct}%`;
                els.challengeStatus.className = 'challenge-status completed';
            } else {
                els.challengeStatus.textContent = '进行中';
                els.challengeStatus.className = 'challenge-status pending';
            }
            if (els.challengeCard) {
                els.challengeCard.dataset.detailTitle = '本阶段照料挑战';
                els.challengeCard.dataset.detailText = buildChallengeDetail(challenge);
            }
        } else {
            els.challengeProgressBar.style.width = '0%';
            els.challengeProgressText.textContent = '0 / 0';
            els.challengeStatus.textContent = '--';
            els.challengeStatus.className = 'challenge-status pending';
            if (els.challengeCard) {
                els.challengeCard.dataset.detailTitle = '本阶段照料挑战';
                els.challengeCard.dataset.detailText = buildChallengeDetail(null);
            }
        }
    }
}

function updateControls() {
    const waterValue = typeof state.water === 'number' ? state.water : 0;
    const lightValue = typeof state.light === 'number' ? state.light : 0;

    if (els.waterVal) {
        els.waterVal.textContent = waterValue.toFixed(1);
    }
    if (els.waterDisplay) {
        els.waterDisplay.textContent = `${waterValue.toFixed(1)}%`;
    }
    if (els.waterMeterFill) {
        els.waterMeterFill.style.width = `${clampValue(waterValue)}%`;
    }

    if (els.lightVal) {
        els.lightVal.textContent = lightValue.toFixed(1);
    }
    if (els.lightDisplay) {
        els.lightDisplay.textContent = `${lightValue.toFixed(1)}%`;
    }
    if (els.lightMeterFill) {
        els.lightMeterFill.style.width = `${clampValue(lightValue)}%`;
    }
}

function clampValue(value) {
    return Math.max(0, Math.min(100, value));
}

function adjustControlValue(type, delta) {
    if (!type || isNaN(delta)) return;
    if (type === 'water') {
        const current = typeof state.water === 'number' ? state.water : 0;
        state.water = clampValue(current + delta);
    } else if (type === 'light') {
        const current = typeof state.light === 'number' ? state.light : 0;
        state.light = clampValue(current + delta);
    }
    updateControls();
}

export function showModal(title, contentHTML, isQuiz = false) {
    els.modalTitle.textContent = title;
    els.modal.classList.remove('hidden');
    
    // 隐藏所有特定区域
    els.qrSection.classList.add('hidden');
    els.knowledgeSection.classList.add('hidden');
    els.quizSection.classList.add('hidden');
    els.feedbackSection.classList.add('hidden');
    els.journalSection.classList.add('hidden');
    els.harvestSection.classList.add('hidden');
    if (els.harvestCardContainer) els.harvestCardContainer.classList.add('hidden');
    if (els.harvestCardPreview) els.harvestCardPreview.src = '';
    if (els.harvestCardDownload) els.harvestCardDownload.dataset.cardUrl = '';
    
    if (isQuiz) {
        els.quizSection.classList.remove('hidden');
    }
}

export function showFeedback(isCorrect, explanation, onContinue, options = {}) {
    const { closeAfter = true } = options;
    els.quizSection.classList.add('hidden');
    els.knowledgeSection.classList.add('hidden'); // 隐藏知识点，专注结果
    els.feedbackSection.classList.remove('hidden');
    
    if (isCorrect) {
        els.feedbackIcon.textContent = '🎉';
        els.feedbackTitle.textContent = '回答正确！';
        els.feedbackTitle.style.color = '#4CAF50';
    } else {
        els.feedbackIcon.textContent = '🤔';
        els.feedbackTitle.textContent = '回答错误';
        els.feedbackTitle.style.color = '#F44336';
    }
    
    els.feedbackText.textContent = explanation;
    
    // 移除旧的监听器 (简单粗暴的方法是克隆节点)
    const newBtn = els.feedbackBtn.cloneNode(true);
    els.feedbackBtn.parentNode.replaceChild(newBtn, els.feedbackBtn);
    els.feedbackBtn = newBtn;
    
    els.feedbackBtn.onclick = () => {
        onContinue();
        if (closeAfter) {
            closeModal();
        }
    };
}

export function showKnowledgeCard(card, onQuizComplete) {
    els.modalTitle.textContent = card.title;
    els.traditionText.textContent = card.tradition;
    els.modernText.textContent = card.modern;
    
    els.knowledgeSection.classList.remove('hidden');
    els.quizSection.classList.remove('hidden');
    els.feedbackSection.classList.add('hidden');
    els.qrSection.classList.add('hidden');
    els.journalSection.classList.add('hidden');
    if (els.harvestSection) els.harvestSection.classList.add('hidden');
    if (els.harvestCardContainer) els.harvestCardContainer.classList.add('hidden');
    if (els.harvestCardPreview) els.harvestCardPreview.src = '';
    if (els.harvestCardDownload) els.harvestCardDownload.dataset.cardUrl = '';
    
    els.quizQuestion.textContent = card.quiz.q;
    els.quizOptions.innerHTML = '';

    card.quiz.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.onclick = () => {
            // 禁用所有按钮
            Array.from(els.quizOptions.children).forEach(b => b.disabled = true);
            
            if (idx === card.quiz.answerIdx) {
                btn.classList.add('correct');
                state.correctCount++;
                state.buffs += 0.1; // 奖励
                
                // 解锁卡片
                if (!state.unlockedCards.includes(card.id)) {
                    state.unlockedCards.push(card.id);
                }
                
                setTimeout(() => {
                    showFeedback(true, card.quiz.explanation, () => onQuizComplete(true));
                }, 600);
            } else {
                btn.classList.add('wrong');
                // 标出正确答案
                els.quizOptions.children[card.quiz.answerIdx].classList.add('correct');
                setTimeout(() => {
                    showFeedback(false, card.quiz.explanation, () => onQuizComplete(false));
                }, 1000);
            }
            state.quizCount++;
        };
        els.quizOptions.appendChild(btn);
    });

    els.modal.classList.remove('hidden');
}

export function showQR(url) {
    els.modalTitle.textContent = "扫码分享";
    els.knowledgeSection.classList.add('hidden');
    els.quizSection.classList.add('hidden');
    els.feedbackSection.classList.add('hidden');
    els.journalSection.classList.add('hidden');
    els.qrSection.classList.remove('hidden');
    if (els.harvestSection) els.harvestSection.classList.add('hidden');
    if (els.harvestCardContainer) els.harvestCardContainer.classList.add('hidden');
    if (els.harvestCardPreview) els.harvestCardPreview.src = '';
    if (els.harvestCardDownload) els.harvestCardDownload.dataset.cardUrl = '';
    
    // 使用 QRious 生成
    if (window.QRious) {
        new QRious({
            element: els.qrCanvas,
            value: url,
            size: 200
        });
    }
    
    els.modal.classList.remove('hidden');
}

export function showJournal(knowledgeData) {
    els.modalTitle.textContent = "园艺图鉴";
    els.knowledgeSection.classList.add('hidden');
    els.quizSection.classList.add('hidden');
    els.feedbackSection.classList.add('hidden');
    els.qrSection.classList.add('hidden');
    els.journalSection.classList.remove('hidden');
    if (els.harvestSection) els.harvestSection.classList.add('hidden');
    if (els.harvestCardContainer) els.harvestCardContainer.classList.add('hidden');
    if (els.harvestCardPreview) els.harvestCardPreview.src = '';
    if (els.harvestCardDownload) els.harvestCardDownload.dataset.cardUrl = '';
    
    journalKnowledgeCache = Array.isArray(knowledgeData) ? knowledgeData.slice() : [];
    renderJournalFilters();
    renderJournalList();

    els.modal.classList.remove('hidden');
}

export function showHarvestCelebration(details) {
    const {
        cropName = '作物',
        emoji = '🎉',
        cropId = '',
        days = 0,
        maxStreak = 0,
        knowledgeCount = 0,
        challengeCount = 0,
        score = 0,
        summaryLines,
        shareText = '',
        shareUrl = window.location.href,
        cropImageUrl = ''
    } = details || {};

    els.modalTitle.textContent = '丰收庆典';
    els.knowledgeSection.classList.add('hidden');
    els.quizSection.classList.add('hidden');
    els.feedbackSection.classList.add('hidden');
    els.qrSection.classList.add('hidden');
    els.journalSection.classList.add('hidden');

    if (els.harvestSection) {
        els.harvestSection.classList.remove('hidden');
    }
    if (els.harvestVisual) {
        if (cropImageUrl) {
            els.harvestVisual.style.backgroundImage = `url('${cropImageUrl}')`;
            els.harvestVisual.textContent = '';
        } else {
            els.harvestVisual.style.backgroundImage = '';
            els.harvestVisual.textContent = emoji || '🎉';
        }
    }
    if (els.harvestTitle) {
        els.harvestTitle.textContent = `成功收获 ${cropName}!`;
    }

    const fallbackLines = [
        `历经 ${days} 天的细心照料，你成功迎来收获。`,
        `最高连击 ${maxStreak} 轮，完成挑战 ${challengeCount} 次，答对 ${knowledgeCount} 道知识题。`,
        `最终积分 ${score} 分，分享到朋友圈一起加入园艺冒险吧！`
    ];
    if (els.harvestSummary) {
        const lines = Array.isArray(summaryLines) && summaryLines.length ? summaryLines : fallbackLines;
        els.harvestSummary.innerHTML = lines.join('<br>');
    }

    if (els.harvestCardContainer) {
        els.harvestCardContainer.classList.add('hidden');
    }
    if (els.harvestCardPreview) {
        els.harvestCardPreview.src = '';
    }
    if (els.harvestCardDownload) {
        const newDownloadBtn = els.harvestCardDownload.cloneNode(true);
        els.harvestCardDownload.parentNode.replaceChild(newDownloadBtn, els.harvestCardDownload);
        els.harvestCardDownload = newDownloadBtn;
        els.harvestCardDownload.dataset.cardUrl = '';
        els.harvestCardDownload.onclick = () => {
            const dataUrl = els.harvestCardDownload.dataset.cardUrl;
            if (!dataUrl) {
                alert('请先点击分享成果生成卡片。');
                return;
            }
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `greengarden-harvest-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }

    if (els.harvestShareBtn) {
        const newBtn = els.harvestShareBtn.cloneNode(true);
        els.harvestShareBtn.parentNode.replaceChild(newBtn, els.harvestShareBtn);
        els.harvestShareBtn = newBtn;

        els.harvestShareBtn.onclick = async () => {
            if (!shareText) {
                alert('目前没有可分享的数据，请稍后重试。');
                return;
            }
            if (!window.QRious) {
                alert('二维码模块正在加载，请稍后再试。');
                return;
            }

            const originalText = els.harvestShareBtn.textContent;
            els.harvestShareBtn.disabled = true;
            els.harvestShareBtn.textContent = '生成卡片中...';

            try {
                const cardDataUrl = await generateHarvestCard({
                    cropName,
                    emoji,
                    cropId,
                    days,
                    maxStreak,
                    knowledgeCount,
                    challengeCount,
                    score,
                    shareUrl,
                    summaryLines,
                    shareText,
                    cropImageUrl
                });

                if (cardDataUrl) {
                    if (els.harvestCardPreview) {
                        els.harvestCardPreview.src = cardDataUrl;
                    }
                    if (els.harvestCardContainer) {
                        els.harvestCardContainer.classList.remove('hidden');
                    }
                    if (els.harvestCardDownload) {
                        els.harvestCardDownload.dataset.cardUrl = cardDataUrl;
                    }
                }

                let shared = false;
                if (cardDataUrl && navigator.share && navigator.canShare) {
                    try {
                        const blob = await (await fetch(cardDataUrl)).blob();
                        const file = new File([blob], 'greengarden-harvest.png', { type: 'image/png' });
                        const sharePayload = {
                            title: 'GreenGarden Lite 收获战报',
                            text: shareText,
                            files: [file]
                        };
                        if (navigator.canShare(sharePayload)) {
                            await navigator.share(sharePayload);
                            shared = true;
                        }
                    } catch (err) {
                        console.warn('分享图片失败，使用复制方案。', err);
                    }
                }

                if (!shared) {
                    const copied = await copyShareText(shareText);
                    if (copied) {
                        alert('分享文案已复制，记得保存图片后发送给好友。');
                    } else {
                        alert('请手动复制分享文案并保存图片。');
                    }
                }
            } catch (err) {
                console.error('生成分享卡片失败', err);
                alert('生成分享卡片时出现问题，请稍后再试。');
            } finally {
                els.harvestShareBtn.disabled = false;
                els.harvestShareBtn.textContent = originalText;
            }
        };
    }

    els.modal.classList.remove('hidden');
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

async function generateHarvestCard(details) {
    const {
        cropName,
        emoji,
        cropId = '',
        days,
        maxStreak,
        knowledgeCount,
        challengeCount,
        score,
        shareUrl,
        summaryLines = [],
        cropImageUrl = ''
    } = details;

    const canvas = document.createElement('canvas');
    const width = 720;
    const height = 1180;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#e3f3ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#2196f3';
    drawRoundedRect(ctx, 60, 60, width - 120, 220, 40);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText('GreenGarden Lite', 96, 150);
    ctx.font = '32px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText('丰收战报 Harvest Report', 96, 205);

    const circleX = width / 2 - 100;
    const circleY = 210;
    drawRoundedRect(ctx, circleX, circleY, 200, 200, 100);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(33, 150, 243, 0.25)';
    ctx.lineWidth = 6;
    ctx.stroke();

    const circleCenterX = width / 2;
    const circleCenterY = circleY + 100;
    const circleRadius = 92;
    let cropImageDrawn = false;

    if (cropImageUrl) {
        try {
            const cropArtwork = await loadImage(cropImageUrl);
            ctx.save();
            ctx.beginPath();
            ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(cropArtwork, circleCenterX - circleRadius, circleCenterY - circleRadius, circleRadius * 2, circleRadius * 2);
            ctx.restore();
            cropImageDrawn = true;
        } catch (err) {
            console.warn('加载作物素材失败，将使用 Emoji 代替。', err);
        }
    }

    if (!cropImageDrawn) {
        ctx.fillStyle = '#ff7043';
        ctx.font = '120px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji"';
        const emojiMetrics = ctx.measureText(emoji);
        const emojiWidth = emojiMetrics.width;
        ctx.fillText(emoji, width / 2 - emojiWidth / 2, circleY + 140);
    }

    ctx.fillStyle = '#1976d2';
    ctx.font = '40px "Segoe UI", "Microsoft YaHei", sans-serif';
    const headline = `成功收获 ${cropName}`;
    ctx.fillText(headline, width / 2 - ctx.measureText(headline).width / 2, 480);

    ctx.fillStyle = '#455a64';
    ctx.font = '26px "Segoe UI", "Microsoft YaHei", sans-serif';
    const stats = [
        `栽培天数：${days} 天`,
        `最高连击：${maxStreak} 轮`,
        `完成挑战：${challengeCount} 次`,
        `知识回答：${knowledgeCount} 道`
    ];
    stats.forEach((line, idx) => {
        ctx.fillText(line, 120, 540 + idx * 44);
    });

    drawRoundedRect(ctx, width - 300, 520, 180, 80, 24);
    ctx.fillStyle = '#ff9800';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText(`总积分 ${score}`, width - 285, 568);

    ctx.fillStyle = '#37474f';
    ctx.font = '24px "Segoe UI", "Microsoft YaHei", sans-serif';
    const sanitizedLines = (summaryLines.length ? summaryLines : [`历经 ${days} 天的细心照料，迎来丰收。`, `把这份喜悦分享给朋友，一起加入绿意世界！`])
        .map(line => String(line).replace(/<br\s*\/?/gi, ' '));
    sanitizedLines.forEach((line, idx) => {
        const top = 640 + idx * 36;
        ctx.fillText(line, 100, top);
    });

    const qrSize = 240;
    const qrDataUrl = createQrDataUrl(shareUrl || window.location.href);
    const qrImage = await loadImage(qrDataUrl);
    ctx.drawImage(qrImage, width / 2 - qrSize / 2, height - 340, qrSize, qrSize);

    ctx.fillStyle = '#1976d2';
    ctx.font = '28px "Segoe UI", "Microsoft YaHei", sans-serif';
    const qrCaption = '扫码加入我的阳台农场';
    ctx.fillText(qrCaption, width / 2 - ctx.measureText(qrCaption).width / 2, height - 70);

    ctx.fillStyle = '#607d8b';
    ctx.font = '20px "Segoe UI", "Microsoft YaHei", sans-serif';
    const shortUrl = (shareUrl || '').replace(/^https?:\/\//, '');
    if (shortUrl) {
        ctx.fillText(shortUrl, width / 2 - ctx.measureText(shortUrl).width / 2, height - 35);
    }

    ctx.fillStyle = '#90a4ae';
    ctx.font = '18px "Segoe UI", "Microsoft YaHei", sans-serif';
    const footer = 'GreenGarden Lite · 绿色种植体验';
    ctx.fillText(footer, width / 2 - ctx.measureText(footer).width / 2, height - 10);

    return canvas.toDataURL('image/png');
}

function createQrDataUrl(value) {
    const qr = new QRious({
        value: value || window.location.href,
        size: 260,
        background: '#ffffff',
        foreground: '#1976d2',
        padding: 10,
        level: 'H'
    });
    return qr.toDataURL();
}

async function copyShareText(text) {
    if (!text) return false;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (err) {
        console.warn('Clipboard write failed', err);
    }

    try {
        prompt('复制以下分享内容：', text);
        return true;
    } catch (err) {
        console.warn('Prompt fallback blocked', err);
    }
    return false;
}
