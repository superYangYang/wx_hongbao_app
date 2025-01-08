class Router {
    constructor() {
        this.routes = {
            '/': '/pages/home/index.html',
            '/generate': '/pages/generate/index.html'
        };
        
        // 监听路由变化
        $(window).on('popstate', () => this.handleRoute());
        
        // 初始化路由
        this.handleRoute();
        
        // 拦截所有导航链接
        $(document).on('click', 'a', (e) => {
            const href = $(e.target).attr('href');
            if (href && href.startsWith('/')) {
                e.preventDefault();
                this.navigate(href);
            }
        });

        console.log('Router initialized');
    }

    // 处理路由变化
    async handleRoute() {
        console.log('Handling route:', window.location.pathname);
        const path = window.location.pathname;
        let route = this.routes[path];
        
        // 处理子路由
        if (!route) {
            const parentPath = '/' + path.split('/')[1];
            route = this.routes[parentPath];
        }

        if (!route) {
            route = this.routes['/'];  // 默认路由
        }

        try {
            console.log('Loading route:', route);
            const html = await $.get(route);
            
            // 更新内容
            const $content = $('#app');
            if ($content.length) {
                // 清除旧的事件监听器和脚本
                $('script:not([src="/js/router.js"])').remove();

                $content.html(this.extractBody(html));
                this.updateTitle(html);
                
                // 先加载所有脚本
                await this.loadScripts(html);
                console.log('Scripts loaded, waiting for initialization...');
                
                // 等待一小段时间确保脚本已执行
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // 更新导航状态
                this.updateActiveNav();
                
                // 根据路由初始化特定页面
                if (path === '/' || path === '') {
                    console.log('Initializing home page');
                    if (typeof window.initializeHome === 'function') {
                        window.initializeHome();
                    } else {
                        console.error('initializeHome function not found');
                    }
                } else if (path === '/generate') {
                    console.log('Initializing generate page');
                    if (typeof window.initializeGenerate === 'function') {
                        window.initializeGenerate();
                    } else {
                        console.error('initializeGenerate function not found');
                    }
                }
                
                // 触发页面加载完成事件
                console.log('Dispatching pageLoaded event');
                $(document).trigger('pageLoaded');
            } else {
                console.error('App container not found');
            }
        } catch (error) {
            console.error('Error loading page:', error);
        }
    }

    // 导航到新路由
    navigate(path) {
        console.log('Navigating to:', path);
        window.history.pushState({}, '', path);
        this.handleRoute();
    }

    // 从HTML中提取body内容
    extractBody(html) {
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        return bodyMatch ? bodyMatch[1] : html;
    }

    // 更新页面标题
    updateTitle(html) {
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch) {
            document.title = titleMatch[1];
        }
    }

    // 加载页面脚本
    async loadScripts(html) {
        console.log('Loading page scripts');
        const scriptTags = html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g);
        if (scriptTags) {
            const loadPromises = scriptTags.map(tag => {
                const srcMatch = tag.match(/src="([^"]+)"/);
                if (srcMatch) {
                    const src = srcMatch[1];
                    console.log('Loading script:', src);
                    if (!this.isScriptLoaded(src)) {
                        return new Promise((resolve, reject) => {
                            $('<script>')
                                .attr('src', src)
                                .on('load', () => {
                                    console.log('Script loaded:', src);
                                    resolve();
                                })
                                .on('error', (err) => {
                                    console.error('Script load error:', src, err);
                                    reject(err);
                                })
                                .appendTo('body');
                        });
                    }
                }
                return Promise.resolve();
            });
            
            await Promise.all(loadPromises);
            console.log('All scripts loaded');
        }
    }

    // 检查脚本是否已加载
    isScriptLoaded(src) {
        return $(`script[src="${src}"]`).length > 0;
    }

    // 更新导航栏活动状态
    updateActiveNav() {
        const currentPath = window.location.pathname;
        $('.nav-links a').each((_, link) => {
            const $link = $(link);
            const href = $link.attr('href');
            if (href === currentPath || 
                (href !== '/' && currentPath.startsWith(href))) {
                $link.addClass('active');
            } else {
                $link.removeClass('active');
            }
        });
    }
}

// 初始化路由
$(document).ready(() => {
    console.log('Initializing router');
    window.router = new Router();
}); 