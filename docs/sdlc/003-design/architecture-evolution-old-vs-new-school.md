# Evolución de Arquitectura: Old-School vs. New-School

Este documento define la comparación formal, fundamentación teórica y decisiones tecnológicas entre la arquitectura inicial del proyecto (**Old-School / Bare-Metal**) y la evolución moderna (**New-School / Type-Safe & Web Standards**).

---

## 1. Filosofía y Motivación

| Dimensión | Old-School (Branch `main`) | New-School (Branch `feature/new-school`) |
|---|---|---|
| **Propósito Principal** | Entender las tripas del motor (qué hace un framework por debajo). | Entregar software de grado empresarial con máxima velocidad, mantenibilidad y cero errores de tipo. |
| **Abstracción** | Mínima indispensable ("A ring pelado"). | Abstracciones modernas de alto rendimiento y cero costo en runtime (*Zero-Cost Abstractions*). |
| **Seguridad de Tipos** | Dinámica / Runtime checks con validadores aislados. | **End-to-End Type Safety** en tiempo de compilación y runtime. |
| **Estándares** | APIs propietarias de Node.js (`node:http`, streams manuales). | **Web Standards First** (`fetch`, `Request`, `Response`, `Headers`). |

---

## 2. Comparativa Detallada de Stacks

### A. Capa de Ejecución y Lenguaje
- **Old-School:**
  - Node.js ESM nativo (`import/export`, sin transpilación).
  - Tipado dinámico en JavaScript puro.
  - Ejecución mediante `node --watch`.
- **New-School:**
  - **TypeScript 5+ (Strict Mode):** Tipado exhaustivo que previene errores antes de ejecutar el código.
  - **tsx / esbuild:** Ejecución instantánea y hot-reload de TypeScript sin esperas por compilación pesada.

### B. Capa HTTP y Enrutamiento
- **Old-School:**
  - Módulo nativo `node:http`.
  - Router construido a mano (`src/infrastructure/http/router.js`).
  - Parseo manual de chunks de datos de streams (`req.on('data')`, `req.on('end')`).
- **New-School:**
  - **Hono** (`@hono/node-server`): Framework ultraligero (<15kb), construido sobre estándares web abiertos.
  - Enrutamiento basado en árboles de prefijos (Radix Tree) de alta velocidad.
  - Manejo unificado de peticiones compatible con Node.js, Bun, Deno o Edge Functions.

### C. Capa de Base de Datos y Persistencia
- **Old-School:**
  - Driver nativo `mysql2/promise` con consultas SQL en texto crudo (`pool.query('SELECT ...')`).
  - Migraciones y transacciones manuales (`pool.getConnection()`, `beginTransaction()`).
  - Riesgo de desincronización entre el esquema SQL de la base de datos y los objetos JS.
- **New-School:**
  - **Drizzle ORM** (`drizzle-orm` + `drizzle-kit` sobre MySQL):
    - No es un ORM pesado ni mágico como Prisma o TypeORM antiguo; es un **Type-Safe SQL Query Builder**.
    - Escribes SQL con la seguridad de que si eliminas o renombras una columna en el schema, TypeScript arroja error inmediatamente en los casos de uso.
    - Generación automática de migraciones deterministas.

### D. Validación de Datos y Contratos de API
- **Old-School:**
  - `zod` invocado manualmente dentro de cada controlador o middleware.
  - Mapeo manual de errores hacia formatos HTTP.
- **New-School:**
  - **`@hono/zod-validator`**:
    - La validación está ligada intrínsecamente al router.
    - Inferencia automática: los parámetros del request (JSON, query params, headers) se convierten automáticamente en tipos TypeScript fuertemente tipados dentro del handler.

### E. Estrategia de Testing
- **Old-School:**
  - Vitest para unit tests en JavaScript.
  - Playwright para E2E y k6 para pruebas de carga.
- **New-School:**
  - **Vitest nativo con TypeScript:** Pruebas unitarias y de integración contra tipos e interfaces reales.
  - Playwright para flujos E2E multi-feature.
  - k6 y escaneos de seguridad automatizados en CI.

---

## 3. Ejemplo Visual de Transformación

### Ruta de Creación de Usuario

#### Enfoque Old-School:
```javascript
// src/infrastructure/http/router.js (Manual)
if (req.method === 'POST' && req.url === '/users') {
  const body = await parseJsonBody(req);
  const validated = userSchema.parse(body);
  const user = await createUserUseCase.execute(validated);
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(user));
}
```

#### Enfoque New-School:
```typescript
// src/features/users/users.routes.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createUserSchema } from './users.schema.js';

export const userRoutes = new Hono();

userRoutes.post('/', zValidator('json', createUserSchema), async (c) => {
  const data = c.req.valid('json'); // Inferencia de tipos 100% garantizada
  const result = await c.var.createUserUseCase.execute(data);
  return c.json(result, 201);
});
```

---

## 4. Guía de Convivencia entre Ramas

1. **Rama `main` (Old-School Foundation):**
   - Se mantiene intacta como referencia de ingeniería base.
   - Demuestra el dominio de los fundamentos de Node.js sin frameworks ni abstracciones automáticas.
2. **Rama `feature/new-school` (Modern Enterprise Stack):**
   - Implementa la versión con TypeScript + Hono + Drizzle ORM + MySQL.
   - Demuestra buenas prácticas modernas, alta velocidad de desarrollo (DX) y cero deuda técnica de tipado.
