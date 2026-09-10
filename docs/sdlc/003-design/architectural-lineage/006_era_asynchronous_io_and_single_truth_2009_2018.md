# Era 006 (2009 - 2018): Asincronía No Bloqueante, Tipado Unificado y Control ABAC

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Precedencia Cronológica** | 006 |
| **Tecnologías de Referencia** | Node.js Nativo (Ryan Dahl, 2009), NIST SP 800-162 (ABAC), NestJS (2017), FastAPI (Tiangolo, 2018) |
| **Problema Nuclear** | Bloqueo de memoria por peticiones concurrentes, desfase entre validadores y Swagger, y limitaciones de RBAC en multi-tenancy |
| **Implementación en node-erp-app** | Event Loop no bloqueante, Streams con Backpressure, Zod como única fuente de verdad y Policies ABAC |

---

## 1. Contexto Histórico y Problema de Ingeniería

Con el auge de las arquitecturas de microservicios y el tráfico móvil masivo:
1. El modelo clásico de asignar **un hilo del sistema operativo por cada conexión HTTP** saturaba la memoria RAM de los servidores.
2. Mantener la sincronización entre tres archivos distintos (el modelo de base de datos, el validador del controlador y el archivo YAML de OpenAPI) era una fuente constante de documentación engañosa.
3. El modelo de permisos simple por Roles (RBAC) colapsaba en sistemas multi-empresa donde un cajero solo puede operar sobre su propia sucursal en su horario laboral.

---

## 2. Soluciones Pioneras de la Era

### 2.1. Node.js Nativo (Ryan Dahl, 2009): I/O No Bloqueante sobre el Event Loop
- **Aporte Nuclear:**
  Utiliza un único hilo principal orquestado por `libuv`. Mientras la base de datos o el disco procesan una operación, el motor atiende a miles de conexiones concurrentes en microsegundos sin crear hilos pesados.
  - **Manejo de Streams y Backpressure:** Los datos viajan en fragmentos de memoria (`chunks`) sin cargar archivos masivos de golpe en RAM.

### 2.2. NIST SP 800-162: Control de Acceso Basado en Atributos (ABAC)
- **Aporte Nuclear:** Supera a RBAC evaluando cuatro dimensiones dinámicas en cada operación:
  1. **Sujeto:** Rol, holdingId, companyId, branchId del usuario.
  2. **Recurso:** holdingId, branchId y estado del registro solicitado.
  3. **Acción:** Leer, crear, actualizar, anular.
  4. **Entorno:** Horario de sucursal, origen de red.

### 2.3. NestJS (Kamil Myśliwiec, 2017): Taxonomía Estricta de Componentes
- **Aporte Nuclear:** Formalizó en TypeScript la separación de responsabilidades:
  - **Guards:** Deciden si la petición pasa o no (Auth / ABAC).
  - **Pipes:** Transforman y validan la entrada de datos.
  - **Interceptors:** Enriquecen o miden tiempos de respuesta.
  - **Filters:** Mapean excepciones a códigos HTTP.

### 2.4. FastAPI (Sebastián Ramírez, 2018): Fuente Única de Verdad (Single Source of Truth)
- **Aporte Nuclear:**
  Un único esquema fuertemente tipado (Pydantic / Zod) valida los datos en tiempo de ejecución, infiere los tipos de TypeScript/Python y genera automáticamente el contrato OpenAPI sin escribir YAML a mano.

---

## 3. Línea Evolutiva en la Industria

```text
 Thread-per-request ──────────► Node.js Event Loop / libuv ──► Concurrencia masiva a coste $0 de CPU
 RBAC plano (if user.role) ───► NIST ABAC Matrix ────────────► Policies con contexto (Holding + Branch)
 NestJS Pipes & Guards ───────► Separación de Concerns ──────► Schema Validator + Policies nativas
 Pydantic / FastAPI ──────────► Inferencia de Tipos ─────────► Zod como única fuente de verdad en features
```

---

## 4. Implementación Rigurosa en `node-erp-app`

1. **Flujo de Peticiones Asíncrono con Streams TCP:**
   - `src/infrastructure/http/request-body.js` lee los datos en chunks y destruye el socket de inmediato si se excede 1 MB, impidiendo ataques de agotamiento de memoria.
2. **Autorización ABAC Jerárquica:**
   - La regla fundamental de las policies:
     `user.holdingId === resource.holdingId` **Y** (`user.role === 'SUPERADMIN'` **O** `user.branchId === resource.branchId`).
3. **Esquema Único Zod (`users.schema.js`):**
   - Valida la petición de entrada, sanitiza campos y genera las definiciones de tipo sin duplicación de código.
