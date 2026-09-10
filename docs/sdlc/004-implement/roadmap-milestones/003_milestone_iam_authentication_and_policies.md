# Hito 003: Módulo IAM, Autenticación JWT y Políticas de Acceso ABAC (`auth/`)

| Metadato | Valor |
|---|---|
| **Hito** | 003 |
| **Clasificación** | 👞 Zapatos (Capa 1 de Negocio: Identidad y Seguridad) |
| **Precedencia Requerida** | Hito 002 completado (Usa `withTransaction`, `ProblemDetails` y `traceId`) |
| **Estado** | 📋 PLANIFICADO |
| **Linaje de Referencia** | Era 002 (SAP Mandante), Era 004 (Django Auth), Era 006 (NIST ABAC) |

---

## 1. Alcance y Entregables del Hito

1. **Migración DDL `003_create_aut_auth.up.sql` y `.down.sql`:**
   - Tabla `aut_refresh_tokens`: almacenamiento hash de tokens de refresco, revocación atómica, expiración y metadatos de IP / User-Agent.
   - Tabla `aut_login_audit`: registro inmutable (append-only) de inicios de sesión fallidos y exitosos para prevención de fuerza bruta.
2. **Capa de Dominio y Seguridad (`src/features/auth/`):**
   - Hashing seguro con **Argon2id** (estándar OWASP) y generación de Access Token (JWT efímero en memoria) + Refresh Token (almacenado en cookie `HttpOnly; Secure; SameSite=Strict`).
   - Caso de Uso: `auth.login.use-case.js`.
   - Caso de Uso: `auth.refresh-token.use-case.js`.
   - Caso de Uso: `auth.logout.use-case.js` (revocación).
3. **Middleware de Autenticación y Autorización ABAC:**
   - `src/infrastructure/http/middlewares/auth.middleware.js`: valida el Bearer token o cookie, inyecta `req.currentUser`.
   - `src/features/auth/auth.policy.js`: evalúa reglas jerárquicas (`holdingId`, `companyId`, `branchId`).
4. **Pruebas Co-localizadas:**
   - `src/features/auth/test/`: unitarias de use-cases, de políticas y de integración HTTP de login.
