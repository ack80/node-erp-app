# AGENTS.md

## Propósito del proyecto

Este repositorio es un proyecto de **aprendizaje profundo**, no un producto comercial en producción activa. El objetivo es diseñar, implementar y probar un backend empresarial en **Node.js "a ring pelado"** — es decir, deliberadamente **sin frameworks** (sin Express, NestJS, Fastify, etc.) y sin "magia negra" (sin ORMs con auto-mapeo oculto, sin decoradores mágicos, sin inyección de dependencias vía librerías que ocultan el flujo real).

La meta es entender **qué hace un framework por debajo** antes de volver a depender de uno. Cada capa (HTTP server, router, middlewares, pool de conexiones, contenedor de dependencias) se construye a mano para exponer el mecanismo real.

## Qué SÍ es este proyecto
- Un ejercicio de Clean Architecture / arquitectura por features (vertical slices)
- Un ejercicio de TDD y pirámide de testing completa
- Un ejercicio de DevOps moderno: IaC, GitOps-ready (aunque GitOps en sí no se usa todavía), CI/CD
- Un espacio para entender *por qué* existen los frameworks, construyendo sus partes esenciales manualmente

## Qué NO es este proyecto
- Un producto con SLA de producción real
- Un lugar para instalar frameworks "porque es más rápido" — si una tarea se resuelve más fácil con un framework, ese es exactamente el motivo para NO usarlo aquí
- Sobre-ingeniería porque sí — cada capa/patrón que se agrega debe tener una razón de aprendizaje concreta, no "porque así se hace en empresas grandes"

---

## Arquitectura

**Clean Architecture organizada por features** (vertical slices), no por capas técnicas horizontales.
```
src/
├── bootstrap/ # Contenedor de dependencias, arranque de la app
├── config/ # Configuración (env, logger)
├── features/ # Un folder por dominio de negocio
│ └── <feature>/
│ ├── test/ # Unit/integration tests DE ESTE feature (Vitest)
│ ├── *.service.js
│ └── *.use-case.js
├── infrastructure/ # Adaptadores externos: DB, HTTP server, seguridad
│ └── database/
│ ├── migrations/
│ └── seeds/
└── shared/ # Código transversal: errores, validación, utilidades
```

### Regla de cohesión
> Todo lo que cambia junto, vive junto.

Los tests unitarios/de integración de un feature viven **dentro** de ese feature (`features/<feature>/test/`), no en un `/test` centralizado. `/test` en la raíz es exclusivamente para lo que **cruza features** o prueba el sistema completo (ver sección Testing).

### Sin frameworks — implica
- El servidor HTTP se construye sobre el módulo nativo `http` de Node (o similar), no sobre Express.
- El router es propio (`infrastructure/http/router.js`), no una librería.
- El pool de conexiones a BD se maneja explícitamente (`infrastructure/database/pool.js`), sin ORM que abstraiga las queries.
- La inyección de dependencias es manual, vía el contenedor propio en `bootstrap/container.js` — sin `tsyringe`, `inversify`, ni decoradores.

---

## Stack de Testing

Pirámide completa, cada herramienta en su nivel:

| Herramienta | Qué prueba | Dónde vive | Cuándo corre |
|---|---|---|---|
| **Vitest** | Unit + integration de código | `features/<feature>/test/` | En cada push/PR |
| **Playwright** | E2E — flujos completos multi-feature | `/test/e2e/` | Al mergear a `main` |
| **k6** | Carga / performance contra staging | `/test/load/` | Manual o nightly (`workflow_dispatch` + `schedule`) |
| **OWASP ZAP** | Seguridad — escaneo de vulnerabilidades contra staging | `/test/security/` | Manual o nightly |

k6 y ZAP **nunca** corren en cada PR: requieren un ambiente vivo (staging) y son pesados. Van en workflows separados con trigger manual o programado.

---

## Infraestructura (`infra/`)
```
infra/
├── terraform/
│ ├── modules/ # Módulos reutilizables por servicio de Aiven (mysql, redis, network)
│ ├── environments/ # development/ y production/, cada uno con su propio backend/state
│ └── versions.tf # Providers compartidos
├── ansible/ # Provisión/configuración de servidores propios (ej. serverwct)
└── docker/ # Compose para desarrollo local
```

### Decisiones de infraestructura vigentes
- **Base de datos gestionada:** Aiven (plan free) — MySQL + Redis, administrados 100% vía Terraform.
- **Sin Kubernetes ni GitOps por ahora** — no hay cluster que reconciliar. Se revisará si el proyecto migra a K8s en el futuro.
- **Servidor propio:** `serverwct`, provisionado con Ansible (Docker, usuarios, hardening básico).
- **State de Terraform aislado por entorno** — `development` y `production` nunca comparten backend/state.
- **Secretos nunca en Git** — `terraform.tfvars`, `.env`, y cualquier `.tfstate` están en `.gitignore`. Solo se versionan los `.example`.

---

## Convenciones de nombres y estructura

- `scripts/` (raíz) → solo scripts que operan sobre la **aplicación** (seed, migraciones, build, rollback).
- `infra/scripts/` (si se crea) → solo scripts que operan sobre la **infraestructura** (Terraform, Ansible).
- Carpetas vacías intencionales llevan `.gitkeep`.
- Nombres de archivo sin typos — si detectas un typo en un nombre existente (ej. archivos mal escritos), repórtalo antes de replicarlo en código nuevo.
- `docs/sdlc/` documenta el ciclo de vida completo por fases (001-planning → 007-operation) — cualquier decisión de diseño relevante se documenta ahí, no solo en commits.
- `docs/sdlc/003-design/architectural-lineage/` contiene la **matriz maestra de precedencia histórica (7 Eras)** que fundamenta cada decisión arquitectónica de este backend.

---

## Reglas Obligatorias de Base de Datos y Persistencia

1. **Migraciones Bidireccionales (UP / DOWN) por Lotes:**
   - Toda migración en `src/infrastructure/database/migrations/` requiere obligatoriamente su archivo `.up.sql` y su contraparte `.down.sql` (respetando orden inverso de claves foráneas).
   - El ejecutor (`scripts/migrate.js`) asigna lotes (`batch`). Toda reversión debe ser quirúrgica con `pnpm db:rollback:dev`, **NUNCA borrando tablas ajenas ni haciendo DROPs indiscriminados**.
2. **Semillas Modulares por Entidad (Principio de Responsabilidad Única):**
   - En `src/infrastructure/database/seeds/`, está prohibido crear archivos monolíticos ("sacos de gatos"). Cada entidad posee su propio seeder numerado (`001_org_countries.sql`, `002_org_currencies.sql`, etc.).
   - Todo seed debe ser estrictamente **idempotente** utilizando `ON DUPLICATE KEY UPDATE` o `INSERT IGNORE`.
3. **El Mandamiento Monetario (Precisión Decimal Exacta):**
   - En cualquier tabla de compras, ventas, facturación, impuestos o comisiones, está **terminantemente prohibido usar `FLOAT` o `DOUBLE`**.
   - Los montos financieros se declaran exclusivamente como **`DECIMAL(12, 4)`** o **`DECIMAL(10, 2)`** para prevenir errores de redondeo de coma flotante binaria IEEE 754.
4. **Garantías Transaccionales ACID:**
   - Operaciones de escritura compuestas (que afecten más de una tabla o fila vinculada) deben ejecutarse dentro de transacciones de InnoDB con auto-rollback.

---

## Filosofía de Construcción por Precedencia Técnica Obligatoria

### El Principio Fundamental

**Ningún sistema de software empresarial se construye de forma aleatoria.** Existe un orden de precedencia técnica inviolable que garantiza que cada componente de dominio de negocio que se construya tenga a su disposición, desde el primer milisegundo de su existencia, todas las herramientas de infraestructura que necesita para operar con grado empresarial.

Violarlo produce el síndrome más costoso del software: **deuda técnica estructural** — código de negocio que funciona pero que carece de transacciones ACID, de trazabilidad de errores, de contratos de respuesta normados o de políticas de acceso. Arreglarlo después implica tocar y romper el 100% del código ya escrito.

### La Regla de Precedencia de Dos Niveles

```text
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │ NIVEL 1: INFRAESTRUCTURA DE BASE                                                      │
 │ Runtime HTTP nativo (node:http), Pool de BD, Migraciones Bidireccionales (UP/DOWN)    │
 │ El substrato sin el cual no existe sistema.                                           │
 ├──────────────────────────────────────────────────────────────────────────────────────┤
 │ NIVEL 2: INFRAESTRUCTURA TRANSVERSAL DE RESILIENCIA Y OBSERVABILIDAD                  │
 │ • Gestor Transaccional ACID declarativo (withTransaction)                             │
 │ • Trazabilidad Distribuida (CorrelationId / traceId)                                  │
 │ • Contratos de Error Normados (RFC 7807 / ProblemDetails)                             │
 │ La capa que blinda cada feature de negocio antes de que exista.                      │
 ├──────────────────────────────────────────────────────────────────────────────────────┤
 │ NIVEL 3: FEATURES DE DOMINIO DE NEGOCIO                                               │
 │ auth/ → users/ → organization/ → products/ → orders/ → billing/                      │
 │ Solo se construyen sobre una base de Nivel 1 y Nivel 2 completamente operativa.      │
 ├──────────────────────────────────────────────────────────────────────────────────────┤
 │ NIVEL 4: AUDITORÍA GLOBAL DE CALIDAD Y SEGURIDAD                                      │
 │ Playwright (E2E), k6 (carga / rendimiento), OWASP ZAP (DAST)                         │
 │ Solo se ejecutan sobre sistemas de Niveles 1, 2 y 3 completamente ensamblados.       │
 └──────────────────────────────────────────────────────────────────────────────────────┘
```

### Por qué esta secuencia es infalible y reproducible

1. **Cero dependencias circulares:** Cada hito solo depende de los hitos anteriores. No existe ningún paso que requiera algo que no se haya construido antes.
2. **Cero código reescrito por deuda estructural:** Transacciones, trazabilidad y contratos de error ya existen cuando se escribe la primera línea de un feature de negocio.
3. **Agnóstica del lenguaje o framework:** Esta secuencia aplica idénticamente en Node.js nativo, Go, Rust, Java (Spring Boot), Python (FastAPI) o C# (ASP.NET Core).
4. **Auditable e incontestable en entrevistas de arquitectura:** Cuando un entrevistador de nivel *Bar Raiser* pregunta *"¿cómo diseñarías este sistema desde cero?"*, la respuesta canónica, ordenada e inequívoca de este proyecto es la respuesta correcta y no improvisa.

### Referencia de la Hoja de Ruta por Hitos Numerados

El detalle de cada hito, su estado, criterios de aceptación y linaje arquitectónico están formalizados en:
👉 [`docs/sdlc/004-implement/roadmap-milestones/`](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/004-implement/roadmap-milestones/)

---

## Cómo debe comportarse un agente en este repo

1. **No sugerir frameworks** (Express, NestJS, Prisma, TypeORM, etc.) como solución por defecto — el punto del proyecto es evitarlos. Si un framework parece "la solución obvia", es señal de que hay que implementar esa pieza a mano y documentar el porqué.
2. **Respetar la cohesión por feature** — nuevo código de un feature (incluidos sus tests unitarios) va dentro de `features/<feature>/`, no en carpetas centralizadas.
3. **Seguir el linaje de las 7 Eras** (`docs/sdlc/003-design/architectural-lineage/`) para cualquier abstracción nueva (Ports & Adapters, ABAC, RFC 7807, etc.).
4. **Respuestas de error normadas** — Todo error HTTP 4xx/5xx debe emitirse conforme a la especificación **RFC 7807 (`ProblemDetails`)** con `Content-Type: application/problem+json` y `traceId`.
5. **No mezclar entornos de Terraform** — cualquier cambio de infra debe declarar explícitamente si es para `development` o `production`, nunca aplicar sin especificar.
6. **Nunca commitear secretos** — API tokens, passwords, `.tfvars` reales van siempre ignorados por Git.
7. **Priorizar explicabilidad sobre brevedad** — dado que el objetivo es aprender, preferir código explícito y comentado sobre código "elegante" pero opaco.
8. **Trazabilidad de Inspiración Arquitectónica Obligatoria** — Todo nuevo archivo de código, clase, helper o migración debe declarar en su cabecera JSDoc o comentario SQL explícitamente a qué **Era y Tecnología de Inspiración** corresponde según la matriz de linaje (`docs/sdlc/003-design/architectural-lineage/`), por ejemplo: `Inspiración: Era 002 (SAP ABAP - LUW / Mandante)` o `Inspiración: Era 005 (Laravel withTransaction)`.

