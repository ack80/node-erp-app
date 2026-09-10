# Guía y Plan Maestro de Diseño Arquitectónico: Patrones Enterprise Inspirados en Laravel (Zero-Frameworks)

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Objetivo** | Diseñar la implementación "a ring pelado" de los patrones de arquitectura y ergonomía de Laravel |
| **Entorno de Ejecución** | Node.js (ESM Nativo), MySQL 2 / MariaDB (Prepared Statements), Docker, Vitest |
| **Filosofía** | Comprender el mecanismo interno de un framework construyendo sus componentes a mano |

---

## 1. Justificación y Filosofía de Diseño

Laravel no inventó la rueda: encapsuló los **patrones clásicos de la ingeniería de software** (Martin Fowler, GoF, Enterprise Application Architecture) en una API ergonómica, legible y consistente.

En este repositorio (`node-erp-app`), la regla fundamental es **NO usar frameworks mágicos (sin Express, NestJS, Prisma ni TypeORM)**. Sin embargo, **evitar un framework no significa programar código desordenado ni espagueti**. 

Este documento establece el plan maestro para implementar los **6 grandes patrones arquitectónicos inspirados en Laravel**, construidos 100% sobre las librerías estándar y nativas de Node.js.

```text
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                   MAPA DE PATRONES ARQUITECTÓNICOS ENTERPRISE                   │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ 1. Form Requests / DTOs  ──► Validación desacoplada del controlador (Zod)       │
 │ 2. DB Transaction Helper ──► Contexto transaccional con auto-commit/rollback    │
 │ 3. Policies & Gates      ──► Autorización granular por jerarquía (RBAC / ABAC)  │
 │ 4. Middleware Onion      ──► Pipeline en capas concéntricas (next() nativo)     │
 │ 5. Domain Events         ──► Desacoplamiento asíncrono vía node:events          │
 │ 6. Background Jobs/Queues──► Tareas asíncronas con Outbox Pattern / Redis       │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Patrón 1: Form Requests & Validación DTO (Aislamiento de Controladores)

### El Problema en Controladores Clásicos de Node:
El controlador promedio en Express o Node termina con más de 100 líneas donde el 70% es fontanería defensiva:
`if (!req.body.email) return res.status(400)...`

### El Patrón Laravel (`StoreUserRequest`):
La validación se extrae de la acción del controlador y se ejecuta como un guardián de entrada. Si los datos fallan, el controlador **nunca llega a ejecutarse**.

### Nuestra Implementación Nativa:
- **Ubicación:** `src/features/<feature>/<feature>.schema.js` y `src/features/<feature>/<feature>.controller.js`.
- **Mecanismo:** El controlador delega de inmediato en el esquema tipado de Zod con `schema.parse(rawBody)`.
- **Manejo Centralizado de Errores:** En `src/infrastructure/http/middlewares/error.middleware.js`, interceptamos cualquier `ZodError` y lo transformamos automáticamente en una respuesta HTTP `400 Bad Request` con la lista atómica de campos inválidos (`ERROR_CODES.VALIDATION_ERROR`).

```text
 Request TCP Stream ──► parseJsonBody ──► schema.parse() ──► [Válido] ──► UseCase
                                                │
                                                └──► [Invalido] ──► errorHandler (HTTP 400)
```

---

## 3. Patrón 2: Gestor Transaccional Declarativo (`DB::transaction`)

### El Problema de la Fontanería Repetitiva:
Manejar transacciones SQL en crudo obliga a repetir en cada caso de uso:
```javascript
const conn = await pool.getConnection();
await conn.beginTransaction();
try {
  // queries...
  await conn.commit();
} catch (e) {
  await conn.rollback();
  throw e;
} finally {
  conn.release();
}
```
Esto contamina la capa de dominio con detalles de infraestructura de base de datos.

### El Patrón Laravel (`DB::transaction(fn)`):
Una función de orden superior recibe una función callback y le suministra una conexión transaccional.
- Si el callback resuelve con éxito: ejecuta `COMMIT` automáticamente.
- Si el callback arroja un error: ejecuta `ROLLBACK` automáticamente.
- En cualquier caso: ejecuta `RELEASE` en el bloque `finally`.

### Nuestra Especificación de Diseño:
- **Archivo:** `src/infrastructure/database/transaction.js`
- **Firma:**
  ```javascript
  export async function withTransaction(pool, work) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const result = await work(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  ```
- **Uso en Casos de Uso:**
  ```javascript
  await withTransaction(this.db, async (trx) => {
    const userId = await this.userRepo.create(userData, trx);
    await this.roleRepo.assign(userId, roleId, trx);
  });
  ```

---

## 4. Patrón 3: Policies & Gates (Autorización Granular RBAC / ABAC)

### El Problema:
Confundir **Autenticación** (saber quién eres: 401 Unauthorized) con **Autorización** (saber si tienes permiso de hacer algo: 403 Forbidden).

En un ERP Multi-Tenant jerárquico (`Holding -> Company -> Branch`):
- Un `CASHIER` de la sucursal Quito **no puede** cerrar la caja de Guayaquil.
- Un `COMPANY_ADMIN` de Worldclass Travel **no puede** ver la facturación de RapiVisa.

### El Patrón Laravel (`UserPolicy` / `Gate`):
Lógica de autorización aislada en clases o funciones puras independientes de HTTP.

### Nuestra Especificación de Diseño:
- **Ubicación:** `src/features/<feature>/<feature>.policy.js`
- **Diseño de Funciones Puras:**
  ```javascript
  // src/features/users/users.policy.js
  export const userPolicy = {
    canView(currentUser, targetUser) {
      if (currentUser.role === 'SUPERADMIN') return true;
      if (currentUser.holdingId !== targetUser.holdingId) return false;
      if (currentUser.role === 'COMPANY_ADMIN') {
        return currentUser.companyId === targetUser.companyId;
      }
      return currentUser.id === targetUser.id;
    },
    
    canManageBranch(currentUser, branchId) {
      if (currentUser.role === 'SUPERADMIN') return true;
      return currentUser.branchId === branchId;
    }
  };
  ```

---

## 5. Patrón 4: Pipeline de Middlewares (Patrón "Cebolla")

### El Patrón Laravel:
Las peticiones atraviesan middlewares concéntricos antes y después del controlador:
`Request ──► Middleware 1 ──► Middleware 2 ──► Router / Controller ──► Response`

### Nuestra Especificación de Diseño:
- Ya construimos `requestLogger`, `corsMiddleware` y `errorHandler`.
- Para encadenar middlewares de ruta (como `authMiddleware` + `tenantMiddleware`), implementamos un pipeline nativo basado en funciones:
  ```javascript
  export function composeMiddlewares(...middlewares) {
    return (req, res, context) => {
      let index = 0;
      const next = () => {
        const current = middlewares[index++];
        if (current) {
          return current(req, res, context, next);
        }
      };
      return next();
    };
  }
  ```

---

## 6. Patrón 5: Eventos de Dominio y Listeners (`node:events`)

### El Problema en ERPs:
Cuando un usuario crea una orden o se registra un usuario:
1. Crear el usuario en la BD.
2. Enviar email de bienvenida.
3. Crear un registro de auditoría de seguridad.
4. Notificar por webhook a un sistema externo.

Si todo se escribe dentro del Caso de Uso, el código viola el Principio de Responsabilidad Única (SRP) y se vuelve frágil.

### El Patrón Laravel (`Event::dispatch(new UserRegistered)`):
El Caso de Uso realiza su trabajo transaccional principal y emite un evento desacoplado.

### Nuestra Especificación de Diseño:
- **Ubicación:** `src/infrastructure/events/event-bus.js`
- **Mecanismo:** Basado en `EventEmitter` nativo de Node.js (`node:events`).
- **Ejemplo:**
  ```javascript
  // Disparo en Caso de Uso:
  eventBus.emit('user.registered', { userId: user.id, email: user.email });

  // Listeners desacoplados en src/features/users/listeners/:
  eventBus.on('user.registered', sendWelcomeEmailListener);
  eventBus.on('user.registered', auditLogListener);
  ```

---

## 7. Patrón 6: Jobs y Tareas Asíncronas en Segundo Plano

### El Problema:
Operaciones pesadas (generación de facturas electrónicas SRI en PDF, reportes de cierre de mes, sincronización de inventario) no deben bloquear la respuesta HTTP al cliente.

### El Patrón Laravel (`Queue::dispatch(new SyncInventoryJob)`):
El endpoint responde de inmediato `202 Accepted` y delega la ejecución a un worker en segundo plano.

### Nuestra Especificación de Diseño (Outbox Pattern + Redis):
1. **Paso 1 (Transaccional):** Se escribe la tarea en la tabla SQL `ord_sync_outbox` dentro de la misma transacción de la venta (garantía ACID: cero órdenes perdidas).
2. **Paso 2 (Despacho):** Un proceso worker nativo lee los registros pendientes de la tabla o de una cola en **Redis** (gestionada en nuestro Docker/Aiven) y procesa la tarea de forma asíncrona.

---

## 8. Cronograma de Implementación

| Patrón | Módulo Afectado | Prioridad | Estado |
|---|---|:---:|:---:|
| **Form Requests (Zod Schemas)** | `users/`, `auth/` | Alta | ✅ Implementado en `users` |
| **Migraciones UP/DOWN por Batches** | `infrastructure/database/` | Alta | ✅ Implementado |
| **Seeds Modulares por Entidad** | `infrastructure/database/seeds/` | Alta | ✅ Implementado |
| **`withTransaction(pool, fn)`** | `infrastructure/database/` | Alta | ⏳ Siguiente paso |
| **Policies & Authorization Gates** | `features/auth/`, `features/users/` | Media | ⏳ Al construir `auth` |
| **Pipeline de Middlewares con Auth** | `infrastructure/http/` | Alta | ⏳ Al construir `auth` |
| **Event Bus Nativo (`node:events`)** | `infrastructure/events/` | Media | ⏳ Post-Auth |
| **Jobs / Outbox Worker con Redis** | `features/orders/` | Media | ⏳ En módulo de Ventas |
