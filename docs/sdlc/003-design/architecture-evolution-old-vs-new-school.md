# Comparativa de Arquitectura: Monolito de Fundamentos vs. Plataforma Serverless Cloud-Native

Este documento define la comparación formal, fundamentación técnica y estrategias de despliegue entre los dos paradigmas de ingeniería implementados en el proyecto:

1. **Bare-Metal Persistent Backend (Rama `main`):** Arquitectura clásica basada en procesos continuos, contenedores y control total sin frameworks (Zero-Frameworks).
2. **Serverless Edge & Type-Safe Platform (Rama `feature/new-school`):** Arquitectura moderna orientada a estándares web, seguridad de tipos de extremo a extremo y computación efímera en la nube.

> **Premisa Operativa y Financiera:** Ambos entornos están diseñados para operar al **100% dentro de capas gratuitas ($0 USD)**, maximizando la eficiencia de recursos sin incurrir en costos de infraestructura.

---

## 1. Nomenclatura Profesional

Para comunicación formal técnica, CV y entrevistas con reclutadores/tech leads:

| Término Coloquial | Nombre Técnico Formal | Propósito del Paradigma |
|---|---|---|
| **Old-School** | **Bare-Metal Persistent Architecture** | Dominio de runtime nativo, bajo nivel, sockets TCP, gestión manual de memoria y conexiones sin abstracciones. |
| **New-School** | **Serverless Edge & Type-Safe Architecture** | Máxima velocidad de entrega (DX), tipado estricto end-to-end, cómputo autoescalable a cero y Web Standards. |

---

## 2. Matriz Comparativa de Ingeniería

| Dimensión | Bare-Metal Persistent (`main`) | Serverless Edge & Type-Safe (`feature/new-school`) |
|---|---|---|
| **Lenguaje** | JavaScript puro ESM nativo (`.js`) | **TypeScript 5+** en modo estricto (`strict: true`) |
| **Runtime & Servidor** | Node.js nativo (`node:http`, TCP streaming manual) | **Hono** sobre Web Standards (`Fetch`, `Request`, `Response`) |
| **Motor de Base de Datos** | **MySQL** (Relacional clásico) | **PostgreSQL** (Serverless cloud-native) |
| **Capa de Persistencia** | Conexiones y queries directas (`mysql2/promise`) | **Drizzle ORM** (Type-safe SQL query builder) |
| **Validación de Datos** | Aislada en use-cases vía esquemas Zod manuales | **`@hono/zod-validator`** con inferencia directa al router |
| **Contenedor DI** | Inyección de dependencias manual (closures/factory) | Inyección funcional basada en contexto (`c.set` / `c.get`) |
| **Estrategia de Testing** | Vitest (Unit/Integration) + Playwright (E2E) + k6 | Vitest tipado sobre TypeScript + Playwright + CI checks |

---

## 3. Matriz de Infraestructura, Despliegue y Costo Cero ($0 USD)

Ambos caminos aprovechan las mejores ofertas de capas gratuitas de la industria:

```
[ BARE-METAL PERSISTENT: Computación Continua Contenerizada ]

 ┌──────────────┐         ┌───────────────────────────────┐         ┌─────────────────────────┐
 │ Dockerfile   │ ───►    │ Render (Web Service Free)     │ ───►    │ Aiven Cloud ($0 Free)   │
 │ Linux Alpine │         │ Proceso continuo Node.js      │         │ MySQL gestionado        │
 └──────────────┘         └───────────────────────────────┘         └─────────────────────────┘


[ SERVERLESS EDGE & TYPE-SAFE: Cómputo Efímero y Branching ]

 ┌──────────────┐         ┌───────────────────────────────┐         ┌─────────────────────────┐
 │ TypeScript   │ ───►    │ Vercel Functions (Hobby $0)   │ ───►    │ Neon Serverless ($0)    │
 │ + Hono Build │         │ Serverless edge/ephemeral     │         │ Postgres + DB Branching │
 └──────────────┘         └───────────────────────────────┘         └─────────────────────────┘
```

### Detalle de Proveedores $0 USD:

#### A. Bare-Metal Persistent (`main`)
- **Cómputo:** **Render Free Tier** / VPS propio (`serverwct`). Proceso continuo empaquetado en Docker.
- **Base de Datos:** **Aiven Free Plan**. Instancia dedicada de MySQL (con límite de conexiones administrado por nuestro `pool.js`).
- **Monitoreo/Health:** Chequeo activo `/health` para verificar estado de conexión a MySQL y consumo de RAM.

#### B. Serverless Edge & Type-Safe (`feature/new-school`)
- **Cómputo:** **Vercel Hobby Plan ($0)**. Despliegue automático basado en Git con soporte para edge functions y escala automática a cero.
- **Base de Datos:** **Neon PostgreSQL Free Tier ($0)**. PostgreSQL serverless con auto-suspend cuando no hay tráfico y creación instantánea de branches de base de datos para previews y PRs.
- **Conectividad:** Pooler HTTP/WebSocket integrado de Neon para evitar saturación de conexiones en entornos serverless.

---

## 4. Comparativa de Implementación de Código

### Caso de Uso: Creación de Usuario

#### A. Bare-Metal Persistent (`main`):
```javascript
// src/infrastructure/http/router.js
// Procesamiento artesanal de streams y buffers sin frameworks
if (req.method === 'POST' && req.url === '/api/users') {
  const rawBody = await parseJsonBody(req);
  const validatedData = userSchema.parse(rawBody);
  const result = await createUserUseCase.execute(validatedData);
  
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
}
```

#### B. Serverless Edge & Type-Safe (`feature/new-school`):
```typescript
// src/features/users/users.routes.ts
// Pipeline declarativo, validado e inferido con Web Standards
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createUserSchema } from './users.schema.js';

export const userRoutes = new Hono();

userRoutes.post('/', zValidator('json', createUserSchema), async (c) => {
  const input = c.req.valid('json'); // Inferencia automática de tipos
  const user = await c.var.userService.create(input);
  return c.json(user, 201);
});
```

---

## 5. Resumen para Entrevistas Técnicas

> *"En este proyecto demostré dos habilidades críticas de ingeniería: primero, cómo construir un backend en Node.js de bajo nivel sin frameworks, manejando sockets, pools manuales de MySQL y contenedores Docker en Render/Aiven; y segundo, cómo construir una plataforma moderna de alta productividad usando TypeScript, Hono, Drizzle ORM y Postgres serverless en Vercel/Neon, manteniendo ambos entornos a costo cero ($0 USD)."*
