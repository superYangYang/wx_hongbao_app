from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import os
from datetime import datetime
from typing import Optional
import uvicorn
from text_to_image import generate_image

app = FastAPI(title="文生图API服务")

# 添加CORS支持
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件目录
app.mount("/images", StaticFiles(directory="images"), name="images")
app.mount("/show_images", StaticFiles(directory="show_images"), name="show_images")

class ImageRequest(BaseModel):
    prompt: str = Field(..., description="图片描述文本", min_length=1, max_length=1000)
    size: Optional[str] = Field(None, description="图片尺寸，例如：1024x1024")
    force: Optional[bool] = Field(False, description="是否强制重新生成")

class ImageResponse(BaseModel):
    filename: str
    message: str
    url: Optional[str] = None

@app.post("/generate", response_model=ImageResponse)
async def create_image(request: ImageRequest):
    """
    生成图片的API端点
    
    - prompt: 图片描述文本
    - size: 图片尺寸（可选）
    - force: 是否强制重新生成（可选）
    """
    try:
        # 验证size参数
        if request.size:
            available_sizes = os.getenv('AVAILABLE_SIZES', '1024x1024').split(',')
            if request.size not in available_sizes:
                raise HTTPException(
                    status_code=400,
                    detail=f"不支持的图片尺寸。可用尺寸: {', '.join(available_sizes)}"
                )
        
        # 生成图片
        filename = generate_image(
            prompt=request.prompt,
            size=request.size,
            force_generate=request.force
        )
        
        if filename:
            # 构建完整的图片URL
            image_url = f"/images/{filename}"
            return ImageResponse(
                filename=filename,
                message="图片生成成功",
                url=image_url
            )
        else:
            return ImageResponse(
                filename="",
                message="图片已存在，跳过生成",
                url=None
            )
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sizes")
async def get_available_sizes():
    """获取支持的图片尺寸列表"""
    sizes = os.getenv('AVAILABLE_SIZES', '1024x1024').split(',')
    return {"sizes": sizes}

@app.get("/show_images_list")
async def list_show_images():
    """获取show_images目录下的所有图片文件列表"""
    try:
        files = os.listdir("show_images")
        # 只返回图片文件
        image_files = [f for f in files if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp'))]
        return {
            "files": image_files,
            "total": len(image_files)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """API服务根路径"""
    return {
        "message": "文生图API服务正在运行",
        "version": "1.0.0",
        "endpoints": {
            "generate": "/generate - POST 生成图片",
            "images": "/images/{filename} - GET 获取图片",
            "sizes": "/sizes - GET 获取支持的图片尺寸",
            "show_images": "/show_images/{filename} - GET 获取展示图片",
            "show_images_list": "/show_images_list - GET 获取展示图片列表"
        }
    }

if __name__ == "__main__":
    # 确保图片存储目录存在
    os.makedirs("images", exist_ok=True)
    os.makedirs("show_images", exist_ok=True)
    
    # 启动服务器
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        access_log=True
    ) 