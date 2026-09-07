
    // src/infrastructure/http/test/logger.middleware.test.js
    import { describe, it, expect, vi, beforeEach } from 'vitest';
    import { EventEmitter } from 'node:events';
    import { requestLogger } from '../middlewares/logger.middleware.js';
    import { logger } from '../../../config/logger.js';
    
    describe('requestLogger Middleware', () => {
      beforeEach(() => {
        vi.restoreAllMocks();
      });
    
      function createFakeReqRes(method = 'GET', url = '/health', statusCode = 200) {
        const req = { method, url };
        // Node.js ServerResponse hereda de EventEmitter para emitir 'finish'
        const res = new EventEmitter();
        res.statusCode = statusCode;
        return { req, res };
      }
    
      it('debe registrar con logger.info una petición exitosa (200 OK)', () => {
        const { req, res } = createFakeReqRes('GET', '/health', 200);
        const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => {});
    
        requestLogger(req, res);
        res.emit('finish');

        expect(infoSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledWith(
          expect.stringContaining('GET /health procesado exitosamente'),
          expect.objectContaining({
            method: 'GET',
            url: '/health',
            statusCode: 200,
            durationMs: expect.any(Number),
          })
        );
      });

      it('debe registrar con logger.warn un error de cliente (404 Not Found)', () => {
        const { req, res } = createFakeReqRes('POST', '/api/desconocida', 404);
        const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

        requestLogger(req, res);
        res.emit('finish');

        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('POST /api/desconocida finalizado con advertencia'),
          expect.objectContaining({
            statusCode: 404,
          })
        );
      });

      it('debe registrar con logger.error un fallo de servidor (500)', () => {
        const { req, res } = createFakeReqRes('GET', '/api/error', 500);
        const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

        requestLogger(req, res);
        res.emit('finish');

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('GET /api/error finalizado con error de servidor'),
          expect.objectContaining({
            statusCode: 500,
          })
        );
      });
    });
