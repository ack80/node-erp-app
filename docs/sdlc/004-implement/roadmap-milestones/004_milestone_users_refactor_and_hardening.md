# Hito 004: Enlace, Transacciones y Hardening del Feature `users/`

| Metadato | Valor |
|---|---|
| **Hito** | 004 |
| **Clasificación** | 👞 Zapatos (Capa 2 de Negocio: Consolidación de Usuarios) |
| **Precedencia Requerida** | Hito 002 (withTransaction) e Hito 003 (Auth / Policies) |
| **Estado** | 📋 PLANIFICADO |

---

## 1. Alcance y Entregables del Hito

1. **Refactor Transaccional del Caso de Uso:**
   - Enlazar `users.create.use-case.js` a `withTransaction(db, ...)` para que la creación del usuario y la asignación en `usr_user_roles` ocurran bajo garantía ACID atómica.
2. **Endpoints Restful Completos:**
   - `GET /api/v1/users`: Listar usuarios con paginación y filtro obligatorio por `holdingId` (protegido por ABAC).
   - `GET /api/v1/users/:id`: Obtener detalle de usuario validando pertenencia a la misma empresa.
   - `PUT /api/v1/users/:id`: Actualizar perfil respetando políticas de sucursal.
3. **Mapeo de Errores a RFC 7807:**
   - Todo error de email duplicado o rol inexistente responde `application/problem+json` con `traceId`.
