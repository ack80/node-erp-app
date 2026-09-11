// src/infrastructure/http/middlewares/error.middleware.js
import { AppError } from '../../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../../shared/errors/error-codes.js';
import { logger } from '../../../config/logger.js';
import { createProblemDetails } from '../../../shared/errors/problem-details.js';

/**
 * @file src/infrastructure/http/middlewares/error.middleware.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 002 (Erlang "Let it Crash" / Isolation) & Era 005 (ASP.NET Core RFC 7807) & Era 006 (NestJS Exception Filters)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Exception Filter Pattern & Centralized Error Handler (Chain of Responsibility)
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Type Matching Branching / Polymorphic Error Mapping | Tiempo: O(1) | Espacio: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      Information Disclosure Vulnerability (fugar stack traces internos de BD o rutas de archivos al cliente en producción) & Silent Error Swallowing (capturar errores sin registrarlos en log, dejando bugs fantasma)
 * 🛡️ EL ANTÍDOTO:                Filtro centralizado con discriminación de errores operacionales controlados (AppError / ZodError) vs no controlados (HTTP 500 con log estructurado y mensaje sanitizado al cliente), respondiendo estrictamente conforme a IETF RFC 7807 (`application/problem+json`).
 *
 * @param {Error} error
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
export function errorHandler(error, req, res) {
  const traceId = req.id || null;
  const instance = req.url || null;

  // 1. Envío helper especializado en application/problem+json (RFC 7807)
  const sendProblem = (status, problemData) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/problem+json; charset=utf-8');
    res.end(JSON.stringify(problemData));
  };

  // 2. Si es un error de validación de esquema (Zod)
  if (error.name === 'ZodError') {
    const invalidParams = Array.isArray(error.issues)
      ? error.issues.map((issue) => ({
          name: issue.path?.join('.') || 'body',
          reason: issue.message,
          code: issue.code,
        }))
      : [];

    logger.warn('Error de validación en la petición', {
      traceId,
      url: req.url,
      method: req.method,
      issues: error.issues,
    });

    const problem = createProblemDetails({
      type: 'validation-error',
      title: 'Validation Error',
      status: 400,
      detail: 'Los datos enviados no cumplen con el formato requerido.',
      instance,
      traceId,
      invalidParams,
    });

    // Mantener compatibilidad retroactiva con propiedad error: 'VALIDATION_ERROR'
    problem.error = ERROR_CODES.VALIDATION_ERROR;

    return sendProblem(400, problem);
  }

  // 3. Si es un error operacional controlado (AppError)
  if (error instanceof AppError && error.isOperational) {
    logger.warn(`Operational error: ${error.message}`, {
      traceId,
      code: error.code,
      statusCode: error.statusCode,
      url: req.url,
      method: req.method,
    });

    const problem = createProblemDetails({
      type: error.code ? error.code.toLowerCase().replace(/_/g, '-') : 'operational-error',
      title: error.code || 'Operational Error',
      status: error.statusCode,
      detail: error.message,
      instance,
      traceId,
    });

    // Compatibilidad retroactiva
    problem.error = error.code;

    return sendProblem(error.statusCode, problem);
  }

  // 4. Si es un error inesperado del sistema (Bugs, fallos de infraestructura)
  logger.error(`Unhandled system error: ${error.message}`, {
    traceId,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  const problem = createProblemDetails({
    type: 'internal-error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'Ha ocurrido un error inesperado en el servidor.',
    instance,
    traceId,
  });

  // Compatibilidad retroactiva
  problem.error = ERROR_CODES.INTERNAL_ERROR;

  return sendProblem(500, problem);
}
