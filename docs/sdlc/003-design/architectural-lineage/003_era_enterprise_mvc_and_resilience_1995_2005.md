# Era 003 (1995 - 2005): Desacoplamiento Empresarial, Puertos y Resiliencia Bancaria

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Precedencia Cronológica** | 003 |
| **Tecnologías de Referencia** | Java J2EE, Spring Framework, Spring Boot, Spring Cloud (Hystrix / Resilience4j) |
| **Problema Nuclear** | Acoplamiento rígido a librerías de infraestructura, caídas en cascada por APIs lentas y pérdida de trazabilidad contable |
| **Implementación en node-erp-app** | Puertos y Adaptadores (Hexagonal), Circuit Breaker con Outbox Pattern, Auditoría Inmutable |

---

## 1. Contexto Histórico y Problema de Ingeniería

A finales de los 90, la web empresarial colapsó bajo el peso de Java J2EE y sus componentes EJB (*Enterprise JavaBeans*), que exigían cientos de líneas de configuración XML y servidores de aplicaciones monolíticos pesados.
Spring Framework surgió para demostrar que el código de negocio debía ser **independiente de la infraestructura**.

---

## 2. Soluciones Pioneras de la Era

### 2.1. Puertos y Adaptadores (Arquitectura Hexagonal - Alistair Cockburn / Spring)
- **Mecanismo Técnico:**
  El Dominio y los Casos de Uso solo definen contratos de interfaces (*Ports*). Los controladores, bases de datos o clientes HTTP externos son meros adaptadores enchufables (*Adapters*).
- **Regla:** El código de negocio jamás importa ni depende directamente de `mysql2`, Redis o librerías de terceros.

### 2.2. Tolerancia a Fallos y Circuit Breakers (Spring Cloud / Netflix)
- **Mecanismo Técnico:**
  Si un servicio externo (como el SRI de Ecuador o una pasarela de pagos) empieza a fallar o a responder con lentitud extrema, el disyuntor se **abre**: en lugar de colgar los hilos del servidor esperando 30 segundos, responde de inmediato con una vía alternativa (*Fallback*) y encola la operación en la tabla de Outbox.

### 2.3. Domain-Driven Design (DDD - Eric Evans, 2003 y Martin Fowler)
- **Mecanismo Técnico:**
  Evans y Fowler formalizaron la arquitectura de software empresarial orientada al dominio de negocio:
  1. **Lenguaje Ubicuo (*Ubiquitous Language*):** El código fuente, las tablas y las conversaciones con el contador o gerente usan exactamente los mismos términos (`holding`, `company`, `branch`, `tax_id`).
  2. **Entidades vs Objetos de Valor (*Value Objects*):** `UserEntity` tiene identidad propia (ID); un correo electrónico o un código postal son inmutables y se validan por su valor.
  3. **Límites de Contexto (*Bounded Contexts*) y Raíces de Agregado (*Aggregate Roots*):** Un Holding controla sus filiales como un todo coherente.
  4. **Patrón Repositorio (*Repository Pattern*):** Encapsula el acceso a datos como si fuera una colección en memoria, separando la lógica de negocio de las consultas SQL directas.

### 2.4. Auditoría Inmutable y Rastreabilidad (Spring Data Envers / Append-Only)
- **Mecanismo Técnico:**
  Las tablas de dinero no hacen `UPDATE` destructivo. Cada modificación registra un nuevo estado inmutable con el identificador del usuario, IP y motivo del cambio.

---

## 3. Línea Evolutiva en la Industria

```text
 Java Interfaces / Spring IoC ──► Ports & Adapters ──────────► Repositorios desacoplados en node-erp-app
 Eric Evans & Martin Fowler ────► Domain-Driven Design (DDD) ─► Entidades, Value Objects y Repositorios puros
 Netflix Hystrix / Resilience4j ─► Circuit Breakers ─────────► Outbox Pattern + Worker Redis para SRI
 Spring Data Envers ────────────► Event Sourcing / CDC ──────► Tablas transaccionales Append-Only
```

---

## 4. Implementación Rigurosa en `node-erp-app`

1. **Casos de Uso Desacoplados (Puertos y Adaptadores):**
   - `users.create.use-case.js` solo conoce métodos abstractos del repositorio (`findByEmail`, `create`). En pruebas unitarias se inyecta un adaptador en memoria que corre en 12 milisegundos sin tocar MariaDB.
2. **Entidades y Repositorios DDD (Herencia de Evans y Fowler):**
   - `users.entity.js` modela la entidad con identidad única y métodos puros de serialización (`toPublicJSON()`).
   - `users.repository.js` aísla las consultas SQL de MariaDB sin contaminar el Caso de Uso.
3. **Resiliencia Operativa ante el SRI de Ecuador:**
   - La emisión de facturas electrónicas y sincronizaciones externas no bloquean la respuesta HTTP al cliente: se persisten transaccionalmente en `ord_sync_outbox` para procesamiento asíncrono.
