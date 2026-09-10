# Hito 006: Feature `products/` — Catálogo, Precios Decimales y Kardex

| Metadato | Valor |
|---|---|
| **Hito** | 006 |
| **Clasificación** | 👞 Zapatos (Capa 4 de Negocio: Catálogo Comercial) |
| **Precedencia Requerida** | Hito 005 completado |
| **Estado** | 📋 PLANIFICADO |
| **Linaje de Referencia** | Era 001 (COBOL DECIMAL), Era 002 (FoxPro Rushmore B-Tree) |

---

## 1. Alcance y Entregables del Hito

1. **Migración DDL `004_create_prd_products.up.sql` / `.down.sql`:**
   - Tablas: `prd_categories`, `prd_products`, `prd_inventory` (stock por `branch_id`).
   - Todos los precios de venta, costos y márgenes estrictamente tipados como **`DECIMAL(12, 4)`**.
2. **Casos de Uso de Catálogo:**
   - Creación y edición de productos por filial legal (`company_id`).
   - Ajuste y consulta de stock en tiempo real por sucursal física.
3. **Optimización de Búsqueda:**
   - Índices compuestos para filtrado rápido por código de barras, SKU y categoría.
