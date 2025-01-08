console.log('home.js loaded');

// 在全局作用域注册初始化函数
window.initializeHome = function() {
    console.log('initializeHome called');
    console.log('Current pathname:', window.location.pathname);
    
    // 检查是否在首页且尚未加载过图片
    if ((window.location.pathname === '/' || window.location.pathname === '') && 
        !window.imagesLoaded) {
        console.log('On homepage, loading showcase images...');
        window.imagesLoaded = true;  // 标记图片已开始加载
        loadShowcaseImages();
    } else {
        console.log('Not on homepage or images already loaded, skipping showcase images');
    }
};

async function loadShowcaseImages() {
    try {
        console.log('Fetching images from API...');
        const response = await $.ajax({
            url: '/api/show_images_list',
            method: 'GET'
        });
        
        console.log('API response:', response);
        
        if (!response.files || !response.files.length) {
            throw new Error('No images found');
        }

        // 获取展示卡片容器
        const $grid = $('.showcase-grid');
        $grid.empty(); // 清空现有内容

        // 为每个图片创建卡片
        response.files.forEach(filename => {
            const $card = $('<div>').addClass('showcase-card');
            const $img = $('<img>')
                .attr('alt', '红包封面')
                .attr('loading', 'lazy');
            const $loadingIndicator = $('<div>').addClass('loading-indicator');
            const $errorMessage = $('<div>').addClass('error-message').text('加载失败');

            $card.append($img, $loadingIndicator, $errorMessage);
            $grid.append($card);

            // 添加加载状态类
            $card.addClass('loading').removeClass('error');
            
            // 设置图片源
            const imageUrl = `/api/show_images/${filename}`;
            console.log('Setting image source:', imageUrl);
            
            // 预加载图片
            const tempImg = new Image();
            tempImg.onload = () => {
                $img.attr('src', imageUrl);
                console.log('Image loaded:', filename);
                $card.removeClass('loading');
                
                // 添加渐入动画
                requestAnimationFrame(() => {
                    $img.css('transform', 'scale(0.95)');
                    requestAnimationFrame(() => {
                        $img.css({
                            'transition': 'all 0.5s ease',
                            'transform': 'scale(1)'
                        }).addClass('loaded');
                    });
                });
            };
            
            tempImg.onerror = () => {
                console.error('Image load error:', filename);
                $card.removeClass('loading').addClass('error');
                $img.removeClass('loaded').attr('alt', '加载失败');
            };
            
            tempImg.src = imageUrl;
        });
    } catch (error) {
        console.error('Error loading showcase images:', error);
        // 显示错误状态
        $('.showcase-card').each((_, card) => {
            const $card = $(card);
            $card.removeClass('loading').addClass('error');
            const $img = $card.find('img');
            if ($img.length) {
                $img.removeClass('loaded').attr('alt', '加载失败');
            }
        });
        // 重置加载状态，允许重试
        window.imagesLoaded = false;
    }
}

// 只在路由处理时初始化，不需要额外的事件监听
// 移除 document.ready 和 pageLoaded 事件监听 