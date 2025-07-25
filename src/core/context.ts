/**
 * HTTP Context Class
 * Provides modern request-response handling APIs
 */

import { IncomingMessage, ServerResponse } from 'node:http';
import { parse as parseQuery } from 'node:querystring';
import { parse as parseUrl } from 'node:url';

export interface ContextOptions {
  maxRequestSize: number;
}

export interface ParsedBody {
  [key: string]: any;
}

/**
 * HTTP Context and Response/Request Wrapper
 * Encapsulates request and response, provides convenient APIs
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
   * Get/Set response status code
   */
  get status(): number {
    return this._status;
  }

  set status(code: number) {
    this._status = code;
  }

  /**
   * Check if response has been sent
   */
  get responded(): boolean {
    return this._responded || this.response.headersSent;
  }

  /**
   * Get/Set response body
   */
  get body(): ParsedBody | null {
    return this._body;
  }

  set body(data: ParsedBody | null) {
    this._body = data;
  }

  /**
   * Get request method
   */
  get method(): string {
    return this.request.method || 'GET';
  }

  /**
   * Get request URL
   */
  get url(): string {
    return this.request.url || '/';
  }

  /**
   * Get request headers
   */
  get headers(): { [key: string]: string | string[] | undefined } {
    return this.request.headers;
  }

  /**
   * Get specific request header
   */
  getHeader(name: string): string | string[] | undefined {
    return this.request.headers[name.toLowerCase()];
  }

  /**
   * Set response header
   */
  setHeader(name: string, value: string | number): void {
    this._headers[name] = String(value);
  }

  /**
   * Set multiple response headers
   */
  setHeaders(headers: { [key: string]: string | number }): void {
    for (const [name, value] of Object.entries(headers)) {
      this.setHeader(name, value);
    }
  }

  /**
   * Send JSON response
   */
  json(data: any, status?: number): void {
    if (this.response.headersSent) return;
    if (status) this.status = status;
    this.setHeader('Content-Type', 'application/json');
    this._send(JSON.stringify(data));
  }

  /**
   * Send text response
   */
  text(data: string, status?: number): void {
    if (this.response.headersSent) return;
    if (status) this.status = status;
    this.setHeader('Content-Type', 'text/plain');
    this._send(data);
  }

  /**
   * Send HTML response
   */
  html(data: string, status?: number): void {
    if (this.response.headersSent) return;
    if (status) this.status = status;
    this.setHeader('Content-Type', 'text/html');
    this._send(data);
  }

  /**
   * Redirect
   */
  redirect(url: string, status: number = 302): void {
    if (this.response.headersSent) return;
    this.status = status;
    this.setHeader('Location', url);
    this._send('');
  }

  /**
   * Set Cookie
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
   * Parse request body
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

    // Check request body size
    if (contentLength > this.options.maxRequestSize) {
      throw new Error(`Request body too large: ${contentLength} bytes`);
    }

    // Read request body
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
   * Parse URL and query parameters
   */
  private parseUrl(): void {
    const parsed = parseUrl(this.url, true);
    Object.assign(
      this.query,
      parsed.query as { [key: string]: string | string[] }
    );
  }

  /**
   * Parse Cookies
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
   * Send response
   */
  private _send(data: string): void {
    if (this.response.headersSent || this._responded) return;

    this._responded = true;

    // Set status code
    this.response.statusCode = this._status;

    // Set response headers
    for (const [name, value] of Object.entries(this._headers)) {
      this.response.setHeader(name, value);
    }

    // Send response body
    this.response.end(data);
  }
}
