# Hoja de Ruta del ERP Backend (Roadmap Canónico)

> **Nota de Arquitectura:** Esta hoja de ruta se encuentra formalmente modularizada por hitos desacoplados bajo la regla de precedencia **"Primero las Medias, Después los Zapatos"**.
> Para consultar el tablero de control maestro y los hitos específicos, diríjase a:
> 👉 [**`docs/sdlc/004-implement/roadmap-milestones/000_roadmap_master_index.md`**](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/004-implement/roadmap-milestones/000_roadmap_master_index.md)

---

## Resumen Ejecutivo de Precedencias

```text
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                      SECUENCIA OBLIGATORIA POR HITOS NUMERADOS                         │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ 🧦 LAS MEDIAS (Fundaciones e Infraestructura Transversal):                             │
 │ • Hito 001: Runtime HTTP, Pool MariaDB y Migraciones UP/DOWN       ──► ✅ COMPLETADO   │
 │ • Hito 002: withTransaction, CorrelationId y RFC 7807              ──► ⏳ EN COLA      │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ 👞 LOS ZAPATOS (Features de Dominio de Negocio):                                       │
 │ • Hito 003: Módulo IAM (auth/) con JWTs HttpOnly y Policies ABAC   ──► 📋 PLANIFICADO  │
 │ • Hito 004: Hardening y enlace transaccional de users/             ──► 📋 PLANIFICADO  │
 │ • Hito 005: Estructura Multi-Tenant y filiales (organization/)     ──► 📋 PLANIFICADO  │
 │ • Hito 006: Catálogo de productos e inventario (products/)         ──► 📋 PLANIFICADO  │
 │ • Hito 007: Ventas transaccionales y Outbox Pattern (orders/)      ──► 📋 PLANIFICADO  │
 │ • Hito 008: Facturación electrónica SRI Ecuador (billing/)         ──► 📋 PLANIFICADO  │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ 🛡️ VERIFICACIÓN GLOBAL (Pirámide de Testing y Seguridad):                              │
 │ • Hito 009: Playwright E2E, Pruebas de Carga k6 y Auditoría ZAP   ──► 📋 PLANIFICADO  │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Directorio de Hitos Desacoplados

1. [**Hito 001:** Runtime Base HTTP y Migraciones UP/DOWN](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/004-implement/roadmap-milestones/001_milestone_core_http_and_database_runtime.md)
2. [**Hito 002:** Infraestructura Transversal ("Las Medias")](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/004-implement/roadmap-milestones/002_milestone_transversal_medias_infrastructure.md)
3. [**Hito 003:** Módulo IAM, Autenticación y Policies (`auth/`)](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/004-implement/roadmap-milestones/003_milestone_iam_authentication_and_policies.md)
4. [**Hito 004:** Refactor Transaccional de `users/`](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/004-implement/roadmap-milestones/004_milestone_users_refactor_and_hardening.md)
5. [**Hito 005:** Organización Jerárquica (`organization/`)](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/004-implement/roadmap-milestones/005_milestone_organization_and_multitenancy.md)
6. [**Hito 006:** Catálogo e Inventario Decimal (`products/`)](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/004-implement/roadmap-milestones/006_milestone_catalog_and_inventory.md)
7. [**Hito 007:** Órdenes y Outbox Pattern (`orders/`)](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/004-implement/roadmap-milestones/007_milestone_orders_and_outbox_transactions.md)
8. [**Hito 008:** Facturación Fiscal SRI Ecuador (`billing/`)](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/004-implement/roadmap-milestones/008_milestone_billing_and_fiscal_invoices.md)
9. [**Hito 009:** E2E, Carga y Seguridad DAST](file:///home/rujanad/worldclass-workspace/node-erp-app/docs/sdlc/004-implement/roadmap-milestones/009_milestone_end_to_end_verification_and_load.md)
