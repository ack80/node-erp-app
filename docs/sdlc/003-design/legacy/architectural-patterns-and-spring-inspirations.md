# Guía y Plan Maestro de Diseño: Lecciones de Resiliencia, Puertos y Adaptadores Inspiradas en Spring Boot (Zero-Frameworks)

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Documentos Hermanos** | `architectural-patterns-and-laravel-inspirations.md`, `architectural-patterns-and-aspnet-inspirations.md` |
| **Objetivo** | Adoptar las lecciones de resiliencia bancaria, arquitectura hexagonal estricta y tolerancia a fallos de Java / Spring Boot |
| **Entorno de Ejecución** | Node.js (ESM Nativo), MySQL 2 / MariaDB, Docker, Vitest |
| **Filosofía** | Sobrevivir a las décadas: código desacoplado de la infraestructura, auditoría inmutable y tolerancia a caídas externas |

---

## 1. Justificación: Por qué Mirar a Java y Spring Boot

Java y el ecosistema Spring Boot han dominado el software bancario, asegurador y de misión crítica durante más de dos décadas. Procesan billones de dólares diarios en empresas como Visa, JPMorgan Chase, Amazon y Netflix.

A diferencia de proyectos JavaScript convencionales que se vuelven obsoletos o inmanejables en dos años, las aplicaciones empresariales de Spring están diseñadas para durar 15 o 20 años en producción.

Al construir este ERP sin frameworks, destilamos las **5 lecciones de oro de Spring Boot** para blindar nuestra arquitectura contra el paso del tiempo.

```text
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │               5 LECCIONES ENTERPRISE INSPIRADAS EN SPRING BOOT                  │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ 1. Puertos y Adaptadores (Hexagonal) ──► El dominio jamás conoce a MariaDB      │
 │ 2. Perfiles de Entorno (Profiles)    ──► Configuración coherente dev/test/prod  │
 │ 3. Resiliencia & Circuit Breaker     ──► Caídas del SRI/pagos no colapsan el ERP│
 │ 4. Auditoría Inmutable (Append-Only) ──► Rastreabilidad contable y antifraude   │
 │ 5. Graceful Shutdown & Draining      ──► Cero transacciones cortadas en deploy  │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Lección 1: Arquitectura Hexagonal Pura (Ports & Adapters)

### El Problema en Proyectos JavaScript:
El código de negocio termina fuertemente acoplado a la librería de base de datos (`mysql2`, Prisma, TypeORM). Si la librería cambia, o si se desea probar la lógica de negocio sin base de datos, es imposible desacoplarla.

### La Lección de Spring Boot:
El corazón de la aplicación (el Dominio y los Casos de Uso) **solo define interfaces/contratos (Puertos)**. La infraestructura (base de datos, HTTP, servicios externos) son **Adaptadores** que se conectan por fuera.

```text
               ┌─────────────────────────────────────────────────┐
               │                CAPA DE DOMINIO                  │
               │                                                 │
               │   CreateUserUseCase ──► [Port: UserRepository]  │
               └──────────────────────────────┬──────────────────┘
                                              │ Inyección
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
     ┌───────────────────────────────┐                 ┌───────────────────────────────┐
     │ ADAPTADOR PRODUCCIÓN:         │                 │ ADAPTADOR TEST (VITEST):      │
     │ MySqlUserRepository          │                 │ InMemoryUserRepository        │
     │ (Queries directas MariaDB)    │                 │ (Arreglo en memoria, 12ms)    │
     └───────────────────────────────┘                 └───────────────────────────────┘
```

### Aplicación en nuestro ERP:
- Nuestros Casos de Uso (como `users.create.use-case.js`) reciben únicamente un objeto con la firma del contrato:
  - `findByEmail(holdingId, email)`
  - `findById(id)`
  - `create(userData)`
- **Beneficio:** En pruebas unitarias no levantamos Docker ni MariaDB; inyectamos un objeto en memoria y la suite completa corre en milisegundos.

---

## 3. Lección 2: Perfiles de Entorno Coherentes (Spring Profiles)

### El Problema:
Condicionales `if (process.env.NODE_ENV === 'development')` dispersos por todo el código fuente.

### La Lección de Spring:
Los entornos no son solo variables sueltas: son **Perfiles Coherentes** (`development`, `test`, `staging`, `production`).

### Aplicación en nuestro ERP:
- **`test`:**
  - Base de datos en memoria o con rollback automático.
  - Logger silenciado para no contaminar la salida de Vitest.
  - Hasher de contraseñas con coste computacional bajo para velocidad en tests.
- **`development`:**
  - MariaDB local en Docker (`erp_master_dev`).
  - Logger detallado en formato legible.
  - Argon2id con parámetros OWASP completos.
- **`production`:**
  - MariaDB gestionada en Aiven (SSL obligatorio, pool estricto).
  - Logger en JSON estructurado para ingestión en Datadog / ELK.
  - Fail-Fast estricto: rechaza iniciar si falta cualquier secreto.

---

## 4. Lección 3: Tolerancia a Fallos y Circuit Breaker (Resiliencia)

### El Escenario Real en Ecuador:
En un ERP de comercio y facturación:
- El servicio del **SRI de Ecuador** (Servicio de Rentas Internas) se cae con frecuencia para mantenimiento o saturación.
- Si un cliente intenta pagar y la llamada HTTP al SRI tarda 40 segundos hasta dar timeout, las conexiones de Node.js se agotan y **todo el sistema colapsa**, impidiendo incluso que las cajas físicas cobren en efectivo.

### La Lección de Spring Cloud (Resilience4j / Circuit Breaker):
Un disyuntor monitorea las llamadas externas:
1. **Estado Cerrado (Normal):** Las peticiones fluyen al servicio externo.
2. **Estado Abierto (Falla detectada):** Si 5 llamadas seguidas fallan o tardan más de 3 segundos, el disyuntor se **abre**. Las siguientes peticiones no esperan: responden de inmediato con un camino alternativo (*fallback*).
3. **Estado Semi-Abierto:** Cada cierto tiempo prueba una petición piloto para verificar si el servicio externo revivió.

```text
 Venta Realizada ──► Intento de Factura SRI
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
       [SRI Disponible]            [SRI Caído / Abierto]
       Autorizado online           Guardado en tabla `ord_sync_outbox`
                                   y emitido comprobante provisional
```

---

## 5. Lección 4: Auditoría Inmutable y Trazabilidad Contable (Append-Only)

### El Problema de la Corrupción de Datos:
En un ERP, las tablas de dinero **nunca deben hacer `UPDATE` destructivo** sobre registros contables.
Si un empleado modifica el monto de una orden o factura, y la base de datos solo guarda el nuevo valor con `updated_at`, es imposible auditar el fraude.

### La Lección de Spring Data Envers / Event Sourcing:
Los registros transaccionales son **inmutables** (Append-Only):
- Si una orden de venta se modifica, se genera un evento de ajuste con su motivo.
- Toda tabla transaccional (`ord_*`, `bil_*`) registra:
  - `created_by_user_id`
  - `created_at`
  - En caso de cancelación, no se hace `DELETE`: se registra un estado `CANCELLED` junto con `cancelled_reason` y `cancelled_by_user_id`.

---

## 6. Lección 5: Graceful Shutdown y Drenado de Conexiones (Draining)

### El Problema en Despliegues:
Cuando se sube una nueva versión a producción con CI/CD, el proceso anterior de Node.js se mata con `SIGTERM`. Si un usuario estaba a la mitad de una transacción bancaria de $2,000, la conexión se corta abruptamente y la base de datos queda en estado inconsistente.

### La Lección de Spring Boot:
El servidor implementa **Graceful Shutdown con Drenado**:
1. Deja de aceptar peticiones HTTP nuevas (responde `503 Service Unavailable` a nuevos clientes).
2. Da un tiempo de gracia (ej. 10 segundos) para que las peticiones y transacciones en vuelo terminen normalmente.
3. Cierra ordenadamente el Pool de conexiones a MariaDB y Redis.
4. Finaliza el proceso con código de salida `0`.

> **Nota de Implementación:** Nuestro archivo `src/main.js` ya cuenta con los listeners `SIGTERM` y `SIGINT` que invocan `server.stop()`. En los siguientes pasos nos aseguraremos de que cierre también el `pool.end()` de la base de datos.

---

## 7. La Trilogía de Arquitectura Completa

Con este documento, el proyecto cuenta con un marco conceptual exhaustivo que combina lo mejor de la industria:

1. **`architectural-patterns-and-laravel-inspirations.md`** $\to$ *Ergonomía, flujo de negocio y casos de uso.*
2. **`architectural-patterns-and-aspnet-inspirations.md`** $\to$ *Rigor de tipos, observabilidad y trazabilidad.*
3. **`architectural-patterns-and-spring-inspirations.md`** $\to$ *Resiliencia, desacoplamiento y persistencia inmutable.*
