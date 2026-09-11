// src/infrastructure/http/test/logger.middleware.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'node:events';
import { requestLogger } from '../middlewares/logger.middleware.js';
import { logger } from '../../../config/logger.js';

/**
 * @file src/infrastructure/http/test/logger.middleware.test.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 002 (Smalltalk TDD) & Era 005 (ASP.NET Core CorrelationId Tests)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Test Double / Spy Pattern (Meszaros xUnit Patterns)
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Arrange-Act-Assert (AAA) | Tiempo: O(1) | Espacio: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      Blind Untraced Requests (peticiones sin identificador único rastreable en logs y respuestas)
 * 🛡️ EL ANTÍDOTO:                Validación automatizada de generación criptográfica de traceId, reutilización de cabecera X-Correlation-ID entrante y propagación a respuesta y logs.
 */
describe('requestLogger Middleware', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createFakeReqRes({ method = 'GET', url = '/health', statusCode = 200, headers = {} } = {}) {
    const req = { method, url, headers };
    const res = new EventEmitter();
    res.statusCode = statusCode;
    res.headers = {};
    res.setHeader = vi.fn((name, value) => {
      res.headers[name.toLowerCase()] = value;
    });
    return { req, res };
  }

  it('debe generar un traceId único (UUID v4) y setearlo en req.id y en cabecera X-Correlation-ID', () => {
    const { req, res } = createFakeReqRes();

    requestLogger(req, res);

    expect(req.id).toBeDefined();
    expect(typeof req.id).toBe('string');
    // Valida formato UUID v4
    expect(req.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', req.id);
  });

  it('debe respetar y propagar el X-Correlation-ID entrante si ya existe en la petición', () => {
    const customTraceId = 'gateway-upstream-trace-12345';
    const { req, res } = createFakeReqRes({
      headers: { 'x-correlation-id': customTraceId }
    });

    requestLogger(req, res);

    expect(req.id).toBe(customTraceId);
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', customTraceId);
  });

  it('debe registrar con logger.info una petición exitosa (200 OK) incluyendo traceId', () => {
    const { req, res } = createFakeReqRes({ method: 'GET', url: '/health', statusCode: 200 });
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => {});

    requestLogger(req, res);
    res.emit('finish');

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /health procesado exitosamente'),
      expect.objectContaining({
        traceId: req.id,
        method: 'GET',
        url: '/health',
        statusCode: 200,
        durationMs: expect.any(Number),
      })
    );
  });

  it('debe registrar con logger.warn un error de cliente (404 Not Found) con traceId', () => {
    const { req, res } = createFakeReqRes({ method: 'POST', url: '/api/desconocida', statusCode: 404 });
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    requestLogger(req, res);
    res.emit('finish');

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('POST /api/desconocida finalizado con advertencia'),
      expect.objectContaining({
        traceId: req.id,
        statusCode: 404,
      })
    );
  });

  it('debe registrar con logger.error un fallo de servidor (500) con traceId', () => {
    const { req, res } = createFakeReqRes({ method: 'GET', url: '/api/error', statusCode: 500 });
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    requestLogger(req, res);
    res.emit('finish');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/error finalizado con error de servidor'),
      expect.objectContaining({
        traceId: req.id,
        statusCode: 500,
      })
    );
  });
});
