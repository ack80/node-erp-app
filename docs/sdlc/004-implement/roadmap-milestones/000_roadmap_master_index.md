# Hoja de Ruta Maestra de Implementación (Master Roadmap Index)

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 004-implement |
| **Ubicación** | `docs/sdlc/004-implement/roadmap-milestones/` |
| **Principio Rector** | **"Primero las Medias, Después los Zapatos"** (Precedencia Estricta de Infraestructura antes de Features) |
| **Estado General** | En Ejecución (Fase 001 completada al 100%, Fase 002 lista para iniciar) |

---

## 1. Justificación de la Estructura Modular por Hitos

Para evitar archivos monolíticos inmanejables ("sacos de gatos") y mantener una **trazabilidad evolutiva estilo migraciones**, la hoja de ruta se desacopla en hitos numerados secuenciales:

```text
docs/sdlc/004-implement/roadmap-milestones/
├── 000_roadmap_master_index.md                         ← Este documento (Brújula global y estado de avance)
├── 001_milestone_core_http_and_database_runtime.md     ← Base HTTP nativa, Router O(1), Docker MariaDB, Migrador UP/DOWN
├── 002_milestone_transversal_medias_infrastructure.md  ← withTransaction, ProblemDetails (RFC 7807), CorrelationId
├── 003_milestone_iam_authentication_and_policies.md    ← Feature auth/, JWTs HttpOnly, Policies ABAC
├── 004_milestone_users_refactor_and_hardening.md       ← Refactor de users/ conectado a medias y transactor
├── 005_milestone_organization_and_multitenancy.md      ← Feature organization/ (Holdings, Filiales SRI, Sucursales)
├── 006_milestone_catalog_and_inventory.md              ← Feature products/ (Kardex, stock atómico, precios decimales)
├── 007_milestone_orders_and_outbox_transactions.md    ← Feature orders/ (Transacciones compuestas, outbox pattern)
├── 008_milestone_billing_and_fiscal_invoices.md        ← Feature billing/ (Facturación SRI Ecuador, retenciones)
└── 009_milestone_end_to_end_verification_and_load.md   ← Playwright E2E, k6 carga, ZAP DAST
```

---

## 2. Tablero de Control de Precedencias y Estado

| Hito | Nombre del Hito | Clasificación | Precedencia Obligatoria | Estado |
|:---:|---|:---:|---|:---:|
| **001** | Runtime Base HTTP, DB & Migraciones | 🧦 Medias (Capa 1) | Ninguna (Génesis del repo) | ✅ **COMPLETADO (100%)** |
| **002** | Infraestructura Transversal de Resiliencia | 🧦 Medias (Capa 2) | Requiere Hito 001 | ⏳ **SIGUIENTE A EJECUTAR** |
| **003** | Módulo IAM (`auth/`) & Policies ABAC | 👞 Zapatos (Identidad) | Requiere Hito 002 | 📋 Planificado |
| **004** | Enlace y Hardening de `users/` | 👞 Zapatos (Usuarios) | Requiere Hito 003 | 📋 Planificado |
| **005** | Módulo Jerárquico `organization/` | 👞 Zapatos (Multi-Tenant)| Requiere Hito 003 y 004 | 📋 Planificado |
| **006** | Catálogo e Inventario (`products/`) | 👞 Zapatos (Inventario) | Requiere Hito 005 | 📋 Planificado |
| **007** | Núcleo Comercial Transaccional (`orders/`) | 👞 Zapatos (Ventas) | Requiere Hito 006 | 📋 Planificado |
| **008** | Facturación Electrónica SRI (`billing/`) | 👞 Zapatos (Fiscal) | Requiere Hito 007 | 📋 Planificado |
| **009** | Pirámide E2E, Carga y Seguridad DAST | 🛡️ Auditoría Global | Requiere Hitos 001 - 008 | 📋 Planificado |

---

## 3. La Regla de Precedencia: "Las Medias antes que los Zapatos"

Ningún feature de negocio (`auth/`, `organization/`, `orders/`) puede crearse sin que las herramientas transversales que utiliza estén probadas y listas en `shared/` o `infrastructure/`:

```text
 [001: Runtime & DB Pool]
           │
           ▼
 [002: LAS MEDIAS TRANSVERSALES] ──► withTransaction(pool, fn)
                                 ──► CorrelationId (traceId)
                                 ──► RFC 7807 (ProblemDetails)
           │
           ├──────────────────────────────┬──────────────────────────────┐
           ▼                              ▼                              ▼
 [003: IAM auth/]               [004: users/]               [005: organization/]
   (Usa withTransaction +          (Usa withTransaction +       (Usa withTransaction +
    ProblemDetails + Policies)      ProblemDetails + traceId)    ABAC + Seeds 3NF)
```
