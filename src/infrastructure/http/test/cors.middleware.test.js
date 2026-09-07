
    // src/infrastructure/http/test/cors.middleware.test.js
    import { describe, it, expect, vi } from 'vitest';
    import { corsMiddleware } from '../middlewares/cors.middleware.js';

    describe('corsMiddleware', () => {
      function createFakeContext(method = 'GET') {
        const headers = {};
        const fakeRes = {
          statusCode: null,
          setHeader(name, value) {
            headers[name] = value;
          },
          end: vi.fn(),
        };

        const fakeReq = { method };
        return { fakeReq, fakeRes, headers };
      }

      it('debe inyectar cabeceras CORS y de seguridad en peticiones estándar y retornar true', () => {
        const { fakeReq, fakeRes, headers } = createFakeContext('GET');

        const shouldContinue = corsMiddleware(fakeReq, fakeRes);

        expect(shouldContinue).toBe(true);
        expect(headers['Access-Control-Allow-Origin']).toBe('*');
        expect(headers['Access-Control-Allow-Methods']).toContain('GET, POST');
        expect(headers['X-Content-Type-Options']).toBe('nosniff');
        expect(headers['X-Frame-Options']).toBe('DENY');
        expect(fakeRes.end).not.toHaveBeenCalled();
      });

      it('debe responder 204 y finalizar la respuesta en peticiones preflight OPTIONS', () => {
        const { fakeReq, fakeRes, headers } = createFakeContext('OPTIONS');

        const shouldContinue = corsMiddleware(fakeReq, fakeRes);

        expect(shouldContinue).toBe(false);
        expect(fakeRes.statusCode).toBe(204);
        expect(fakeRes.end).toHaveBeenCalledTimes(1);
        expect(headers['Access-Control-Allow-Headers']).toContain('Authorization');
      });
    });
