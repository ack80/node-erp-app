# Matriz de Auditoría Bar Raiser: Patrones de Diseño Formales de Base de Datos y Persistencia

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design / Persistencia Relacional |
| **Ubicación** | `docs/sdlc/003-design/architectural-lineage/009_database_design_patterns_and_anti_patterns.md` |
| **Audiencia** | Database Architects, Principal Engineers, Bar Raisers |
| **Objetivo** | Catálogo formal de Patrones de Modelado Relacional (3NF, Celko, Fowler) vs Villanos (Anti-Patrones de Base de Datos). |

---

## 1. El Rigor en el Diseño de Base de Datos para ERPs

En un ERP, los errores de código se corrigen con un commit y un despliegue de 2 minutos. **Los errores de modelo de base de datos son eternos y cuestan millones:** corrompen saldos contables, bloquean tablas de millones de filas o fuerzan migraciones con horas de inactividad (*downtime*).

Un arquitecto de software no diseña tablas "al ojo": aplica **Patrones Formales de Modelado de Datos** y conoce el nombre técnico de los **Anti-Patrones (los Villanos)** para erradicarlos antes de ejecutar un solo `CREATE TABLE`.

---

## 2. El Repertorio Canónico de Patrones de Base de Datos en `node-erp-app`

```text
 ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ PATRONES CANÓNICOS DE MODELADO RELACIONAL (LOS ANTÍDOTOS)                                              │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ 1. Multitenant Shared Database, Shared Schema (Mandante SAP / Isolation Key)                           │
 │ 2. Exact Decimal Currency Pattern (Regla Monetaria de COBOL)                                           │
 │ 3. Clustered B-Tree Natural/Surrogate Composite Indexing (Optimización Rushmore)                       │
 │ 4. Soft Delete via Temporal State (Eliminación Lógica con Preservación Forense)                        │
 │ 5. Transactional Outbox Pattern (Garantía de Consistencia Eventual Dual-Write)                        │
 │ 6. Immutable Financial Ledger / Append-Only (Libro Mayor Inmutable)                                    │
 │ 7. Adjacency List with Foreign Key Constraints (Árbol Jerárquico de Organización)                     │
 │ 8. Metadata Extension Pattern (Esquema Híbrido Relacional 3NF + JSON Validado)                         │
 └────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz de Confrontación: Patrones vs Villanos (Anti-Patrones)

### 1. El Patrón Monetario de Precisión Decimal vs El Villano del Redondeo Fantasma
- **El Villano (Anti-Patrón):** *IEEE 754 Floating-Point Currency Theft*. Declarar columnas de dinero, impuestos o saldos como `FLOAT`, `DOUBLE` o `REAL`. Provoca pérdida y aparición de centavos por la imposibilidad del sistema binario de representar fracciones decimales periódicas (ej. $0.1 + 0.2 = 0.30000000000000004$).
- **El Antídoto (Patrón Formal):** **Exact Decimal Representation Pattern** (`DECIMAL(12, 4)` o `DECIMAL(10, 2)`). Los motores InnoDB almacenan cada dígito decimal en paquetes fijos de 4 bytes sin aproximación binaria.
- **Implementación en el ERP:** Regla 3 de `AGENTS.md` obligatoria en toda tabla fiscal (`org_`, `ord_`, `bil_`).

---

### 2. El Patrón Multi-Tenant con Clave de Mandante vs El Villano de la Fuga de Datos Cruzada
- **El Villano (Anti-Patrón):** *Tenant Data Leakage / Accidental Cross-Tenant Query*. Diseñar tablas secundarias (como sucursales o usuarios) sin la columna del tenant raíz (`holding_id`), confiando en múltiples `JOINs` hacia atrás. Una consulta mal filtrada expone datos fiscales de una empresa a otra.
- **El Antídoto (Patrón Formal):** **Shared Database, Shared Schema Multi-Tenancy (SAP Client Pattern)**. Toda tabla transaccional o de entidad incluye `holding_id` en el índice primario o secundario compuesto (`INDEX (holding_id, email)`).
- **Implementación en el ERP:** Tablas `usr_users`, `org_companies`, `org_branches` incluyen explícitamente `holding_id`.

---

### 3. El Patrón de Índices B-Tree Compuestos vs El Villano del Full Table Scan
- **El Villano (Anti-Patrón):** *Unindexed Foreign Keys / Index Starvation*. Crear relaciones `FOREIGN KEY` sin crear índices explícitos sobre la columna foránea. Cada búsqueda o `JOIN` fuerza al motor a recorrer el disco entero ($O(N)$), bloqueando la tabla ante escrituras concurrentes.
- **El Antídoto (Patrón Formal):** **Covering Composite B-Tree Index Pattern**. Toda clave foránea y campo de búsqueda combinada (`company_id, city_id`) tiene su índice B-Tree dedicado, garantizando búsquedas en $O(\log N)$ y bloqueos a nivel de fila (*Row-Level Locking*) sin bloquear la tabla completa.
- **Implementación en el ERP:** Migración `001_create_org_organization.up.sql` y `002_create_usr_users.up.sql`.

---

### 4. El Patrón Ledger Inmutable (Append-Only) vs El Villano de la Mutación Destructiva
- **El Villano (Anti-Patrón):** *Destructive In-Place Updates on Financial Records*. Ejecutar `UPDATE bil_invoices SET total = ...` o `DELETE FROM ord_order_items`. Destruye la trazabilidad contable, viola normativas tributarias (SRI, IRS, Sarbanes-Oxley) y oculta fraudes internos.
- **El Antídoto (Patrón Formal):** **Immutable Financial Ledger Pattern (Event Sourcing Relacional)**. Las tablas financieras son estrictamente de inserción (*Append-Only*). Las correcciones contables se realizan emitiendo una nueva transacción inversa (Nota de Crédito / Asiento de Ajuste) con referencia cruzada.
- **Implementación en el ERP:** Módulos de inventario (`prd_kardex`) y facturación (`bil_invoices`).

---

### 5. El Patrón Transactional Outbox vs El Villano de la Escritura Huérfana (Dual-Write Pitfall)
- **El Villano (Anti-Patrón):** *Two-Phase Dual Write Hazard*. Guardar una venta en MariaDB y en la siguiente línea de código hacer `await fetch('https://sri.gob.ec/comprobantes')` o enviar un evento a Redis/Kafka. Si la red cae tras el commit, el comprobante se pierde; si la BD cae tras el HTTP, se cobra dos veces.
- **El Antídoto (Patrón Formal):** **Transactional Outbox Pattern**. El evento o comprobante electrónico se inserta en la tabla `ord_sync_outbox` **dentro de la misma transacción local ACID que guarda la orden**. Un worker en segundo plano lee la tabla y garantiza la entrega al SRI con reintentos exponenciales.
- **Implementación en el ERP:** Hito 007 (`ord_orders` + `ord_sync_outbox`).

---

### 6. El Patrón Híbrido Relacional/JSON vs El Villano de la Explosión de Columnas Sparse
- **El Villano (Anti-Patrón):** *Polymorphic Column Explosion / EAV Anti-Pattern (Entity-Attribute-Value)*. Crear 50 columnas en la tabla para datos que cambian por empresa (ej. URLs de Instagram, logotipo, configuración de factura) o crear la infame tabla EAV de 3 columnas (`entity_id, key, value`) que arruina el rendimiento de los `JOINs`.
- **El Antídoto (Patrón Formal):** **Hybrid Schema Pattern (Relacional 3NF para datos nucleares + JSON Type para extensiones)**. Las columnas esenciales (`legal_name`, `tax_id`, `email`) son atómicas 3NF fuertemente tipadas; los atributos flexibles de presentación se agrupan en una columna `metadata JSON`.
- **Implementación en el ERP:** Columna `metadata JSON` en `org_companies` validada por esquemas Zod en la capa de aplicación.

---

### 7. El Patrón Soft Delete Controlado vs El Villano del Registro Huérfano en Cascada
- **El Villano (Anti-Patrón):** *Cascading Deletion Holocaust / Accidental Data Erasure*. Ejecutar `DELETE FROM org_companies WHERE id = 1` y borrar en cascada cientos de miles de facturas históricas y registros contables.
- **El Antídoto (Patrón Formal):** **Soft Delete with Integrity State Pattern (`is_active TINYINT(1)` / `deleted_at TIMESTAMP NULL`)**. Las tablas principales jamás se eliminan físicamente; se desactivan lógicamente preservando la integridad referencial histórica para auditoría forense (`ON DELETE RESTRICT`).
- **Implementación en el ERP:** Campo `is_active` en `usr_users` y restricción de borrado físico en empresas y sucursales.

---

## 4. Estándar de Cabecera SQL para Migraciones

A partir de este momento, todo script de migración SQL (`.up.sql` y `.down.sql`) debe incluir en sus comentarios iniciales la declaración formal de sus patrones y villanos neutralizados:

```sql
-- ==============================================================================
-- 🏛️ INSPIRACIÓN:        Era 001 (Edgar F. Codd 3NF) & Era 002 (SAP Mandante)
-- 📐 PATRONES FORMALES:  Multi-Tenant Isolation, Exact Decimal Currency, Composite B-Tree
-- ⚙️ COMPLEJIDAD ÍNDICES: Lookups O(log N) sobre Clustered Primary & Composite Keys
-- 🦹 VILLANOS NEUTRALIZADOS:
--    1. Tenant Data Leakage (prevenido con holding_id foráneo y compuesto)
--    2. Floating-Point Rounding Error (prevenido con DECIMAL(12,4))
--    3. Full Table Scan (prevenido con índices B-Tree en toda FK)
-- ==============================================================================
```
