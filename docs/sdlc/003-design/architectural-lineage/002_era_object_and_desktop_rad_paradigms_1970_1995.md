# Era 002 (1970 - 1995): Paradigmas de Objetos, ERPs Corporativos y RAD de Escritorio

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Precedencia Cronológica** | 002 |
| **Tecnologías de Referencia** | Smalltalk, SAP ABAP, Erlang/OTP, dBASE, FoxPro, PowerBuilder, Visual Basic, Delphi, Perl, Lisp |
| **Problema Nuclear** | Acoplamiento entre interfaz y datos, saturación de redes locales (LAN) y modelado multi-empresa |
| **Implementación en node-erp-app** | Patrón MVC por feature, Multi-Tenancy (Holding/Company/Branch), TDD riguroso (Vitest), Indexación B-Tree |

---

## 1. Contexto Histórico y Problema de Ingeniería

Con la llegada de los microcomputadores y las redes LAN en los años 80 y 90, las empresas migraron de las terminales bobas a sistemas cliente/servidor interactivos. Los desafíos principales fueron:
1. **El desorden entre datos y presentación:** SQL, lógica de cálculo e interfaces gráficas residían en un único archivo inmanejable.
2. **Redes locales lentas (10 Mbps):** Mover tablas masivas por la red para filtrar un registro congelaba los sistemas.
3. **Multi-Tenancy Empresarial:** Gestionar holdings con filiales, sucursales y monedas diversas sin cruzar información fiscal.

---

## 2. Soluciones Pioneras de la Era

### 2.1. SAP ABAP (Advanced Business Application Programming, 1980 / 1992)
- **Aporte Nuclear a los ERPs:**
  1. **El Concepto de Mandante (*Client / Tenant*):** Toda tabla de negocio comienza con el campo `MANDT`. El motor de base de datos aísla automáticamente los datos de cada cliente corporativo.
  2. **SAP LUW (Logical Unit of Work de Negocio):** Separa la transacción de negocio (que dura minutos mientras el usuario interactúa) de la transacción física de base de datos (DB LUW, que dura milisegundos).
  3. **Diccionario de Datos Centralizado (ABAP DDIC):** Definición única y canónica de tipos de datos de negocio (ej. RUC, código postal) reutilizables en tablas, vistas y validaciones.
  4. **Taxonomía de Datos:** División estricta en Datos Maestros (*Master Data*), Transaccionales (*Transactional Data*) y de Configuración (*Customizing / Seeds*).

### 2.2. Smalltalk (Xerox PARC, 1972) y Kent Beck (SUnit, 1976)
- **Aporte Nuclear:**
  1. **Patrón MVC (Model-View-Controller):** Separación matemática entre datos (Model), presentación (View) y orquestación (Controller).
  2. **El Nacimiento de TDD:** Kent Beck creó SUnit en Smalltalk, formalizando la práctica de escribir la prueba automatizada antes del código productivo.

### 2.3. Erlang / OTP (Ericsson, 1986)
- **Aporte Nuclear:**
  1. **Filosofía *"Let it Crash"* (Deja que Falle):** Cero tolerancia a parches defensivos que ocultan memoria corrupta. Si un proceso entra en estado inválido, se destruye y un Supervisor lo reinicia limpio.
  2. **Aislamiento Radical:** Procesos con memoria no compartida que se comunican exclusivamente por paso de mensajes.

### 2.4. dBASE (1979) y FoxPro (1989)
- **Aporte Nuclear:**
  1. **Formato `.DBF` (dBASE):** El estándar universal que democratizó el almacenamiento relacional directo en PCs.
  2. **Tecnología Rushmore (FoxPro):** Algoritmo de indexación mediante mapas de bits comprimidos que resolvía consultas sobre cientos de miles de filas en microsegundos, batiendo a motores cliente/servidor en LAN.

### 2.5. PowerBuilder (1991): El DataWindow
- **Aporte Nuclear:** Unificó la consulta SQL, el buffer de datos en memoria, la grilla visual interactiva y la validación de tipos en un solo objeto reutilizable.

### 2.6. Visual Basic (1991) y Delphi (1995)
- **Aporte Nuclear:**
  1. **Visual Basic:** Popularizó la **Programación Guiada por Eventos (`Event-Driven`)**, permitiendo que la UI reaccione a señales discretas sin bucles infinitos.
  2. **Delphi (Anders Hejlsberg):** Arquitectura cliente/servidor de altísimo rendimiento nativo con tipado estricto que sirvió como cuna conceptual para la creación posterior de C# y TypeScript.

---

## 3. Línea Evolutiva en la Industria

```text
 SAP Mandante / Client ────► Multi-Tenancy Moderno ──────────► org_holdings / org_companies en node-erp-app
 SAP Data Dictionary ─────► Tipos de Dominio / DTOs ────────► Esquemas Zod reutilizables (shared/)
 Smalltalk MVC / SUnit ───► Web MVC / JUnit / Jest ─────────► Clean Architecture por Features + Vitest
 Erlang "Let it Crash" ───► Fail-Fast / Kubernetes Pods ────► Validación estricta en milisegundo cero
 FoxPro Rushmore ─────────► Índices B-Tree compuestos ──────► Índices explícitos en MariaDB
 PowerBuilder DataWindow ─► Form Requests / React Query ────► Contratos unificados Zod (Schema + DTO)
 Visual Basic Eventos ────► Observer Pattern / Streams ─────► EventEmitter nativo (node:events)
```

---

## 4. Implementación Rigurosa en `node-erp-app`

1. **Aislamiento Multi-Tenant Jerárquico (Herencia de SAP ABAP):**
   - El esquema implementa la tríada `org_holdings` (Mandante raíz) $\to$ `org_companies` (Filiales legales) $\to$ `org_branches` (Sucursales operativas). Toda tabla transaccional lleva el `holding_id` indexado como filtro primario.
2. **Cultura de Pruebas TDD (Herencia de Smalltalk / SUnit):**
   - Cada caso de uso nace con su suite de pruebas unitarias (`features/<f>/test/`) probando casos de éxito y de rechazo de forma determinista.
3. **Indexación Compuesta Optimizada (Herencia de FoxPro Rushmore):**
   - Las consultas críticas de usuario y sucursal operan sobre índices únicos y compuestos explícitos (`(holding_id, email)`, `(company_id, city_id)`), evitando escaneos secuenciales de tablas (*Full Table Scans*).
4. **Resiliencia Fail-Fast (Herencia de Erlang):**
   - Si una variable de entorno obligatoria falta o una cabecera de tamaño TCP se viola, el socket se destruye de inmediato sin mantener estados corruptos en memoria.
