import { state } from './state.js';
import { showModal, showFeedback, closeModal } from './ui.js';

const EVENT_DATA = {
    pest: {
        title: "发现蚜虫！",
        desc: "发现大量蚜虫聚集在叶片背面，应该优先采取什么环保措施？",
        options: ["喷洒高毒农药", "悬挂黄板诱杀", "放任不管", "把叶子全剪了"],
        correctIdx: 1,
        explanation: "正确！利用蚜虫趋黄性进行物理防治，绿色环保。",
        penalty: 0.5
    },
    pruning: {
        title: "枝叶过密！",
        desc: "植株生长旺盛，侧枝过多影响了通风透光，应该怎么做？",
        options: ["保留所有枝条", "去除老叶和多余侧枝", "剪掉主茎生长点", "大量浇水"],
        correctIdx: 1,
        explanation: "正确！整枝打杈可以减少养分消耗，改善通风透光条件。",
        penalty: 0.3
    },
    pollination: {
        title: "花期授粉！",
        desc: "番茄进入盛花期，为了提高坐果率和果实品质，最好的授粉方式是？",
        options: ["使用激素蘸花", "引入熊蜂授粉", "大风吹", "人工逐朵摇动"],
        correctIdx: 1,
        explanation: "正确！熊蜂授粉省工省力，且果实圆整、无激素残留。",
        penalty: 0.4
    }
};

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
    state.eventActive = true;
    state.eventType = type;
    state.penalty = EVENT_DATA[type].penalty;
    
    const btn = document.getElementById('event-btn');
    // UI 更新逻辑在 ui.js 的 updateUI 中处理，这里只需绑定点击
    btn.onclick = () => handleEventClick(type);
}

function handleEventClick(type) {
    const data = EVENT_DATA[type];
    showModal(data.title, "", true);
    
    const qText = document.getElementById('quiz-question');
    const opts = document.getElementById('quiz-options');
    
    qText.textContent = data.desc;
    opts.innerHTML = '';
    
    data.options.forEach((opt, idx) => {
        const b = document.createElement('button');
        b.textContent = opt;
        b.onclick = () => {
            // 禁用所有按钮
            Array.from(opts.children).forEach(btn => btn.disabled = true);

            if (idx === data.correctIdx) {
                b.classList.add('correct');
                setTimeout(() => {
                    showFeedback(true, data.explanation, () => resolveEvent());
                }, 600);
            } else {
                b.classList.add('wrong');
                // 标出正确答案
                opts.children[data.correctIdx].classList.add('correct');
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
    state.penalty = 0;
    state.buffs += 0.05; // 解决奖励
    closeModal();
}
