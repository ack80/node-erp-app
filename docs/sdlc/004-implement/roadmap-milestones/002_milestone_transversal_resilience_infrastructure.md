# Hito 002: Infraestructura Transversal de Resiliencia y Observabilidad

| Metadato | Valor |
|---|---|
| **Hito** | 002 |
| **Clasificación** | Infraestructura Transversal (Capa 2: Resiliencia y Contratos para Features) |
| **Precedencia Requerida** | Hito 001 completado |
| **Estado** | ⏳ **SIGUIENTE EN COLA DE IMPLEMENTACIÓN** |
| **Linaje de Referencia** | Era 001 (Mainframe ACID), Era 002 (SAP LUW), Era 005 (Laravel / ASP.NET Core) |

---

## 1. Justificación y Alcance Técnico

Antes de construir el login o ampliar los endpoints de usuarios, debemos forjar las herramientas transversales que garantizarán consistencia transaccional y observabilidad en todos los módulos de negocio.

---

## 2. Entregables Obligatorios del Hito

### Entregable 2.1: Gestor Transaccional Declarativo (`withTransaction`)
- **Ubicación:** `src/infrastructure/database/transaction.js`
- **Firma:** `withTransaction(pool, async (connection) => { ... })`
- **Mecanismo:**
  1. Adquiere conexión del pool.
  2. Ejecuta `beginTransaction()`.
  3. Ejecuta la función de negocio pasando la conexión activa.
  4. Si resuelve: ejecuta `commit()`.
  5. Si arroja excepción: ejecuta `rollback()` y relanza el error.
  6. En bloque `finally`: ejecuta `connection.release()`.
- **Pruebas Automatizadas:** `test/unit/infrastructure/database/transaction.test.js` (probando casos de commit exitoso y rollback ante fallos simulados).

### Entregable 2.2: Trazabilidad Distribuida (`CorrelationId` / `traceId`)
- **Ubicación:** `src/infrastructure/http/middlewares/logger.middleware.js`
- **Mecanismo:**
  1. Extrae el header `X-Correlation-ID` o genera un UUID criptográfico v4 (`crypto.randomUUID()`).
  2. Asocia el `traceId` al contexto de la petición (`req.id = traceId`).
  3. Estampa el `traceId` en cada log emitido (`logger.info`, `logger.error`).
  4. Agrega la cabecera `X-Correlation-ID: <traceId>` en la respuesta HTTP al cliente.

### Entregable 2.3: Respuestas de Error Estándar RFC 7807 (`ProblemDetails`)
- **Ubicación:** `src/infrastructure/http/middlewares/error.middleware.js` y `src/shared/errors/problem-details.js`
- **Mecanismo:**
  - Header de respuesta: `Content-Type: application/problem+json; charset=utf-8`.
  - Estructura JSON universal:
    ```json
    {
      "type": "https://erp.worldclass.ec/errors/<error-code>",
      "title": "<Mensaje corto>",
      "status": 400,
      "detail": "<Detalle legible>",
      "instance": "/api/v1/...",
      "traceId": "<UUID>",
      "invalidParams": []
    }
    ```
  - Mapeo automático de:
    - `ZodError` $\to$ HTTP 400 con lista de `invalidParams`.
    - `AppError` operacional $\to$ `error.statusCode`.
    - Errores no controlados $\to$ HTTP 500 ocultando detalles sensibles en producción.

---

## 3. Criterio de Aceptación del Hito

- [ ] `withTransaction` probado al 100% con tests unitarios en Vitest.
- [ ] Peticiones HTTP reciben cabecera `X-Correlation-ID` en respuesta.
- [ ] Errores 400 emiten `Content-Type: application/problem+json` con su `traceId`.
- [ ] Suite de pruebas pasando sin regresiones.
