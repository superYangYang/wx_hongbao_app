# AI红包封面生成器 - 后端项目

基于 Python 和 FastAPI 开发的红包封面生成器后端项目，使用 Stable Diffusion 进行图片生成。

## 功能特点

- 基于文本生成图片
- 图片本地存储和管理
- RESTful API 接口
- 支持跨域请求

## 目录结构

```
backend/
├── api_server.py       # FastAPI 服务器
├── text_to_image.py   # 图片生成核心逻辑
├── requirements.txt   # Python 依赖
├── .env              # 环境变量配置
├── images/           # 生成的图片存储目录
└── show_images/      # 展示图片存储目录
```

## 开发环境要求

- Python >= 3.8
- CUDA >= 11.0 (用于 GPU 加速，可选)
- 足够的磁盘空间用于存储模型和生成的图片

## 安装和运行

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 配置环境变量：
复制 `.env.example` 到 `.env` 并填写必要的配置：
```
MODEL_PATH=模型路径
DEVICE=cuda
```

3. 启动服务器：
```bash
python api_server.py
```

4. 服务器将在以下地址运行：
```
http://localhost:8000
```

## API 接口

1. 生成图片
- 端点：`POST /api/generate`
- 请求体：
```json
{
    "prompt": "图片描述文本"
}
```
- 响应：
```json
{
    "filename": "生成的图片文件名"
}
```

2. 获取展示图片列表
- 端点：`GET /api/show_images_list`
- 响应：
```json
{
    "files": ["图片1.png", "图片2.png", ...]
}
```

3. 获取图片
- 端点：`GET /api/images/{filename}`
- 响应：图片文件

## 技术栈

- Python
- FastAPI
- Stable Diffusion
- Torch
- Pillow
- python-dotenv 