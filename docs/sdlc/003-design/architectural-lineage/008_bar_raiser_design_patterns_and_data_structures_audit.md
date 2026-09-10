# Matriz Maestra de Auditoría Bar Raiser: Patrones de Diseño Formales (GoF / PoEAA) y Estructuras de Datos

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design / 004-implement |
| **Ubicación** | `docs/sdlc/003-design/architectural-lineage/008_bar_raiser_design_patterns_and_data_structures_audit.md` |
| **Audiencia** | Principals, Staff Engineers, Bar Raisers (Amazon, Google, Meta, Stripe) |
| **Objetivo** | Mapeo exhaustivo y riguroso de Patrones de Diseño Canónicos (GoF / Fowler) y Estructuras de Datos de Bajo Nivel por cada Hito de Construcción. |

---

## 1. El Arsenal del Bar Raiser: ¿Cómo se quebra a un candidato?

Los entrevistadores de nivel **Bar Raiser** detectan a los desarrolladores de "copiar y pegar tutoriales" haciendo dos preguntas letales de bajo nivel:
1. **La trampa del patrón nominal:** *"Mencionas que desacoplas con un controller, pero ¿cuál es el patrón GoF exacto detrás de ese middleware y por qué no usas Decorator o Chain of Responsibility puro?"*
2. **La trampa de la estructura de datos en memoria y complejidad algorítmica:** *"¿Qué estructura de datos almacena tus rutas, tus conexiones de base de datos o los chunks del stream TCP? ¿Cuál es la complejidad temporal y espacial en Big-O ($O(1)$, $O(\log n)$, $O(n)$) de cada operación y por qué esa estructura previene colapsos por fragmentación de memoria o CPU starvation?"*

Este documento audita cada hito de nuestra hoja de ruta, desmontando capa por capa los **Patrones de Diseño Formales** y las **Estructuras de Datos** que sostienen nuestro backend Zero-Frameworks.

---

## 2. Auditoría Hito por Hito: Patrones y Estructuras de Datos

```text
 ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ HITO 001: RUNTIME BASE HTTP, ROUTER O(1), POOL DE BD Y MIGRACIONES UP/DOWN                            │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Patrones de Diseño Formales:                                                                           │
 │ • Front Controller (PoEAA)            ──► Enrutador centralizado que canaliza todas las peticiones.    │
 │ • Chain of Responsibility (GoF)       ──► Pipeline de middlewares procesando en cascada ordenada.      │
 │ • Singleton Pattern (GoF / Module)    ──► Pool de base de datos único exportado como ESM Module.       │
 │ • Object Pool Pattern (GoF / Creational)► Reutilización determinista de sockets TCP a MariaDB.         │
 │ • Command Pattern (GoF)               ──► Scripts migrate.js / rollback.js ejecutando unidades UP/DOWN.│
 │                                                                                                        │
 │ Estructuras de Datos y Complejidad:                                                                    │
 │ • Hash Table / Hash Map (ES6 Map)     ──► Enrutador HTTP: O(1) tiempo en lookups de rutas.             │
 │ • Doubly-Linked List / FIFO Queue     ──► Cola de espera del Connection Pool en saturación.            │
 │ • Circular Ring Buffer / Byte Stream  ──► Buffer de node:http recibiendo TCP chunks con límite estricto│
 │ • B-Tree (MariaDB InnoDB Engine)      ──► Índices primarios y foráneos (Clustered Index O(log n)).     │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ HITO 002: INFRAESTRUCTURA TRANSVERSAL DE RESILIENCIA Y OBSERVABILIDAD                                  │
 │ • withTransaction, CorrelationId / traceId, RFC 7807 ProblemDetails                                    │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Patrones de Diseño Formales:                                                                           │
 │ • Unit of Work (PoEAA)                ──► Mantiene la lista de transacciones pendientes en una conexión│
 │ • Template Method / Loan Pattern      ──► withTransaction(pool, fn) gestiona apertura, commit y cierre│
 │ • Decorator / Interceptor Pattern     ──► Inyección de traceId e interceptores de cabeceras RFC 7807. │
 │ • Factory Pattern (GoF)               ──► createProblemDetails() encapsulando la norma IETF RFC 7807.  │
 │                                                                                                        │
 │ Estructuras de Datos y Complejidad:                                                                    │
 │ • Call Stack LIFO (V8 Engine)         ──► Anidamiento de bloques try/catch/finally en withTransaction. │
 │ • String Buffer / Byte Array          ──► Serialización JSON del payload de error RFC 7807.            │
 │ • Map / Context Dictionary (TLS/ALS)  ──► Almacén de traceId persistente a lo largo del ciclo asíncrono│
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ HITO 003: MÓDULO IAM, AUTENTICACIÓN JWT Y POLÍTICAS DE ACCESO ABAC (auth/)                             │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Patrones de Diseño Formales:                                                                           │
 │ • Strategy Pattern (GoF)              ──► Políticas de autorización intercambiables según el recurso.  │
 │ • Token Bucket / Leaky Bucket         ──► Prevención de ataques de fuerza bruta en aut_login_audit.    │
 │ • Guard / Gatekeeper Pattern          ──► auth.middleware.js verificando identidad antes de entrar.   │
 │                                                                                                        │
 │ Estructuras de Datos y Complejidad:                                                                    │
 │ • Fixed-Length Byte Array (Uint8Array)──► Salting y Hash de Argon2id (prevención de Timing Attacks).   │
 │ • Hash Set (Redis Key-Value O(1))     ──► Lista negra de Refresh Tokens revocados de acceso inmediato. │
 │ • JSON Web Token (Base64URL Header/Payload/Signature) ──► Compact Vector de transporte sin estado.    │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ HITO 004: ENLACE, HARDENING Y CASOS DE USO DE USUARIOS (users/)                                        │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Patrones de Diseño Formales:                                                                           │
 │ • Repository Pattern (PoEAA / Evans)  ──► Colección abstracta en memoria mediando contra MariaDB.      │
 │ • Data Transfer Object (DTO)          ──► createUserSchema (Zod) como frontera de entrada tipada.     │
 │ • Use Case / Command Handler (Clean)  ──► Orquestación única por acción de negocio (SRP).              │
 │                                                                                                        │
 │ Estructuras de Datos y Complejidad:                                                                    │
 │ • Record / Frozen Object (Object.freeze) ──► UserEntity garantizando inmutabilidad del dominio.        │
 │ • Radix Tree / Trie (si aplica en paths) ──► Validación de jerarquías de roles y usuarios.             │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ HITO 005: FEATURE ORGANIZATION (HOLDINGS, FILIALES SRI, SUCURSALES)                                    │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Patrones de Diseño Formales:                                                                           │
 │ • Composite Pattern (GoF)             ──► Jerarquía arbórea: Holding ──► Company ──► Branch ──► Store.│
 │ • Specification Pattern (Evans/Fowler)──► Reglas de validación compuestas (RUC SRI Ecuador válido).    │
 │                                                                                                        │
 │ Estructuras de Datos y Complejidad:                                                                    │
 │ • N-ary Tree (Árbol N-ario)           ──► Modelado de la jerarquía corporativa multi-tenant en memoria.│
 │ • Adjacency List (Lista de Adyacencia)──► Representación SQL de dependencias foráneas (company_id).    │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ HITO 006: CATÁLOGO DE PRODUCTOS, PRECIOS DECIMALES Y KARDEX (products/)                                │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Patrones de Diseño Formales:                                                                           │
 │ • Value Object (DDD)                  ──► Dinero tipado en Decimal(12,4) con métodos inmutables.      │
 │ • Snapshot Pattern / Memento (GoF)    ──► Foto instantánea de stock de inventario para cierre contable.│
 │                                                                                                        │
 │ Estructuras de Datos y Complejidad:                                                                    │
 │ • Scaled Integers / Fixed-Point Arithmetic ──► Enteros multiplicados por 10^4 para evitar float IEEE754│
 │ • Inverted Index / B-Tree Compuesto   ──► Búsqueda O(log n) por SKU, Código de Barras y Branch ID.    │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ HITO 007: NÚCLEO TRANSACCIONAL DE VENTAS Y OUTBOX PATTERN (orders/)                                    │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Patrones de Diseño Formales:                                                                           │
 │ • Transactional Outbox Pattern        ──► Garantía de consistencia eventual entre BD y microservicios. │
 │ • State Pattern (GoF)                 ──► Máquina de estados de la orden (PENDING ─► PAID ─► VOID).   │
 │                                                                                                        │
 │ Estructuras de Datos y Complejidad:                                                                    │
 │ • Append-Only Log / WAL Simulation    ──► Tabla ord_sync_outbox procesada secuencialmente (FIFO O(1)). │
 │ • Directed Acyclic Graph (DAG)        ──► Transiciones legales de estados de una orden sin ciclos.     │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ HITO 008: FACTURACIÓN ELECTRÓNICA Y FISCALIDAD SRI ECUADOR (billing/)                                  │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Patrones de Diseño Formales:                                                                           │
 │ • Adapter Pattern (GoF)               ──► Adaptador al Web Service SOAP/REST del SRI de Ecuador.       │
 │ • Circuit Breaker Pattern             ──► Aislamiento ante caídas masivas del servidor tributario.     │
 │                                                                                                        │
 │ Estructuras de Datos y Complejidad:                                                                    │
 │ • Priority Queue (Heap / Cola Prioridad) ──► Reintentos con Backoff Exponencial para facturas fallidas.│
 │ • Numeric Array / Modulo 11 Vector    ──► Cálculo de dígito verificador para la clave de 49 dígitos.   │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ HITO 009: AUDITORÍA GLOBAL, PRUEBAS DE CARGA Y SEGURIDAD DAST                                          │
 ├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Patrones de Diseño Formales:                                                                           │
 │ • Test Double / Spy / Mock (Meszaros) ──► Aislamiento determinista de componentes en pruebas.          │
 │ • Virtual Users Pool (k6)             ──► Simulación concurrente estocástica de saturación de red.     │
 │                                                                                                        │
 │ Estructuras de Datos y Complejidad:                                                                    │
 │ • Reservoir Sampling / P-Square Algorithm ──► Cálculo en tiempo real de percentiles p95/p99 en k6.     │
 │ • Directed Graph (ZAP Crawler)        ──► Mapeo exhaustivo de superficies de ataque y endpoints.      │
 └────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Guía de Defensa ante el Bar Raiser: Preguntas y Respuestas Letales

### Pregunta 1: *"¿Por qué construyes tu propio router con un Map en lugar de usar un Trie o una librería como `find-my-way`?"*
- **Respuesta de Nivel Staff:**
  > *"En nuestro caso de uso actual, las rutas son estáticas y predeterminadas (`/api/v1/users`, `/health`). Una **Hash Table (ES6 `Map`)** proporciona búsqueda en tiempo constante **$O(1)$** en promedio, evitando la sobrecarga de traversal por nodos de un **Radix Tree / Trie** ($O(k)$ donde $k$ es la longitud del path). Además, al prescindir de librerías externas eliminamos la superficie de vulnerabilidad en la cadena de suministro (Supply Chain Attacks) y asignaciones innecesarias de memoria en el heap."*

### Pregunta 2: *"En `withTransaction(pool, fn)`, ¿qué estructura garantiza que una conexión no se fugue si el callback arroja una promesa rechazada no capturada?"*
- **Respuesta de Nivel Staff:**
  > *"Implementamos el **Loan Pattern (Template Method)** apoyado en el bloque determinista `finally` del **Call Stack de JavaScript / V8**. La adquisición y liberación de la conexión están encapsuladas dentro del mismo frame léxico: la conexión del Object Pool jamás se expone como variable global o flotante. Si el closure arroja un error síncrono o una excepción asíncrona no controlada, el flujo del microtask loop garantiza la ejecución del `connection.release()`, devolviendo el socket a la cola circular del pool en tiempo $O(1)$."*

### Pregunta 3: *"¿Por qué el RFC 7807 (`ProblemDetails`) es superior a devolver un JSON arbitrario como `{ error: 'Invalid data' }`?"*
- **Respuesta de Nivel Staff:**
  > *"Porque desacopla el cliente del contrato de error mediante un estándar normado por la IETF. `ProblemDetails` (`application/problem+json`) define propiedades canónicas (`type`, `title`, `status`, `detail`, `instance`, `invalidParams`). Esto permite que API Gateways, Service Meshes y clientes frontend genéricos reconozcan la semántica de la falla sin escribir código de parseo específico para cada microservicio. Además, ligamos cada error al `traceId` distributed tracing, permitiendo correlacionar el incidente en logs estructurados con costo de búsqueda $O(1)$ en herramientas como Datadog o Elasticsearch."*

### Pregunta 4: *"Para la base de datos, ¿usas el patrón Singleton o el patrón Object Pool? ¿Cuál es la diferencia exacta y cómo evitas el anti-patrón de Singleton global?"*
- **Respuesta de Nivel Staff:**
  > *"Utilizamos **ambos patrones en capas distintas y complementarias**:
  > 1. **A nivel de conexión TCP individual:** Un Singleton sería desastroso. Una sola conexión física a MariaDB provocaría que peticiones concurrentes se bloqueen entre sí en fila india o que una transacción en curso (`BEGIN`) sea leída o abortada por otra petición simultánea. Por eso, a nivel de conexiones se usa un **Object Pool Pattern** (`mysql2.createPool({ connectionLimit: 10 })`), que administra una cola de $N$ sockets TCP independientes reutilizables.
  > 2. **A nivel del gestor del Pool:** El Pool en sí mismo actúa como un **Module Singleton** en Node.js (gracias a la caché del cargador ESM de Node que evalúa `pool.js` exactamente una vez). 
  > 3. **Eliminación del Anti-Patrón:** Para no acoplar el código al Singleton global (lo cual impediría hacer unit testing sin base de datos real), desacoplamos la instancia inyectándola a través de nuestro contenedor de dependencias (`createContainer({ db: overrides.db || pool })`). Así, en producción se comparte el Pool único, pero en pruebas unitarias podemos inyectar un **Test Double (Fake Pool con `vi.fn()` o `mysql-mock`)** en tiempo $O(1)$ sin tocar sockets de red."*

