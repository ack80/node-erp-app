# Manual Maestro de Diseño y Arquitectura de Datos: Holding, Replicación y Despliegue Híbrido

Este documento establece la **arquitectura integral de datos de grado empresarial** para el ERP, cubriendo desde la estructura relacional 3NF de grupos corporativos hasta la sincronización distribuida entre sucursales y la casa matriz.

---

## 1. Patrones de Arquitectura de Datos Implementados

El diseño no es monolítico ni improvisado; se fundamenta en **5 patrones formales de arquitectura de software enterprise**:

1. **Hierarchical Multi-Tenancy Pattern (Multi-Inquilino Jerárquico):**
   - El sistema no se limita a aislar empresas sueltas, sino que modela árboles corporativos completos: `Holding` $\to$ `Company` $\to$ `Branch` $\to$ `User`.
2. **Control Plane / Data Plane Separation:**
   - El portal central (`myerp.com`) actúa como plano de control (identidad, licencias, planes), mientras que las bases de datos operativas (Aiven, On-Premise, Nube privada) gestionan el plano de datos.
3. **Database-Per-Deployment Adapter Pattern:**
   - Una interfaz de acceso a datos (`dbPool`) que desacopla la lógica de negocio del tipo de infraestructura subyacente (SaaS compartido, BD dedicada o servidor propio).
4. **Transactional Outbox Pattern (Garantía de Sincronización Eventual):**
   - Cada sucursal descentralizada (Mérida, Valencia) registra eventos de negocio en una tabla local `sync_outbox` dentro de la misma transacción ACID de la venta. Un proceso en segundo plano despacha los eventos al clúster central en Caracas sin pérdida de datos.
5. **Natural Branch Key Partitioning (Prevención de Colisiones):**
   - Claves de negocio compuestas con código de sucursal (`[COMPANY]-[BRANCH]-[SEQ]`), garantizando unicidad global al consolidar datos descentralizados.

---

## 2. Diagrama del Modelo Relacional Jerárquico (3NF)

```text
 ┌─────────────────────────────────────────────────────────────┐
 │ 🏢 auth_holdings (Nivel 1: Licencia / SaaS / Grupo)         │
 ├─────────────────────────────────────────────────────────────┤
 │ PK: id                                                      │
 │ slug (UNIQUE)                                               │
 │ deployment_mode: 'cloud_shared' | 'dedicated' | 'on_premise'│
 └──────────────────────────────┬──────────────────────────────┘
                                │ 1:N
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ 🏛️ auth_companies (Nivel 2: Razón Social / Filial / Moneda)  │
 ├─────────────────────────────────────────────────────────────┤
 │ PK: id                                                      │
 │ FK: holding_id ──► auth_holdings(id)                        │
 │ tax_id (RIF / RFC / Tax Number)                             │
 │ currency: 'USD' | 'EUR' | 'VES'                             │
 │ UNIQUE KEY (holding_id, tax_id)                             │
 └──────────────────────────────┬──────────────────────────────┘
                                │ 1:N
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ 📍 auth_branches (Nivel 3: Sucursal / Zona Operativa)       │
 │    "Cada perro se lame su machete pero vuelve al corral"    │
 ├─────────────────────────────────────────────────────────────┤
 │ PK: id                                                      │
 │ FK: company_id ──► auth_companies(id)                       │
 │ code: VARCHAR(10) (ej. 'CCS', 'VAL', 'MAR', 'MER')          │
 │ UNIQUE KEY (company_id, code)                               │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ├──────────────────────────────┐
                                │ 1:N (Opcional)               │ 1:N (Para documentos)
                                ▼                              ▼
 ┌────────────────────────────────────────────────────────┐  ┌─────────────────────────┐
 │ 👤 auth_users (Nivel 4: Identidad y Ámbito de Acceso)  │  │ 🧾 Documentos de Negocio│
 ├────────────────────────────────────────────────────────┤  │ (Facturas, Pedidos)     │
 │ PK: id                                                 │  ├─────────────────────────┤
 │ FK: holding_id (Obligatorio)                           │  │ PK Compuesta / UUID v7  │
 │ FK: company_id (NULL = Auditor / CEO de todo el grupo) │  │ branch_id (FK)          │
 │ FK: branch_id  (NULL = Operador multi-sucursal)        │  │ doc_number:             │
 │ email (UNIQUE por holding_id)                          │  │ 'RAP-VAL-000104'        │
 └──────────────────────────────┬─────────────────────────┘  └─────────────────────────┘
                                │
                                ▼ N:M
 ┌────────────────────────────────────────────────────────┐  ┌─────────────────────────┐
 │ 🔗 auth_user_roles (Tabla Asociativa / Junction)       │  │ 🛡️ auth_roles (Catálogo)│
 ├────────────────────────────────────────────────────────┤  ├─────────────────────────┤
 │ PK Compuesta: (user_id, role_id)                       │  │ PK: id                  │
 │ FK1: user_id ──► auth_users(id)                        │◄─┤ name: 'ADMIN', etc.     │
 │ FK2: role_id ──► auth_roles(id)                        │  └─────────────────────────┘
 └────────────────────────────────────────────────────────┘
```

---

## 3. Topología de Replicación y Despliegue de Sucursales

### A. Flujo de Sincronización Híbrido (Caracas vs. Regiones)

```text
 SUCURSAL VALENCIA / MARACAIBO              SEDE CENTRAL / CLOUD CARACAS
 (Operación Local Autónoma)                 (Nodo Master / Consolidador)
 
 1. Usuario genera factura:
    INSERT INTO ord_orders (...)
    INSERT INTO ord_sync_outbox (...)
    [ COMMIT LOCAL INMEDIATO ]
               │
               │ (¿Hay conexión a Internet?)
               ├────────────────────────────────────────┐
               │ [ SÍ ]                                 │ [ NO (Caída de red) ]
               ▼                                        ▼
    Worker de Sincronización                La sucursal sigue vendiendo.
    Lee ord_sync_outbox                     Los eventos se encolan
    y envía por HTTP seguro:                en ord_sync_outbox local.
    POST /api/v1/sync/events                            │
               │                                        │ (Vuelve la red)
               ▼                                        ▼
    Consolidador Central (Caracas) ◄────────────────────┘
    Recibe payload, valida firma,
    y aplica en el clúster central.
    Responde 200 OK.
               │
               ▼
    Sucursal marca en outbox:
    UPDATE ord_sync_outbox SET synced_at = NOW();
```

---

## 4. Los 4 Modos de Despliegue (Matriz de Decisiones)

| Modo | Ubicación de la Base de Datos | Autenticación | Caso de Negocio |
|---|---|---|---|
| **`cloud_shared`** | Instancia MySQL compartida en Aiven, aislada por `holding_id`. | Centralizada en `myerp.com`. | Clientes estándar SaaS con tarifa mensual accesible. |
| **`cloud_dedicated`** | Base de datos dedicada en Aiven/AWS por cliente. | Centralizada en `myerp.com`. | Clientes corporativos con requisitos de cumplimiento legal o aislamiento físico. |
| **`on_premise_hybrid`** | Base de datos local en el datacenter del cliente. | Híbrida: valida licencia en `myerp.com` periódicamente. | Grandes empresas que por ley no pueden subir datos transaccionales a la nube. |
| **`on_premise_isolated`** | Servidor local desconectado o con enlaces satelitales intermitentes. | Local autónoma con sync por Outbox al reconectar. | Sucursales en zonas industriales o remotas. |

---

## 5. Justificación Teórica de Formas Normales en el Esquema DDL

- **1FN (Primera Forma Normal):**
  - Todas las columnas de las tablas `auth_*` contienen atributos atómicos. No existen listas delimitadas por comas ni estructuras serializadas no tipadas en campos relacionales clave.
- **2FN (Segunda Forma Normal):**
  - En las tablas con claves compuestas (ej. `auth_user_roles`), los atributos no clave (`assigned_at`) dependen de la totalidad de la clave primaria `(user_id, role_id)`.
- **3FN (Tercera Forma Normal):**
  - Se eliminan todas las dependencias transitivas: `auth_users` no contiene la razón social de la compañía ni el nombre de la sucursal; solo contiene sus claves foráneas resolviendo la integridad referencial en `auth_companies` y `auth_branches`.
