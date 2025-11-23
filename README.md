# GreenGarden Lite

一个极简的移动端园艺科普微游戏，支持直接通过 GitHub Pages 访问手机端。

## 扫码体验
(在此处放置生成的二维码图片 assets/qr.png)

在线访问（示例占位，请替换为你的实际用户名）: `https://<your-username>.github.io/greengarden-lite/`

## 玩法简介
1. **种植**: 观察番茄生长，它会自动进行。
2. **管理**: 拖动滑块控制「水分」和「光照」，保持在绿色最佳区间内以加速生长。
3. **应对**: 
   - 遇到 **病虫害** 警告时，点击按钮并回答环保防治问题。
   - 注意 **节气** 变化，不同节气会有生长加成或减益。
4. **学习**: 每个生长阶段完成时，解锁「传统技艺 vs 现代新质」科普卡片，答题正确可获得永久生长加速。

## 部署说明
本项目为纯静态网页，无需构建。

### GitHub Pages 部署（主分支根目录托管）
> 如果你已经有远程仓库：`https://github.com/shao-yua/greengarden-lite`，只需在 GitHub 上开启 Pages 即可。

1. 确认本地已有 `.nojekyll` 文件（已添加，避免 Jekyll 处理导致资源路径异常）。
2. 将当前分支从 `master` 重命名为 `main`（GitHub 现在默认使用 main，非必需但推荐）：
   ```powershell
   git branch -m master main
   git push -u origin main
   git push origin --delete master  # 可选
   ```
3. 打开仓库 Settings → Pages：
   - Source: `Deploy from a branch`
   - Branch: `main` / 目录选择 `/ (root)`
   保存后等待 30 秒~数分钟。
4. 访问： `https://<your-username>.github.io/greengarden-lite/`
5. 为方便扫码，可生成二维码保存到 `assets/qr.png` 并在本 README 顶部展示。

#### 后续更新
每次修改提交后：
```powershell
git add .
git commit -m "feat: 更新生长阶段素材"
git push
```
GitHub Pages 会自动重新部署（静态托管，通常几十秒内生效）。

#### （可选）自动化工作流
如果未来引入构建（例如使用 Vite），可添加 `.github/workflows/pages.yml`，并将构建输出目录 `dist` 作为发布目录。当前纯静态无需此步骤。

### 本地运行
请使用本地开发服务器，而不是直接双击 HTML，避免 `fetch` 读取 JSON 失败。
如果你安装了 Node.js:
```powershell
npx serve -l 5173
```
或者 Python:
```powershell
python -m http.server 5173
```
浏览器访问：`http://localhost:5173`。

## 目录结构
- `index.html`: 入口文件
- `data/`: 游戏数据 (作物、知识、节气)
- `*.js`: 游戏逻辑 (ES Modules)
- `assets/`: 图片资源

## 版权与使用
代码可自由使用与二次开发。科普文本与图片素材请在教育或非商业场景下使用，若商用请自行核实图片来源版权。添加或替换新作物图片时建议统一命名：`<crop>_stage_<index>.png`。
