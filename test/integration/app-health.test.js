// test/integration/app-health.test.js
    import { describe, it, expect } from 'vitest';
    import { createApp } from '../../src/bootstrap/create-app.js';

    describe('App Integration - Health Check', () => {
      it('GET /health debe responder 200 con status UP y uptime', async () => {
        const app = createApp();

        // Fabricamos un fakeRes que soporte el ciclo de vida de eventos de Node.js
        const listeners = {};
        const fakeRes = {
          statusCode: 200,
          headers: {},
          body: null,
          setHeader(name, value) {
            this.headers[name] = value;
          },
          on(event, callback) {
            listeners[event] = callback;
          },
          end(payload) {
            this.body = payload;
            // Cuando se llama a end(), se dispara el evento 'finish' (igual que en Node real)
            if (listeners['finish']) {
              listeners['finish']();
            }
          },
        };

        const fakeReq = {
          method: 'GET',
          url: '/health',
          headers: { host: 'localhost:5000' },
        };

        await app(fakeReq, fakeRes);

        expect(fakeRes.statusCode).toBe(200);
        expect(fakeRes.headers['Content-Type']).toBe('application/json; charset=utf-8');

        const body = JSON.parse(fakeRes.body);
        expect(body.status).toBe('UP');
        expect(typeof body.uptimeSeconds).toBe('number');
        expect(body.timestamp).toBeDefined();
      });
    });
