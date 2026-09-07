// src/shared/errors/error-codes.js

    /**
     * Diccionario oficial de códigos de error del ERP.
     * Usar siempre estos códigos en vez de strings literales dispersos.
     *
     * Formato: DOMINIO_DESCRIPCION
     */
    export const ERROR_CODES = Object.freeze({
      // Recursos
      NOT_FOUND:        'NOT_FOUND',
      CONFLICT:         'CONFLICT',

      // Seguridad
      UNAUTHORIZED:     'UNAUTHORIZED',
      FORBIDDEN:        'FORBIDDEN',
      TOKEN_EXPIRED:    'TOKEN_EXPIRED',

      // Datos de entrada
      VALIDATION_ERROR: 'VALIDATION_ERROR',
      INVALID_JSON:     'INVALID_JSON',
      PAYLOAD_TOO_LARGE:'PAYLOAD_TOO_LARGE',

      // Servidor
      INTERNAL_ERROR:   'INTERNAL_ERROR',
      DB_ERROR:         'DB_ERROR',
    });
