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
  // 1. Si es un error de validación de esquema (Zod)
  if (error.name === 'ZodError') {
    logger.warn('Error de validación en la petición', {
      url: req.url,
      method: req.method,
      issues: error.issues,
    });

    return sendJson(res, 400, {
      error: ERROR_CODES.VALIDATION_ERROR,
      message: 'Los datos enviados no cumplen con el formato requerido.',
      details: error.issues,
    });
  }

  // 2. Si es un error operacional controlado (AppError)
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

  // 3. Si es un error inesperado (Bugs, caídas de red no controladas)
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
