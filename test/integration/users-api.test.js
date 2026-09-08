// test/integration/users-api.test.js
import { describe, it, expect, vi } from 'vitest';
import { Readable } from 'node:stream';
import { createApp } from '../../src/bootstrap/create-app.js';
import { createContainer } from '../../src/bootstrap/container.js';

describe('POST /api/v1/users (HTTP Integration)', () => {
  /**
   * Crea un mock de IncomingMessage de Node.js simulando un stream TCP con JSON
   */
  function createFakeReq({ method = 'POST', url = '/api/v1/users', body = {} }) {
    const jsonString = JSON.stringify(body);
    const req = Readable.from([Buffer.from(jsonString)]);
    req.method = method;
    req.url = url;
    req.headers = {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(jsonString).toString(),
    };
    return req;
  }

  /**
   * Crea un mock de ServerResponse de Node.js capturando statusCode y respuesta
   */
  function createFakeRes() {
    let _statusCode = 200;
    const headers = {};
    let body = '';
    const listeners = {};

    return {
      get statusCode() {
        return _statusCode;
      },
      set statusCode(val) {
        _statusCode = val;
      },
      setHeader(name, value) {
        headers[name.toLowerCase()] = value;
      },
      getHeader(name) {
        return headers[name.toLowerCase()];
      },
      writeHead(code, newHeaders = {}) {
        _statusCode = code;
        Object.entries(newHeaders).forEach(([k, v]) => this.setHeader(k, v));
      },
      end(chunk) {
        if (chunk) body += chunk;
        if (listeners['finish']) listeners['finish']();
      },
      on(event, callback) {
        listeners[event] = callback;
      },
      get body() {
        return body ? JSON.parse(body) : null;
      },
    };
  }

  it('debe registrar un usuario exitosamente y responder HTTP 201 Created con cabeceras seguras', async () => {
    // 1. Simulamos el Pool de MySQL para evitar llamadas reales a Aiven en el test
    const fakeDb = {
      execute: vi.fn(),
    };

    // findByEmail retorna null (el correo no existe)
    fakeDb.execute.mockResolvedValueOnce([[]]);
    // INSERT retorna insertId: 42
    fakeDb.execute.mockResolvedValueOnce([{ insertId: 42 }]);

    // 2. Creamos la app inyectando el mock del pool
    const container = createContainer({ db: fakeDb });
    const app = createApp(container);

    const req = createFakeReq({
      body: {
        holdingId: 1,
        companyId: 10,
        branchId: 101,
        email: 'nuevo.cajero@worldclass.com',
        password: 'PasswordSeguro123!',
        name: 'Cajero Valencia',
      },
    });
    const res = createFakeRes();

    // 3. Ejecutamos el pipeline completo
    await app(req, res);

    // 4. Verificaciones HTTP
    expect(res.statusCode).toBe(201);
    expect(res.getHeader('content-type')).toContain('application/json');
    expect(res.getHeader('x-content-type-options')).toBe('nosniff');

    // 5. Verificaciones de Datos
    expect(res.body).toMatchObject({
      id: 42,
      holdingId: 1,
      companyId: 10,
      branchId: 101,
      email: 'nuevo.cajero@worldclass.com',
      name: 'Cajero Valencia',
      isActive: true,
    });
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('debe responder HTTP 400 Bad Request si los datos violan el contrato de Zod', async () => {
    const fakeDb = { execute: vi.fn() };
    const container = createContainer({ db: fakeDb });
    const app = createApp(container);

    // Petición con contraseña inválida (sin número ni mayúscula) y sin holdingId
    const req = createFakeReq({
      body: {
        email: 'correo-invalido',
        password: 'corta',
        name: 'A',
      },
    });
    const res = createFakeRes();

    await app(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    // La base de datos jamás debió ser consultada
    expect(fakeDb.execute).not.toHaveBeenCalled();
  });
});
