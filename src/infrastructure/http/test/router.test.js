// src/infrastructure/http/test/router.test.js
import { describe, it, expect, vi } from 'vitest';
import { createRouter } from '../router.js';

describe('createRouter (Artesanal HTTP Router)', () => {
  // Helper para fabricar un mock de Response de Node.js
  function createFakeRes() {
    return {
      statusCode: null,
      headers: {},
      body: null,
      setHeader(name, value) {
        this.headers[name] = value;
      },
      end(payload) {
        this.body = payload;
      },
    };
  }

  it('debe registrar y despachar una ruta GET existente ignorando query params', async () => {
    const router = createRouter();
    const fakeRes = createFakeRes();
    const fakeReq = {
      method: 'GET',
      url: '/health?check=database',
      headers: { host: 'localhost:5000' },
    };

    router.get('/health', (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'ok' }));
    });

    await router.handle(fakeReq, fakeRes);

    expect(fakeRes.statusCode).toBe(200);
    expect(JSON.parse(fakeRes.body)).toEqual({ status: 'ok' });
  });

  it('debe responder 404 Not Found si la ruta no está registrada', async () => {
    const router = createRouter();
    const fakeRes = createFakeRes();
    const fakeReq = {
      method: 'POST',
      url: '/ruta-desconocida',
      headers: { host: 'localhost:5000' },
    };

    await router.handle(fakeReq, fakeRes);

    expect(fakeRes.statusCode).toBe(404);
    const body = JSON.parse(fakeRes.body);
    expect(body.error).toBe('Not Found');
    expect(body.message).toContain('POST /ruta-desconocida no encontrada');
  });

  it('debe propagar el contexto (DI Container) al handler', async () => {
    const router = createRouter();
    const fakeRes = createFakeRes();
    const fakeReq = {
      method: 'GET',
      url: '/test-context',
      headers: { host: 'localhost:5000' },
    };

    const dummyContext = { userService: { name: 'UserMockService' } };
    let receivedContext = null;

    router.get('/test-context', (req, res, ctx) => {
      receivedContext = ctx;
      res.statusCode = 200;
      res.end('ok');
    });

    await router.handle(fakeReq, fakeRes, dummyContext);

    expect(receivedContext).toEqual(dummyContext);
  });
});
