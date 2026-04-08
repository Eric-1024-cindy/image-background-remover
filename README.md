# 🪄 BGRemover - Image Background Remover

> 一键消除图片背景的在线工具，Powered by Remove.bg API

![Status](https://img.shields.io/badge/status-MVP-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue)

## 功能特点

- ✅ 拖拽或点击上传图片
- ✅ 自动消除背景（无需点击任何按钮）
- ✅ 滑动对比原图/结果
- ✅ 一键下载 PNG（保留透明通道）
- 🔒 全程无存储，保护隐私
- 🌐 支持 JPG、PNG、WebP 格式（最大 25MB）

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 (App Router) |
| 样式 | Tailwind CSS |
| API | Remove.bg API |
| 部署 | Vercel / Cloudflare Pages |

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/Eric-1024-cindy/image-background-remover.git
cd image-background-remover
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，填入你的 Remove.bg API Key：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
REMOVE_BG_API_KEY=your_api_key_here
```

> 获取 API Key：https://www.remove.bg/api

### 4. 本地开发

```bash
npm run dev
```

打开 http://localhost:3000

### 5. 部署到 Vercel

```bash
npm install -g vercel
vercel
```

在 Vercel Dashboard 中配置 `REMOVE_BG_API_KEY` 环境变量。

## Remove.bg API

- 免费额度：50 张图/月
- 付费：$0.09/张
- 文档：https://www.remove.bg/api

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 主页面
│   ├── layout.tsx            # 布局
│   ├── globals.css           # 全局样式
│   └── api/
│       └── remove-bg/
│           └── route.ts      # API 路由
├── components/
│   ├── UploadZone.tsx        # 上传组件
│   ├── CompareSlider.tsx    # 滑动对比
│   └── ResultPreview.tsx    # 结果预览
└── lib/
    └── errors.ts             # 错误处理
```

## License

MIT
