# Plan Maestro de Migraciones de Base de Datos: Taxonomía Semántica, Precedencia y Ciclo de Vida (UP / DOWN)

Este documento establece el **mapa oficial de migraciones incrementales** del ERP. Define el orden cronológico estricto de precedencia relacional (árbol de llaves foráneas), la convención de nomenclatura semántica y las reglas de creación (`UP`) y reversión (`DOWN`) para garantizar un esquema 3NF determinista y libre de bloqueos en MySQL.

---

## 1. Convención de Nomenclatura Semántica

Cada archivo de migración sigue una estructura formal de 3 partes:

```text
  [NUMERO_ORDEN]_[ACCION]_[MODULO]_[DESCRIPCION].sql
       │            │        │           │
       │            │        │           └─► Entidades creadas (ej. identity, customers, catalog)
       │            │        └─────────────► Módulo de negocio (core, crm, inv, ord, fin)
       │            └──────────────────────► Acción atómica (create, alter, add_index)
       └───────────────────────────────────► Secuencia numérica fija de 3 dígitos (001, 002...)
```

**Regla de Oro:** El prefijo numérico (`001`, `002`, `003`) define el orden absoluto de ejecución en [scripts/migrate.js](file:///home/rujanad/worldclass-workspace/node-erp-app/scripts/migrate.js).

---

## 2. Mapa Integral de Precedencia de Migraciones (El Árbol de Dependencias)

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 001_create_core_identity.sql                                           │
 │ • auth_holdings   (Raíz Grupo SaaS)                                    │
 │ • auth_companies  (Filiales legales)                                   │
 │ • auth_branches   (Sucursales operativas)                              │
 │ • auth_roles      (Catálogo de roles)                                  │
 │ • auth_users      (Usuarios y credenciales)                            │
 │ • auth_user_roles (Asociativa N:M)                                     │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 002_create_crm_customers.sql                                           │
 │ • crm_customer_categories (Catálogo de tipos de cliente)               │
 │ • crm_customers           (Clientes vinculados a company_id)           │
 │ • crm_customer_addresses  (Direcciones fiscales y de entrega)          │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 003_create_inv_catalog.sql                                             │
 │ • inv_warehouses          (Almacenes por sucursal / branch_id)         │
 │ • inv_categories          (Categorías de productos)                    │
 │ • inv_items               (Catálogo maestro de artículos)              │
 │ • inv_item_stock          (Existencias por almacén)                    │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 004_create_ord_sales.sql                                               │
 │ • ord_orders              (Cabecera de pedidos vinculada a customer)   │
 │ • ord_order_items         (Líneas de detalle vinculadas a inv_item)    │
 │ • ord_sync_outbox         (Cola de eventos para sucursales offline)    │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 005_create_fin_billing.sql                                             │
 │ • fin_payment_methods     (Catálogo: Transferencia, Zelle, Tarjeta)    │
 │ • fin_invoices            (Comprobantes fiscales y series)             │
 │ • fin_payments            (Abonos y conciliación transaccional)        │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz Oficial de Módulos y Scripts DDL

| Archivo de Migración | Dominio | Tablas Creadas | Depende De (Foreign Keys) |
|---|---|---|---|
| **`001_create_core_identity.sql`** | Core / Auth | `auth_holdings`<br>`auth_companies`<br>`auth_branches`<br>`auth_roles`<br>`auth_users`<br>`auth_user_roles` | *Ninguna* (Es la raíz del universo de datos). |
| **`002_create_crm_customers.sql`** | Clientes / CRM | `crm_customer_categories`<br>`crm_customers`<br>`crm_customer_addresses` | `auth_companies(id)`<br>`auth_branches(id)` |
| **`003_create_inv_catalog.sql`** | Inventario / MM | `inv_warehouses`<br>`inv_categories`<br>`inv_items`<br>`inv_item_stock` | `auth_companies(id)`<br>`auth_branches(id)` |
| **`004_create_ord_sales.sql`** | Ventas / SD | `ord_orders`<br>`ord_order_items`<br>`ord_sync_outbox` | `crm_customers(id)`<br>`inv_items(id)`<br>`auth_branches(id)` |
| **`005_create_fin_billing.sql`** | Finanzas / FI | `fin_payment_methods`<br>`fin_invoices`<br>`fin_payments` | `ord_orders(id)`<br>`crm_customers(id)` |

---

## 4. Estrategia de Reversión y Destrucción Controlada (DOWN)

Cuando se requiera reiniciar o revertir la base de datos en ambientes de desarrollo o pruebas de estrés, **la destrucción debe ejecutarse en estricto orden inverso al de creación**:

```text
  ORDEN SEGURO DE BORRADO (Evita error 'Foreign key constraint fails'):
  1. DROP TABLE IF EXISTS fin_payments, fin_invoices, fin_payment_methods;
  2. DROP TABLE IF EXISTS ord_sync_outbox, ord_order_items, ord_orders;
  3. DROP TABLE IF EXISTS inv_item_stock, inv_items, inv_categories, inv_warehouses;
  4. DROP TABLE IF EXISTS crm_customer_addresses, crm_customers, crm_customer_categories;
  5. DROP TABLE IF EXISTS auth_user_roles, auth_users, auth_roles, auth_branches, auth_companies, auth_holdings;
```

---

## 5. Reglas de Ingeniería para Desarrolladores

1. **Inmutabilidad:** Una migración ya fusionada en la rama `main` **nunca se edita**. Si se necesita agregar una columna, se crea una migración incremental (ej. `006_alter_inv_items_add_barcode.sql`).
2. **Transaccionalidad:** Cada archivo `.sql` debe poder ejecutarse dentro de un bloque `START TRANSACTION ... COMMIT` garantizado por el runner.
3. **Comentarios DDL Obligatorios:** Cada tabla creada debe incluir en su encabezado la explicación de su Forma Normal (1FN, 2FN o 3FN) y su rol en la topología de replicación MySQL.
