import {describe, it, expect, vi} from 'vitest';
import {sendJson, sendEmpty} from '../response.js';

describe('HTTP Response Helpers', () => {
    it('sendJson: debe fijar statusCode, header application/json y serializar los datos', () => {
      // Fabricamos un objeto fake de respuesta
      const fakeRes = {
        statusCode: null,
        headers: {},
        body: null,
        setHeader(name, value) {
          this.headers[name] = value;
        },
        end(data) {
          this.body = data;
        },
      };

      const payload = { success: true, message: 'ERP listo' };
      sendJson(fakeRes, 201, payload);

      expect(fakeRes.statusCode).toBe(201);
      expect(fakeRes.headers['Content-Type']).toBe('application/json; charset=utf-8');
      expect(fakeRes.body).toBe(JSON.stringify(payload));
    });

    it('sendEmpty: debe fijar statusCode 204 por defecto y cerrar con end() sin contenido', () => {
      const fakeRes = {
        statusCode: null,
        end: vi.fn(), // Función espía de Vitest para saber si fue llamada
      };

      sendEmpty(fakeRes);

      expect(fakeRes.statusCode).toBe(204);
      expect(fakeRes.end).toHaveBeenCalledTimes(1);
    });
  });
