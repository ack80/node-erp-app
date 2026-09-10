# Guía y Plan Maestro de Diseño: Los Padres Peregrinos del Cómputo — El Legado de los Mainframes, COBOL, Fortran y Prolog

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Documentos del Compendio** | `...-fallen-heroes.md`, `...-ninja-guardians.md`, `...-modern-guardians.md`, `...-django-inspirations.md`, `...-laravel-inspirations.md`, `...-aspnet-inspirations.md`, `...-spring-inspirations.md` |
| **Objetivo** | Documentar los principios inmortales de los ancestros primordiales de la computación: **COBOL, Fortran, Prolog y la arquitectura Mainframe (IBM System/360)** |
| **Entorno de Ejecución** | Node.js (ESM Nativo), MySQL 2 / MariaDB, Docker, Vitest |
| **Filosofía** | La banca, el cálculo numérico y la lógica empresarial moderna descansan sobre los hombros de los abuelos que crearon el procesamiento de datos |

---

## 1. Justificación: Por qué Honrar a los Padres Peregrinos

Antes de los microcomputadores, de Linux, de la web y de los microservicios, existió la era fundacional (1950–1970). Los problemas que enfrentaron los pioneros no eran de interfaces visuales ni de frameworks: eran problemas de **precisión matemática absoluta en dinero, persistencia masiva en cinta y disco, y formalización lógica de reglas de negocio**.

Si un ERP moderno en Node.js pretende ser de "grado bancario", tiene la obligación ética y técnica de entender por qué los **Mainframes (IBM z/OS)** y **COBOL** todavía procesan el **95% de las transacciones de cajeros automáticos del mundo y el 80% de los pagos con tarjeta de crédito**.

```text
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                      LOS PADRES PEREGRINOS (1950 - 1970)                               │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ 🏛️ COBOL (1959)        ──► Aritmética de Punto Fijo (Decimal Exacto), Cero IEEE 754     │
 │ 🔢 FORTRAN (1957)      ──► Precisión Numérica Pura, Eficiencia Vectorial de Cálculo     │
 │ 🧠 PROLOG (1972)       ──► Motores de Reglas Declarativas y Deducción Lógica            │
 │ 🏢 MAINFRAMES / CICS   ──► El Monitor de Teleproceso Transaccional y Garantía ACID      │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Los Cuatro Ancestros Primordiales y sus Mandamientos

### 2.1. COBOL (Grace Hopper, 1959): El Santo Grial de la Precisión Financiera
- **La Lección Inmortal:**
  En JavaScript, `0.1 + 0.2 === 0.30000000000000004`. Esto se debe al estándar de coma flotante binaria **IEEE 754**.
  En un ERP o banco, **el error de redondeo de medio centavo multiplicado por 10 millones de transacciones es un delito financiero y una catástrofe contable**.
- **La Solución de COBOL:**
  COBOL introdujo la cláusula `PIC 9(10)V99` (Aritmética Decimal de Punto Fijo exacta). El dinero nunca se calcula como punto flotante: se calcula como enteros en centavos o decimales exactos.
- **En nuestro ERP:**
  - En la base de datos MariaDB, todo monto de dinero en facturas (`bil_`), órdenes (`ord_`) y comisiones se almacena estrictamente como **`DECIMAL(12, 4)`** o **`DECIMAL(10, 2)`**, **NUNCA como `FLOAT` ni `DOUBLE`**.
  - En el código JavaScript, los cálculos contables operan sobre enteros (centavos) o strings de alta precisión para evitar la pérdida de centavos del V8.

---

### 2.2. Fortran (John Backus en IBM, 1957): El Padre del Rendimiento Numérico
- **La Lección Inmortal:**
  Fortran fue el primer lenguaje de alto nivel de la historia humana. Demostró que los humanos no necesitaban programar en ensamblador binario para obtener la máxima velocidad que el procesador podía entregar.
- **En nuestro ERP:**
  - Respeto por los tipos primitivos y los índices contiguos en memoria: cuando procesamos lotes de inventario o reconciliaciones masivas, usamos arreglos densos y operaciones atómicas sin sobrecargar el recolector de basura.

---

### 2.3. Prolog (Alain Colmerauer y Robert Kowalski, 1972): Reglas de Negocio Declarativas
- **La Lección Inmortal:**
  En Prolog, el programador no escribe algoritmos paso a paso (*imperativo*): define **Hechos** y **Reglas** (*declarativo*), y el motor deduce automáticamente la verdad:
  `puede_facturar(Empresa, Sucursal) :- activa(Empresa), autorizada_sri(Sucursal).`
- **En nuestro ERP:**
  - Nuestro motor de autorización y políticas (`*.policy.js`) y las validaciones de Zod (`*.schema.js`) son **completamente declarativos**: declaramos las reglas de negocio como contratos de hechos, no como árboles infinitos de `if/else` espagueti.

---

### 2.4. Los Mainframes de IBM (System/360, 1964) y CICS: La Paternidad del ACID
- **La Lección Inmortal:**
  En 1964, Thomas Watson Jr. apostó el futuro de IBM con el **System/360**, introduciendo la compatibilidad binaria hacia adelante (un programa compilado en 1965 sigue corriendo hoy en un mainframe z16).
  Junto con él nació **CICS (Customer Information Control System)** e **IMS**, los primeros monitores de procesamiento transaccional que definieron lo que más tarde Jim Gray formalizaría como las propiedades **ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad)**.
- **En nuestro ERP:**
  - La transacción no es un accesorio: es el escudo protector del negocio. Cada operación de creación de usuario con sus roles, o de emisión de factura con descuento de inventario, se ejecuta dentro de una transacción ACID estricta con InnoDB.

---

## 3. La Genealogía Definitiva de la Ingeniería de Software

Con este documento queda sellado el linaje completo del conocimiento que sostiene a `node-erp-app`:

```text
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                      LA GENEALOGÍA SUPREMA DEL SOFTWARE                                │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ 👑 LOS PADRES PEREGRINOS (1950 - 1970):                                                │
 │ • COBOL:       Aritmética Decimal de Punto Fijo (DECIMAL exacto, cero float en dinero).│
 │ • Fortran:     Rendimiento numérico bruto, disciplina computacional.                   │
 │ • Prolog:      Reglas de negocio declarativas y motores de inferencia (Zod/Policies).  │
 │ • Mainframes:  Monitores transaccionales, compatibilidad decenal, garantías ACID.      │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ 🏛️ LOS HÉROES CAÍDOS (1970 - 1990):                                                    │
 │ • Smalltalk:   Patrón MVC, Orientación a Objetos pura, Cultura TDD (SUnit/Vitest).     │
 │ • Erlang/OTP:  Filosofía "Let it Crash", Aislamiento de memoria, Resiliencia total.   │
 │ • Delphi:      Arquitectura de ERPs transaccionales cliente/servidor, raíz TypeScript. │
 │ • Perl:        Expresiones Regulares universales (PCRE), gestores de paquetes (npm).   │
 │ • Lisp:        Funciones de orden superior (callbacks/lambdas), closures y GC.         │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ ⚔️ LOS VETERANOS HEROICOS (1995 - 2015):                                               │
 │ • Ruby on Rails: Convención sobre Configuración, Paternidad de Migraciones UP/DOWN.    │
 │ • Django:        Vertical Slices (Apps Aisladas), Seguridad "Secure-by-Default".       │
 │ • Laravel:       Ergonomía, withTransaction, Policies por sucursal, Seeds modulares.   │
 │ • ASP.NET Core:  RFC 7807 (ProblemDetails), CorrelationId, Dual Health Checks.         │
 │ • Spring Boot:   Puertos y Adaptadores (Hexagonal), Circuit Breaker, Append-Only.      │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ ⚡ LOS JÓVENES TITANES & NINJAS (2009 - Presente):                                     │
 │ • FastAPI:       Contratos DTO estrictos que son validación y OpenAPI a la vez.        │
 │ • Node.js:       Event Loop asíncrono no bloqueante, Streams TCP con Backpressure.     │
 │ • Go:            Cero magia oculta (Explicit > Clever), Errores como valores, Context. │
 │ • Rust:          Extractores de peticiones, Abstracciones coste cero, Estados puros.   │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```
