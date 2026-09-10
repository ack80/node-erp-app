# Guía y Plan Maestro de Diseño: Patrones de Rigor y Observabilidad Enterprise Inspirados en ASP.NET Core (Zero-Frameworks)

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Documento Complementario** | `architectural-patterns-and-laravel-inspirations.md` |
| **Objetivo** | Diseñar la implementación "a ring pelado" de los patrones de resiliencia, contratos estrictos y observabilidad de ASP.NET Core (.NET 8/9) |
| **Entorno de Ejecución** | Node.js (ESM Nativo), MySQL 2 / MariaDB, Docker, Vitest |
| **Filosofía** | Rigor bancario: contratos inmutables, trazabilidad punto a punto y tolerancia a fallos |

---

## 1. Justificación y Filosofía: El Enfoque ASP.NET Core

Mientras que Laravel representa la cúspide de la **ergonomía y felicidad del programador**, ASP.NET Core (.NET 8 / 9) es el referente mundial de **disciplina de tipos, trazabilidad observable y contratos de grado bancario**.

Al construir un ERP empresarial sin frameworks en Node.js, adoptar estos principios nos protege contra los vicios más peligrosos del ecosistema JavaScript:
1. Errores con formatos inconsistentes entre endpoints.
2. Imposibilidad de rastrear una falla en logs cuando hay concurrencia alta.
3. Fallos tardíos en producción por variables de entorno mal configuradas.
4. Falsos estados de salud en el servidor ante caídas de la base de datos.

```text
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │               5 PATRONES ENTERPRISE INSPIRADOS EN ASP.NET CORE                  │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ 1. RFC 7807: ProblemDetails ──► Formato universal y normado de errores HTTP     │
 │ 2. CorrelationId & Tracing  ──► Trazabilidad distribuida de logs y queries SQL  │
 │ 3. Strongly-Typed Options   ──► Configuración validada en milisegundo cero      │
 │ 4. DI Lifetimes (Singleton) ──► Gestión estricta de memoria y conexiones        │
 │ 5. Liveness vs Readiness    ──► Health checks reales con ping a MariaDB y Redis │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Patrón 1: RFC 7807 — `ProblemDetails` (Estándar Mundial de Errores)

### El Problema en APIs de Node.js:
La mayoría de APIs responden errores arbitrarios:
- Un endpoint responde: `{ "message": "No encontrado" }`
- Otro endpoint responde: `{ "error": "USER_NOT_FOUND" }`
- La validación responde: `{ "errors": ["Email inválido"] }`

Esto obliga a los clientes (frontend React, app Flutter móvil, terminales POS de sucursales) a escribir lógica defensiva frágil.

### El Patrón ASP.NET Core:
Todo error HTTP 4xx o 5xx se adhiere obligatoriamente a la especificación oficial de la IETF: **RFC 7807 (Problem Details for HTTP APIs)** con Content-Type `application/problem+json`.

### Nuestra Especificación de Diseño:
Estructura universal emitida por `src/infrastructure/http/middlewares/error.middleware.js`:

```json
{
  "type": "https://erp.worldclass.ec/errors/validation-error",
  "title": "Error de Validación de Datos",
  "status": 400,
  "detail": "La contraseña enviada no cumple con la política de seguridad del holding.",
  "instance": "/api/v1/users",
  "traceId": "c8f2a1b0-8f92-4e67-9c12-789a6b123456",
  "invalidParams": [
    {
      "name": "password",
      "reason": "La contraseña debe contener al menos una letra mayúscula"
    }
  ]
}
```

#### Implementación:
- Creamos una factoría utilitaria `createProblemDetails({ status, title, detail, instance, traceId, invalidParams })`.
- El middleware de errores responde con cabecera `Content-Type: application/problem+json; charset=utf-8`.

---

## 3. Patrón 2: `CorrelationId` y Trazabilidad de Logs (`Activity / TraceId`)

### El Problema en Producción:
En un ERP con 50 cajeros y clientes comprando a la vez, se generan miles de líneas de logs por minuto. Cuando un usuario reporta: *"Me cobró pero falló la reserva"*, buscar en un log plano es buscar una aguja en un pajar.

### El Patrón ASP.NET Core:
En cuanto entra una petición HTTP:
1. Se inspecciona el header `X-Correlation-ID` o `traceparent` (W3C TraceContext).
2. Si no viene, se genera un UUID v4 criptográfico único: `traceId`.
3. **Ese `traceId` se asocia al ciclo de vida de la petición.**
4. Cada log emitido por `logger.info()` o `logger.error()` lo incluye automáticamente.
5. Se devuelve en el header de respuesta `X-Correlation-ID` al cliente para soporte técnico.

```text
 Cliente ──► POST /api/v1/users ──► requestLogger: genera traceId "abc-123"
                                         │
                                         ├─► logger.info("[abc-123] Creando usuario...")
                                         ├─► SQL Query "[abc-123] INSERT INTO usr_users..."
                                         └─► Response Header: X-Correlation-ID: abc-123
```

---

## 4. Patrón 3: Configuración Fuertemente Tipada con Fail-Fast (`IOptions<T>`)

### El Problema:
Usar `process.env.VARIABLE` repartido por el código es una bomba de tiempo: si una variable de entorno falta o tiene un tipo incorrecto (ej: puerto como string en vez de número), la aplicación puede explotar días después en tiempo de ejecución.

### El Patrón ASP.NET Core:
La configuración se mapea a una clase fuertemente tipada y se valida con validadores estrictos en el **milisegundo cero** de arranque. Si algo no cumple el contrato, el proceso aborta con un diagnóstico claro antes de abrir el socket de red.

### Nuestra Especificación de Diseño:
- **Archivo:** `src/config/env.js`
- Validar todo el entorno con un esquema formal de **Zod**:
  ```javascript
  const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(5000),
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().default(3306),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string().min(1),
    JWT_SECRET: z.string().min(32, 'El JWT_SECRET debe tener al menos 32 caracteres para seguridad HMAC-SHA256'),
  });
  ```
- Si la validación falla, imprime un informe tabular en consola y ejecuta `process.exit(1)`.

---

## 5. Patrón 4: Disciplina en el Ciclo de Vida de Dependencias (DI Lifetimes)

### El Concepto en ASP.NET Core:
El contenedor de inyección de dependencias clasifica formalmente los componentes según su tiempo de vida:

| Ciclo de Vida | Comportamiento | Ejemplos en nuestro ERP |
|---|---|---|
| **Singleton** | Una sola instancia compartida durante toda la vida del proceso | `pool` (MySQL), `logger`, `eventBus` |
| **Scoped** | Una instancia aislada por cada petición HTTP o transacción | Transacción activa (`trx`), `currentUserContext` |
| **Transient** | Una instancia nueva cada vez que se requiere | DTOs, Entidades de dominio, Formatters |

### Nuestra Especificación en `src/bootstrap/container.js`:
- El contenedor raíz almacena los **Singletons**.
- Cuando se ejecuta una transacción o un middleware con sesión, se genera un contexto hijo (Scope) que transporta la conexión transaccional y el `traceId` sin colisionar con peticiones concurrentes.

---

## 6. Patrón 5: Diagnóstico Dual de Salud (`/health/live` vs `/health/ready`)

### El Problema de un `/health` ingenuo:
Un endpoint `/health` que solo retorna `{ status: "UP", uptime: 120 }` es engañoso:
- El proceso Node.js puede estar respondiendo 200, pero la base de datos MariaDB pudo haberse caído o saturado de conexiones.
- Si un orquestador (Docker Compose, Kubernetes o Aiven) ve 200, seguirá enviando tráfico de clientes reales a un backend que va a reventar en cada query.

### El Patrón ASP.NET Core & Cloud-Native:
Se dividen los endpoints de salud en dos responsabilidades:

1. **Liveness Probe (`GET /health/live`):**
   - Verifica únicamente que el Event Loop de Node.js no está congelado y el servidor HTTP responde.
   - Si falla: el contenedor está muerto y debe reiniciarse.
2. **Readiness Probe (`GET /health/ready`):**
   - Ejecuta un `SELECT 1` rápido contra MariaDB y un `PING` contra Redis con timeout de 2 segundos.
   - Si la base de datos no responde: responde HTTP `503 Service Unavailable`.
   - Si falla: el contenedor está vivo pero **no está listo para recibir tráfico de clientes**.

---

## 7. Plan de Implementación Progresiva

| Patrón | Módulo Afectado | Prioridad |
|---|---|:---:|
| **`traceId` / `CorrelationId` en Logger & Headers** | `src/infrastructure/http/middlewares/logger.middleware.js` | Alta |
| **RFC 7807 `ProblemDetails` en Error Middleware** | `src/infrastructure/http/middlewares/error.middleware.js` | Alta |
| **Zod Environment Schema (Fail-Fast Tipado)** | `src/config/env.js` | Media |
| **Dual Health Checks (`/health/live` y `/health/ready`)** | `src/infrastructure/health/` | Media |
| **Scoped Context por Petición (traceId + trx)** | `src/bootstrap/create-app.js` | Media |
