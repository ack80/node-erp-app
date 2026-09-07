// src/shared/errors/app-error.js
    import { ERROR_CODES } from './error-codes.js';
    
    /**
     * Error personalizado del ERP.
     * Extiende el Error nativo de JavaScript agregando:
     *   - statusCode: El código HTTP a responder
     *   - code: El código de negocio del ERP (del diccionario ERROR_CODES)
     *   - isOperational: ¿Es un error esperado del negocio (true) o un fallo inesperado (false)?
     */
    export class AppError extends Error {
      /**
       * @param {string} message - Mensaje legible para el cliente
       * @param {number} statusCode - Código HTTP (404, 401, 422, etc.)
       * @param {string} code - Código del diccionario ERROR_CODES
       * @param {boolean} isOperational - true = error de negocio esperado
       */
      constructor(message, statusCode = 500, code = ERROR_CODES.INTERNAL_ERROR, isOperational = true) {
        // Llama al constructor del Error nativo de JS
        super(message);

        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;

        // Preserva el stack trace correcto en Node.js
        Error.captureStackTrace(this, this.constructor);
      }
    }  

    /**
     * Fábricas de errores comunes del ERP (para no repetir new AppError(...) en cada feature).
     * Ejemplo de uso: throw Errors.notFound('Usuario no encontrado');
     */
    export const Errors = {
      notFound: (msg = 'Recurso no encontrado') =>
        new AppError(msg, 404, ERROR_CODES.NOT_FOUND),

      unauthorized: (msg = 'No autenticado') =>
        new AppError(msg, 401, ERROR_CODES.UNAUTHORIZED),

      forbidden: (msg = 'No tienes permisos') =>
        new AppError(msg, 403, ERROR_CODES.FORBIDDEN),

      conflict: (msg = 'El recurso ya existe') =>
        new AppError(msg, 409, ERROR_CODES.CONFLICT),

      validation: (msg = 'Datos de entrada inválidos') =>
        new AppError(msg, 422, ERROR_CODES.VALIDATION_ERROR),

      internal: (msg = 'Error interno del servidor') =>
        new AppError(msg, 500, ERROR_CODES.INTERNAL_ERROR, false),
    };
  