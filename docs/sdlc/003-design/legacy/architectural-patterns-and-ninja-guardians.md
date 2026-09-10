# Guía y Plan Maestro de Diseño: Los Ninjas del Bajo Nivel — Lecciones de Simplicidad Radical, Tipos y Rendimiento (Go y Rust)

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Documentos del Compendio** | `...-laravel-inspirations.md`, `...-aspnet-inspirations.md`, `...-spring-inspirations.md`, `...-django-inspirations.md`, `...-modern-guardians.md` |
| **Objetivo** | Documentar los principios de ingeniería de los dos clanes ninja del bajo nivel: **Go (Gin / Chi / Stdlib)** y **Rust (Axum / Actix-web)** |
| **Entorno de Ejecución** | Node.js (ESM Nativo), MySQL 2 / MariaDB, Docker, Vitest |
| **Filosofía** | Cero magia oculta, errores explícitos, abstracciones de coste cero e invulnerabilidad en memoria |

---

## 1. Justificación: Por qué Mirar a Go y Rust en un ERP Node.js

Cuando los sistemas empresariales escalan a millones de transacciones por segundo o deben sobrevivir a auditorías de seguridad implacables, los desarrolladores de élite miran a dos lenguajes diseñados para la guerra de trincheras:

- **Go (Golang):** Diseñado en Google para desterrar la sobre-ingeniería. Enseña que **el código explícito, sin magia y sin decoradores oscuros es el código más fácil de mantener durante 20 años**.
- **Rust:** Diseñado para alcanzar el rendimiento bruto de C/C++ pero con **garantía matemática de seguridad en memoria y ausencia de condiciones de carrera** (*Fearless Concurrency*).

Al construir nuestro ERP en Node.js "a ring pelado", adoptamos estas lecciones para mantener el código ligero, predecible y blindado contra estados corruptos.

```text
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                      EL CONSEJO NINJA: GO vs RUST                                      │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ 🐹 GO (El Clan de la Simplicidad Radical):                                             │
 │ • Cero Magia Oculta (Explicit > Clever) ──► Todo se pasa como argumento visible        │
 │ • Errores como Valores de 1ª Clase     ──► Manejo predecible, cero try/catch ciego     │
 │ • Patrón Context (ctx)                 ──► Timeouts, cancelación y metadata en vuelo   │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ 🦀 RUST (El Clan de la Inmutabilidad y Coste Cero):                                    │
 │ • Patrón Extractor de Axum (FromRequest)──► Extracción y validación antes del handler  │
 │ • Abstracciones de Coste Cero          ──► Máxima modularidad con mínimo uso de RAM    │
 │ • Make Illegal States Unrepresentable  ──► Entidades donde es imposible violar reglas  │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Parte I: Las Lecciones Ninja de Go (Golang)

### 2.1. Filosofía "Cero Magia" (Explicit is Better than Clever)
En muchos frameworks (NestJS, Spring, Angular), el flujo del código desaparece detrás de decoradores (`@Injectable()`, `@Autowired`, `@UseGuards()`). Si algo falla, el desarrollador tiene que adivinar qué librería oculta interceptó la llamada.

**La lección de Go:**
- En Go, las dependencias se pasan de forma **explícita y manual**.
- En nuestro ERP, `src/bootstrap/container.js` sigue este dogma al 100%:
  ```javascript
  // Cero decoradores, cero magia oculta:
  const userRepository = createUserRepository(dbPool);
  const createUserUseCase = createCreateUserUseCase({ userRepository, passwordHasher });
  const userController = createUserController({ createUserUseCase });
  ```
- Si un nuevo programador abre el repositorio, solo tiene que hacer clic derecho "Go to Definition" para ver exactamente qué función llama a qué objeto.

### 2.2. Errores como Valores de Primera Clase
En Go no existen excepciones invisibles que explotan en lugares imprevistos: toda función retorna `(result, err)` explícitamente.

**Aplicación en nuestro ERP:**
- En lugar de arrojar `throw new Error()` genéricos que colapsen el proceso, clasificamos los errores en:
  1. **Errores Operacionales (`AppError`):** Reglas de negocio violadas (correo duplicado, sucursal inactiva). Son valores conocidos y controlados.
  2. **Errores de Programación (Bugs no controlados):** Interceptados en el último anillo de la cebolla por el `errorHandler`.

### 2.3. El Patrón `Context` (`context.Context`)
En Go, toda petición HTTP viaja con un `ctx` que transporta:
1. **Cancelación por Timeout:** Si el cliente corta la conexión en su navegador, el servidor detecta que el contexto se canceló y aborta la query SQL a MariaDB de inmediato, liberando la CPU del servidor.
2. **Metadata en Vuelo:** El `traceId` y la transacción activa viajan en el contexto.

**Aplicación en nuestro Router:**
Nuestro router nativo pasa el contenedor y contexto de forma limpia:
`await router.handle(req, res, context);`

---

## 3. Parte II: Las Lecciones Ninja de Rust (Axum & Actix)

### 3.1. El Patrón "Extractor" de Axum (`FromRequest`)
En Axum (el framework web oficial del motor asíncrono Tokio en Rust), la firma de una función describe exactamente qué necesita:
`async fn create_user(Json(payload): Json<CreateUserDto>, State(pool): State<DbPool>)`

Si los datos no cumplen la estructura en el milisegundo en que llegan por el socket, el compilador y el runtime abortan la petición **antes de que el código de negocio sea ejecutado**.

**Aplicación en nuestro ERP:**
En `users.controller.js`:
```javascript
// 1. Extractor TCP (Stream a Buffer)
const rawBody = await parseJsonBody(req);

// 2. Extractor de Validación de Contrato (Zod)
const validatedInput = createUserSchema.parse(rawBody);

// 3. Dominio puro (Solo se ejecuta si los extractores tuvieron éxito)
const user = await createUserUseCase.execute(validatedInput);
```

### 3.2. Abstracciones de Coste Cero (Zero-Cost Abstractions)
En Rust, la modularidad y la división en funciones y tipos no agrega sobrecarga de procesamiento en tiempo de ejecución.

**Aplicación en nuestro ERP en Node.js:**
- Evitamos middlewares que hagan operaciones inútiles (como clonar objetos gigantes o instanciar clases innecesarias).
- Nuestro enrutador artesanal (`createRouter`) utiliza una tabla hash nativa de JavaScript (`Map`), con resolución de rutas en tiempo constante **$O(1)$** sin recorrer expresiones regulares complejas.
- Las respuestas JSON se serializan directamente al socket TCP con `sendJson(res, 201, data)` sin capas intermedias.

### 3.3. "Hacer los Estados Ilegales Inrepresentables" (Make Illegal States Unrepresentable)
En Rust, el sistema de tipos algebraicos y enums estrictos hace que sea imposible que un dato exista en un estado contradictorio.

**Aplicación en nuestras Entidades de Dominio (`users.entity.js`):**
- La entidad `UserEntity` no es un simple objeto plano `{}` sin reglas.
- Su constructor valida que `holdingId`, `email` y `name` existan obligatoriamente.
- Su método `toPublicJSON()` garantiza matemáticamente que el campo `passwordHash` **jamás** se escape hacia el cliente HTTP en una respuesta JSON.

---

## 4. El Panteón Legendario de la Arquitectura del ERP

Con este documento, el compendio de arquitectura de `node-erp-app` queda formalmente cerrado con los 8 grandes sistemas de la historia de la computación:

| Clan | Pionero / Framework | El Gran Aporte al ERP |
|---|---|---|
| 💎 **El Patriarca** | **Ruby on Rails** | Convención sobre Configuración, Paternidad de Migraciones UP/DOWN, TDD como cultura. |
| 🐍 **El Guardián** | **Django** | Vertical Slices (Apps Pluggables), Seguridad Secure-by-Default (OWASP), Permisos Atómicos. |
| 🐘 **El Ergónomo** | **Laravel** | `withTransaction()` declarativo, Form Requests con Zod, Policies de sucursal, Seeds Modulares. |
| 🔷 **El Riguroso** | **ASP.NET Core** | Formato universal RFC 7807 (`ProblemDetails`), `CorrelationId` (`traceId`) punto a punto, Dual Health Checks. |
| ☕ **El Veterano** | **Spring Boot** | Puertos y Adaptadores (Hexagonal pura: Dominio desacoplado de MySQL), Circuit Breaker ante el SRI, Auditoría Append-Only. |
| ⚡ **El Tipado** | **FastAPI** | Fuente única de verdad para validación y contratos OpenAPI (Zod), Inyección funcional. |
| 🟢 **El Asíncrono** | **Node.js Nativo** | Event Loop no bloqueante, Streams TCP con límite anti-DoS de memoria y coste de licencias $0. |
| 🐹 **El Explícito** | **Go (Golang)** | Cero magia oculta (Explicit > Clever), Errores como valores de 1ª clase, Context Pattern. |
| 🦀 **El Implacable**| **Rust (Axum)** | Patrón Extractor de peticiones, Abstracciones de coste cero, Estados ilegales inrepresentables. |
