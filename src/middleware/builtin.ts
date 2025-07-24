/**
 * 内置中间件集合
 * 提供常用的Web服务器中间件功能
 */

import { Context } from '../core/context';
import { Middleware } from '../core/middleware';

/**
 * CORS中间件
 */
export function cors(
  options: {
    origin?: string | string[] | ((origin: string) => boolean);
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
  } = {}
): Middleware {
  const {
    origin = '*',
    methods = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    exposedHeaders = [],
    credentials = false,
    maxAge = 86400
  } = options;

  return async (ctx: Context, next: () => Promise<void>) => {
    const requestOrigin = ctx.getHeader('origin') as string;

    // 设置Access-Control-Allow-Origin
    if (typeof origin === 'string') {
      ctx.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        ctx.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        ctx.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    // 设置其他CORS头
    ctx.setHeader('Access-Control-Allow-Methods', methods.join(', '));
    ctx.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));

    if (exposedHeaders.length > 0) {
      ctx.setHeader('Access-Control-Expose-Headers', exposedHeaders.join(', '));
    }

    if (credentials) {
      ctx.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 处理预检请求
    if (ctx.method === 'OPTIONS') {
      ctx.setHeader('Access-Control-Max-Age', maxAge.toString());
      ctx.status = 204;
      ctx.text('');
      return;
    }

    await next();
  };
}

/**
 * 请求日志中间件
 */
export function logger(
  options: {
    format?: 'combined' | 'common' | 'short' | 'tiny';
    skip?: (ctx: Context) => boolean;
  } = {}
): Middleware {
  const { format = 'combined', skip } = options;

  return async (ctx: Context, next: () => Promise<void>) => {
    if (skip && skip(ctx)) {
      await next();
      return;
    }

    const start = Date.now();

    await next();

    const duration = Date.now() - start;
    const logData = {
      method: ctx.method,
      url: ctx.url,
      status: ctx.status,
      duration: `${duration}ms`,
      userAgent: ctx.getHeader('user-agent'),
      ip:
        ctx.getHeader('x-forwarded-for') ||
        ctx.getHeader('x-real-ip') ||
        ctx.request.socket.remoteAddress,
      timestamp: new Date().toISOString()
    };

    // 根据格式输出日志
    switch (format) {
      case 'tiny':
        console.log(
          `${logData.method} ${logData.url} ${logData.status} ${logData.duration}`
        );
        break;
      case 'short':
        console.log(
          `${logData.ip} ${logData.method} ${logData.url} ${logData.status} ${logData.duration}`
        );
        break;
      case 'common':
        console.log(
          `${logData.ip} - [${logData.timestamp}] "${logData.method} ${logData.url}" ${logData.status}`
        );
        break;
      default: // combined
        console.log(
          `${logData.ip} - [${logData.timestamp}] "${logData.method} ${logData.url}" ${logData.status} ${logData.duration} "${logData.userAgent}"`
        );
    }
  };
}

/**
 * 请求体解析中间件
 */
export function bodyParser(
  options: {
    maxSize?: number;
    strict?: boolean;
  } = {}
): Middleware {
  return async (ctx: Context, next: () => Promise<void>) => {
    if (['POST', 'PUT', 'PATCH'].includes(ctx.method)) {
      try {
        await ctx.parseBody();
      } catch (error) {
        ctx.status = 400;
        ctx.json({
          error: 'Invalid request body',
          message: (error as Error).message
        });
        return;
      }
    }

    await next();
  };
}

/**
 * 静态文件服务中间件
 */
export function staticFiles(
  root: string,
  options: {
    prefix?: string;
    maxAge?: number;
    index?: string[];
    dotfiles?: 'allow' | 'deny' | 'ignore';
  } = {}
): Middleware {
  const {
    prefix = '',
    maxAge = 0,
    index = ['index.html'],
    dotfiles = 'ignore'
  } = options;

  return async (ctx: Context, next: () => Promise<void>) => {
    if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
      await next();
      return;
    }

    let path = ctx.url;

    // 检查前缀
    if (prefix && !path.startsWith(prefix)) {
      await next();
      return;
    }

    if (prefix) {
      path = path.slice(prefix.length);
    }

    // 处理点文件
    if (dotfiles === 'deny' && path.includes('/.')) {
      ctx.status = 403;
      ctx.text('Forbidden');
      return;
    }

    if (dotfiles === 'ignore' && path.includes('/.')) {
      await next();
      return;
    }

    // 这里应该实现文件系统访问逻辑
    // 为简化示例，暂时跳过实际文件读取
    await next();
  };
}

/**
 * 错误处理中间件
 */
export function errorHandler(
  options: {
    expose?: boolean;
    template?: (error: Error, ctx: Context) => any;
  } = {}
): Middleware {
  const { expose = false, template } = options;

  return async (ctx: Context, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      const err = error as Error;

      ctx.status = 500;

      // 自定义错误模板
      if (template) {
        ctx.body = template(err, ctx);
        return;
      }

      // 默认错误响应
      const errorResponse = {
        error: 'Internal Server Error',
        message:
          expose || process.env.NODE_ENV === 'development'
            ? err.message
            : 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      };

      ctx.json(errorResponse);
    }
  };
}

/**
 * 请求频率限制中间件
 */
export function rateLimit(
  options: {
    windowMs?: number;
    max?: number;
    message?: string;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
  } = {}
): Middleware {
  const {
    windowMs = 15 * 60 * 1000, // 15分钟
    max = 100,
    message = 'Too many requests',
    standardHeaders = true,
    legacyHeaders = false
  } = options;

  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (ctx: Context, next: () => Promise<void>) => {
    const key =
      (ctx.getHeader('x-forwarded-for') as string) ||
      (ctx.getHeader('x-real-ip') as string) ||
      ctx.request.socket.remoteAddress ||
      'unknown';

    const now = Date.now();
    const record = requests.get(key);

    if (!record || now > record.resetTime) {
      requests.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
    } else {
      record.count++;
    }

    const current = requests.get(key)!;

    // 设置响应头
    if (standardHeaders) {
      ctx.setHeader('RateLimit-Limit', max.toString());
      ctx.setHeader(
        'RateLimit-Remaining',
        Math.max(0, max - current.count).toString()
      );
      ctx.setHeader(
        'RateLimit-Reset',
        new Date(current.resetTime).toISOString()
      );
    }

    if (legacyHeaders) {
      ctx.setHeader('X-RateLimit-Limit', max.toString());
      ctx.setHeader(
        'X-RateLimit-Remaining',
        Math.max(0, max - current.count).toString()
      );
      ctx.setHeader(
        'X-RateLimit-Reset',
        Math.ceil(current.resetTime / 1000).toString()
      );
    }

    if (current.count > max) {
      ctx.status = 429;
      ctx.json({ error: 'Rate limit exceeded', message });
      return;
    }

    await next();
  };
}
