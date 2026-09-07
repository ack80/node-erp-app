# Manual Maestro de Diseño, Normalización y Modelado de Base de Datos (Estándar SAP / Enterprise ERP)

Este documento establece la **taxonomía oficial, estándares de normalización (1NF, 2NF, 3NF), particionamiento modular y directrices de replicación** para la base de datos relacional del ERP, inspirados en las mejores prácticas de **SAP ERP** y arquitecturas de datos de grado industrial.

---

## 1. Filosofía del Modelo: Taxonomía SAP Modular + Forma Normal

En sistemas ERP de gran envergadura (como SAP S/4HANA), miles de tablas coexisten en el mismo clúster. 
Para evitar colisiones, entender a qué módulo pertenece cada entidad y conocer de un vistazo su forma normal y mutabilidad, implementamos una **nomenclatura compuesta de 3 segmentos**:

```text
  [MÓDULO]_[TIPO_TABLA]_[ENTIDAD]
     │          │           │
     │          │           └─► Nombre en plural de la entidad de negocio (ej: users, items)
     │          └─────────────► Rol relacional y nivel de normalización (cat, core, rel, log)
     └────────────────────────► Sigla del módulo de negocio del ERP (sec, inv, ord, crm, fin)
```

### Segmento 1: Códigos Oficiales de Módulo (Inspirados en SAP)

| Prefijo Módulo | Dominio SAP Equivalente | Responsabilidad en el ERP |
|---|---|---|
| **`sec_`** | **BC-SEC** (Security / Basis) | Gestión de identidad, autenticación, tenants, roles y permisos. |
| **`crm_`** | **CRM / SD** (Sales & Distribution) | Clientes, contactos, direcciones y cuentas comerciales. |
| **`inv_`** | **MM** (Materials Management) | Catálogo de productos, stock, almacenes, unidades de medida. |
| **`ord_`** | **SD-SLS** (Sales Orders) | Cabecera y detalle de pedidos, transacciones de venta. |
| **`fin_`** | **FI-CO** (Financial & Controlling) | Facturación, comprobantes fiscales, cuentas por cobrar, pagos. |

### Segmento 2: Clasificación Relacional y Forma Normal

| Tipo Tabla | Forma Normal | Mutabilidad | Rol en Replicación (Primary vs. Replica) |
|---|:---:|:---:|---|
| **`cat_`** *(Catálogo)* | **1FN / 2FN** | Baja mutación | Tablas de consulta fija (ej: países, roles, monedas). Altamente cacheadas y leídas en réplicas. |
| **`core_`** *(Entidad Raíz)* | **3FN** | Alta mutación | Entidades principales del negocio (ej: usuarios, clientes, pedidos). Escrituras en Primary. |
| **`rel_`** *(Junction / Puente)* | **3FN (BCNF)** | Media mutación | Resuelven relaciones Muchos a Muchos ($N:M$) con claves compuestas. Sin dependencias transitivas. |
| **`log_`** *(Auditoría / Evento)* | **Append-Only** | Inmutable | Solo `INSERT`, nunca `UPDATE`. Trazabilidad histórica forense y eventos de compliance. |

---

## 2. Las Tres Formas Normales (3NF) Aplicadas al ERP

### A. Primera Forma Normal (1FN) - Atomicidad
* **Regla:** Cada columna contiene un único valor atómico indivisible. No hay listas, JSONs desnormalizados en tablas operacionales, ni columnas repetitivas (`telefono1`, `telefono2`).
* **En nuestro diseño:** 
  - Las listas de roles no se guardan como string separado por comas (`'ADMIN,USER'`).
  - Se desacoplan en registros individuales vinculados mediante una tabla asociativa.

### B. Segunda Forma Normal (2FN) - Dependencia Funcional Completa
* **Regla:** Todos los atributos que no forman parte de la clave primaria deben depender de la **totalidad de la clave primaria**, no de una parte de ella (aplica a tablas con claves compuestas).
* **En nuestro diseño:**
  - En la tabla puente `sec_rel_user_roles(user_id, role_id)`, el campo `assigned_at` depende funcionalmente de la combinación exacta `(user_id, role_id)`.
  - La descripción del rol **no vive en la tabla puente**, sino en su propio catálogo `sec_cat_roles`.

### C. Tercera Forma Normal (3FN) - Cero Dependencias Transitivas
* **Regla:** Ningún atributo no clave debe depender de otro atributo no clave ($X \to Y \to Z$).
* **En nuestro diseño:**
  - El usuario pertenece a un Tenant (`sec_core_users.tenant_id`).
  - El nombre de la empresa del Tenant **no se copia** en la tabla de usuarios. Si el Tenant cambia de razón social, se actualiza en `sec_core_tenants` y el cambio se refleja en todo el sistema sin inconsistencias.

---

## 3. Topología de Base de Datos y Replicación Enterprise

En entornos productivos (Aiven MySQL / AWS RDS), el clúster opera con **1 Nodo Primary (Escritura)** y **N Nodos Read-Replica (Lectura)**:

```text
                   CLIENTES / FRONTEND (React)
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ 🚦 ROUTER / POOL DE BASE DE DATOS                           │
 │                                                             │
 │  ¿Es operación de Escritura? (INSERT, UPDATE, DELETE, TX)   │
 │   ├── [ SÍ ] ──► NODO PRIMARY (Aiven MySQL Master)          │
 │   │              • Maneja transacciones ACID (InnoDB)       │
 │   │              • Escribe en el Binary Log (Binlog ROW)    │
 │   │                        │                                │
 │   │                        │ (Replicación Asíncrona Binlog) │
 │   │                        ▼                                │
 │   └── [ NO ] ──► NODO READ-REPLICA (Aiven Read Replica)     │
 │                  • Resuelve consultas SELECT masivas        │
 │                  • Cero impacto sobre el motor transaccional│
 └─────────────────────────────────────────────────────────────┘
```

### Reglas Críticas para Replicación MySQL sin Bloqueos:
1. **Primary Key Obligatoria:** Toda tabla en el sistema **debe poseer una PK explícita**. Las réplicas de MySQL sufren colapso de rendimiento en operaciones `UPDATE/DELETE` si una tabla carece de clave primaria.
2. **Motor Transaccional Exclusivo:** Todas las tablas usan obligatoriamente `ENGINE=InnoDB`.
3. **Collation Unificada:** `utf8mb4_unicode_ci` en todo el clúster para prevenir errores de codificación en el binlog.
4. **Foreign Keys con Cláusulas Deterministas:** Uso estricto de `ON DELETE RESTRICT` para evitar eliminaciones en cascada masivas accidentales en producción.

---

## 4. Mapa del Módulo de Identidad y Seguridad (`sec_`)

```text
 ┌────────────────────────────────────────────────────────┐
 │ 🏢 sec_core_tenants (Multi-Tenant Raíz - 3FN)          │
 ├────────────────────────────────────────────────────────┤
 │ PK: id                                                 │
 │ name                                                   │
 │ slug (UNIQUE)                                          │
 └───────────────────────────┬────────────────────────────┘
                             │ 1:N
                             ▼
 ┌────────────────────────────────────────────────────────┐         ┌─────────────────────────────────────┐
 │ 👤 sec_core_users (Entidad de Usuario - 3FN)           │         │ 🛡️ sec_cat_roles (Catálogo 1FN/2FN) │
 ├────────────────────────────────────────────────────────┤         ├─────────────────────────────────────┤
 │ PK: id                                                 │         │ PK: id                              │
 │ FK: tenant_id ──► sec_core_tenants(id)                 │         │ name ('ADMIN', 'OPERATOR')          │
 │ email                                                  │         │ description                         │
 │ password_hash                                          │         └──────────────────┬──────────────────┘
 │ name                                                   │                            │
 │ is_active                                              │                            │ 1:N
 │ UNIQUE KEY (tenant_id, email)                          │                            │
 └───────────────────────────┬────────────────────────────┘                            │
                             │                                                         │
                             └───────────────────────────┬─────────────────────────────┘
                                                         │ N:M
                                                         ▼
                                 ┌─────────────────────────────────────────────────────┐
                                 │ 🔗 sec_rel_user_roles (Tabla Puente BCNF / 3FN)     │
                                 ├─────────────────────────────────────────────────────┤
                                 │ PK Compuesta: (user_id, role_id)                    │
                                 │ FK1: user_id ──► sec_core_users(id)                 │
                                 │ FK2: role_id ──► sec_cat_roles(id)                  │
                                 │ assigned_at                                         │
                                 └─────────────────────────────────────────────────────┘
```
