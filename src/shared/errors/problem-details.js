// src/shared/errors/problem-details.js

/**
 * @file src/shared/errors/problem-details.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 005 (ASP.NET Core ProblemDetails / RFC 7807)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Factory Pattern (GoF) & Data Transfer Object (DTO)
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Object Serialization | Tiempo: O(1) | Espacio: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      Custom Inconsistent Error Formats (devolver esquemas de error dispares como { err: "..." } o { message: "..." }, rompiendo integraciones con API Gateways y frontends)
 * 🛡️ EL ANTÍDOTO:                Fábrica canónica del objeto ProblemDetails según norma IETF RFC 7807 (`application/problem+json`), con URI de tipo tipada, título, estado HTTP, detalle legible, ruta de instancia, traceId de observabilidad e invalidParams.
 */

const BASE_TYPE_URL = 'https://erp.worldclass.ec/errors';

/**
 * Crea una estructura de error estandarizada según RFC 7807.
 * 
 * @param {object} params
 * @param {string} params.type - Código o identificador del error para generar el URI de tipo
 * @param {string} params.title - Título corto legible que describe la categoría del error
 * @param {number} params.status - Código de estado HTTP (4xx o 5xx)
 * @param {string} params.detail - Explicación detallada de la ocurrencia específica del problema
 * @param {string} [params.instance] - URI que identifica la petición causante del error
 * @param {string} [params.traceId] - Identificador único de correlación para observabilidad distribuida
 * @param {Array<object>} [params.invalidParams] - Lista detallada de parámetros inválidos en validaciones DTO
 * @returns {object} Objeto ProblemDetails normalizado
 */
export function createProblemDetails({
  type,
  title,
  status,
  detail,
  instance,
  traceId,
  invalidParams,
}) {
  const problem = {
    type: `${BASE_TYPE_URL}/${type || 'internal-error'}`,
    title: title || 'An error occurred while processing your request.',
    status: status || 500,
    detail: detail || '',
    instance: instance || null,
    traceId: traceId || null,
  };

  if (Array.isArray(invalidParams) && invalidParams.length > 0) {
    problem.invalidParams = invalidParams;
  }

  return problem;
}
