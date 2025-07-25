/**
 * Custom Web Framework - Core Application Class
 * Modern web framework built on Node.js native HTTP module
 */

import { EventEmitter } from 'node:events';
import {
  createServer,
  IncomingMessage,
  Server,
  ServerResponse
} from 'node:http';
import { Context } from './context';
import { Middleware, MiddlewareManager } from './middleware';
import { Router } from './router';

export interface AppOptions {
  port?: number;
  host?: string;
  maxRequestSize?: number;
  timeout?: number;
}

/**
 * Main application class for the custom web framework
 * Manages HTTP server, routing, middleware, etc.
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
      timeout: options.timeout || 30000 // 30 seconds
    };

    this.router = new Router();
    this.middlewareManager = new MiddlewareManager();
    this.server = createServer();

    this.setupServer();
  }

  /**
   * Setup server
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

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      console.log(`Received ${signal}, closing server gracefully...`);

      this.server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });

      // Force exit
      setTimeout(() => {
        console.error('Forcing server shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  /**
   * Add middleware
   */
  use(middleware: Middleware): void {
    this.middlewareManager.use(middleware);
  }

  /**
   * Add GET route
   */
  get(path: string, handler: Function, middleware?: Function[]): void {
    this.router.addRoute('GET', path, handler, middleware);
  }

  /**
   * Add POST route
   */
  post(path: string, handler: Function, middleware?: Function[]): void {
    this.router.addRoute('POST', path, handler, middleware);
  }

  /**
   * Add PUT route
   */
  put(path: string, handler: Function, middleware?: Function[]): void {
    this.router.addRoute('PUT', path, handler, middleware);
  }

  /**
   * Add DELETE route
   */
  delete(path: string, handler: Function, middleware?: Function[]): void {
    this.router.addRoute('DELETE', path, handler, middleware);
  }

  /**
   * Start server
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
   * Stop server
   */
  async close(): Promise<void> {
    return new Promise(resolve => {
      this.server.close(() => {
        resolve();
      });
    });
  }

  /**
   * Get server info
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
   * Handle HTTP requests
   */
  private async handleRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Create context
      const ctx = new Context(req, res, {
        maxRequestSize: this.options.maxRequestSize
      });

      // Parse path
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const pathname = url.pathname;

      // Match route
      const route = this.router.match(req.method || 'GET', pathname);

      if (!route) {
        // Execute middleware chain, return 404 if no middleware handles it
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

      // Set route parameters
      Object.assign(ctx.params, route.params);

      // Execute middleware chain and route handler
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
   * Error handling
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

    // If response hasn't been sent, send 500 error
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
        // If write fails, destroy the connection
        res.destroy();
      }
    }
  }
}
