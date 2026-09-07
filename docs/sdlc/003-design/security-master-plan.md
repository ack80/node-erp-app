# Plan Maestro de Seguridad y Cumplimiento OWASP (Security by Design)

Este documento define la estrategia integral de seguridad para el backend del ERP, siguiendo el estándar **Security by Design** evaluado bajo criterios de Staff/Principal Engineer (Google Bar Raiser Standard).

---

## 1. Filosofía: Shift-Left Security & Defense in Depth

En sistemas empresariales de misión crítica, la seguridad **no es una fase tardía ni un parche post-lanzamiento**, sino un modelo de capas concéntricas (*Defense in Depth*) donde cada capa asume que la anterior pudo haber sido comprometida.

```text
               CLIENTE / ATACANTE
                       │
                       ▼
 ┌────────────────────────────────────────────────────────┐
 │ CAPA 1: PERÍMETRO Y TRANSPORTE (Red / HTTP)            │
 │ • Límite DoS Payload (<1MB en request-body.js)         │
 │ • Headers de Seguridad (HSTS, CSP, X-Frame, No-Sniff)  │
 │ • Sanitización de JSON y Content-Type estricto         │
 └─────────────────────────┬──────────────────────────────┘
                           │
                           ▼
 ┌────────────────────────────────────────────────────────┐
 │ CAPA 2: IDENTIDAD Y ACCESO (Auth & Users)              │
 │ • Hashing resistente a GPU/ASIC: Argon2id              │
 │ • Autenticación stateless criptográfica: JWT (HS256)   │
 │ • Control de Acceso Basado en Roles (RBAC)             │
 └─────────────────────────┬──────────────────────────────┘
                           │
                           ▼
 ┌────────────────────────────────────────────────────────┐
 │ CAPA 3: APLICACIÓN Y NEGOCIO (Domain & Validation)     │
 │ • Validación Fail-Fast en tiempo de entrada con Zod    │
 │ • Respuestas y logs libres de fuga de datos sensibles  │
 │ • Principio de mínimo privilegio en los Casos de Uso   │
 └─────────────────────────┬──────────────────────────────┘
                           │
                           ▼
 ┌────────────────────────────────────────────────────────┐
 │ CAPA 4: PERSISTENCIA Y DATOS (MySQL / SQL Engine)      │
 │ • Inyección SQL Imposible: 100% Queries Preparadas     │
 │ • Transacciones Atómicas (withTransaction) contra DoS  │
 │ • Pool con límites estrictos de conexiones abiertas    │
 └─────────────────────────┬──────────────────────────────┘
                           │
                           ▼
 ┌────────────────────────────────────────────────────────┐
 │ CAPA 5: AUDITORÍA OFENSIVA EXTERNA (DAST & CI/CD)      │
 │ • OWASP ZAP (Baseline Scan contra endpoints vivos)     │
 │ • Escaneo automatizado de dependencias y secretos      │
 └────────────────────────────────────────────────────────┘
```

---

## 2. Matriz de Mitigación OWASP Top 10

| Riesgo OWASP Top 10 | Vector de Ataque | Mecanismo de Defensa Implementado | Estado / Ubicación |
|---|---|---|---|
| **A01: Broken Access Control** | Un usuario accede a facturas u órdenes de otro cliente. | Middleware RBAC + Verificación de propiedad en Casos de Uso. | Fase 2 (`auth.middleware.js`) |
| **A02: Cryptographic Failures** | Robo de base de datos exponiendo contraseñas de usuarios. | Algoritmo **Argon2id** (OWASP Winner) con salting criptográfico. | Fase 2 (`password-hasher.js`) |
| **A03: Injection (SQLi)** | Inyección de código malicioso vía inputs (`' OR 1=1 --`). | Driver `mysql2` con **Prepared Statements (`?`) obligatorios**. Cero concatenación. | Fase 2 (`users.repository.js`) |
| **A04: Insecure Design** | Lógica de negocio desprotegida contra abusos. | Rate Limiting manual en login y límites transaccionales. | Fase 2 y 4 (`transaction.js`) |
| **A05: Security Misconfiguration** | Headers HTTP por defecto que revelan versiones o permiten clickjacking. | Helper de headers seguros (`helmet` artesanal nativo). | Fase 1 (`response.js`) |
| **A06: Vulnerable Components** | Librerías con vulnerabilidades críticas en el árbol de dependencias. | Mínimas dependencias (`pnpm audit`, `zod`, `argon2`, `mysql2`). | Permanente en CI |
| **A07: Identification Failures** | Ataques de fuerza bruta sobre `/login`. | Verificación de tiempo constante (`argon2.verify`) y expiración corta en JWT. | Fase 2 (`login.use-case.js`) |
| **A08: Software & Data Integrity** | Payloads maliciosos o JSON gigantes para desbordar memoria (DoS). | Límite estricto de 1MB (`MAX_BODY_SIZE`) en `request-body.js`. | Implementado y Testeado |
| **A09: Security Logging Failures** | Incursiones no detectadas o logs que filtran contraseñas. | Logger estructurado (`logger.js`) con sanitización de campos (`password`, `token`). | Implementado y Testeado |
| **A10: Server-Side Request Forgery** | Peticiones no autorizadas orquestadas desde el backend. | Arquitectura aislada en red privada para bases de datos (Terraform network module). | `infra/terraform/` |

---

## 3. Ciclo de Vida: Cuándo se implementa cada pieza

### Etapa 1: Durante el Desarrollo del Feature (Preventivo / Código)
*Cada línea de código que entra al repositorio se escribe con defensas activas.*
1. **Defensa contra SQLi:**
   ```javascript
   // REGLA ABSOLUTA: Prohibido usar template strings para valores de usuario
   // ❌ MAL: pool.query(`SELECT * FROM users WHERE email = '${email}'`)
   // ✅ BIEN:
   await pool.query('SELECT * FROM users WHERE email = ?', [email]);
   ```
2. **Defensa contra Fugas Criptográficas:**
   ```javascript
   // Las contraseñas nunca tocan texto plano en almacenamiento
   const passwordHash = await hasher.hash(rawPassword);
   ```
3. **Defensa contra Fuga de Información en Respuestas:**
   ```javascript
   // La entidad limpia la contraseña antes de salir al cliente
   const { password_hash, ...publicUser } = user;
   return publicUser;
   ```

### Etapa 2: Pipeline de CI/CD (Verificación Continua)
*Automatizado en GitHub Actions en cada Pull Request:*
- `pnpm audit`: Analiza si `mysql2`, `argon2` o `zod` tienen parches de seguridad pendientes.
- `vitest run`: Ejecuta pruebas unitarias de inyección y validación.

### Etapa 3: Auditoría Dinámica (OWASP ZAP DAST)
*Se ejecuta contra el servidor levantado en ambiente de staging:*
- Archivo de configuración: `test/security/zap-baseline.conf`.
- Simula ataques reales de penetración (Spidering, SQLi Fuzzing, XSS Probing).
- Genera reporte formal de vulnerabilidades antes del pase a producción.

---

## 4. Criterio de Aprobación de Bar Raiser

1. **Zero-Trust Input:** Ningún input llega al caso de uso sin ser validado por esquema (Zod).
2. **Deterministic Error Handling:** Los errores 500 no filtran detalles internos (`errorHandler`).
3. **No Hardcoded Secrets:** Cero secretos en Git; validación fail-fast en el arranque (`env.js`).
4. **Reproducible Security Audit:** Suite de seguridad ejecutable con un solo comando.
