# Matriz Maestra de Linaje y Precedencia Histórica de la Arquitectura (1950 - 2026)

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Ubicación** | `docs/sdlc/003-design/architectural-lineage/` |
| **Objetivo** | Trazabilidad evolutiva formal: problemas de ingeniería resueltos, precedencia histórica e implementación nativa en `node-erp-app` |
| **Enfoque** | Ingeniería de Software Rigurosa (Taxonomía técnica, fechas, mecanismos y contratos) |

---

## 1. Justificación y Propósito del Linaje Arquitectónico

Un sistema ERP (*Enterprise Resource Planning*) gestiona activos fiscales, dinero fiduciario, inventario físico, auditoría regulatoria y múltiples personas jurídicas concurrentes.

Cometer el error de construir un ERP en Node.js utilizando únicamente tutoriales o recetas superficiales de frameworks conduce a:
1. Pérdida de precisión monetaria por coma flotante binaria IEEE 754.
2. Inconsistencias transaccionales por fallos a mitad de escrituras relacionales.
3. Permisos rígidos incapaces de aislar sucursales y holdings.
4. Acoplamiento del dominio a librerías de terceros efímeras.

Este compendio documenta **7 Eras Tecnológicas Formales**, analizando qué problema de ingeniería resolvió cada pionero, quién continuó su evolución histórica y cómo se aplica hoy de manera nativa y comprobable en nuestro repositorio.

---

## 2. Mapa Cronológico de las 7 Eras de la Arquitectura

```text
 ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                     LÍNEA DE TIEMPO EVOLUTIVA DE LA ARQUITECTURA (1950 - 2026)                   │
 ├──────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ ERA 001 (1950 - 1970) Fundacional: Persistencia, Aritmética Monetaria y Garantías ACID           │
 │           • IBM Mainframes (System/360, CICS) ──► Garantías ACID, persistencia confiable        │
 │           • COBOL (1959)                      ──► Aritmética decimal exacta (cero IEEE 754)      │
 │           • Fortran (1957)                    ──► Tipado primitivo y eficiencia computacional   │
 │           • Prolog (1972)                     ──► Deducción lógica declarativa                  │
 ├──────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ ERA 002 (1970 - 1995) Paradigmas de Objetos, ERPs Corporativos y RAD de Escritorio               │
 │           • Smalltalk (1972)                  ──► Patrón MVC y Cultura TDD (Kent Beck / SUnit)   │
 │           • SAP ABAP (1980 / 1992)            ──► Mandante Multi-Tenant, SAP LUW, DDIC          │
 │           • Erlang / OTP (1986)               ──► Aislamiento y filosofía "Let it Crash"        │
 │           • dBASE (1979) / FoxPro (1989)      ──► Formato .DBF e indexación Rushmore masiva      │
 │           • PowerBuilder (1991)               ──► El DataWindow (Unificación Datos/UI/Validación)│
 │           • Visual Basic (1991)               ──► Programación guiada por eventos (Event-Driven) │
 │           • Delphi (1995)                     ──► Arquitectura transaccional y raíz de TypeScript│
 ├──────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ ERA 003 (1995 - 2005) Desacoplamiento Empresarial, Puertos y Resiliencia Bancaria              │
 │           • Java J2EE / Spring Framework      ──► Puertos y Adaptadores (Arquitectura Hexagonal) │
 │           • Spring Cloud / Netflix Hystrix    ──► Circuit Breaker ante fallos de APIs externas   │
 │           • Spring Data Envers                ──► Auditoría inmutable (Append-Only)              │
 ├──────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ ERA 004 (2004 - 2006) Convención sobre Configuración y Seguridad Web por Defecto                 │
 │           • Ruby on Rails (2004)              ──► Convention over Configuration y Migraciones    │
 │           • Django (2005)                     ──► Vertical Slices (Apps) y Secure-by-Default     │
 ├──────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ ERA 005 (2010 - 2016) Composición de Middlewares, Ergonomía y Observabilidad de Grado Bancario  │
 │           • Express.js (2010)                 ──► Tubería de Middlewares y composición funcional │
 │           • Laravel (2011)                    ──► withTransaction() declarativo y Policies       │
 │           • ASP.NET Core (2016)               ──► RFC 7807 (ProblemDetails), CorrelationId       │
 ├──────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ ERA 006 (2009 - 2018) Asincronía No Bloqueante, Tipado Unificado y Control ABAC                 │
 │           • Node.js Nativo (2009)             ──► Event Loop no bloqueante y Streams Backpressure│
 │           • NIST SP 800-162 (ABAC)            ──► Autorización por atributos contextuales        │
 │           • NestJS (2017)                     ──► Taxonomía estricta (Guards, Pipes, Filters)    │
 │           • FastAPI (2018)                    ──► Fuente única de verdad para DTOs y OpenAPI     │
 ├──────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ ERA 007 (2012 - 2022) Simplicidad Radical, Extractores de Tipos y Coste Cero                     │
 │           • Go (Golang, 2012)                 ──► Cero magia oculta (Explicit > Clever), Context │
 │           • Rust / Tokio / Axum (2021)        ──► Type Extractors y estados ilegales inmutables  │
 └──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz de Precedencia y Trazabilidad de Ingeniería

| Año | Tecnología Pionera | Problema de Ingeniería Resuelto | Evolución Histórica | Implementación en `node-erp-app` |
|:---:|---|---|---|---|
| **1959** | **COBOL** | Pérdida de centavos en cálculos con coma flotante binaria. | SQL `DECIMAL` / Tipos de moneda en ERPs. | `DECIMAL(12, 4)` en MariaDB; cero tipos `FLOAT` en cálculos. |
| **1964** | **IBM System/360 / CICS** | Corrupción de registros tras cortes de energía o caídas. | Estándar ACID de Jim Gray / Motores relacionales. | Transacciones ACID obligatorias con InnoDB en escrituras. |
| **1972** | **Smalltalk** | Acoplamiento desordenado entre datos y visualización. | MVC en Smalltalk $\to$ Web MVC $\to$ Clean Architecture. | Separación: Schema $\to$ Entity $\to$ Repository $\to$ Controller. |
| **1976** | **Kent Beck (SUnit)** | Regresiones continuas en software en evolución. | SUnit $\to$ JUnit $\to$ NUnit $\to$ Vitest. | TDD nativo: 35 pruebas unitarias/integración en verde. |
| **1980** | **SAP ABAP** | Monolitos ERP incapaces de aislar empresas en una misma BD. | Modelo de Dominio ERP y el concepto de *Mandante* (*Client*). | Jerarquía Multi-Tenant: `Holding -> Company -> Branch`. |
| **1986** | **Erlang / OTP** | Caídas en cascada por código defensivo paranoico. | Filosofía *"Let it Crash"* $\to$ Contenedores efímeros. | Fail-Fast en `env.js` y destrucción de sockets en abusos. |
| **1989** | **FoxPro (Rushmore)** | Cuellos de botella en lectura LAN de registros. | Algoritmos de mapas de bits e indexación compuesta. | Índices B-Tree compuestos en claves foráneas y búsquedas. |
| **1991** | **PowerBuilder** | Fricción y duplicación entre Query, Validación y UI. | Componente DataWindow $\to$ React Query / Zod DTOs. | Esquemas Zod que unifican contrato de entrada y validación. |
| **1991** | **Visual Basic** | Bucle procedural infinito para capturar entradas de usuario.| Programación guiada por eventos (`Event-Driven`). | `EventEmitter` nativo (`node:events`) para desacoplar tareas. |
| **1995** | **Delphi** | Sobrecarga de frameworks lentos en redes lentas. | Código compilado rápido y datasets optimizados. | `mysql2` nativo sin capas ORM opacas interpuestas. |
| **2003** | **Spring Framework** | Acoplamiento rígido a librerías de infraestructura. | Arquitectura Hexagonal (Puertos y Adaptadores). | UseCases puros que reciben Repositorios abstractos. |
| **2004** | **Ruby on Rails** | Fatiga de configuración XML y mutación manual de BD. | *Convention over Configuration* y Migraciones UP/DOWN. | Convenciones estrictas de nombres y `scripts/migrate.js`. |
| **2005** | **Django** | Código espagueti horizontal y brechas comunes OWASP. | *Pluggable Apps* y seguridad por defecto (*Secure by Default*). | *Vertical Slices* (`features/<f>/`) y cabeceras de seguridad. |
| **2009** | **Node.js Nativo** | Agotamiento de memoria RAM por hilos bloqueados. | I/O asíncrona no bloqueante sobre el Event Loop. | Manejo de peticiones sobre streams TCP con backpressure. |
| **2010** | **Express.js** | Falta de un estándar para encadenar lógica HTTP previa. | Pipeline secuencial de Middlewares (`req, res, next`). | Composición funcional de middlewares en pipeline nativo. |
| **2011** | **Laravel** | Repetición de bloques `try/catch/rollback` en transacciones.| `DB::transaction(callback)` y Form Requests. | Helper `withTransaction(pool, fn)` con auto-rollback. |
| **2012** | **Go (Golang)** | Cajas negras de decoradores mágicos y reflection oculta. | Código explícito (*Explicit > Clever*) y `context.Context`. | Inyección manual en `container.js` y cancelación contextual. |
| **2014** | **NIST (ABAC)** | Incapacidad de RBAC plano de validar contexto y pertenencia.| Control de acceso basado en atributos dinámicos. | Policies puras evaluando (`holdingId`, `companyId`, `branchId`).|
| **2016** | **ASP.NET Core** | Caos de formatos de error arbitrarios entre endpoints. | Norma internacional RFC 7807 (`ProblemDetails`) y Tracing. | Respuestas `application/problem+json` y `traceId` en logs. |
| **2017** | **NestJS** | Desorden conceptual en aplicaciones TypeScript grandes. | Taxonomía estricta de responsabilidades (Guards/Pipes). | Separación estricta de Roles: Controller, Schema, Repo, UseCase.|
| **2018** | **FastAPI** | Desfase inevitable entre validadores de código y Swagger. | Pydantic: única fuente de verdad para runtime y OpenAPI. | Zod infiriendo tipos y validando contratos sin redundancia. |
| **2021** | **Rust (Axum)** | Fugas de memoria sutiles y estados de dominio inválidos. | *Type Extractors* y *Make Illegal States Unrepresentable*. | Extracción previa al Caso de Uso y Entidades autovalidadas. |

---

## 4. Índice de Documentos de la Serie

1. [**`001_era_foundational_data_and_transactions_1950_1970.md`**](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/003-design/architectural-lineage/001_era_foundational_data_and_transactions_1950_1970.md): Mainframes IBM, COBOL, Fortran, Prolog y garantías ACID.
2. [**`002_era_object_and_desktop_rad_paradigms_1970_1995.md`**](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/003-design/architectural-lineage/002_era_object_and_desktop_rad_paradigms_1970_1995.md): Smalltalk, SAP ABAP, Erlang/OTP, dBASE, FoxPro, PowerBuilder, Visual Basic y Delphi.
3. [**`003_era_enterprise_mvc_and_resilience_1995_2005.md`**](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/003-design/architectural-lineage/003_era_enterprise_mvc_and_resilience_1995_2005.md): Spring Framework, Puertos y Adaptadores, Circuit Breakers y Auditoría Inmutable.
4. [**`004_era_web_convention_and_security_2004_2006.md`**](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/003-design/architectural-lineage/004_era_web_convention_and_security_2004_2006.md): Ruby on Rails, Django, Convención sobre Configuración y Vertical Slices.
5. [**`005_era_developer_ergonomics_and_contracts_2010_2016.md`**](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/003-design/architectural-lineage/005_era_developer_ergonomics_and_contracts_2010_2016.md): Express.js, Laravel, ASP.NET Core, RFC 7807 y Trazabilidad Distribuida.
6. [**`006_era_asynchronous_io_and_single_truth_2009_2018.md`**](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/003-design/architectural-lineage/006_era_asynchronous_io_and_single_truth_2009_2018.md): Node.js Nativo, ABAC, NestJS y FastAPI.
7. [**`007_era_low_overhead_and_type_extractors_2012_2022.md`**](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/003-design/architectural-lineage/007_era_low_overhead_and_type_extractors_2012_2022.md): Go (Cero Magia / Context) y Rust Axum (Type Extractors y Coste Cero).
