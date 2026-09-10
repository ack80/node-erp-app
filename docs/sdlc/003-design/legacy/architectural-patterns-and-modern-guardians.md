# Guía y Plan Maestro de Diseño: La Alianza de Veteranos y Nuevos Titanes (Rails, FastAPI y Node.js Nativo)

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Documentos del Compendio** | `architectural-patterns-and-laravel-inspirations.md`, `architectural-patterns-and-aspnet-inspirations.md`, `architectural-patterns-and-spring-inspirations.md`, `architectural-patterns-and-django-inspirations.md` |
| **Objetivo** | Documentar los aportes inmortales de **Ruby on Rails** (padre de la web moderna) y las innovaciones de alto rendimiento de los nuevos aliados: **FastAPI** y **Node.js Nativo** |
| **Entorno de Ejecución** | Node.js (ESM Nativo), MySQL 2 / MariaDB, Docker, Vitest |
| **Filosofía** | Honrar a los generales que vencieron la entropía y empoderarse con los jóvenes titanes de la concurrencia asíncrona |

---

## 1. Justificación Histórica: La Evolución del Backend

La arquitectura de software no nació en el vacío: es el resultado de batallas campales contra la complejidad, el acoplamiento y el desperdicio de recursos.

- **Ruby on Rails (2004):** El gran héroe que derrotó la entropía de los monolitos burocráticos de XML y estableció las leyes que hoy rigen la web.
- **FastAPI (2018):** El joven campeón que unificó el tipado moderno, la validación en tiempo de ejecución y los contratos OpenAPI sin duplicidad de código.
- **Node.js Nativo (2009-Presente):** El titán del Event Loop asíncrono y la I/O no bloqueante, capaz de sostener decenas de miles de conexiones concurrentes con una fracción de la memoria de los modelos clásicos.

Este documento consolida las lecciones definitivas de ambos mundos para nuestro ERP Zero-Frameworks.

```text
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                      VETERANOS HEROICOS vs JÓVENES TITANES                             │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ 💎 RUBY ON RAILS (El Gran Patriarca):                                                  │
 │ • Convención sobre Configuración (CoC) ──► Nombres predecibles, cero XMLs              │
 │ • Paternidad de Migraciones (UP / DOWN)──► La base de datos tratada como código vivo    │
 │ • Skinny Controllers, Fat Domain       ──► Controladores que solo coordinan tráfico    │
 │ • Cultura de Testing TDD de Raíz       ──► El test no es accesorio: es ciudadano #1   │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ ⚡ FASTAPI & NODE.JS (Los Guerreros de Nueva Generación):                              │
 │ • Fuente Única de Verdad (Zod / Types) ──► Contrato, validación y OpenAPI unificados   │
 │ • I/O No Bloqueante & Event Loop       ──► Cero esperas de hilo en sockets de red      │
 │ • Inyección Funcional y Componible     ──► Dependencias transparentes sin IoC opaca    │
 │ • Streams Binarios con Backpressure    ──► Cero desbordes de memoria RAM en uploads    │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Parte I: Las Lecciones Inmortales de Ruby on Rails

### 2.1. Convención sobre Configuración (Convention over Configuration - CoC)
Antes de Rails, para conectar una tabla a un objeto se requerían cientos de líneas de configuración en archivos XML o esquemas imperativos. 
Rails demostró que si estableces **convenciones universales**, la configuración se reduce al mínimo:
- Si el feature es `users`, sus archivos son `users.schema.js`, `users.entity.js`, `users.repository.js`.
- Si la tabla es `org_branches`, representa la entidad `Branch`.
- Si el prefijo es `org_`, pertenece a la organización; si es `usr_`, al usuario; si es `prd_`, al catálogo.

### 2.2. La Base de Datos como Código Versionado (UP / DOWN)
Rails inventó la disciplina moderna de migraciones con `rake db:migrate` y `rake db:rollback`. La base de datos nunca se toca a mano: se versiona en Git con cambios atómicos bidireccionales.
- Nuestro ejecutor en `scripts/migrate.js` y `scripts/rollback.js` con soporte de lotes (`batch`) honra este legado al 100%.

### 2.3. "Skinny Controllers, Rich Domain" (Controladores Enjutos)
Un controlador de Rails solo tiene 4 líneas de código: recibe el request, delega en el modelo/servicio y responde. 
En nuestro ERP:
- `users.controller.js` no calcula hashes, no valida contraseñas y no sabe qué tabla SQL existe. Solo lee el body TCP, valida contra el schema Zod, llama al Caso de Uso y emite HTTP 201.

### 2.4. La Cultura TDD como ADN
Rails fue el primer framework en autogenerar la suite de pruebas desde el comando de creación del proyecto. En nuestro ERP:
- Nada va a `main` sin su suite completa en Vitest pasando al 100% en verde (actualmente 35 tests, 0 fallos).

---

## 3. Parte II: Las Innovaciones de Vanguardia de FastAPI y Node.js

### 3.1. FastAPI: Un Solo Esquema para Todo (Single Source of Truth)
En arquitecturas antiguas, el desarrollador definía la entidad en el ORM, luego definía el validador en el controlador y luego escribía el archivo Swagger en YAML. Si un campo cambiaba de nombre, tenía que acordarse de cambiar los 3 archivos.

**La lección de FastAPI (Pydantic / Zod):**
En nuestro módulo `users/users.schema.js`, el esquema Zod:
1. Valida el JSON de entrada en tiempo de ejecución.
2. Infiere los tipos de datos de TypeScript / JSDoc para el editor.
3. Se transforma automáticamente en especificación OpenAPI / Swagger sin escribir YAML manual.

### 3.2. Node.js: Concurrencia Masiva No Bloqueante (Event Loop)
Los frameworks tradicionales (Rails, Django, Spring y ASP.NET de primera generación) asignaban un **hilo del sistema operativo por cada petición HTTP**. Si 5,000 conexiones esperaban una query de base de datos, el servidor colapsaba al intentar mantener 5,000 hilos pesados en memoria.

**La arquitectura de Node.js:**
- Un solo hilo de ejecución de JavaScript orquestado por `libuv`.
- Mientras MariaDB procesa una consulta pesada o un cliente envía datos lentamente, el Event Loop atiende a otras 10,000 conexiones en ese mismo microsegundo.
- **Regla estricta del ERP:** Cero llamadas sincrónicas bloqueantes (`fs.readFileSync`) dentro del ciclo de peticiones HTTP.

### 3.3. FastAPI: Inyección de Dependencias Componible (`Depends`)
En lugar de contenedores de inyección pesados con reflexión mágica que ocultan los errores hasta tiempo de ejecución, FastAPI popularizó dependencias que son simples funciones componibles.
- En nuestro ERP, `src/bootstrap/container.js` implementa exactamente este patrón: cada módulo es una fábrica pura (`makeUserModule(db)`), permitiendo rastrear el flujo de dependencias con clic derecho "Go to Definition" sin magia oculta.

### 3.4. Node.js: Manejo de Streams y Backpressure
Cargar un archivo grande o una petición HTTP completa en memoria RAM de golpe es una receta segura para caídas por *Out of Memory* (OOM).
- En `src/infrastructure/http/request-body.js`, leemos el flujo binario TCP en fragmentos (`chunks`). Si el tráfico supera 1 MB, destruimos el socket de inmediato con `req.destroy()`, protegiendo la memoria del servidor antes de que se agote.

---

## 4. El Panteón Completo de Referencia del ERP

| Pionero / Aliado | Rol Histórico | Qué aporta a nuestro ERP Zero-Frameworks |
|---|---|---|
| 💎 **Ruby on Rails** | El Gran Patriarca | Convención sobre Configuración, Paternidad de Migraciones UP/DOWN, Controladores Enjutos, Cultura TDD. |
| 🐍 **Django** | El General de la Seguridad | Vertical Slices (Apps Aisladas), Seguridad "Secure-by-Default", Permisos Atómicos desacoplados de roles planos. |
| 🐘 **Laravel** | El Maestro de la Ergonomía | `withTransaction()` declarativo, Form Requests con Zod, Policies de sucursal, Seeds Modulares independientes. |
| 🔷 **ASP.NET Core** | El Estandarte del Rigor | Formato universal RFC 7807 (`ProblemDetails`), `CorrelationId` (`traceId`) punto a punto en logs y SQL, Dual Health Checks (`live` vs `ready`). |
| ☕ **Spring Boot** | El Veterano de Guerra | Puertos y Adaptadores (Hexagonal pura: UseCase desacoplado de MariaDB), Resiliencia con Circuit Breaker, Auditoría Append-Only. |
| ⚡ **FastAPI** | El Campeón de los Tipos | Esquemas únicos para validación y OpenAPI (Zod), Inyección de dependencias funcional y transparente. |
| 🟢 **Node.js Nativo** | El Titán del Event Loop | I/O asíncrona no bloqueante, Streams TCP con límite anti-DoS y latencias ultra bajas a $0 de costo de licencias. |
