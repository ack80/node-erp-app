# Era 007 (2012 - 2022): Simplicidad Radical, Extractores de Tipos y Coste Cero

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Precedencia Cronológica** | 007 |
| **Tecnologías de Referencia** | Go (Google: Rob Pike / Ken Thompson, 2012), Rust / Tokio / Axum (2021) |
| **Problema Nuclear** | Cajas negras de decoradores opacos, condiciones de carrera sutiles y sobrecarga de frameworks pesados |
| **Implementación en node-erp-app** | Cero magia oculta (Inyección explícita), Context Pattern, Type Extractors y Estados Ilegales Inrepresentables |

---

## 1. Contexto Histórico y Problema de Ingeniería

Hacia 2020, muchos frameworks se convirtieron en cajas negras gigantescas con miles de dependencias en `node_modules`, decoradores opacos que hacían imposible depurar con un simple breakpoint, y consumo desmedido de memoria RAM en entornos de nube (Kubernetes / Serverless).
Go y Rust surgieron para exigir el retorno a la **simplicidad radical, la transparencia del código y la seguridad estricta en memoria**.

---

## 2. Soluciones Pioneras de la Era

### 2.1. Go (Golang, 2012): Simplicidad Radical ("Cero Magia Oculta")
- **Aporte Nuclear:**
  1. **Explicit is Better than Clever:** En Go no existen decoradores mágicos ni reflexión invisible: las dependencias se pasan como argumentos visibles en funciones constructoras.
  2. **Errores como Valores:** Las fallas se manejan explícitamente (`if err != nil`), evitando bloques gigantescos de excepciones incontroladas.
  3. **Patrón Context (`context.Context`):** Propagación de plazos de cancelación (*timeouts/deadlines*) y metadatos de petición a través de todo el ciclo de ejecución.

### 2.2. Rust / Axum (2021): Extractores de Tipos y Coste Cero
- **Aporte Nuclear:**
  1. **Patrón Extractor (`FromRequest`):** Un endpoint declara exactamente qué datos requiere (`Json(payload)`). Si los datos no cumplen la estructura en el socket de red, el código de negocio **jamás llega a ejecutarse**.
  2. **Abstracciones de Coste Cero (*Zero-Cost Abstractions*):** La modularidad y división en capas no introduce sobrecarga innecesaria en la CPU.
  3. **Hacer los Estados Ilegales Inrepresentables:** Las entidades de dominio se construyen de tal forma que resulta matemáticamente imposible crear un objeto con datos contradictorios o corruptos.

---

## 3. Línea Evolutiva en la Industria

```text
 Decoradores opacos / IoC mágica ──► Inyección Funcional de Go ──► container.js transparente en node-erp-app
 Timeouts huérfanos en HTTP ──────► Go context.Context ─────────► Cancelación de peticiones en router
 Handlers con validación dentro ──► Axum Type Extractors ───────► Parseo previo en controller (Zod)
 Objetos corruptos en memoria ────► Rust Type Safety ───────────► UserEntity con constructor estricto
```

---

## 4. Implementación Rigurosa en `node-erp-app`

1. **Inyección de Dependencias 100% Explícita (Herencia de Go):**
   - En `src/bootstrap/container.js`, cada servicio y repositorio se ensambla a mano mediante simples funciones factoría (`makeUserModule(dbPool)`). Cero librerías mágicas de DI (`tsyringe`, `inversify`), permitiendo rastrear el flujo completo con clic derecho "Go to Definition".
2. **Patrón Extractor Previo (Herencia de Axum):**
   - En `users.controller.js`, la petición atraviesa primero el extractor binario (`parseJsonBody`), luego el extractor de contrato (`createUserSchema.parse`) y solo si ambos tienen éxito se invoca el Caso de Uso.
3. **Entidades con Estados Válidos Garantizados (Herencia de Rust):**
   - `UserEntity` valida sus invariantes en el constructor y su método `toPublicJSON()` garantiza que el hash de contraseña jamás se fugue al exterior.
