# Sucker

A modern, high-performance web framework built with TypeScript and Node.js native HTTP module.

[![npm version](https://badge.fury.io/js/@jackie733/sucker.svg)](https://badge.fury.io/js/@jackie733/sucker)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.6+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🚀 **High Performance** - Built on Node.js native HTTP module with zero framework dependencies
- 🔒 **Type Safe** - Full TypeScript support with complete type definitions
- 🧅 **Onion Model** - Async middleware with onion-style execution order
- 🛣️ **Smart Routing** - Parameter routes, wildcard routes, and nested routing
- 🔐 **Built-in Security** - CORS, Rate Limiting, XSS protection and more
- 📊 **Performance Monitoring** - Built-in request logging and metrics collection
- 🐳 **Container Ready** - Docker deployment and graceful shutdown support

## 🚀 Quick Start

### Installation

```bash
npm install @jackie733/sucker
# or
pnpm install @jackie733/sucker
# or
yarn add @jackie733/sucker
```

### Basic Usage

```typescript
import { Application } from '@jackie733/sucker';
import { cors, logger, bodyParser } from '@jackie733/sucker/middleware';

const app = new Application({
  port: 3000,
  host: '0.0.0.0'
});

// Add middleware
app.use(logger({ format: 'combined' }));
app.use(cors({ origin: '*' }));
app.use(bodyParser());

// Define routes
app.get('/api/hello', async ctx => {
  ctx.json({ message: 'Hello World!' });
});

app.get('/api/users/:id', async ctx => {
  const { id } = ctx.params;
  ctx.json({ id, name: `User ${id}` });
});

// Start server
app.listen();
```

## ℹ️ API Reference

### Application

```typescript
import { Application, ApplicationConfig } from '@jackie733/sucker';

const app = new Application(config?: ApplicationConfig);
```

**Configuration Options:**

```typescript
interface ApplicationConfig {
  port?: number; // Default: 3000
  host?: string; // Default: '0.0.0.0'
  maxRequestSize?: number; // Default: 10MB
  timeout?: number; // Default: 30000ms
}
```

### Context API

The context object provides access to request and response:

```typescript
app.get('/example', async ctx => {
  // Request properties
  ctx.method; // HTTP method
  ctx.url; // Full URL
  ctx.path; // URL pathname
  ctx.query; // Query parameters object
  ctx.headers; // Request headers
  ctx.params; // Route parameters
  ctx.body; // Request body (with bodyParser middleware)

  // Response methods
  ctx.status = 200;
  ctx.setHeader('X-Custom', 'value');
  ctx.json({ data: 'value' });
  ctx.text('Hello World');
  ctx.html('<h1>Hello</h1>');
  ctx.redirect('/other-page');
});
```

### Routing

```typescript
// HTTP methods
app.get('/path', handler);
app.post('/path', handler);
app.put('/path', handler);
app.delete('/path', handler);
app.patch('/path', handler);

// Route parameters
app.get('/users/:id', async ctx => {
  const userId = ctx.params.id;
});

// Multiple parameters
app.get('/users/:userId/posts/:postId', async ctx => {
  const { userId, postId } = ctx.params;
});

// Query parameters
app.get('/search', async ctx => {
  const { q, page = 1 } = ctx.query;
});
```

## 🔧 Built-in Middleware

Import middleware from the middleware submodule:

```typescript
import {
  cors,
  logger,
  bodyParser,
  rateLimit,
  errorHandler,
  staticFiles
} from '@jackie733/sucker/middleware';
```

### CORS

```typescript
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    maxAge: 86400 // Cache preflight for 24 hours
  })
);
```

### Request Logger

```typescript
app.use(
  logger({
    format: 'combined' // 'combined' | 'common' | 'short' | 'tiny'
  })
);
```

### Body Parser

```typescript
app.use(
  bodyParser({
    limit: '10mb',
    enableTypes: ['json', 'form', 'text']
  })
);
```

### Rate Limiting

```typescript
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests'
  })
);
```

### Static Files

```typescript
app.use(
  staticFiles({
    root: './public',
    prefix: '/static'
  })
);
```

### Error Handler

```typescript
app.use(
  errorHandler({
    expose: process.env.NODE_ENV === 'development',
    format: 'json' // 'json' | 'html' | 'text'
  })
);
```

### Custom Middleware

```typescript
app.use(async (ctx, next) => {
  const start = Date.now();

  try {
    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.json({ error: 'Internal Server Error' });
  }

  const duration = Date.now() - start;
  console.log(`${ctx.method} ${ctx.path} - ${duration}ms`);
});
```

## 📊 Performance Features

- **Zero-copy Stream Processing** - Efficient handling of large file uploads/downloads
- **Connection Pool Optimization** - HTTP Keep-Alive connection reuse
- **Memory Management** - Automatic garbage collection and memory leak protection
- **Concurrency Control** - Smart request concurrency limiting

## 🔒 Security Features

- **CORS Protection** - Configurable Cross-Origin Resource Sharing
- **Rate Limiting** - Request frequency limiting to prevent DDoS
- **XSS Protection** - Automatic output content escaping
- **Request Size Limiting** - Protection against large request attacks
- **Security Headers** - Automatic security-related HTTP headers

## 🏗️ TypeScript Support

The framework is built with TypeScript and provides full type definitions:

```typescript
import type {
  Context,
  Middleware,
  RouteHandler,
  ApplicationConfig
} from '@jackie733/sucker';

const middleware: Middleware = async (ctx, next) => {
  // ctx is fully typed
  await next();
};

const handler: RouteHandler = async ctx => {
  // Full intellisense support
  ctx.json({ message: 'Typed response' });
};
```

## 🧪 Testing

```bash
# Install dev dependencies for testing
npm install --save-dev jest @types/jest supertest

# Example test
import { Application } from '@jackie733/sucker';
import request from 'supertest';

describe('API Tests', () => {
  const app = new Application();

  app.get('/test', async ctx => {
    ctx.json({ success: true });
  });

  test('should return success', async () => {
    const response = await request(app.callback())
      .get('/test')
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

## 🚢 Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY . .
EXPOSE 3000

CMD ["node", "index.js"]
```

### PM2

```json
{
  "name": "my-app",
  "script": "index.js",
  "instances": "max",
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production",
    "PORT": 3000
  }
}
```

## 📚 Documentation

For detailed guides and references, see the **[documentation directory](docs/README.md)**:

- **Getting Started**
  - [Quick Setup Guide](docs/QUICK_SETUP.md) - GitHub Actions auto-publishing setup
  - [Framework Requirements](docs/FRAMEWORK_REQUIREMENTS.md) - Feature implementation status

- **Development & Publishing**
  - [Publishing Guide](docs/PUBLISH.md) - npm publishing instructions
  - [Automation Setup](docs/AUTOMATION_SETUP.md) - CI/CD configuration

- **Code Quality & Tooling**
  - [Oxlint Guide](docs/OXLINT_GUIDE.md) - Fast Rust-based linting
  - [Oxlint Editor Integration](docs/OXLINT_EDITOR_INTEGRATION.md) - VS Code setup

📋 **[View Full Documentation Index](docs/INDEX.md)** for a complete list of all guides and references.

## 📚 Examples

Check out the [examples directory](https://github.com/jackie733/sucker/tree/main/examples) for complete sample applications.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/jackie733/sucker)
- [npm Package](https://www.npmjs.com/package/@jackie733/sucker)
- [Documentation](https://github.com/jackie733/sucker#readme)
- [Issue Tracker](https://github.com/jackie733/sucker/issues)
