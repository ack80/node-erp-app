// src/infrastructure/http/middlewares/logger.middleware.js
    import { logger } from '../../../config/logger.js';

    /**
     * Middleware que audita cada petición HTTP entrante calculando su tiempo de respuesta.
     *
     * @param {import('node:http').IncomingMessage} req
     * @param {import('node:http').ServerResponse} res
     */
    export function requestLogger(req, res) {
      const startTime = performance.now();

      // Escuchamos el evento 'finish' que dispara Node.js cuando la respuesta termina de enviarse
      res.on('finish', () => {
        const durationMs = Number((performance.now() - startTime).toFixed(2));
        const statusCode = res.statusCode;

        const logData = {
          method: req.method,
          url: req.url,
          statusCode,
          durationMs,
        };

        if (statusCode >= 500) {
          logger.error(`HTTP ${req.method} ${req.url} finalizado con error de servidor`, logData);
        } else if (statusCode >= 400) {
          logger.warn(`HTTP ${req.method} ${req.url} finalizado con advertencia/error de cliente`, logData);
        } else {
          logger.info(`HTTP ${req.method} ${req.url} procesado exitosamente`, logData);
        }
      });
    }
