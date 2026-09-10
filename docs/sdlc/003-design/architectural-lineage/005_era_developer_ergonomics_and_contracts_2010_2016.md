# Era 005 (2010 - 2016): Composición de Middlewares, Ergonomía y Observabilidad de Grado Bancario

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Precedencia Cronológica** | 005 |
| **Tecnologías de Referencia** | Express.js (TJ Holowaychuk, 2010), Laravel (Taylor Otwell, 2011), ASP.NET Core (Microsoft, 2016) |
| **Problema Nuclear** | Repetición de fontanería transaccional, formatos caóticos de error en APIs y ausencia de trazabilidad en producción |
| **Implementación en node-erp-app** | Tubería funcional de middlewares, helper `withTransaction(pool, fn)`, RFC 7807 (`ProblemDetails`) y `CorrelationId` |

---

## 1. Contexto Histórico y Problema de Ingeniería

Entre 2010 y 2016 la proliferación de clientes frontend (React, Angular, apps móviles en iOS/Android) expuso dos problemas graves:
1. **La anarquía en las respuestas de error:** Cada backend respondía formatos de error completamente arbitrarios (`{ error: ... }`, `{ message: ... }`, `{ errors: [...] }`), obligando a escribir código defensivo frágil en el cliente.
2. **La pesadilla de depurar en producción:** Cuando una transacción fallaba entre 20,000 peticiones simultáneas, era imposible rastrear en los logs qué consultas SQL pertenecían a qué usuario sin un identificador de correlación unificado.
3. **El código espagueti en transacciones:** Repetir bloques de 15 líneas de `beginTransaction`, `commit` y `rollback` en cada caso de uso.

---

## 2. Soluciones Pioneras de la Era

### 2.1. Express.js (2010): El Patrón de Middlewares en Cascada
- **Aporte Nuclear:** La tubería secuencial `(req, res, next) => {}`. Permitió modularizar la seguridad, el logging y el parseo de datos en capas concéntricas (*Onion Architecture*).

### 2.2. Laravel (2011): Ergonomía Transaccional y Políticas
- **Aporte Nuclear:**
  1. **`DB::transaction(callback)`:** Función de orden superior que gestiona automáticamente el commit, rollback y liberación de la conexión.
  2. **Policies & Gates:** Aislamiento de las reglas de autorización respecto de los controladores HTTP.
  3. **Seeds Modulares por Entidad:** Desacoplamiento de la siembra de datos maestros en ejecutores atómicos.

### 2.3. ASP.NET Core (2016): Observabilidad y Contratos Estrictos
- **Aporte Nuclear:**
  1. **RFC 7807 (`ProblemDetails`):** Estandarización del formato internacional de errores HTTP bajo `application/problem+json`.
  2. **`CorrelationId` / `Activity`:** Inyección de un UUID de trazabilidad único desde el header HTTP hasta los logs y consultas a base de datos.
  3. **Dual Health Checks:** Separación formal entre `/health/live` (¿Node responde?) y `/health/ready` (¿MariaDB y Redis están disponibles?).

---

## 3. Línea Evolutiva en la Industria

```text
 Express (req, res, next) ────► Koa / Fastify Hooks ────────► Composición asíncrona nativa en node-erp-app
 Laravel DB::transaction ────► Transactores Declarativos ───► withTransaction(pool, fn)
 ASP.NET Core ProblemDetails ─► RFC 7807 Estándar IETF ─────► error.middleware.js formateando ProblemDetails
 ASP.NET Activity / Tracing ──► OpenTelemetry W3C Trace ────► traceId en Logger y cabeceras de respuesta
```

---

## 4. Implementación Rigurosa en `node-erp-app`

1. **Gestor Transaccional Declarativo (`withTransaction`):**
   - Encapsula la conexión del pool, ejecuta la unidad de trabajo y garantiza `COMMIT` o `ROLLBACK` con liberación en bloque `finally`.
2. **Estandarización RFC 7807:**
   - Todo error 4xx o 5xx emitido por el `error.middleware.js` cumple el contrato `ProblemDetails` con campos: `type`, `title`, `status`, `detail`, `instance`, `traceId` y `invalidParams`.
3. **Trazabilidad Distribuida (`traceId`):**
   - Cada petición entrante adquiere un `traceId` que se incluye en los logs estructurados y se devuelve al cliente en el header `X-Correlation-ID`.
