/**
 * Middleware Manager
 * Implements asynchronous middleware execution with onion model
 */

import { Context } from './context';

export type Middleware = (
  ctx: Context,
  next: () => Promise<void>
) => Promise<void>;

/**
 * Middleware Manager
 * Supports onion model middleware execution order
 */
export class MiddlewareManager {
  private middlewares: Middleware[] = [];

  /**
   * Add middleware
   */
  use(middleware: Middleware): void {
    if (typeof middleware !== 'function') {
      throw new TypeError('Middleware must be a function');
    }
    this.middlewares.push(middleware);
  }

  /**
   * Middleware execution using the onion model: middleware1 -> middleware2 -> handler -> middleware2 -> middleware1
   */
  async execute(
    ctx: Context,
    finalHandler: () => Promise<void>
  ): Promise<void> {
    let index = -1;
    let finished = false;

    const dispatch = async (i: number): Promise<void> => {
      // Return directly if already finished or response sent
      if (finished || ctx.responded) {
        return;
      }

      // Prevent calling the same index multiple times
      if (i <= index) {
        throw new Error('next() called multiple times');
      }

      index = i;

      if (i === this.middlewares.length) {
        // Execute final handler
        finished = true;
        await finalHandler();
        return;
      }

      const middleware = this.middlewares[i];
      if (!middleware) {
        return;
      }

      let nextCalled = false;

      await middleware(ctx, async () => {
        if (nextCalled) {
          throw new Error('next() called multiple times in same middleware');
        }
        nextCalled = true;

        if (!finished && !ctx.responded) {
          await dispatch(i + 1);
        }
      });
    };

    await dispatch(0);
  }

  /**
   * Get middleware count
   */
  get length(): number {
    return this.middlewares.length;
  }

  /**
   * Clear all middleware
   */
  clear(): void {
    this.middlewares = [];
  }
}
