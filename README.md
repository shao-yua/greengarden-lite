# GreenGarden Lite

一个极简的移动端园艺科普微游戏。

## 扫码体验
(在此处放置生成的二维码图片 assets/qr.png)

在线访问: [点击这里](https://your-username.github.io/gardening/) (请替换为实际 GitHub Pages 链接)

## 玩法简介
1. **种植**: 观察番茄生长，它会自动进行。
2. **管理**: 拖动滑块控制「水分」和「光照」，保持在绿色最佳区间内以加速生长。
3. **应对**: 
   - 遇到 **病虫害** 警告时，点击按钮并回答环保防治问题。
   - 注意 **节气** 变化，不同节气会有生长加成或减益。
4. **学习**: 每个生长阶段完成时，解锁「传统技艺 vs 现代新质」科普卡片，答题正确可获得永久生长加速。

## 部署说明
本项目为纯静态网页，无需构建。

### GitHub Pages 部署
1. Fork 本仓库。
2. 进入 Settings -> Pages。
3. Source 选择 `main` branch / (root)。
4. 保存，等待生成链接。

### 本地运行
如果你安装了 Node.js:
```bash
npx serve .
```
或者 Python:
```bash
python -m http.server
```
然后浏览器访问 `http://localhost:3000` 或 `http://localhost:8000`。

## 目录结构
- `index.html`: 入口文件
- `data/`: 游戏数据 (作物、知识、节气)
- `*.js`: 游戏逻辑 (ES Modules)
- `assets/`: 图片资源

## 版权
本项目代码开源，科普内容仅供教育用途。
