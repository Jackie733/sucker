/**
 * 中间件管理器
 * 实现洋葱模型的异步中间件执行
 */

import { Context } from './context';

export type Middleware = (
  ctx: Context,
  next: () => Promise<void>
) => Promise<void>;

/**
 * 中间件管理器
 * 支持洋葱模型的中间件执行顺序
 */
export class MiddlewareManager {
  private middlewares: Middleware[] = [];

  /**
   * 添加中间件
   */
  use(middleware: Middleware): void {
    if (typeof middleware !== 'function') {
      throw new TypeError('Middleware must be a function');
    }
    this.middlewares.push(middleware);
  }

  /**
   * 执行中间件链
   * 实现洋葱模型：middleware1 -> middleware2 -> handler -> middleware2 -> middleware1
   */
  async execute(
    ctx: Context,
    finalHandler: () => Promise<void>
  ): Promise<void> {
    let index = -1;
    let finished = false;

    const dispatch = async (i: number): Promise<void> => {
      // 如果已经完成或响应已发送，直接返回
      if (finished || ctx.responded) {
        return;
      }

      // 防止重复调用同一个索引
      if (i <= index) {
        throw new Error('next() called multiple times');
      }

      index = i;

      if (i === this.middlewares.length) {
        // 执行最终处理器
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
   * 获取中间件数量
   */
  get length(): number {
    return this.middlewares.length;
  }

  /**
   * 清空所有中间件
   */
  clear(): void {
    this.middlewares = [];
  }
}
