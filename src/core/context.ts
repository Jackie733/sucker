/**
 * 请求上下文
 * 封装request和response，提供便捷的API
 */

import { IncomingMessage, ServerResponse } from 'node:http';
import { parse as parseUrl } from 'node:url';
import { parse as parseQuery } from 'node:querystring';

export interface ContextOptions {
  maxRequestSize: number;
}

export interface ParsedBody {
  [key: string]: any;
}

/**
 * HTTP上下文类
 * 提供现代化的请求响应处理API
 */
export class Context {
  public readonly request: IncomingMessage;
  public readonly response: ServerResponse;
  public readonly params: Record<string, string> = {};
  public readonly query: Record<string, string | string[]> = {};
  public readonly cookies: { [key: string]: string } = {};

  private _body: ParsedBody | null = null;
  private _bodyParsed = false;
  private _status: number = 200;
  private _headers: { [key: string]: string } = {};
  private _responded = false;
  private options: ContextOptions;

  constructor(
    req: IncomingMessage,
    res: ServerResponse,
    options: ContextOptions
  ) {
    this.request = req;
    this.response = res;
    this.options = options;

    this.parseUrl();
    this.parseCookies();
  }

  /**
   * 获取/设置响应状态码
   */
  get status(): number {
    return this._status;
  }

  set status(code: number) {
    this._status = code;
  }

  /**
   * 检查响应是否已发送
   */
  get responded(): boolean {
    return this._responded || this.response.headersSent;
  }

  /**
   * 获取/设置响应体
   */
  get body(): ParsedBody | null {
    return this._body;
  }

  set body(data: ParsedBody | null) {
    this._body = data;
  }

  /**
   * 获取请求方法
   */
  get method(): string {
    return this.request.method || 'GET';
  }

  /**
   * 获取请求URL
   */
  get url(): string {
    return this.request.url || '/';
  }

  /**
   * 获取请求头
   */
  get headers(): { [key: string]: string | string[] | undefined } {
    return this.request.headers;
  }

  /**
   * 获取特定请求头
   */
  getHeader(name: string): string | string[] | undefined {
    return this.request.headers[name.toLowerCase()];
  }

  /**
   * 设置响应头
   */
  setHeader(name: string, value: string | number): void {
    this._headers[name] = String(value);
  }

  /**
   * 设置多个响应头
   */
  setHeaders(headers: { [key: string]: string | number }): void {
    for (const [name, value] of Object.entries(headers)) {
      this.setHeader(name, value);
    }
  }

  /**
   * 发送JSON响应
   */
  json(data: any, status?: number): void {
    if (this.response.headersSent) return;
    if (status) this.status = status;
    this.setHeader('Content-Type', 'application/json');
    this._send(JSON.stringify(data));
  }

  /**
   * 发送文本响应
   */
  text(data: string, status?: number): void {
    if (this.response.headersSent) return;
    if (status) this.status = status;
    this.setHeader('Content-Type', 'text/plain');
    this._send(data);
  }

  /**
   * 发送HTML响应
   */
  html(data: string, status?: number): void {
    if (this.response.headersSent) return;
    if (status) this.status = status;
    this.setHeader('Content-Type', 'text/html');
    this._send(data);
  }

  /**
   * 重定向
   */
  redirect(url: string, status: number = 302): void {
    if (this.response.headersSent) return;
    this.status = status;
    this.setHeader('Location', url);
    this._send('');
  }

  /**
   * 设置Cookie
   */
  setCookie(
    name: string,
    value: string,
    options: {
      maxAge?: number;
      expires?: Date;
      path?: string;
      domain?: string;
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    } = {}
  ): void {
    let cookie = `${name}=${encodeURIComponent(value)}`;

    if (options.maxAge) {
      cookie += `; Max-Age=${options.maxAge}`;
    }

    if (options.expires) {
      cookie += `; Expires=${options.expires.toUTCString()}`;
    }

    if (options.path) {
      cookie += `; Path=${options.path}`;
    }

    if (options.domain) {
      cookie += `; Domain=${options.domain}`;
    }

    if (options.secure) {
      cookie += '; Secure';
    }

    if (options.httpOnly) {
      cookie += '; HttpOnly';
    }

    if (options.sameSite) {
      cookie += `; SameSite=${options.sameSite}`;
    }

    const existingCookies = this._headers['Set-Cookie'] || '';
    this._headers['Set-Cookie'] = existingCookies
      ? `${existingCookies}, ${cookie}`
      : cookie;
  }

  /**
   * 解析请求体
   */
  async parseBody(): Promise<ParsedBody | null> {
    if (this._bodyParsed) {
      return this._body;
    }

    this._bodyParsed = true;

    const contentType = (this.getHeader('content-type') as string) || '';
    const contentLength = parseInt(
      (this.getHeader('content-length') as string) || '0'
    );

    // 检查请求体大小
    if (contentLength > this.options.maxRequestSize) {
      throw new Error(`Request body too large: ${contentLength} bytes`);
    }

    // 读取请求体
    const chunks: Buffer[] = [];
    let totalLength = 0;

    return new Promise((resolve, reject) => {
      this.request.on('data', (chunk: Buffer) => {
        totalLength += chunk.length;

        if (totalLength > this.options.maxRequestSize) {
          reject(new Error(`Request body too large: ${totalLength} bytes`));
          return;
        }

        chunks.push(chunk);
      });

      this.request.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          const rawBody = buffer.toString('utf8');

          if (contentType.includes('application/json')) {
            this._body = JSON.parse(rawBody);
          } else if (
            contentType.includes('application/x-www-form-urlencoded')
          ) {
            this._body = parseQuery(rawBody) as ParsedBody;
          } else {
            this._body = { raw: rawBody };
          }

          resolve(this._body);
        } catch (error) {
          reject(error);
        }
      });

      this.request.on('error', reject);
    });
  }

  /**
   * 解析URL和查询参数
   */
  private parseUrl(): void {
    const parsed = parseUrl(this.url, true);
    Object.assign(
      this.query,
      parsed.query as { [key: string]: string | string[] }
    );
  }

  /**
   * 解析Cookies
   */
  private parseCookies(): void {
    const cookieHeader = this.getHeader('cookie') as string;
    if (!cookieHeader) return;

    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        this.cookies[name] = decodeURIComponent(value);
      }
    });
  }

  /**
   * 发送响应
   */
  private _send(data: string): void {
    if (this.response.headersSent || this._responded) return;

    this._responded = true;

    // 设置状态码
    this.response.statusCode = this._status;

    // 设置响应头
    for (const [name, value] of Object.entries(this._headers)) {
      this.response.setHeader(name, value);
    }

    // 发送响应体
    this.response.end(data);
  }
}
