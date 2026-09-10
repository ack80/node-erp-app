# Guía y Plan Maestro de Diseño: Seguridad por Defecto, Modularidad y Permisos Atómicos Inspirados en Django (Zero-Frameworks)

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Documentos Hermanos** | `architectural-patterns-and-laravel-inspirations.md`, `architectural-patterns-and-aspnet-inspirations.md`, `architectural-patterns-and-spring-inspirations.md` |
| **Objetivo** | Adoptar las lecciones de modularidad estricta ("Pluggable Apps"), seguridad por defecto (OWASP) y permisos atómicos de Django |
| **Entorno de Ejecución** | Node.js (ESM Nativo), MySQL 2 / MariaDB, Docker, Vitest |
| **Filosofía** | Seguridad inquebrantable desde la raíz, modularidad autosuficiente y control de acceso granular |

---

## 1. Justificación: Por qué Mirar a Django

Creado en 2005 bajo la presión de redacciones de noticias con plazos estrictos (*"The web framework for perfectionists with deadlines"*), Django lleva dos décadas soportando cargas masivas en plataformas como Instagram, Pinterest, Mozilla, Disqus y The Washington Post.

En el mundo de los frameworks web, Django destaca por tres virtudes innegociables:
1. **Seguridad por defecto ("Secure by Default"):** La aplicación nace blindada contra ataques OWASP sin depender de configuraciones opcionales.
2. **Modularidad en Vertical Slices ("Pluggable Apps"):** Cada dominio de negocio es una isla coherente e independiente.
3. **Control de Acceso Granular:** Separación estricta entre Identidad (Quién eres) y Permisos Atómicos (Qué puedes hacer).

Este documento formaliza cómo implementamos estos tres pilares en nuestro backend de Node.js "a ring pelado".

```text
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                  5 LECCIONES ENTERPRISE INSPIRADAS EN DJANGO                    │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ 1. Vertical Slices (Apps Aisladas)   ──► Cohesión total por feature de negocio  │
 │ 2. Seguridad "Secure by Default"     ──► Cabeceras OWASP y límites anti-DoS     │
 │ 3. Permisos Atómicos (RBAC Granular) ──► Permisos desacoplados de roles planos  │
 │ 4. Señales de Ciclo de Vida (Signals)──► Desacople de efectos secundarios       │
 │ 5. Migraciones con Dependencias      ──► Reversibilidad e integridad relacional │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Lección 1: Arquitectura por "Apps" Aisladas (Vertical Slices)

### El Problema de la Arquitectura Horizontal Típica:
La mayoría de proyectos Node.js agrupan el código por capas técnicas:
- `/controllers` (30 archivos mezclando usuarios, facturas y productos).
- `/models` (30 archivos mezclados).
- `/routes` (30 archivos mezclados).

Si el ERP crece, o si se desea comercializar un módulo por separado (ej: solo el catálogo o solo la facturación), es imposible extraerlo sin romper la mitad del repositorio.

### La Lección de Django (`INSTALLED_APPS`):
En Django, cada funcionalidad de negocio es una **App independiente y autocontenida**:
`src/features/<feature>/`

```text
 src/features/users/
 ├── test/                       ──► Pruebas exclusivas de usuarios
 ├── users.controller.js         ──► Capa HTTP (parsimonia y delegación)
 ├── users.schema.js             ──► Contrato de entrada (Zod / Form Request)
 ├── users.entity.js             ──► Entidad pura de dominio (sin dependencias)
 ├── users.repository.js         ──► Persistencia SQL nativa sobre usr_users
 ├── users.create.use-case.js    ──► Caso de uso aislado (SRP de SOLID)
 └── users.policy.js             ──► Reglas de autorización
```

> **Regla de Oro (AGENTS.md):** *"Todo lo que cambia junto, vive junto"*. Los tests de un feature viven dentro de su carpeta, no en un directorio centralizado.

---

## 3. Lección 2: Seguridad por Defecto (Secure by Default)

### El Peligro del Ecosistema Node.js Convencional:
En Node.js, por defecto un servidor HTTP **no protege nada**:
- No pone cabeceras contra Clickjacking.
- Permite que el navegador adivine el tipo MIME (`MIME sniffing`).
- Permite peticiones infinitas de 100 MB que desbordan la memoria RAM.
- No valida orígenes de peticiones (CORS abierto).

El desarrollador debe acordarse de instalar y configurar múltiples librerías. Si se le olvida una, el sistema sale a producción con brechas de seguridad críticas.

### La Filosofía de Django:
En Django, la seguridad **viene encendida de fábrica**. No hay que pedirla.

### Nuestra Implementación "a Ring Pelado":
1. **Límite Anti-DoS Estricto en TCP:**
   En `src/infrastructure/http/request-body.js`, el stream binario destruye el socket de inmediato si el body supera 1 MB (`MAX_BODY_SIZE = 1024 * 1024`), arrojando HTTP 413.
2. **Cabeceras de Protección Activas en Toda Petición:**
   En `src/infrastructure/http/middlewares/cors.middleware.js`:
   - `X-Frame-Options: DENY` (inmune a Clickjacking).
   - `X-Content-Type-Options: nosniff` (inmune a ejecución de scripts maliciosos por sniffing).
   - `X-XSS-Protection: 0` (estándar moderno que delega en CSP).
3. **CORS Restrictivo para React / Flutter:**
   Rechaza orígenes no autorizados y gestiona peticiones preflight `OPTIONS` con HTTP 204 sin tocar el enrutador.

---

## 4. Lección 3: Permisos Atómicos y Roles Dinámicos (`django.contrib.auth`)

### El Vicio de los Roles Planos ("Role Check Hell"):
Muchos sistemas hacen comparaciones rígidas en el código:
```javascript
if (user.role === 'ADMIN') { ... }
```
¿Qué ocurre si la empresa cliente crea un nuevo rol llamado `SUPERVISOR_VENTAS` que puede ver órdenes pero no anular facturas? Hay que editar 50 archivos de código fuente para poner `if (user.role === 'ADMIN' || user.role === 'SUPERVISOR_VENTAS')`.

### El Patrón Django:
Django desacopla los **Permisos Atómicos** de los **Roles / Grupos**:
- **Permiso Atómico:** Una cadena que describe una acción puntual sobre un recurso:
  - `users:create`
  - `branches:view`
  - `invoices:issue`
  - `invoices:void`
- **Rol / Grupo:** Un contenedor de permisos en la base de datos (`usr_roles` y `usr_user_roles`).

### Especificación de Diseño para el ERP:
En lugar de validar roles por nombre, los middlewares y policies validan capacidades:
```javascript
// Validación desacoplada de permisos:
if (!hasPermission(currentUser, 'invoices:void')) {
  throw Errors.forbidden('No tiene autorización para anular comprobantes fiscales.');
}
```
Esto permite que el administrador del Holding cree roles personalizados desde la base de datos sin necesidad de nuevos despliegues de código.

---

## 5. Lección 4: Señales de Ciclo de Vida (Django Signals)

### El Concepto:
En Django, cuando un modelo cambia de estado, se emiten señales desacopladas:
- `post_save`
- `post_delete`

Cualquier otra parte del sistema puede "escuchar" la señal sin que el módulo principal sepa que existe.

### Nuestra Implementación Nativa:
En lugar de crear dependencias cruzadas entre `users` y un futuro módulo de `notifications`:
- Cuando el caso de uso `users.create` finaliza la transacción SQL, emite un evento a través del `EventBus` nativo (`node:events`):
  `eventBus.emit('user:created', { user, holdingId })`
- Un listener en `src/features/notifications/` escucha y despacha el correo de bienvenida de forma asíncrona.
- El caso de uso de usuario **no sabe ni le importa** si existe un servicio de correo.

---

## 6. Cuadro Comparativo del Cuarteto de Oro Enterprise

| Principio | Django | Laravel | ASP.NET Core | Spring Boot | En Nuestro ERP (Zero-Frameworks) |
|---|---|---|---|---|---|
| **Modularidad** | Pluggable Apps | Modules / Domains | Features / Folders | Maven Modules | `src/features/<feature>/` (Vertical Slices) |
| **Transacciones** | `transaction.atomic()` | `DB::transaction()` | `IDbTransaction` | `@Transactional` | `withTransaction(pool, fn)` |
| **Validación** | Forms / Serializers | Form Requests | FluentValidation / DTO | Bean Validation (JSR-380) | `users.schema.js` (Zod DTOs) |
| **Errores** | Custom Handlers | Exception Handler | RFC 7807 ProblemDetails | `@ControllerAdvice` | `error.middleware.js` (ProblemDetails) |
| **Observabilidad** | Middleware Loggers | Log Channels | Activity / TraceId | MDC / Micrometer | `CorrelationId` / `traceId` en Logger |
| **Seguridad** | Secure by Default | Middlewares | Security Pipeline | Spring Security | Cabeceras nativas OWASP + Anti-DoS |
| **Arquitectura** | MVT / Hexagonal | Clean / MVC | Clean Architecture | Hexagonal (Ports & Adapters) | Hexagonal pura sin frameworks mágicos |
