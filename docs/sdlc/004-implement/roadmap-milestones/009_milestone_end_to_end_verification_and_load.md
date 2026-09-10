# Hito 009: Verificación E2E, Rendimiento (k6) y Auditoría DAST (ZAP)

| Metadato | Valor |
|---|---|
| **Hito** | 009 |
| **Clasificación** | 🛡️ Auditoría Global y Calidad Enterprise |
| **Precedencia Requerida** | Hitos 001 al 008 completados |
| **Estado** | 📋 PLANIFICADO |
| **Linaje de Referencia** | Era 002 (Smalltalk / TDD), Era 004 (Django OWASP) |

---

## 1. Alcance y Entregables del Hito

1. **Flujos Completos E2E con Playwright (`test/e2e/`):**
   - Flujo 1: Registro de usuario $\to$ Login $\to$ Obtención de token $\to$ Consulta de sucursales.
   - Flujo 2: Creación de orden $\to$ Descuento de stock $\to$ Emisión de factura.
2. **Pruebas de Carga y Concurrencia con k6 (`test/load/`):**
   - Prueba de estrés de 1,000 usuarios concurrentes validando latencia p95 < 200ms en endpoints críticos.
3. **Escaneo de Vulnerabilidades OWASP ZAP (`test/security/`):**
   - DAST automatizado en staging validando ausencia de inyecciones SQL, cabeceras seguras y cookies protegidas.
