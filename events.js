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
                id: 'pest_seedling_damping',
                stages: [0, 1],
                title: '幼苗茎基部变褐猝倒',
                desc: '育苗期茎基部出现水渍状褐斑并倒伏，应首先采取什么措施？',
                options: ['立即降低土壤湿度并加强通风', '增加浇水频率稀释病菌', '提高温度至35℃以上', '喷施高浓度杀虫剂'],
                correctIdx: 0,
                explanation: '猝倒病由真菌引起，降湿通风能抑制病原扩散，幼苗期需特别注意。'
            },
            {
                id: 'pest_seedling_whitefly',
                stages: [0, 1],
                title: '幼苗叶背出现白色小飞虫',
                desc: '移栽前发现幼苗叶背有白粉虱聚集，最经济有效的处理是？',
                options: ['用黄色粘虫板诱捕成虫', '连续喷水冲洗叶片', '移除所有受害幼苗销毁', '加大施肥促进抗性'],
                correctIdx: 0,
                explanation: '黄板利用粉虱趋黄特性物理防治，成本低且无药残，适合幼苗期。'
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
                id: 'pest_veg_leafminer',
                stages: [2, 3],
                title: '生长期叶片出现蜿蜒白色隧道',
                desc: '叶片表面出现潜叶蝇幼虫挖掘的弯曲通道，当前最佳防治方式是？',
                options: ['摘除严重受害叶片并悬挂黄板', '全株喷洒广谱杀虫剂', '停止施肥等虫自然死亡', '大幅提高光照强度'],
                correctIdx: 0,
                explanation: '摘除病叶减少虫源，黄板诱杀成虫，既有效又减少农药使用。'
            },
            {
                id: 'pest_veg_thrips',
                stages: [2, 3],
                title: '嫩叶嫩芽出现银白色条斑',
                desc: '生长旺盛期发现蓟马危害嫩叶，导致叶片银白扭曲，应如何处理？',
                options: ['喷施蓝色粘虫板并适度修剪受害部位', '立即增施氮肥促进恢复', '完全停止浇水一周', '提高夜间温度至30℃'],
                correctIdx: 0,
                explanation: '蓟马对蓝色敏感，蓝板配合修剪能有效控制，避免化学防治。'
            },
            {
                id: 'pest_fruit_mealy',
                stages: [4, 5],
                title: '结果期果面出现棉絮状虫体',
                desc: '结果或成熟期果面出现粉虱/介壳虫，兼顾安全与品质的措施是？',
                options: ['立即使用除草剂喷洒果面', '用酒精棉球擦拭并释放瓢虫或草蛉', '提前全部采收未熟果', '停止浇水让虫自动脱落'],
                correctIdx: 1,
                explanation: '酒精或棉签擦除配合天敌控制，可避免药残影响成熟果。'
            },
            {
                id: 'pest_fruit_botrytis',
                stages: [4, 5],
                title: '果实表面出现灰褐色霉层',
                desc: '结果期果面出现灰霉病症状，为保证果品安全应该怎么做？',
                options: ['摘除病果并降低棚内湿度', '喷洒高效农药快速杀菌', '增加浇水稀释病原', '停止通风保持恒温'],
                correctIdx: 0,
                explanation: '灰霉病喜高湿，摘除病果+降湿+通风是安全有效的综合措施。'
            },
            {
                id: 'pest_fruit_fruitfly',
                stages: [4, 5],
                title: '果面出现针孔状伤口',
                desc: '成熟期果实表面有小孔并内部腐烂，疑似果蝇产卵，应如何应对？',
                options: ['套袋保护未受害果实', '大量喷施杀虫剂浸透果面', '提前采收所有果实', '增加施肥加速果实硬化'],
                correctIdx: 0,
                explanation: '套袋物理隔离果蝇，保护未受害果实继续成熟，避免药残风险。'
            },
            {
                id: 'pest_any_soilborne',
                stages: [0, 1, 2, 3, 4, 5],
                title: '根部出现褐色腐烂',
                desc: '不分阶段，根系出现土传病害腐烂症状，紧急处理措施是？',
                options: ['控制浇水并增施生物菌剂改良土壤', '加大浇水冲洗病菌', '移栽到新土壤重新种植', '喷施叶面肥补充养分'],
                correctIdx: 0,
                explanation: '土传病害需控水+有益菌竞争抑制，配合改良根际环境，移栽风险高。'
            }
        ]
    },
    pruning: {
        penalty: 0.3,
        questions: [
            {
                id: 'pruning_seedling_cotyledon',
                stages: [0, 1],
                title: '幼苗子叶发黄需要摘除吗',
                desc: '移栽后子叶开始发黄，是否应该立即摘除？',
                options: ['立即全部摘除避免养分浪费', '等子叶完全干枯后自然脱落', '用剪刀剪掉一半子叶', '喷施叶面肥让子叶返绿'],
                correctIdx: 1,
                explanation: '子叶自然衰老是正常现象，等其完全干枯再处理，避免伤口感染。'
            },
            {
                id: 'pruning_seedling_true_leaf',
                stages: [0, 1],
                title: '幼苗真叶过密是否需要疏叶',
                desc: '幼苗期真叶生长茂密互相遮挡，应该怎么处理？',
                options: ['保持通风即可，不要过早修剪', '剪掉所有下部叶片', '每天摘除1-2片叶', '喷施抑制剂控制生长'],
                correctIdx: 0,
                explanation: '幼苗期叶片是光合作用主力，保持通风即可，过早修剪影响生长。'
            },
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
                id: 'pruning_veg_topping',
                stages: [2],
                title: '生长期是否需要打顶',
                desc: '生长旺盛期主蔓已达预定高度，是否需要打顶控制？',
                options: ['立即打顶促进侧枝发育', '等开花后再打顶', '保留顶端让其自然生长', '剪除所有侧芽集中养分'],
                correctIdx: 0,
                explanation: '打顶能控制株高，促进侧枝和果实发育，提高产量。'
            },
            {
                id: 'pruning_old_leaves',
                stages: [2, 3],
                title: '开花前底部老叶影响通风',
                desc: '开花前靠近地面的老叶病叶增多，应该如何整理？',
                options: ['全部保留帮助遮荫', '适量去除靠近地面的老叶和病叶', '一次性剪除所有叶片', '用高浓度肥料灼伤叶片'],
                correctIdx: 1,
                explanation: '去除老叶病叶能减少病源、提高通风，但需要分批进行避免伤株。'
            },
            {
                id: 'pruning_flower_thin',
                stages: [3],
                title: '开花期花蕾过密需要疏花吗',
                desc: '开花期单株花蕾数量过多，是否需要疏除部分花蕾？',
                options: ['疏除弱小花蕾保留健壮花', '全部保留让其自然竞争', '摘除所有花蕾重新开花', '喷施激素促进全部坐果'],
                correctIdx: 0,
                explanation: '适度疏花能集中养分，提高坐果率和果实品质。'
            },
            {
                id: 'pruning_flower_lateral',
                stages: [3],
                title: '开花期侧芽萌发旺盛',
                desc: '开花期侧芽不断萌发消耗养分，应如何处理？',
                options: ['保留所有侧芽增加产量', '及时抹除侧芽集中养分供花果', '等侧芽长大后再修剪', '喷施调节剂抑制侧芽'],
                correctIdx: 1,
                explanation: '抹芽能减少养分消耗，让主蔓集中供应花果发育。'
            },
            {
                id: 'pruning_fruit_thin',
                stages: [4],
                title: '结果期果实过密需要疏果吗',
                desc: '坐果后单穗果实数量过多，是否需要疏除部分果实？',
                options: ['摘除畸形果和弱小果', '全部保留提高产量', '摘除所有果实重新坐果', '增施肥料供应全部果实'],
                correctIdx: 0,
                explanation: '疏果能让养分集中供应优质果，提高商品率和单果重。'
            },
            {
                id: 'pruning_fruit_old_leaf',
                stages: [4, 5],
                title: '结果期底部老叶是否摘除',
                desc: '果实膨大期底部老叶开始发黄，是否应该摘除？',
                options: ['分批摘除黄叶改善通风', '全部保留直至采收', '一次性摘除所有底叶', '喷施营养液让老叶返青'],
                correctIdx: 0,
                explanation: '分批摘除老叶能改善通风透光，减少病害，但要避免一次过度。'
            },
            {
                id: 'pruning_harvest_cut',
                stages: [5],
                title: '采收时如何正确修剪',
                desc: '成熟果实采收时，应该如何正确操作？',
                options: ['用剪刀剪断果柄保留果蒂', '直接手拉扯断果柄', '连枝带叶一起剪下', '等果实自然脱落再收集'],
                correctIdx: 0,
                explanation: '用剪刀剪断果柄能避免伤及植株，保留果蒂延长果实保鲜期。'
            }
        ]
    },
    pollination: {
        penalty: 0.4,
        questions: [
            {
                id: 'pollination_pre_flower',
                stages: [2],
                title: '花蕾期如何促进花芽分化',
                desc: '生长期末端出现花芽，如何促进花芽更好地分化？',
                options: ['适度控水并增加磷钾肥', '大量浇水促进生长', '提高夜温至25℃以上', '摘除所有花芽重新分化'],
                correctIdx: 0,
                explanation: '适度控水+增磷钾能促进花芽分化，提高花质。'
            },
            {
                id: 'pollination_early_drop',
                stages: [3],
                title: '开花初期花朵大量脱落',
                desc: '刚开花不久就出现大量落花，最可能的原因和措施是？',
                options: ['夜温过低，需适度保温并控制氮肥', '光照不足，需增加浇水', '湿度过高，需停止通风', '虫害严重，需喷洒农药'],
                correctIdx: 0,
                explanation: '夜温低+氮肥过多易落花，保温控氮是关键。'
            },
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
            },
            {
                id: 'pollination_hormone',
                stages: [3],
                title: '使用生长激素辅助坐果',
                desc: '开花期是否可以喷施生长激素提高坐果率？',
                options: ['可适量喷施专用坐果激素', '大量喷施各类激素', '完全不使用任何激素', '只在夜间喷施激素'],
                correctIdx: 0,
                explanation: '适量专用激素能辅助坐果，但需注意浓度和时机，避免畸形果。'
            },
            {
                id: 'pollination_humidity',
                stages: [3],
                title: '开花期湿度管理',
                desc: '开花期棚内湿度应该如何控制才有利授粉？',
                options: ['保持50-70%相对湿度并加强通风', '提高湿度至90%以上', '完全停止浇水保持干燥', '昼夜持续喷雾增湿'],
                correctIdx: 0,
                explanation: '适中湿度+通风能保持花粉活力，过高过低都不利授粉。'
            },
            {
                id: 'pollination_timing',
                stages: [3],
                title: '人工授粉最佳时间',
                desc: '如果需要人工辅助授粉，什么时间操作最合适？',
                options: ['上午8-11点花粉活性最强时', '中午高温时段', '下午傍晚时分', '夜间进行避免蒸发'],
                correctIdx: 0,
                explanation: '上午花粉活性最强，温湿度适宜，是人工授粉的黄金时段。'
            },
            {
                id: 'pollination_malformed',
                stages: [3, 4],
                title: '坐果后出现畸形果',
                desc: '授粉后果实发育畸形，最可能的原因是？',
                options: ['授粉不良或温度波动过大', '浇水过多', '光照过强', '肥料不足'],
                correctIdx: 0,
                explanation: '授粉不均匀或花期温度不稳定是畸形果主因，需改善授粉和温控。'
            },
            {
                id: 'pollination_fruit_set',
                stages: [4],
                title: '坐果初期如何提高坐果率',
                desc: '小果初现后如何管理能减少落果提高坐果率？',
                options: ['控制浇水并适当补充硼肥', '大量追施氮肥促进生长', '提高温度至35℃以上', '停止所有施肥'],
                correctIdx: 0,
                explanation: '控水+补硼能促进果实细胞分裂，减少生理落果。'
            },
            {
                id: 'pollination_continuous',
                stages: [4, 5],
                title: '连续坐果能力管理',
                desc: '首批果实膨大期，如何保证后续花序正常授粉坐果？',
                options: ['适度疏果并补充磷钾肥维持平衡', '停止给首批果实供水', '摘除所有新花序', '只关注首批果不管后续'],
                correctIdx: 0,
                explanation: '疏果能减轻负担，补充磷钾保证后续花序养分供应，实现连续坐果。'
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
    state.isPaused = true;

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
    state.isPaused = false;
    closeModal();
}
