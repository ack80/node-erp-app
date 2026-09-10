# Hito 005: Feature `organization/` — Gestión Jerárquica Multi-Tenant

| Metadato | Valor |
|---|---|
| **Hito** | 005 |
| **Clasificación** | 👞 Zapatos (Capa 3 de Negocio: Estructura Corporativa) |
| **Precedencia Requerida** | Hitos 001 al 004 completados |
| **Estado** | 📋 PLANIFICADO |

---

## 1. Alcance y Entregables del Hito

1. **Gestión de Entidades de Negocio:**
   - Casos de uso y repositorios para:
     - `org_companies` (Filiales legales, RUC SRI Ecuador, dirección fiscal, teléfono, branding).
     - `org_branches` (Sucursales físicas atómicas con enlace a `city_id`).
     - `org_stores` (Canales y tiendas digitales e-commerce).
2. **Consultas de Geografía y Catálogos:**
   - Endpoints para listar países (`org_countries`), monedas (`org_currencies`) y ciudades (`org_cities`).
3. **Aislamiento ABAC Estricto:**
   - Solo usuarios con rol `SUPERADMIN` o `COMPANY_ADMIN` pueden modificar datos de la empresa.
