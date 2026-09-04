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

- `scripts/` (raíz) → solo scripts que operan sobre la **aplicación** (seed, migraciones, build).
- `infra/scripts/` (si se crea) → solo scripts que operan sobre la **infraestructura** (Terraform, Ansible).
- Carpetas vacías intencionales llevan `.gitkeep`.
- Nombres de archivo sin typos — si detectas un typo en un nombre existente (ej. archivos mal escritos), repórtalo antes de replicarlo en código nuevo.
- `docs/sdlc/` documenta el ciclo de vida completo por fases (001-planning → 007-operation) — cualquier decisión de diseño relevante se documenta ahí, no solo en commits.

---

## Cómo debe comportarse un agente en este repo

1. **No sugerir frameworks** (Express, NestJS, Prisma, TypeORM, etc.) como solución por defecto — el punto del proyecto es evitarlos. Si un framework parece "la solución obvia", es señal de que hay que implementar esa pieza a mano y documentar el porqué.
2. **Respetar la cohesión por feature** — nuevo código de un feature (incluidos sus tests unitarios) va dentro de `features/<feature>/`, no en carpetas centralizadas.
3. **No mezclar entornos de Terraform** — cualquier cambio de infra debe declarar explícitamente si es para `development` o `production`, nunca aplicar sin especificar.
4. **Nunca commitear secretos** — API tokens, passwords, `.tfvars` reales van siempre ignorados por Git.
5. **Priorizar explicabilidad sobre brevedad** — dado que el objetivo es aprender, preferir código explícito y comentado sobre código "elegante" pero opaco.

