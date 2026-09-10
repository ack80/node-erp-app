# Hito 001: Runtime Base HTTP, Pool MariaDB y Ejecutor de Migraciones UP/DOWN

| Metadato | Valor |
|---|---|
| **Hito** | 001 |
| **Clasificación** | 🧦 Medias (Capa 1: Runtime Primordial) |
| **Precedencia Requerida** | Ninguna |
| **Estado** | ✅ **COMPLETADO (100%)** |
| **Commit Clave** | `371d239`, `b7a801e`, `c526a76` |

---

## 1. Alcance y Entregables Completados

1. **Servidor HTTP Nativo Zero-Frameworks:**
   - Construido sobre `node:http`.
   - Enrutador artesanal basado en tabla hash nativa `Map` con resolución en tiempo $O(1)$ (`src/infrastructure/http/router.js`).
   - Lector de streams TCP con límite anti-DoS de 1 MB (`src/infrastructure/http/request-body.js`).
   - Middlewares base: `logger.middleware.js`, `cors.middleware.js`, `error.middleware.js`.
2. **Infraestructura de Datos Dockerizada:**
   - MariaDB 10.11 local configurada en `infra/docker/docker-compose.yml`.
   - Administrador web CloudBeaver en puerto `8978`.
   - Pool de conexiones `mysql2` con `multipleStatements: true` (`src/infrastructure/database/pool.js`).
3. **Ejecutor Nativo de Migraciones Bidireccionales (UP / DOWN por Batches):**
   - Tabla `_migrations` con columna `batch`.
   - `scripts/migrate.js` para aplicar pendientes en lotes atómicos.
   - `scripts/rollback.js` para reversiones quirúrgicas con archivos `.down.sql`.
   - Comandos en `package.json`: `db:migrate:dev`, `db:rollback:dev`, `db:migrate:pro`, `db:rollback:pro`.
4. **Semillas Modulares por Entidad (SRP):**
   - 8 seeders atómicos e idempotentes en `src/infrastructure/database/seeds/` (`001_org_countries.sql` a `008_usr_roles.sql`).
   - Datos maestros reales de Ecuador (Quito, Guayaquil, Cuenca) para Worldclass Travel S.A. y RapiVisa S.A.
5. **Comprobación de Calidad:**
   - 35 pruebas unitarias e integradas pasando en verde en Vitest (`pnpm test`).
