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

### 2.3. Prolog (Colmerauer y Kowalski, 1972): Programación Lógica Declarativa
- **Mecanismo Técnico:**
  Sustituyó los algoritmos imperativos por un motor de inferencia basado en cálculo de predicados de primer orden: el programador define *Hechos* y *Reglas*, y el sistema deduce lógicamente si una operación es válida.

---

## 3. Línea Evolutiva en la Industria

```text
 COBOL PIC 9V99 ──────────► SQL-92 DECIMAL / NUMERIC ────► Tipos Monetarios Nativos en Bases de Datos
 IBM System/360 CICS ─────► Monitores TP (Tuxedo) ────────► Motores Relacionales con WAL (InnoDB, Postgres)
 Prolog Reglas Lógicas ───► Motores de Reglas (Drools) ───► Validadores Declarativos (Zod, JSON Schema)
```

---

## 4. Implementación Rigurosa en `node-erp-app`

1. **Prohibición Total de Tipos Flotantes en Tablas de Dinero:**
   - En las migraciones de MariaDB (`001_create_org_organization.up.sql`, y las futuras `ord_` y `bil_`), todo monto de precio, costo, subtotal, impuesto o comisión se declara exclusivamente como **`DECIMAL(12, 4)`** (o `DECIMAL(10, 2)` para montos finales), **NUNCA como `FLOAT` ni `DOUBLE`**.
2. **Cálculos en Memoria Libres de Coma Flotante:**
   - En JavaScript, evitamos operaciones directas como `0.1 + 0.2`. Los cálculos de facturación operan sobre números enteros escalados (centavos) o utilizando precisión arbitraria.
3. **Persistencia ACID Obligatoria:**
   - Todas las escrituras que involucran más de un paso (como registrar una empresa con sus sucursales, o un usuario con sus roles asignados) se envuelven obligatoriamente en transacciones de InnoDB con auto-rollback en caso de error.
