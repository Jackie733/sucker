/**
 * 自建Web框架 - 核心应用类
 * 基于Node.js原生HTTP模块构建的现代化Web框架
 */

import { IncomingMessage, ServerResponse, Server } from 'node:http';
import { createServer } from 'node:http';
import { EventEmitter } from 'node:events';
import { Router } from './router';
import { Context } from './context';
import { MiddlewareManager, Middleware } from './middleware';

export interface AppOptions {
  port?: number;
  host?: string;
  maxRequestSize?: number;
  timeout?: number;
}

/**
 * 应用主类
 * 管理HTTP服务器、路由、中间件等
 */
export class Application extends EventEmitter {
  private server: Server;
  private router: Router;
  private middlewareManager: MiddlewareManager;
  private options: Required<AppOptions>;

  constructor(options: AppOptions = {}) {
    super();

    this.options = {
      port: options.port || 3000,
      host: options.host || '0.0.0.0',
      maxRequestSize: options.maxRequestSize || 1024 * 1024, // 1MB
      timeout: options.timeout || 30000 // 30秒
    };

    this.router = new Router();
    this.middlewareManager = new MiddlewareManager();
    this.server = createServer();

    this.setupServer();
  }

  /**
   * 设置服务器
   */
  private setupServer(): void {
    this.server.timeout = this.options.timeout;
    this.server.on('request', this.handleRequest.bind(this));

    this.server.on('error', error => {
      this.emit('error', { error, timestamp: new Date().toISOString() });
    });

    this.server.on('close', () => {
      this.emit('close');
    });

    // 优雅关闭处理
    const gracefulShutdown = async (signal: string) => {
      console.log(`Received ${signal}, closing server gracefully...`);

      this.server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });

      // 强制退出
      setTimeout(() => {
        console.error('Forcing server shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  /**
   * 添加中间件
   */
  use(middleware: Middleware): void {
    this.middlewareManager.use(middleware);
  }

  /**
   * 添加GET路由
   */
  get(path: string, handler: Function, middleware?: Function[]): void {
    this.router.addRoute('GET', path, handler, middleware);
  }

  /**
   * 添加POST路由
   */
  post(path: string, handler: Function, middleware?: Function[]): void {
    this.router.addRoute('POST', path, handler, middleware);
  }

  /**
   * 添加PUT路由
   */
  put(path: string, handler: Function, middleware?: Function[]): void {
    this.router.addRoute('PUT', path, handler, middleware);
  }

  /**
   * 添加DELETE路由
   */
  delete(path: string, handler: Function, middleware?: Function[]): void {
    this.router.addRoute('DELETE', path, handler, middleware);
  }

  /**
   * 启动服务器
   */
  async listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.options.port, this.options.host, () => {
        this.emit('ready', {
          host: this.options.host,
          port: this.options.port,
          timestamp: new Date().toISOString()
        });
        resolve();
      });

      this.server.once('error', reject);
    });
  }

  /**
   * 停止服务器
   */
  async close(): Promise<void> {
    return new Promise(resolve => {
      this.server.close(() => {
        resolve();
      });
    });
  }

  /**
   * 获取服务器信息
   */
  get serverInfo() {
    return {
      port: this.options.port,
      host: this.options.host,
      timeout: this.options.timeout,
      maxRequestSize: this.options.maxRequestSize,
      routes: this.router.getRoutes()
    };
  }

  /**
   * 处理HTTP请求
   */
  private async handleRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // 创建上下文
      const ctx = new Context(req, res, {
        maxRequestSize: this.options.maxRequestSize
      });

      // 解析路径
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const pathname = url.pathname;

      // 匹配路由
      const route = this.router.match(req.method || 'GET', pathname);

      if (!route) {
        // 执行中间件链，如果没有中间件处理，返回404
        await this.middlewareManager.execute(ctx, async () => {
          if (!ctx.responded) {
            ctx.status = 404;
            ctx.json({
              error: 'Not Found',
              message: `Cannot ${req.method} ${req.url}`
            });
          }
        });
        return;
      }

      // 设置路由参数
      Object.assign(ctx.params, route.params);

      // 执行中间件链和路由处理器
      await this.middlewareManager.execute(ctx, async () => {
        if (!ctx.responded) {
          await route.handler(ctx);
        }
      });
    } catch (error) {
      await this.handleError(req, res, error as Error, startTime);
    }
  }

  /**
   * 错误处理
   */
  private async handleError(
    req: IncomingMessage,
    res: ServerResponse,
    error: Error,
    startTime: number
  ): Promise<void> {
    const duration = Date.now() - startTime;

    const errorInfo = {
      error,
      method: req.method,
      url: req.url,
      duration,
      timestamp: new Date().toISOString()
    };

    this.emit('error', errorInfo);

    // 如果响应还没发送，发送500错误
    if (!res.headersSent) {
      try {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Internal Server Error',
            message: 'Something went wrong'
          })
        );
      } catch (writeError) {
        // 如果写入失败，只能关闭连接
        res.destroy();
      }
    }
  }
}
