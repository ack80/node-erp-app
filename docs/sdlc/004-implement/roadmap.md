# 🧭 Hoja de Ruta de Implementación (Dual-Architecture ERP)

Esta hoja de ruta define el orden de implementación y precedencia técnica para los dos paradigmas del sistema, ambos operando al 100% sobre capas gratuitas ($0 USD):

1. **Bare-Metal Persistent Architecture (Rama `main`):** Node.js nativo, MySQL en Aiven ($0), contenedor Docker en Render ($0).
2. **Serverless Edge & Type-Safe Platform (Rama `feature/new-school`):** TypeScript, Hono, Drizzle ORM, Neon PostgreSQL ($0), Vercel Functions ($0).

---

## Estrategia de Ejecución por Ramas

```
[ Rama main: Bare-Metal ]           [ Rama feature/new-school: Serverless Edge ]
Node.js nativo + MySQL              TypeScript + Hono + Drizzle + Neon Postgres
Docker + Render ($0)                Vercel Functions ($0)
         │                                   │
         ▼                                   ▼
Fase 1: Motor HTTP & Pool           Fase 1: Setup TS, Hono & Schema Drizzle
Fase 2: Auth & Users (MySQL crudo)  Fase 2: Auth & Users (Type-Safe Hono)
Fase 3: CRM Customers               Fase 3: CRM Customers
Fase 4: Products & Orders           Fase 4: Products & Orders
Fase 5: Billing & CI/CD             Fase 5: Billing & Vercel Preview Deploys
```

---

## 🎯 Track A: Bare-Metal Persistent Architecture (Rama `main`)

### Fase 1: Primitivas Transversales y Motor HTTP Nativo
- [x] **Gestión de Errores Base:** `shared/errors/app-error.js` y `error-codes.js`.
- [x] **Patrón Result:** `shared/result/result.js` para retornos deterministas.
- [x] **Conexión a Base de Datos:** Pool nativo MySQL (`mysql2/promise`) en `src/infrastructure/database/pool.js`.
- [x] **Manejador de Transacciones:** Helper `withTransaction` en `src/infrastructure/database/transaction.js`.
- [x] **Servidor HTTP:** `src/infrastructure/http/server.js` en ESM nativo (`node:http`).
- [ ] **Router Artesanal:** Implementar árbol/matcheo de rutas nativas en `src/infrastructure/http/router.js`.
- [ ] **Middleware Pipeline:** Logger, sanitización y parseador de body por chunks (`request-body.js`).

### Fase 2: Núcleo de Identidad y Seguridad (`auth` y `users`)
- [ ] **Entidad y Repositorio de Usuarios:** Consultas SQL parametrizadas directas en MySQL.
- [ ] **Seguridad Criptográfica:** Hashing con `argon2` y generación de tokens JWT.
- [ ] **Casos de Uso:** `create-user.use-case.js` y `login.use-case.js`.
- [ ] **Middleware de Autenticación:** Validación de Bearer Token en `auth.middleware.js`.
- [ ] **Pruebas Unitarias:** Co-localizadas en `features/auth/test/` y `features/users/test/` con Vitest.

### Fase 3: CRM y Gestión de Terceros (`customers`)
- [ ] **Migración SQL MySQL:** Creación de tabla `customers`.
- [ ] **Casos de Uso:** CRUD de clientes con validación Zod desacoplada.
- [ ] **Seeds:** Script de inicialización de datos de prueba en `infrastructure/database/seeds/`.

### Fase 4: Catálogo y Ventas Transaccionales (`products` y `orders`)
- [ ] **Catálogo (`products`):** Gestión de ítems y precios.
- [ ] **Motor Transaccional (`orders`):** Orquestación atómica entre cliente, productos y stock usando `withTransaction`.

### Fase 5: Finanzas, Despliegue y Pruebas Globales
- [ ] **Módulo `billing`:** Generación y liquidación de comprobantes.
- [ ] **Docker & Render ($0):** Build de imagen Alpine y despliegue continuo en Render Web Service.
- [ ] **Suite E2E & Rendimiento:** Pruebas Playwright multi-feature y tests de carga con k6.

---

## ⚡ Track B: Serverless Edge & Type-Safe Platform (Rama `feature/new-school`)

### Fase 1: Tooling Moderno, Hono y Conexión Neon Postgres
- [ ] **Configuración TypeScript:** `tsconfig.json` estricto y runner ultra-rápido `tsx`.
- [ ] **Setup Hono:** Aplicación base sobre Web Standards (`Fetch`/`Request`/`Response`) en `src/app.ts`.
- [ ] **Drizzle ORM + Neon:**
  - Configuración de conexión HTTP/WebSocket hacia Neon PostgreSQL ($0).
  - Configuración de `drizzle.config.ts` y scripts de migración.
- [ ] **Validación Integrada:** Middleware declarativo `@hono/zod-validator`.

### Fase 2: Identidad Type-Safe (`auth` y `users`)
- [ ] **Schema Drizzle:** Definición de tablas `users` y `sessions` con inferencia automática de tipos (`$inferSelect`, `$inferInsert`).
- [ ] **Servicios y Casos de Uso Tipados:** Login y registro de usuarios con tipado estricto end-to-end.
- [ ] **Rutas Hono Tipadas:** Endpoints con autocompletado en parámetros y body.
- [ ] **Pruebas Tipadas:** Vitest ejecutando directamente archivos `.ts`.

### Fase 3: CRM Type-Safe (`customers`)
- [ ] **Schema Drizzle `customers`:** Relaciones y validaciones.
- [ ] **Casos de Uso & Rutas Hono:** Manejo de estado y respuesta en milisegundos.

### Fase 4: Transacciones Serverless (`products` y `orders`)
- [ ] **Schema Drizzle `products` & `orders`:** Relaciones muchos a muchos (items de la orden).
- [ ] **Transacciones Drizzle:** Transacciones serverless seguras y optimizadas contra Neon.

### Fase 5: Despliegue Serverless Vercel ($0) & CI/CD
- [ ] **Vercel Functions:** Configuración de `vercel.json` para auto-scale a cero sin costo en reposo.
- [ ] **Database Branching en Neon:** Integración de branches efímeras de Postgres en GitHub Actions para pruebas aisladas por PR.
- [ ] **Auditoría de Seguridad y Pruebas E2E:** Verificación automatizada en staging de Vercel.

---

## 📊 Matriz de Comparación y Estado

| Módulo / Hito | Bare-Metal (`main`) | Serverless Edge (`feature/new-school`) |
|---|:---:|:---:|
| **Infraestructura Base** | En progreso (ESM + MySQL pool) | Por iniciar |
| **HTTP Routing** | Artesanal (`node:http`) | Hono (Web Standards) |
| **Persistencia** | SQL crudo (`mysql2`) en Aiven ($0) | Drizzle ORM en Neon Postgres ($0) |
| **Validación** | Zod en use-case | `@hono/zod-validator` en router |
| **Despliegue** | Docker + Render ($0) | Vercel Serverless ($0) |
