import { state } from './state.js';
import { showModal, showFeedback, closeModal } from './ui.js';

const EVENT_DATA = {
    pest: {
        penalty: 0.5,
        questions: [
            {
                id: 'pest_seedling_aphid',
                stages: [0, 1],
                title: '幼苗叶片卷曲有蚜虫',
                desc: '幼苗期叶片背面密布蚜虫并分泌蜜露，最安全的首选措施是？',
                options: ['直接喷洒速效高残留农药', '用稀释的肥皂水或茶皂水喷洗叶背', '加大氮肥追施量', '暂时停止通风保温'],
                correctIdx: 1,
                explanation: '温和的肥皂水能破坏蚜虫蜡质层，幼苗期可避免药害。'
            },
            {
                id: 'pest_veg_mite',
                stages: [2, 3],
                title: '生长旺季出现红蜘蛛',
                desc: '生长期或开花前，叶片出现黄白小斑伴随红蜘蛛，应优先怎么处理？',
                options: ['持续加大浇水量', '提高棚温减少通风', '增强空气湿度并配合释放捕食螨', '把受害叶片全部摘除'],
                correctIdx: 2,
                explanation: '提高湿度配合捕食螨等生物防治可以抑制红蜘蛛，避免化学药残。'
            },
            {
                id: 'pest_fruit_mealy',
                stages: [4, 5],
                title: '结果期果面出现棉絮状虫体',
                desc: '结果或成熟期果面出现粉虱/介壳虫，兼顾安全与品质的措施是？',
                options: ['立即使用除草剂喷洒果面', '用酒精棉球擦拭并释放瓢虫或草蛉', '提前全部采收未熟果', '停止浇水让虫自动脱落'],
                correctIdx: 1,
                explanation: '酒精或棉签擦除配合天敌控制，可避免药残影响成熟果。'
            }
        ]
    },
    pruning: {
        penalty: 0.3,
        questions: [
            {
                id: 'pruning_branch_crowd',
                stages: [2],
                title: '生长期侧枝疯长遮光',
                desc: '生长期大量侧枝互相遮挡叶片，最合适的做法是什么？',
                options: ['全部保留等其自然黄化', '及时摘除过密侧枝并保留主蔓', '剪掉主茎顶端抑制长势', '连续喷施生长调节剂抑芽'],
                correctIdx: 1,
                explanation: '打杈保主蔓能改善通风透光，又不破坏主茎。'
            },
            {
                id: 'pruning_old_leaves',
                stages: [2, 3],
                title: '开花前底部老叶影响通风',
                desc: '开花前靠近地面的老叶病叶增多，应该如何整理？',
                options: ['全部保留帮助遮荫', '适量去除靠近地面的老叶和病叶', '一次性剪除所有叶片', '用高浓度肥料灼伤叶片'],
                correctIdx: 1,
                explanation: '去除老叶病叶能减少病源、提高通风，但需要分批进行避免伤株。'
            }
        ]
    },
    pollination: {
        penalty: 0.4,
        questions: [
            {
                id: 'pollination_bumblebee',
                stages: [3],
                title: '温室授粉效率低',
                desc: '进入开花期花粉干燥、室内风小，想提升坐果率应该怎么做？',
                options: ['频繁喷雾保持花朵潮湿', '引入熊蜂或人工轻振花序', '增加氮肥刺激开花', '完全密闭减少外界干扰'],
                correctIdx: 1,
                explanation: '熊蜂或轻振花序能高效散粉，提高坐果率并保持果形。'
            },
            {
                id: 'pollination_coldnight',
                stages: [3],
                title: '夜温偏低导致花粉活性差',
                desc: '开花期夜间温度偏低，应怎样既保温又保障授粉？',
                options: ['白天整天大开棚通风', '适度保温并在上午人工轻摇花穗', '把植株搬出温室暴晒', '提前采收尚未张开的花朵'],
                correctIdx: 1,
                explanation: '保持适宜夜温并在上午轻摇花穗，可让活性花粉均匀释放。'
            }
        ]
    }
};

function questionMatchesStage(question, stage) {
    if (!question || question.stages === undefined || question.stages === null) return true;
    if (question.stages === 'any') return true;
    return Array.isArray(question.stages) ? question.stages.includes(stage) : false;
}

function selectEventQuestion(type, stage) {
    const eventCfg = EVENT_DATA[type];
    if (!eventCfg || !Array.isArray(eventCfg.questions)) return null;
    const matches = eventCfg.questions.filter(q => questionMatchesStage(q, stage));
    const pool = matches.length ? matches : eventCfg.questions;
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
}

export function checkRandomEvent() {
    if (state.eventActive) return; // 已有事件未处理

    const rand = Math.random();
    const stage = state.stageIndex;

    // 逻辑：根据阶段触发特定事件
    // Stage 2 (生长期): 容易枝叶过密 -> Pruning
    // Stage 3 (开花期): 需要授粉 -> Pollination
    // Any Stage: 病虫害 -> Pest

    // 降低频率：原 0.03 -> 0.01, 原 0.015 -> 0.005
    if (stage === 2 && rand < 0.01) {
        triggerEvent('pruning');
    } else if (stage === 3 && rand < 0.01) {
        triggerEvent('pollination');
    } else if (rand < 0.005) {
        triggerEvent('pest');
    }
}

function triggerEvent(type) {
    const eventCfg = EVENT_DATA[type];
    if (!eventCfg) return;
    const question = selectEventQuestion(type, state.stageIndex);
    if (!question) return;

    state.eventActive = true;
    state.eventType = type;
    state.eventQuestion = question;
    state.penalty = eventCfg.penalty || 0;
    
    const btn = document.getElementById('event-btn');
    if (btn) {
        btn.onclick = () => handleEventClick(type);
    }
}

function handleEventClick(type) {
    const eventCfg = EVENT_DATA[type];
    if (!eventCfg) return;
    const question = state.eventQuestion || selectEventQuestion(type, state.stageIndex);
    if (!question) return;
    state.eventQuestion = question;

    showModal(question.title, "", true);
    
    const qText = document.getElementById('quiz-question');
    const opts = document.getElementById('quiz-options');
    
    qText.textContent = question.desc;
    opts.innerHTML = '';
    
    question.options.forEach((opt, idx) => {
        const b = document.createElement('button');
        b.textContent = opt;
        b.onclick = () => {
            // 禁用所有按钮
            Array.from(opts.children).forEach(btn => btn.disabled = true);

            if (idx === question.correctIdx) {
                b.classList.add('correct');
                setTimeout(() => {
                    showFeedback(true, question.explanation, () => resolveEvent());
                }, 600);
            } else {
                b.classList.add('wrong');
                // 标出正确答案
                opts.children[question.correctIdx].classList.add('correct');
                setTimeout(() => {
                    showFeedback(
                        false,
                        "不太妥当，再想想。",
                        () => {
                            resetQuizButtons(opts);
                            const feedbackSection = document.getElementById('feedback-section');
                            const quizSection = document.getElementById('quiz-section');
                            if (feedbackSection) feedbackSection.classList.add('hidden');
                            if (quizSection) quizSection.classList.remove('hidden');
                        },
                        { closeAfter: false }
                    );
                }, 1000);
            }
        };
        opts.appendChild(b);
    });
}

function resetQuizButtons(container) {
    Array.from(container.children).forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'wrong');
    });
}

function resolveEvent() {
    state.eventActive = false;
    state.eventType = null;
    state.eventQuestion = null;
    state.penalty = 0;
    state.buffs += 0.05; // 解决奖励
    closeModal();
}
