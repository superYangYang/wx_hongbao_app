import zhipuai
import argparse
import requests
from PIL import Image
import io
import os
from dotenv import load_dotenv
from datetime import datetime
import hashlib

# 加载.env文件
load_dotenv()

def generate_hash(text):
    """生成文本的哈希值"""
    return hashlib.md5(text.encode()).hexdigest()[:12]

def combine_images(generated_image, overlay_path="di.png"):
    """将生成的图片与底图组合"""
    try:
        # 打开底图
        overlay = Image.open(overlay_path)
        
        # 确保底图是RGBA模式（带透明通道）
        if overlay.mode != 'RGBA':
            overlay = overlay.convert('RGBA')
            
        # 确保生成的图片也是RGBA模式
        if generated_image.mode != 'RGBA':
            generated_image = generated_image.convert('RGBA')
        
        # 调整生成图片的大小，预留底部空间
        new_height = int(generated_image.height * 0.85)  # 缩小到85%高度
        new_width = int(generated_image.width * 0.85)   # 保持宽高比
        generated_image = generated_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # 调整底图大小
        overlay_height = int(generated_image.height * 0.3)  # 底图高度为生成图片的30%
        width_ratio = overlay_height / overlay.height
        overlay_width = int(overlay.width * width_ratio)
        overlay = overlay.resize((overlay_width, overlay_height), Image.Resampling.LANCZOS)
        
        # 创建新画布，使用生成图片的原始尺寸
        final_width = generated_image.width
        final_height = generated_image.height
        combined_image = Image.new('RGBA', (final_width, final_height), (0, 0, 0, 0))
        
        # 计算生成图片的位置（居中）
        x_offset = (final_width - generated_image.width) // 2
        y_offset = 0
        
        # 计算底图的位置（底部居中）
        overlay_x = (final_width - overlay.width) // 2
        overlay_y = final_height - overlay.height
        
        # 粘贴图片
        combined_image.paste(generated_image, (x_offset, y_offset))
        combined_image.paste(overlay, (overlay_x, overlay_y), overlay)
        
        return combined_image
    except Exception as e:
        print(f"合成图片时发生错误: {e}")
        return generated_image

def generate_image(prompt, api_key=None, size=None, force_generate=False):
    """
    生成图片并返回文件名
    
    Args:
        prompt: 图片描述文本
        api_key: API密钥（可选）
        size: 图片尺寸（可选）
        force_generate: 是否强制重新生成
        
    Returns:
        str: 生成的图片文件名，如果跳过生成则返回None
    """
    # 确保images目录存在
    os.makedirs("images", exist_ok=True)
    
    # 获取当前时间戳
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # 生成哈希值（使用提示词和时间戳的组合）
    hash_input = f"{prompt}_{timestamp}"
    hash_code = generate_hash(hash_input)
    
    # 构建输出文件名
    output_filename = f"{hash_code}.png"
    output_path = os.path.join("images", output_filename)
    
    # 检查文件是否已存在
    if os.path.exists(output_path) and not force_generate:
        print(f"图片 {output_filename} 已存在，跳过生成")
        return output_filename
    
    # 使用环境变量或参数中的API密钥
    api_key = api_key or os.getenv('API_KEY')
    if not api_key:
        raise ValueError("未设置API密钥")
    
    # 使用环境变量或参数中的尺寸
    size = size or os.getenv('DEFAULT_SIZE', '1024x1024')
    
    # 获取模型名称
    model = os.getenv('MODEL_NAME', 'cogview-3-plus')
    
    # 初始化知谱AI
    zhipuai.api_key = api_key
    
    try:
        # 调用API生成图片
        response = zhipuai.model_api.invoke(
            model=model,
            prompt=prompt,
            type="text_to_image",
            size=size
        )
        
        # 检查响应
        if isinstance(response, dict) and 'code' in response and response['code'] == 200:
            # 获取图片URL
            data = response['data']
            if data['task_status'] == 'SUCCESS' and data['image_links']:
                image_url = data['image_links'][0]['url']
                print(f"生成的图片URL: {image_url}")
                
                # 下载图片
                img_response = requests.get(image_url)
                if img_response.status_code == 200:
                    # 将图片数据转换为PIL图像
                    generated_image = Image.open(io.BytesIO(img_response.content))
                    
                    # 合成图片
                    final_image = combine_images(generated_image)
                    
                    # 保存图片
                    final_image.save(output_path, "PNG")
                    print(f"图片已保存为: {output_filename}")
                    return output_filename
                else:
                    print(f"下载图片失败: HTTP {img_response.status_code}")
                    return None
            else:
                print("生成图片失败: 任务未完成或无图片链接")
                return None
        else:
            print("生成图片失败:", response)
            return None
            
    except Exception as e:
        print(f"发生错误: {e}")
        print("完整响应:", response)
        return None

def main():
    # 检查底图是否存在
    if not os.path.exists('di.png'):
        print("警告: di.png 文件不存在，将只生成原始图片")
    
    # 获取可用的尺寸列表
    available_sizes = os.getenv('AVAILABLE_SIZES', '1024x1024').split(',')
    
    # 设置命令行参数解析
    parser = argparse.ArgumentParser(description='文本生成图像程序')
    parser.add_argument('prompt', type=str, help='用于生成图像的文本描述')
    parser.add_argument('--api_key', type=str, 
                        default=None,
                        help='API密钥（可选，默认使用环境变量）')
    parser.add_argument('--size', type=str,
                        default=None,
                        choices=available_sizes,
                        help=f'图片尺寸（可选，默认使用环境变量）')
    parser.add_argument('--force', action='store_true',
                        help='强制重新生成图片，即使文件已存在')
    
    # 解析命令行参数
    args = parser.parse_args()
    
    # 调用生成函数
    generate_image(args.prompt, args.api_key, args.size, args.force)

if __name__ == "__main__":
    main() 