# Era 001 (1950 - 1970): Fundamentos de Persistencia, Aritmética Monetaria y Garantías ACID

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Precedencia Cronológica** | 001 |
| **Tecnologías de Referencia** | IBM Mainframes (System/360, CICS), COBOL, Fortran, Prolog |
| **Problema Nuclear** | Inconsistencia de datos ante cortes eléctricos, errores de redondeo en dinero y falta de inferencia declarativa |
| **Implementación en node-erp-app** | MariaDB InnoDB ACID, `DECIMAL(12, 4)` estricto en dinero, contratos declarativos Zod |

---

## 1. Contexto Histórico y Problema de Ingeniería

Entre 1950 y 1970 nació el procesamiento electrónico de datos empresariales. Las organizaciones se enfrentaban a tres retos críticos que podían quebrar un negocio:
1. **La pérdida de dinero por redondeo binario:** Al almacenar saldos bancarios o calcular intereses en representaciones binarias de coma flotante, las fracciones se truncaban o aproximaban arbitrariamente, produciendo discrepancias contables ilegales.
2. **La corrupción del estado por fallos mecánicos o de energía:** Si una actualización bancaria se interrumpía a la mitad del proceso, una cuenta quedaba debitada pero la otra no quedaba acreditada.
3. **El enredo procedimental en la lógica de negocio:** Intentar codificar árboles complejos de decisiones regulatorias mediante saltos de instrucción imperativos (*GOTO*) producía código inauditables.

---

## 2. Soluciones Pioneras de la Era

### 2.1. COBOL (Grace Hopper, 1959): Aritmética Decimal Exacta de Punto Fijo
- **Mecanismo Técnico:**
  COBOL introdujo el tipo de dato `COMP-3` (Decimal Empaquetado) y la especificación de formato `PIC 9(n)V99`. En este formato, cada dígito decimal se almacena directamente sin conversión a fracciones binarias de potencias de 2 ($2^{-n}$).
- **Regla Fundamental:** La moneda fiduciaria es intrínsecamente decimal. Nunca se debe calcular en coma flotante IEEE 754.

### 2.2. IBM Mainframes (System/360, 1964) y CICS: La Invención del ACID
- **Mecanismo Técnico:**
  IBM diseñó CICS (*Customer Information Control System*) como un monitor de teleproceso capaz de coordinar miles de terminales concurrentes. Desarrolló el concepto de **Unidad Lógica de Trabajo (LUW - Logical Unit of Work)**, que posteriormente Jim Gray formalizó como **ACID**:
  - **Atomicidad:** O se ejecutan todas las escrituras o ninguna.
  - **Consistencia:** El estado resultante respeta todas las restricciones del esquema.
  - **Aislamiento:** Las transacciones simultáneas no leen estados intermedios corruptos.
  - **Durabilidad:** Una vez confirmado (*COMMIT*), el dato sobrevive a fallos del sistema operativo.

### 2.3. Edgar F. Codd (IBM, 1970) y Donald D. Chamberlin (1974): El Modelo Relacional y SQL
- **Mecanismo Técnico:**
  En su histórico paper *"A Relational Model of Data for Large Shared Data Banks"*, Codd demostró que los datos debían representarse matemáticamente en **relaciones (tablas) compuestas por tuplas (filas) y atributos (columnas)**, gobernadas por el álgebra relacional y las **Formas Normales (1NF, 2NF, 3NF)**.
  Chamberlin y Boyce crearon **SEQUEL (hoy SQL)** para permitir consultar datos de forma declarativa sin conocer la ubicación física de los sectores del disco duro.
- **Regla Fundamental:** La estructura de los datos es independiente de cómo el motor los almacena en disco.

### 2.4. C y Unix (Dennis Ritchie y Ken Thompson, Bell Labs, 1969 - 1972)
- **Mecanismo Técnico:**
  Crearon la base del cómputo moderno:
  1. **Tipos Primitivos y Control de Memoria en C:** El sustrato donde hoy corren los motores de bases de datos (MariaDB, PostgreSQL) y el motor V8 de Node.js.
  2. **La Filosofía de Unix ("Todo es un flujo de bytes / stream"):** Los sockets TCP de red, los archivos y los procesos comparten la misma interfaz abstracta de lectura y escritura (*POSIX streams*).

### 2.5. Prolog (Colmerauer y Kowalski, 1972): Programación Lógica Declarativa
- **Mecanismo Técnico:**
  Sustituyó los algoritmos imperativos por un motor de inferencia basado en cálculo de predicados de primer orden: el programador define *Hechos* y *Reglas*, y el sistema deduce lógicamente si una operación es válida.

---

## 3. Línea Evolutiva en la Industria

```text
 COBOL PIC 9V99 ──────────► SQL-92 DECIMAL / NUMERIC ────► Tipos Monetarios Nativos en Bases de Datos
 IBM System/360 CICS ─────► Monitores TP (Tuxedo) ────────► Motores Relacionales con WAL (InnoDB, Postgres)
 Edgar F. Codd (3NF) ─────► SQL ANSI Estándar ────────────► Esquemas Normalizados (org_countries, org_cities)
 C / Unix POSIX Streams ──► Sockets TCP / libuv ──────────► Node.js Streams y Prepared Statements en mysql2
 Prolog Reglas Lógicas ───► Motores de Reglas (Drools) ───► Validadores Declarativos (Zod, JSON Schema)
```

---

## 4. Implementación Rigurosa en `node-erp-app`

1. **Prohibición Total de Tipos Flotantes en Tablas de Dinero (Herencia de COBOL):**
   - En las migraciones de MariaDB (`001_create_org_organization.up.sql`, y las futuras `ord_` y `bil_`), todo monto de precio, costo, subtotal, impuesto o comisión se declara exclusivamente como **`DECIMAL(12, 4)`** (o `DECIMAL(10, 2)` para montos finales), **NUNCA como `FLOAT` ni `DOUBLE`**.
2. **Normalización 3NF Estricta (Herencia de Edgar F. Codd):**
   - La base de datos rechaza la desnormalización perezosa ("sacos de gatos"): países (`org_countries`), monedas (`org_currencies`), ciudades (`org_cities`), sucursales atómicas (`org_branches`) y filiales (`org_companies`) están vinculadas con integridad referencial explícita (`FOREIGN KEY ON DELETE RESTRICT`).
3. **Persistencia ACID Obligatoria (Herencia de IBM CICS):**
   - Todas las escrituras compuestas se envuelven obligatoriamente en transacciones de InnoDB con auto-rollback en caso de error.
4. **I/O Basada en Streams TCP Nativos (Herencia de Unix y C):**
   - En `src/infrastructure/http/request-body.js`, procesamos las peticiones directamente como streams binarios de bajo nivel de Node.js sin sobrecargar la memoria.
