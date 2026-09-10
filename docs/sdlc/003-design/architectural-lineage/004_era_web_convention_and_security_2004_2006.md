# Era 004 (2004 - 2006): Convención sobre Configuración y Seguridad Web por Defecto

| Metadato | Valor |
|---|---|
| **Fase SDLC** | 003-design |
| **Precedencia Cronológica** | 004 |
| **Tecnologías de Referencia** | Ruby on Rails (DHH, 2004), Django (Adrian Holovaty / Simon Willison, 2005) |
| **Problema Nuclear** | Parálisis por configuración (XML Hell), modificaciones manuales de BD y vulnerabilidades comunes OWASP |
| **Implementación en node-erp-app** | Convención de nombres, Migraciones UP/DOWN por Batches, Vertical Slices, Cabeceras de Seguridad Nativas |

---

## 1. Contexto Histórico y Problema de Ingeniería

Hacia 2004, desarrollar una aplicación web corporativa requería días de configuración burocrática antes de escribir una sola línea de lógica. Además, la base de datos se alteraba manualmente en producción sin trazabilidad de versiones en Git, y las aplicaciones nacían vulnerables por defecto a ataques de inyección, Cross-Site Scripting (XSS) y Clickjacking.

---

## 2. Soluciones Pioneras de la Era

### 2.1. Ruby on Rails (David Heinemeier Hansson, 2004)
- **Aporte Nuclear:**
  1. **Convención sobre Configuración (Convention over Configuration - CoC):** Si sigues convenciones estándar de nombres de archivos y tablas, eliminas el 90% de los archivos de configuración.
  2. **Migraciones Bidireccionales (UP / DOWN):** La base de datos es código versionado en Git que puede avanzar o retroceder de forma determinista mediante lotes (*batches*).
  3. **Controladores Enjutos (*Skinny Controllers*):** El controlador solo coordina el tráfico HTTP; la lógica pesada pertenece al dominio.

### 2.2. Django (Adrian Holovaty y Simon Willison, 2005)
- **Aporte Nuclear:**
  1. **Arquitectura en Vertical Slices (Pluggable Apps):** Cada funcionalidad de negocio es una aplicación autocontenida (`features/<feature>/`) con sus propios modelos, rutas y pruebas.
  2. **Seguridad por Defecto (*Secure by Default*):** Las cabeceras de protección (anti-clickjacking, anti-MIME sniffing, límites de tamaño) vienen encendidas desde el primer milisegundo.
  3. **Permisos Atómicos Desacoplados:** En lugar de comprobar nombres rígidos de roles (`if user.role == 'ADMIN'`), se validan capacidades atómicas (`users:create`, `invoices:void`).

---

## 3. Línea Evolutiva en la Industria

```text
 Rails Migrations (rake db:migrate) ──► TypeORM / Prisma Migrations ──► scripts/migrate.js por Batches (Zero-Framework)
 Django Pluggable Apps ───────────────► Vertical Slices / Clean Arch ──► src/features/<feature>/ (Regla AGENTS.md)
 Django Secure by Default ────────────► Helmet.js / WAF Policies ─────► Cabeceras OWASP en cors.middleware.js
```

---

## 4. Implementación Rigurosa en `node-erp-app`

1. **Migraciones Quirúrgicas UP/DOWN (`scripts/migrate.js` y `scripts/rollback.js`):**
   - Cada migración posee su contraparte `.up.sql` y `.down.sql`. La tabla `_migrations` almacena la columna `batch` para permitir reversiones exactas sin raspar tablas ajenas.
2. **Cohesión Estricta por Feature (Vertical Slices):**
   - Todo lo que cambia junto vive junto en `src/features/<feature>/`. Las pruebas unitarias de un feature viven dentro de su carpeta, nunca en un directorio centralizado.
3. **Seguridad Nivel OWASP Activa:**
   - Cabeceras `X-Frame-Options: DENY` y `X-Content-Type-Options: nosniff` inyectadas en cada respuesta. Límite anti-DoS de 1 MB en el stream TCP.
