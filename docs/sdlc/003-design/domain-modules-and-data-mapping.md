# Mapeo Oficial de Dominios (Features) y Modelo Relacional (Estándar Silicon Valley / Modular Monolith)

Este documento define la correspondencia estricta 1:1 entre los **Dominios de Negocio (Vertical Slices en `src/features/`)**, la **Nomenclatura Prefijada de Tablas en MySQL** y el **Plan Secuencial de Migraciones**.

Inspirado en los estándares de arquitectura modular de alto rendimiento de **Stripe, Shopify y Square/Block**.

---

## 1. Principio de Arquitectura: Alta Cohesión y Desacoplamiento por Dominio

Cada feature en `src/features/` es un módulo autónomo con su propia lógica de dominio, contratos de transporte (schemas), persistencia y pruebas unitarias. En la base de datos, cada módulo es dueño exclusivo de un conjunto de tablas identificadas por un **prefijo de 3 letras**:

```text
  📁 src/features/<domain>/  ──►  🐘 <pre>_<entidad>  ──►  📄 [N]_create_<pre>_<dominio>.sql
```

---

## 2. Matriz Maestra de Módulos, Entidades y Tablas

| Carpeta Feature (`src/features/`) | Prefijo Tabla | Tablas en MySQL | Responsabilidad y Entidades de Negocio |
|---|:---:|---|---|
| **`organization/`** | **`org_`** | `org_holdings`<br>`org_companies`<br>`org_branches`<br>`org_stores` | **Estructura Corporativa Multi-Tenant:** Grupos económicos (Holdings), filiales legales (Companies), sucursales físicas (Branches) y canales de venta digital (Stores). |
| **`users/`** | **`usr_`** | `usr_users`<br>`usr_roles`<br>`usr_user_roles` | **Gestión de Personas y Permisos:** Perfiles de empleados, operadores y administradores con ámbito jerárquico y roles RBAC. |
| **`auth/`** | **`aut_`** | `aut_refresh_tokens`<br>`aut_login_audit` | **Seguridad y Sesiones:** Manejo criptográfico de credenciales, refresh tokens, revocación y auditoría de intentos de acceso. |
| **`products/`** | **`prd_`** | `prd_categories`<br>`prd_products`<br>`prd_variants`<br>`prd_stock` | **Catálogo y Existencias:** Categorías de producto, SKUs (variantes de talla/color), precios base y stock por almacén/sucursal. |
| **`customers/`** | **`cst_`** | `cst_customers`<br>`cst_addresses` | **Clientes y Cuentas:** Clientes compradores (B2B/B2C), direcciones de facturación y entrega fiscal. |
| **`orders/`** | **`ord_`** | `ord_carts`<br>`ord_cart_items`<br>`ord_orders`<br>`ord_order_items`<br>`ord_sync_outbox` | **Ventas, Carritos y Pedidos:** Carritos de compra en sesión, órdenes formalizadas, líneas de detalle y cola de eventos transaccionales (Outbox) para sincronización entre sucursales. |
| **`billing/`** | **`bil_`** | `bil_invoices`<br>`bil_payments` | **Finanzas y Facturación:** Comprobantes fiscales, series de facturación, transacciones de pago y conciliación. |

---

## 3. Plan Secuencial de Migraciones (Precedencia Relacional Estricta)

Para garantizar que ninguna tabla hija se ejecute antes de que existan sus tablas padre con Foreign Keys, las migraciones se ordenan cronológicamente:

```text
 001_create_org_organization.sql
 │   • org_holdings (Raíz Multi-Tenant)
 │   • org_companies (Filiales vinculadas a holdings)
 │   • org_branches (Sucursales vinculadas a companies)
 │   • org_stores (Tiendas vinculadas a branches/companies)
 │
 └──► 002_create_usr_users.sql
      │   • usr_roles (Catálogo maestro)
      │   • usr_users (Usuarios vinculados a org_holdings, companies, branches)
      │   • usr_user_roles (Asociación N:M)
      │
      └──► 003_create_aut_auth.sql
           │   • aut_refresh_tokens (Sesiones vinculadas a usr_users)
           │   • aut_login_audit (Logs forenses de acceso)
           │
           └──► 004_create_prd_products.sql
                │   • prd_categories
                │   • prd_products
                │   • prd_variants
                │   • prd_stock (Vinculado a org_branches)
                │
                └──► 005_create_cst_customers.sql
                     │   • cst_customers (Vinculados a org_companies)
                     │   • cst_addresses (Direcciones fiscales/envío)
                     │
                     └──► 006_create_ord_orders.sql
                          │   • ord_carts
                          │   • ord_cart_items (Vinculados a prd_variants)
                          │   • ord_orders (Vinculados a cst_customers y org_branches)
                          │   • ord_order_items
                          │   • ord_sync_outbox
                          │
                          └──► 007_create_bil_billing.sql
                               • bil_invoices (Vinculados a ord_orders)
                               • bil_payments (Transacciones de pago)
```

---

## 4. Estándar DDL: Integración y Replicación MySQL

Cada script de migración cumple con las siguientes directrices técnicas no negociables:
1. **`ENGINE=InnoDB`:** Garantiza transacciones ACID y consistencia referencial.
2. **`utf8mb4_unicode_ci`:** Soporte completo para caracteres internacionales, acentos y emojis.
3. **Primary Key Explícita:** Obligatoria en cada tabla para garantizar que las réplicas de lectura (`Read-Replicas`) no se bloqueen durante la replicación basada en filas (`binlog_format=ROW`).
4. **Comentarios DDL Didácticos:** Cada tabla documenta en su encabezado su Forma Normal (1FN, 2FN, 3FN).
