console.log('generate.js loaded');

// 监听 DOMContentLoaded 和 pageLoaded 事件
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    initializeGenerate();
});

document.addEventListener('pageLoaded', () => {
    console.log('pageLoaded event fired');
    initializeGenerate();
});

// 在全局作用域注册初始化函数
window.initializeGenerate = function() {
    console.log('Initializing generate page');
    
    // 绑定生成按钮事件
    const generateBtn = document.getElementById('generateBtn');
    const promptInput = document.getElementById('prompt');
    const imagePreview = document.getElementById('imagePreview');
    const downloadSection = document.getElementById('downloadSection');

    if (!generateBtn || !promptInput || !imagePreview || !downloadSection) {
        console.log('Required elements not found, skipping initialization');
        return;
    }

    console.log('Found all required elements');

    // 直接绑定事件监听器
    generateBtn.onclick = async (e) => {
        e.preventDefault();
        console.log('Generate button clicked');
        await generateImage();
    };

    // 绑定回车键事件
    promptInput.onkeydown = async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            console.log('Enter key pressed');
            await generateImage();
        }
    };

    // 初始化预览区域
    imagePreview.innerHTML = '<div class="placeholder"><p>生成的图片将在这里显示</p></div>';
    downloadSection.style.display = 'none';
};

// 下载图片的辅助函数
async function downloadImage(url, filename) {
    try {
        console.log('Downloading image:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        // 创建一个隐藏的链接元素
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // 触发点击事件
        link.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        }, 100);
        
        console.log('Image download triggered');
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
}

async function generateImage() {
    console.log('generateImage function called');
    const promptInput = document.getElementById('prompt');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        alert('请输入红包封面描述');
        return;
    }

    const generateBtn = document.getElementById('generateBtn');
    const imagePreview = document.getElementById('imagePreview');
    const downloadSection = document.getElementById('downloadSection');

    try {
        // 更新按钮状态
        generateBtn.textContent = '生成中...';
        generateBtn.disabled = true;
        generateBtn.classList.add('loading');

        // 更新预览区域
        imagePreview.innerHTML = '<div class="placeholder"><p>AI 正在创作您的红包封面</p></div>';

        console.log('Sending request to generate image with prompt:', prompt);

        // 调用生成接口
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });

        console.log('Received response:', response);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `生成失败 (${response.status})`);
        }

        const data = await response.json();
        console.log('Generation response:', data);

        if (!data.filename) {
            throw new Error('生成失败：未获取到图片');
        }

        // 加载并显示图片
        const img = new Image();
        img.src = `/api/images/${data.filename}`;
        img.alt = prompt;

        console.log('Loading image:', img.src);

        // 等待图片加载
        await new Promise((resolve, reject) => {
            img.onload = () => {
                console.log('Image loaded successfully');
                resolve();
            };
            img.onerror = () => {
                console.error('Image load error');
                reject(new Error('图片加载失败'));
            };
            setTimeout(() => {
                console.error('Image load timeout');
                reject(new Error('图片加载超时'));
            }, 30000);
        });

        // 显示图片
        imagePreview.innerHTML = '';
        imagePreview.appendChild(img);

        // 显示下载按钮
        downloadSection.style.display = 'block';
        downloadSection.classList.add('visible');

        // 绑定下载事件
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.onclick = async () => {
            try {
                const imageUrl = `/api/images/${data.filename}`;
                const filename = `红包封面_${prompt.slice(0, 10)}.png`;
                await downloadImage(imageUrl, filename);
            } catch (error) {
                console.error('Download error:', error);
                alert('下载失败，请稍后重试');
            }
        };

    } catch (error) {
        console.error('Generation error:', error);
        imagePreview.innerHTML = `<div class="placeholder"><p>${error.message || '生成失败，请稍后重试'}</p></div>`;
        downloadSection.style.display = 'none';
        downloadSection.classList.remove('visible');
    } finally {
        // 恢复按钮状态
        generateBtn.textContent = '开始生成';
        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
    }
} 