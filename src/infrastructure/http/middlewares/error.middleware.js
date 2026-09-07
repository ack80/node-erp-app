// src/infrastructure/http/middlewares/error.middleware.js
    import { AppError } from '../../../shared/errors/app-error.js';
    import { ERROR_CODES } from '../../../shared/errors/error-codes.js';
    import { logger } from '../../../config/logger.js';
    import { sendJson } from '../response.js';

    /**
     * Middleware central de captura y respuesta de errores HTTP.
     *
     * @param {Error} error
     * @param {import('node:http').IncomingMessage} req
     * @param {import('node:http').ServerResponse} res
     */
    export function errorHandler(error, req, res) {
      // 1. Si es un error controlado de la aplicación (AppError)
      if (error instanceof AppError && error.isOperational) {
        logger.warn(`Operational error: ${error.message}`, {
          code: error.code,
          statusCode: error.statusCode,
          url: req.url,
          method: req.method,
        });

        return sendJson(res, error.statusCode, {
          error: error.code,
          message: error.message,
        });
      }

      // 2. Si es un error inesperado (Bugs de código, fallos de conexión, etc.)
      logger.error(`Unhandled system error: ${error.message}`, {
        stack: error.stack,
        url: req.url,
        method: req.method,
      });

      return sendJson(res, 500, {
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Ha ocurrido un error inesperado en el servidor.',
      });
    }
