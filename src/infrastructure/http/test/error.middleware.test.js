// src/infrastructure/http/test/error.middleware.test.js
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { errorHandler } from '../middlewares/error.middleware.js';
import { Errors } from '../../../shared/errors/app-error.js';

describe('errorHandler Middleware — RFC 7807 ProblemDetails', () => {
  function createFakeContext(url = '/api/users/99', traceId = 'test-trace-uuid-1234') {
    const fakeRes = {
      statusCode: null,
      headers: {},
      body: null,
      setHeader(name, value) {
        this.headers[name.toLowerCase()] = value;
      },
      getHeader(name) {
        return this.headers[name.toLowerCase()];
      },
      end(payload) {
        this.body = payload;
      },
    };

    const fakeReq = {
      url,
      method: 'GET',
      id: traceId,
    };

    return { fakeReq, fakeRes };
  }

  it('debe responder con Content-Type: application/problem+json; charset=utf-8 y formato RFC 7807 para AppError', () => {
    const { fakeReq, fakeRes } = createFakeContext('/api/v1/customers/10');
    const appError = Errors.notFound('El cliente solicitado no existe');

    errorHandler(appError, fakeReq, fakeRes);

    expect(fakeRes.statusCode).toBe(404);
    expect(fakeRes.getHeader('content-type')).toBe('application/problem+json; charset=utf-8');

    const body = JSON.parse(fakeRes.body);
    expect(body.type).toBe('https://erp.worldclass.ec/errors/not-found');
    expect(body.title).toBe('NOT_FOUND');
    expect(body.status).toBe(404);
    expect(body.detail).toBe('El cliente solicitado no existe');
    expect(body.instance).toBe('/api/v1/customers/10');
    expect(body.traceId).toBe('test-trace-uuid-1234');
    // Retrocompatibilidad
    expect(body.error).toBe('NOT_FOUND');
  });

  it('debe mapear ZodError a HTTP 400 con lista de invalidParams estructurada', () => {
    const { fakeReq, fakeRes } = createFakeContext('/api/v1/users');
    const schema = z.object({
      email: z.string().email('Email inválido'),
      age: z.number().min(18, 'Debe ser mayor de edad'),
    });

    let zodError;
    try {
      schema.parse({ email: 'no-es-email', age: 15 });
    } catch (err) {
      zodError = err;
    }

    errorHandler(zodError, fakeReq, fakeRes);

    expect(fakeRes.statusCode).toBe(400);
    expect(fakeRes.getHeader('content-type')).toBe('application/problem+json; charset=utf-8');

    const body = JSON.parse(fakeRes.body);
    expect(body.type).toBe('https://erp.worldclass.ec/errors/validation-error');
    expect(body.title).toBe('Validation Error');
    expect(body.status).toBe(400);
    expect(body.instance).toBe('/api/v1/users');
    expect(body.traceId).toBe('test-trace-uuid-1234');
    expect(Array.isArray(body.invalidParams)).toBe(true);
    expect(body.invalidParams).toHaveLength(2);
    expect(body.invalidParams[0]).toMatchObject({
      name: 'email',
      reason: 'Email inválido',
    });
    expect(body.invalidParams[1]).toMatchObject({
      name: 'age',
      reason: 'Debe ser mayor de edad',
    });
  });

  it('debe responder 500 y RFC 7807 sanitizado ante errores inesperados del sistema', () => {
    const { fakeReq, fakeRes } = createFakeContext('/api/v1/checkout');
    const systemError = new TypeError('Cannot read property of undefined');

    errorHandler(systemError, fakeReq, fakeRes);

    expect(fakeRes.statusCode).toBe(500);
    expect(fakeRes.getHeader('content-type')).toBe('application/problem+json; charset=utf-8');

    const body = JSON.parse(fakeRes.body);
    expect(body.type).toBe('https://erp.worldclass.ec/errors/internal-error');
    expect(body.title).toBe('Internal Server Error');
    expect(body.status).toBe(500);
    expect(body.detail).toBe('Ha ocurrido un error inesperado en el servidor.');
    expect(body.instance).toBe('/api/v1/checkout');
    expect(body.traceId).toBe('test-trace-uuid-1234');
    // Sanitización: no expone el mensaje ni el stack interno en production
    expect(body.detail).not.toContain('Cannot read property');
  });
});
