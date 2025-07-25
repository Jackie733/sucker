import assert from 'node:assert';
import { describe, test } from 'node:test';
import { Application } from '../dist/core/application.js';

describe('Application', () => {
  test('should create an application instance', () => {
    const app = new Application();
    assert.ok(app instanceof Application);
  });

  test('should have default configuration', () => {
    const app = new Application();
    // 基础实例检查
    assert.ok(app);
    assert.equal(typeof app.use, 'function');
    assert.equal(typeof app.get, 'function');
    assert.equal(typeof app.post, 'function');
  });

  test('should accept custom configuration', () => {
    const config = {
      port: 8080,
      host: '127.0.0.1'
    };
    const app = new Application(config);
    assert.ok(app instanceof Application);
  });
});

describe('Framework Exports', () => {
  test('should export main classes', async () => {
    const framework = await import('../dist/index.js');

    assert.ok(framework.Application);
    assert.ok(framework.Context);
    assert.ok(framework.Router);
    assert.ok(framework.MiddlewareManager);
    assert.ok(framework.middleware);
  });

  test('should export middleware functions', async () => {
    const { middleware } = await import('../dist/index.js');

    assert.equal(typeof middleware.cors, 'function');
    assert.equal(typeof middleware.logger, 'function');
    assert.equal(typeof middleware.bodyParser, 'function');
    assert.equal(typeof middleware.staticFiles, 'function');
    assert.equal(typeof middleware.errorHandler, 'function');
    assert.equal(typeof middleware.rateLimit, 'function');
  });
});
