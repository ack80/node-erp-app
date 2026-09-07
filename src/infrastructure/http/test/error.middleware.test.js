// src/infrastructure/http/test/error.middleware.test.js
import { describe, it, expect } from 'vitest';
import { errorHandler } from '../middlewares/error.middleware.js';
import { Errors } from '../../../shared/errors/app-error.js';

describe('errorHandler Middleware', () => {
  function createFakeContext() {
    const fakeRes = {
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

    const fakeReq = {
      url: '/api/users/99',
      method: 'GET',
    };

    return { fakeReq, fakeRes };
  }

  it('debe responder con el statusCode y código de un AppError operacional', () => {
    const { fakeReq, fakeRes } = createFakeContext();
    const appError = Errors.notFound('El cliente solicitado no existe');

    errorHandler(appError, fakeReq, fakeRes);

    expect(fakeRes.statusCode).toBe(404);
    const body = JSON.parse(fakeRes.body);
    expect(body.error).toBe('NOT_FOUND');
    expect(body.message).toBe('El cliente solicitado no existe');
  });

  it('debe responder 500 y mensaje genérico seguro ante errores inesperados del sistema', () => {
    const { fakeReq, fakeRes } = createFakeContext();
    const systemError = new TypeError('Cannot read property of undefined');

    errorHandler(systemError, fakeReq, fakeRes);

    expect(fakeRes.statusCode).toBe(500);
    const body = JSON.parse(fakeRes.body);
    expect(body.error).toBe('INTERNAL_ERROR');
    expect(body.message).toBe('Ha ocurrido un error inesperado en el servidor.');
    // Garantizamos que no se filtre el stack trace ni el mensaje sensible del crash
    expect(body.message).not.toContain('Cannot read property');
  });
});

