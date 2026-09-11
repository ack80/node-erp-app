// src/infrastructure/http/middlewares/logger.middleware.js
import { randomUUID } from 'node:crypto';
import { logger } from '../../../config/logger.js';

/**
 * @file src/infrastructure/http/middlewares/logger.middleware.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 005 (ASP.NET Core CorrelationId / Activity Tracing) & Distributed Tracing Standards (W3C Trace Context)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Interceptor Pattern / Decorator Pattern (Chain of Responsibility)
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Context Decoration & Header Mutation | Tiempo: O(1) | Espacio: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      Log Needle in a Haystack (incapacidad de correlacionar logs de una petición específica entre miles de peticiones simultáneas) & Missing Upstream Context (ignorar el traceId propagado por API Gateways o frontend)
 * 🛡️ EL ANTÍDOTO:                Asignación determinista de un `traceId` único (reutilizando `X-Correlation-ID` entrante o generando un UUID v4 criptográfico), inyección en `req.id`, emisión en la cabecera HTTP de respuesta y enriquecimiento de todos los logs con dicho identificador.
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
export function requestLogger(req, res) {
  const startTime = performance.now();

  // 1. Extrae cabecera o genera nuevo UUID criptográfico v4
  const incomingCorrelationId = req.headers?.['x-correlation-id'];
  const traceId = (typeof incomingCorrelationId === 'string' && incomingCorrelationId.trim().length > 0)
    ? incomingCorrelationId.trim()
    : randomUUID();

  // 2. Asocia traceId al contexto del request
  req.id = traceId;

  // 3. Estampa cabecera en la respuesta para el cliente o downstream services
  if (typeof res.setHeader === 'function') {
    res.setHeader('X-Correlation-ID', traceId);
  }

  // Escuchamos el evento 'finish' que dispara Node.js cuando la respuesta termina de enviarse
  res.on('finish', () => {
    const durationMs = Number((performance.now() - startTime).toFixed(2));
    const statusCode = res.statusCode;

    const logData = {
      traceId,
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

