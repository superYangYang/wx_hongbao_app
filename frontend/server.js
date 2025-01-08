const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 3000;

// API代理配置
const apiProxy = createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: {
        '^/api': ''  // 移除 /api 前缀
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error');
    },
    logLevel: 'debug'  // 添加日志以便调试
});

// 处理所有API请求
app.use('/api', apiProxy);

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something broke!');
});

// 所有其他路由都返回index.html（支持前端路由）
app.get('*', (req, res) => {
    if (req.url.startsWith('/pages/')) {
        // 如果是直接访问页面文件，返回对应的HTML
        const pagePath = path.join(__dirname, req.url);
        if (req.url.endsWith('/')) {
            res.sendFile(path.join(pagePath, 'index.html'));
        } else {
            res.sendFile(pagePath);
        }
    } else {
        // 其他所有路由返回主页面
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

app.listen(port, () => {
    console.log(`Frontend server running at http://localhost:${port}`);
}); 