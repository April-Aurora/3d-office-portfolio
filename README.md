# 3D Office Portfolio

一间可探索、可展开并具有昼夜变化的 Three.js 微缩工作室。

## 运行

```powershell
npm install
npm run dev
```

## 发布到 GitHub Pages

仓库已包含 GitHub Actions 工作流。将代码推送到 `main` 分支后，Actions 会自动构建并发布 `dist/`。
在 GitHub 仓库的 **Settings → Pages** 中，将发布来源设为 **GitHub Actions**。

## 场景能力

- 程序化胡桃木、混凝土与织物材质
- 可翻开的项目书与纸艺微缩场景
- 可抽出的书架档案与作品索引
- 点击电脑后进入完整的产品交互设计作品集
- 台灯控制的连续昼夜变化与隐藏线索
- 受控环绕镜头、响应式界面与可逆动画

## 作品集更新

电脑中的作品集以同源静态页面嵌入，部署资产位于 `public/portfolio/`。作品集源项目在同级目录 `../just-think-portfolio/`；更新源项目后先运行其 `npm run build`，再将 `dist/` 内容同步到本项目的 `public/portfolio/`。
