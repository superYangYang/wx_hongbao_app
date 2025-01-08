# AI红包封面生成器

一个基于 AI 技术的红包封面生成器，使用智谱清言模型将文本描述转换为精美的红包封面图片。

效果展示
![img.png](xiaoguo/img.png)
![img_1.png](xiaoguo/img_1.png)

## 项目架构

项目采用前后端分离架构：

```
wx_hongbao/
├── frontend/          # 前端项目
│   ├── css/          # 样式文件
│   ├── js/           # JavaScript 文件
│   ├── pages/        # 页面文件
│   └── server.js     # 开发服务器
│
└── backend/          # 后端项目
    ├── api_server.py  # FastAPI 服务器
    ├── text_to_image.py # 图片生成核心逻辑
    ├── images/       # 生成的图片存储
    └── show_images/  # 展示图片存储
```

## 快速开始

### 1. 启动后端服务

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置必要的配置项

# 启动服务器
python api_server.py
```

后端服务将在 http://localhost:8000 运行

### 2. 启动前端服务

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
node server.js
```

前端服务将在 http://localhost:3000 运行

## 主要功能

1. 文本生成图片
   - 输入文本描述
   - AI 自动生成对应的红包封面
   - 实时预览生成结果

2. 图片管理
   - 本地存储生成的图片
   - 展示精品案例
   - 下载生成的图片

## 技术栈

### 前端
- HTML5/CSS3
- JavaScript (ES6+)
- jQuery
- Node.js

### 后端
- Python
- FastAPI
- Stable Diffusion
- Torch

## 详细文档

- [前端文档](frontend/README.md)
- [后端文档](backend/README.md)

## 开发环境要求

- Node.js >= 14.0.0
- Python >= 3.8
- CUDA >= 11.0 (可选，用于 GPU 加速)

## 贡献指南

1. Fork 本项目
2. 创建新的功能分支
3. 提交你的修改
4. 创建 Pull Request

## 许可证

MIT License 