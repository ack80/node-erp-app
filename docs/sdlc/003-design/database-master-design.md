# Manual Maestro de Diseño, Normalización y Modelado de Base de Datos (Estándar Enterprise Clásico)

Este documento establece la **taxonomía oficial, estándares de normalización (1NF, 2NF, 3NF), particionamiento modular y directrices de replicación** para la base de datos relacional del ERP.

---

## 1. Convención de Nomenclatura Clásica Enterprise (Opción B)

En sistemas ERP modulares, cada tabla pertenece a un dominio funcional claro identificado mediante un **prefijo de módulo simple de 3 a 4 letras**, seguido del nombre de la entidad en plural:

```text
  [prefijo_modulo]_[entidad]
         │              │
         │              └─► Entidad de negocio en plural (users, roles, items, orders)
         └────────────────► Módulo funcional del ERP (auth, inv, crm, ord, fin)
```

### Catálogo Oficial de Prefijos por Módulo:

| Prefijo Módulo | Dominio Funcional | Responsabilidad en el ERP | Tablas de Ejemplo |
|---|---|---|---|
| **`auth_`** | **Identidad y Seguridad** | Tenants, usuarios, credenciales, roles y permisos. | `auth_tenants`, `auth_users`, `auth_roles`, `auth_user_roles` |
| **`crm_`** | **Clientes y Terceros** | Cuentas comerciales, contactos, direcciones. | `crm_customers`, `crm_contacts`, `crm_addresses` |
| **`inv_`** | **Inventario y Catálogo** | Artículos, almacenes, stock, unidades de medida. | `inv_items`, `inv_warehouses`, `inv_stock` |
| **`ord_`** | **Ventas y Transacciones** | Pedidos de venta y líneas de detalle. | `ord_orders`, `ord_order_items` |
| **`fin_`** | **Finanzas y Facturación** | Facturas, pagos, cuentas contables. | `fin_invoices`, `fin_payments` |

---

## 2. Documentación de Formas Normales en el DDL (Comentarios de Ingeniería)

Para garantizar un código autodocumentado de alto valor didáctico, **cada script DDL de migración documenta explícitamente en sus comentarios la Forma Normal que cumple cada tabla**:

### A. Primera Forma Normal (1FN) - Atomicidad
* **Definición:** Todos los atributos contienen valores indivisibles (sin arreglos, sin listas de valores dentro de un solo campo). Clave primaria identificable.
* **Ejemplo DDL:** En `auth_users`, los roles no se guardan como string `'ADMIN,OPERATOR'`; cada usuario tiene sus registros independientes.

### B. Segunda Forma Normal (2FN) - Dependencia Funcional Completa
* **Definición:** Todo atributo no clave depende de la **totalidad de la clave primaria**, no de una parte de ella (crítico en tablas con Primary Keys compuestas).
* **Ejemplo DDL:** En `auth_user_roles(user_id, role_id)`, el campo `assigned_at` depende estrictamente del par `(user_id, role_id)`. Los nombres de rol no residen en esta tabla para evitar dependencias parciales.

### C. Tercera Forma Normal (3FN) - Cero Dependencias Transitivas
* **Definición:** Ningún atributo no clave depende de otro atributo no clave ($A \to B \to C$).
* **Ejemplo DDL:** `auth_users` referencia a `auth_tenants` mediante `tenant_id`. Los datos de la empresa (`name`, `slug`) no se duplican en la tabla de usuarios. Si el nombre de la empresa cambia, se actualiza en una sola fila de `auth_tenants`.

---

## 3. Topología de Replicación MySQL (Primary / Read-Replica)

El clúster de base de datos opera bajo el estándar de replicación binaria basada en filas (`binlog_format=ROW`):

```text
 ┌─────────────────────────────────────────────────────────────┐
 │ 🐘 CLÚSTER MYSQL ENTERPRISE                                │
 │                                                             │
 │  NODO PRIMARY (Master - Aiven MySQL / AWS RDS):             │
 │  • Exclusivo para transacciones de Escritura:               │
 │    INSERT, UPDATE, DELETE y transacciones atómicas.         │
 │  • Emite eventos binarios al Binary Log (Binlog).           │
 │               │                                             │
 │               │ (Replicación Asíncrona / Semi-síncrona)     │
 │               ▼                                             │
 │  NODOS READ-REPLICA (Esclavos de Lectura):                  │
 │  • Exclusivos para consultas SELECT masivas y reportes.     │
 │  • Tablas de catálogo (como auth_roles) se consultan aquí.  │
 └─────────────────────────────────────────────────────────────┘
```

### Reglas Técnicas Obligatorias para Replicación sin Colapsos:
1. **Primary Key Obligatoria:** En MySQL con replicación basada en filas, cualquier tabla sin Primary Key provoca bloqueos de tabla completos (`Table Scans`) durante operaciones `UPDATE` o `DELETE` en las réplicas.
2. **Motor Transaccional:** `ENGINE=InnoDB` exclusivamente.
3. **Collation:** `utf8mb4_unicode_ci` estandarizada en todo el clúster.
4. **Foreign Keys Controladas:** `ON DELETE RESTRICT` por defecto para prevenir borrados en cascada que bloqueen el binlog en horas pico.
