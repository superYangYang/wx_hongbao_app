# AI红包封面生成器 - 前端项目

基于 Node.js 和原生 JavaScript 开发的红包封面生成器前端项目。

## 功能特点

- 精美的用户界面
- 响应式设计，支持多种设备
- 实时图片预览
- 支持图片下载

## 目录结构

```
frontend/
├── css/                # 样式文件
│   ├── style.css      # 全局样式
│   ├── home.css       # 首页样式
│   └── generate.css   # 生成页面样式
├── js/                # JavaScript 文件
│   ├── router.js      # 路由管理
│   ├── home.js        # 首页逻辑
│   └── generate.js    # 生成页面逻辑
├── pages/             # 页面文件
│   ├── home/         # 首页
│   └── generate/     # 生成页面
└── server.js         # 开发服务器
```

## 开发环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
cd frontend
node server.js
```

3. 访问地址：
```
http://localhost:3000
```

## 主要功能

1. 首页
   - 展示精品案例
   - 导航到生成页面

2. 生成页面
   - 输入文本描述
   - 生成红包封面
   - 预览生成结果
   - 下载生成的图片

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- jQuery
- Node.js (开发服务器) 