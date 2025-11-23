# GreenGarden Lite 游戏规划文档 (简化版)

## 1. 概述
- **项目名称**: GreenGarden Lite
- **目标**: 极简移动端单页园艺科普微模拟，扫码即玩，无需复杂构建。
- **核心理念**: 用最少交互（调节水分与光照）呈现作物生长、节气与事件，并在关键节点弹出科普知识与单题测验，让玩家感知“传统技艺 + 现代智慧”融合。

## 2. 玩法设计 (精简循环)
1. 选择或默认作物（初版：番茄）。
2. 查看当前阶段与生长进度条。
3. 通过“水分”与“光照”两个滑块或按钮调整环境参数，使其保持在最佳区间。
4. 每 10 秒表示一个“游戏日”，进度按公式增长。
5. 随机事件：
   - 病虫害：出现时降低生长速率，需要点击处理 → 弹出科普与1道选择题，答对后移除惩罚并给临时加成。
   - 节气 Buff：模拟少量节气（立春、雨水、处暑），给予加速或轻微减速提示。纯文本+图标。
6. 阶段完成弹出知识卡（传统技艺 + 现代技术对照 + 题目）。
7. 全部阶段完成 → 收获评分，显示产量与学习指标（答题正确率）。

## 3. 阶段与参数
- 阶段：seed → seedling → vegetative → flowering → fruiting → harvest (6 阶段)
- 参数：water（0-100），light（0-100）
- 最佳区间（番茄示例）：
  - water: [40, 70]
  - light: [50, 80]

## 4. 生长公式 (简化)
```
每秒阶段进度增量 = baseRate * 参数适配系数 * (1 + buff加成) * (1 - penalty)
参数适配系数 = (水分适配 + 光照适配) / 2
适配单项 = 1 - 偏差归一化 (区间内则为 1)
```
- baseRate：每阶段固定或作物定义（初版可统一 0.8）。
- buff加成：节气、答题奖励（如 +0.1）。
- penalty：病虫事件时设为 0.3~0.5。

## 5. 数据结构 (示例 TypeScript 接口)
```ts
interface CropDef {
  name: string;
  baseRate: number;
  optimal: { water: [number, number]; light: [number, number]; };
}
interface GameState {
  stageIndex: number; // 0-5
  progress: number;   // 0-100 当前阶段进度
  water: number;      // 0-100
  light: number;      // 0-100
  day: number;        // 游戏日计数
  solarTerm?: string; // 当前简化节气
  buffs: number;      // 累积加成百分比 (0.0-...) 
  penalty: number;    // 惩罚系数(0-1)
}
interface KnowledgeCard {
  stage: number;
  title: string;
  tradition: string;
  modern: string;
  quiz: { q: string; options: string[]; answerIdx: number; explanation: string };
}
```

## 6. 文件结构
```
index.html
style.css
main.js        // 初始化与入口
state.js       // 状态存取与localStorage
growth.js      // 计时与公式计算
events.js      // 病虫/节气随机触发与处理逻辑
ui.js          // DOM 更新、弹窗创建
data/crops.json
data/knowledge.json
data/solar_terms.json
README.md
```

## 7. 技术栈与实现策略
- 原生 HTML + CSS + ES Modules。
- 不使用框架（后期可选 Alpine.js 仅在需要时）。
- 使用 `setInterval` (1000ms) 驱动逻辑 Tick + requestAnimationFrame 处理轻量动画（进度条）。
- `localStorage`：保存当前阶段、参数、已回答题数、正确率。

## 8. UI 布局草案
- 顶部：标题、当前节气、游戏日。
- 中部：作物阶段图片 + 进度条 + 阶段名称。
- 下方：两个参数调节区域（滑块或按钮组）。
- 底部：事件提示按钮（出现时高亮）、“查看知识”按钮（阶段完成后）。
- 模态弹窗：知识卡内容 + 题目 + 提交按钮。

## 9. 素材与资源 (最小需求)
- 作物阶段图片：6 张 128x128 PNG / 或合并一张 sprite。
- 图标：水滴、太阳、虫子、节气（SVG 优先）。
- 可选音效：点击、收获（2 个 <10KB）。
- 文案：番茄各阶段传统管理与现代技术概述（如育苗温控、滴灌、水肥一体化）。

## 10. 示例数据占位 (crops.json)
```json
[
  {
    "name": "番茄",
    "baseRate": 0.8,
    "optimal": { "water": [40,70], "light": [50,80] }
  }
]
```

### knowledge.json (示例一阶段)
```json
[
  {
    "stage": 0,
    "title": "番茄播种阶段管理",
    "tradition": "传统经验强调选饱满种子与适时播种。",
    "modern": "现代采用基质育苗与精准温控提升整齐度。",
    "quiz": {
      "q": "播种阶段现代技术的核心优势是什么?",
      "options": ["减少用水量", "提高出苗整齐度", "防止病虫害", "提升果实颜色"],
      "answerIdx": 1,
      "explanation": "基质与温控让幼苗整齐健壮，有利后续管理。"
    }
  }
]
```

### solar_terms.json (示例)
```json
[
  { "name": "立春", "buff": 0.1, "stages": [0,1] },
  { "name": "雨水", "buff": 0.05, "stages": [1,2] },
  { "name": "处暑", "buff": -0.05, "stages": [3,4] }
]
```

## 11. 生长与事件流程图 (文字描述)
- Tick → 计算当前节气 → 随机事件判定(病虫概率 ~2%) → 应用加成/惩罚 → 计算进度增量 → 若进度≥100 切换阶段并弹出知识卡。

## 12. 部署与扫码
- 上传全部静态文件到 GitHub 仓库。
- 启用 GitHub Pages（根目录）。
- 获取 URL 后用在线二维码服务或嵌入 qrious 生成二维码。
- README 中附二维码 PNG，便于手机扫码体验。

## 13. 性能与适配
- 总资源 <400KB：合并图片，压缩 PNG 为 WebP（可选）。
- CSS 使用媒体查询控制字体与布局，最小点击区域 40px。
- 禁止多余动画，避免低端机卡顿。

## 14. 可扩展点
- 追加更多作物：新增 JSON 即可。
- 排行榜：本地存储 + 分享导出（后续）。
- PWA：添加 manifest 与 service-worker 缓存静态资源。
- AI 图片识别（未来模块占位，不在首版）。

## 15. 里程碑 (极简)
- Day1：基础结构 + 状态与进度条。
- Day2：公式 & 参数调节 + 节气。
- Day3：事件与知识卡 + 答题加成。
- Day4：部署 + 二维码 + 压缩资源。
- Day5：文案扩展与打磨体验。

## 16. 开发辅助命令 (可选)
```
# 本地快速预览 (任选其一)
npx serve .
python -m http.server 8080
```

## 17. 版权与合规
- 使用自绘或 CC0 素材，避免侵权。
- 科普内容来源于公知农业常识，自行整理表述。

## 18. 下一步
若继续：创建初始文件（index.html 等）并填入占位逻辑与数据结构。可随时提出需要的模块或直接要求脚手架生成。
