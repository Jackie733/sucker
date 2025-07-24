/**
 * 框架使用示例
 * 展示如何使用自建Web框架创建博客系统
 */

import { Application } from './core/application';
import { Context } from './core/context';
import {
  cors,
  logger,
  bodyParser,
  errorHandler,
  rateLimit
} from './middleware/builtin';

// 创建应用实例
const app = new Application({
  port: parseInt(process.env.PORT || '3000'),
  host: '0.0.0.0',
  maxRequestSize: 1024 * 1024 * 10, // 10MB
  timeout: 30000
});

// 添加全局中间件
app.use(errorHandler({ expose: true }));
app.use(logger({ format: 'combined' }));
app.use(
  cors({
    origin: [
      `http://localhost:${process.env.PORT || '3000'}`,
      'http://localhost:8080'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  })
);
app.use(bodyParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100
  })
);

// 定义路由

// 首页
app.get('/', async (ctx: Context) => {
  ctx.json({
    message: 'Welcome to Custom Blog Framework',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/health', async (ctx: Context) => {
  ctx.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// 模拟博客数据
const mockPosts = [
  {
    id: 1,
    title: 'Hello World',
    content: 'This is my first blog post!',
    author: 'Admin',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 2,
    title: 'TypeScript Tips',
    content: 'Some useful TypeScript tips...',
    author: 'Admin',
    createdAt: new Date('2024-01-02')
  },
  {
    id: 3,
    title: 'Web Development',
    content: 'Modern web development practices...',
    author: 'Admin',
    createdAt: new Date('2024-01-03')
  }
];

// 博客相关路由

// 获取所有文章
app.get('/api/posts', async (ctx: Context) => {
  const page = parseInt(ctx.query.page as string) || 1;
  const limit = parseInt(ctx.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const posts = mockPosts.slice(offset, offset + limit);

  ctx.json({
    posts,
    pagination: {
      page,
      limit,
      total: mockPosts.length,
      pages: Math.ceil(mockPosts.length / limit)
    }
  });
});

// 获取单篇文章
app.get('/api/posts/:id', async (ctx: Context) => {
  const id = parseInt(ctx.params.id || '0');

  if (isNaN(id)) {
    ctx.status = 400;
    ctx.json({ error: 'Invalid post ID' });
    return;
  }

  const post = mockPosts.find(p => p.id === id);

  if (!post) {
    ctx.status = 404;
    ctx.json({ error: 'Post not found' });
    return;
  }

  ctx.json(post);
});

// 创建文章
app.post('/api/posts', async (ctx: Context) => {
  await ctx.parseBody();
  const { title, content } = ctx.body as any;

  if (!title || !content) {
    ctx.status = 400;
    ctx.json({ error: 'Title and content are required' });
    return;
  }

  const newPost = {
    id: mockPosts.length + 1,
    title,
    content,
    author: 'Admin',
    createdAt: new Date()
  };

  mockPosts.push(newPost);

  ctx.status = 201;
  ctx.json(newPost);
});

// 更新文章
app.put('/api/posts/:id', async (ctx: Context) => {
  const id = parseInt(ctx.params.id || '0');

  if (isNaN(id)) {
    ctx.status = 400;
    ctx.json({ error: 'Invalid post ID' });
    return;
  }

  await ctx.parseBody();
  const { title, content } = ctx.body as any;

  if (!title || !content) {
    ctx.status = 400;
    ctx.json({ error: 'Title and content are required' });
    return;
  }

  const postIndex = mockPosts.findIndex(p => p.id === id);

  if (postIndex === -1) {
    ctx.status = 404;
    ctx.json({ error: 'Post not found' });
    return;
  }

  const existingPost = mockPosts[postIndex];
  if (existingPost) {
    mockPosts[postIndex] = {
      id: existingPost.id,
      title,
      content,
      author: existingPost.author,
      createdAt: existingPost.createdAt
    };
  }

  ctx.json(mockPosts[postIndex]);
});

// 删除文章
app.delete('/api/posts/:id', async (ctx: Context) => {
  const id = parseInt(ctx.params.id || '0');

  if (isNaN(id)) {
    ctx.status = 400;
    ctx.json({ error: 'Invalid post ID' });
    return;
  }

  const postIndex = mockPosts.findIndex(p => p.id === id);

  if (postIndex === -1) {
    ctx.status = 404;
    ctx.json({ error: 'Post not found' });
    return;
  }

  mockPosts.splice(postIndex, 1);

  ctx.status = 204;
  ctx.text('');
});

// 用户认证相关路由

// 登录
app.post('/api/auth/login', async (ctx: Context) => {
  await ctx.parseBody();
  const { username, password } = ctx.body as any;

  if (!username || !password) {
    ctx.status = 400;
    ctx.json({ error: 'Username and password are required' });
    return;
  }

  // 简单的模拟认证
  if (username === 'admin' && password === 'password') {
    const token = 'mock-jwt-token-' + Date.now();
    ctx.json({
      message: 'Login successful',
      token,
      user: { id: 1, username: 'admin' }
    });
  } else {
    ctx.status = 401;
    ctx.json({ error: 'Invalid credentials' });
  }
});

// 获取用户信息
app.get('/api/auth/me', async (ctx: Context) => {
  const token = ctx.getHeader('authorization');

  if (!token) {
    ctx.status = 401;
    ctx.json({ error: 'Authorization token required' });
    return;
  }

  ctx.json({
    user: { id: 1, username: 'admin' },
    message: 'User authenticated'
  });
});

// 默认的404处理
app.use(async (ctx: Context, next: () => Promise<void>) => {
  await next();

  if (!ctx.response.headersSent) {
    ctx.status = 404;
    ctx.json({
      error: 'Not Found',
      message: `Route ${ctx.method} ${ctx.url} not found`
    });
  }
});

// 启动服务器
async function startServer() {
  try {
    app.on('ready', (info: any) => {
      console.log(`🚀 Server running at http://${info.host}:${info.port}`);
      console.log(`📝 API available at http://${info.host}:${info.port}/api`);
      console.log(`🏥 Health check at http://${info.host}:${info.port}/health`);
    });

    app.on('error', (errorInfo: any) => {
      console.error('❌ Server error:', errorInfo);
    });

    app.on('close', () => {
      console.log('👋 Server closed gracefully');
    });

    await app.listen();
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

// 启动应用
if (require.main === module) {
  startServer();
}

export { app };
