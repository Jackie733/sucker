# Custom Blog Framework

一个基于 TypeScript 和 Node.js 原生 HTTP 模块开发的现代化 Web 框架，专为个人博客设计。

## ✨ 特性

- 🚀 **高性能** - 基于 Node.js 原生 HTTP 模块，零第三方框架依赖
- 🔒 **类型安全** - 完全使用 TypeScript 开发，提供完整的类型支持
- 🧅 **洋葱模型** - 支持异步中间件，采用洋葱模型执行顺序
- 🛣️ **智能路由** - 支持参数路由、通配符路由和嵌套路由
- 🔐 **内置安全** - 包含 CORS、Rate Limiting、XSS 防护等安全中间件
- 📊 **性能监控** - 内置请求日志和性能指标收集
- 🐳 **容器友好** - 支持 Docker 部署和优雅关闭

## 🚀 快速开始

### 环境要求

- Node.js >= 20.6.0
- TypeScript >= 5.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 复制环境变量文件
cp .env.example .env

# 启动开发服务器 (带热重载)
npm run dev
```

### 生产构建

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 📁 项目结构

```
src/
├── core/                # 框架核心
│   ├── application.ts   # 主应用类
│   ├── router.ts       # 路由系统
│   ├── context.ts      # 请求上下文
│   └── middleware.ts   # 中间件管理器
├── middleware/         # 内置中间件
│   └── builtin.ts     # 常用中间件集合
└── app.ts             # 应用入口和示例
```

## 🛠️ 核心API

### 创建应用

```typescript
import { Application } from './core/application';

const app = new Application({
  port: 3000,
  host: '0.0.0.0',
  maxRequestSize: 1024 * 1024 * 10, // 10MB
  timeout: 30000
});
```

### 添加中间件

```typescript
import { cors, logger, bodyParser } from './middleware/builtin';

app.use(logger({ format: 'combined' }));
app.use(cors({ origin: '*' }));
app.use(bodyParser());
```

### 定义路由

```typescript
// GET 路由
app.get('/api/posts', async ctx => {
  ctx.json({ posts: [] });
});

// 参数路由
app.get('/api/posts/:id', async ctx => {
  const { id } = ctx.params;
  ctx.json({ id, title: `Post ${id}` });
});

// POST 路由
app.post('/api/posts', async ctx => {
  const { title, content } = ctx.body;
  ctx.status = 201;
  ctx.json({ id: Date.now(), title, content });
});
```

### 请求上下文

```typescript
app.get('/example', async ctx => {
  // 请求信息
  console.log(ctx.method); // GET
  console.log(ctx.url); // /example?foo=bar
  console.log(ctx.query); // { foo: 'bar' }
  console.log(ctx.headers); // 请求头
  console.log(ctx.params); // 路由参数
  console.log(ctx.body); // 请求体 (需要bodyParser中间件)

  // 响应操作
  ctx.status = 200;
  ctx.setHeader('X-Custom', 'value');
  ctx.json({ message: 'Hello World' });

  // 或者
  ctx.text('Hello World');
  ctx.html('<h1>Hello World</h1>');
  ctx.redirect('/other-page');
});
```

## 🔧 内置中间件

### CORS

```typescript
app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
);
```

### 请求日志

```typescript
app.use(
  logger({
    format: 'combined' // 'combined' | 'common' | 'short' | 'tiny'
  })
);
```

### 频率限制

```typescript
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 每个IP最多100个请求
  })
);
```

### 错误处理

```typescript
app.use(
  errorHandler({
    expose: process.env.NODE_ENV === 'development'
  })
);
```

## 📊 性能特性

- **零拷贝流处理** - 支持大文件的流式上传下载
- **连接池优化** - HTTP Keep-Alive 连接复用
- **内存管理** - 自动垃圾回收和内存泄漏防护
- **并发控制** - 智能的请求并发限制

## 🔒 安全特性

- **CORS 防护** - 可配置的跨域资源共享
- **Rate Limiting** - 请求频率限制防止 DDoS
- **XSS 防护** - 自动转义输出内容
- **请求大小限制** - 防止大请求攻击
- **安全响应头** - 自动设置安全相关的HTTP头

## 🧪 测试

```bash
# 运行测试
npm test

# 观察模式
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

## 📈 监控和日志

框架内置了完整的监控和日志系统：

- 请求日志 (访问日志、错误日志)
- 性能指标 (响应时间、内存使用)
- 健康检查端点
- 优雅关闭机制

## 🚢 部署

### Docker 部署

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY dist ./dist
EXPOSE 3000

CMD ["node", "dist/app.js"]
```

### PM2 部署

```json
{
  "name": "blog-server",
  "script": "dist/app.js",
  "instances": "max",
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production",
    "PORT": 3000
  }
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
