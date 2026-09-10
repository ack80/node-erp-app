# Hito 008: Feature `billing/` — Facturación Electrónica y Fiscalidad (SRI Ecuador)

| Metadato | Valor |
|---|---|
| **Hito** | 008 |
| **Clasificación** | 👞 Zapatos (Capa 6 de Negocio: Fiscalidad y Cobranzas) |
| **Precedencia Requerida** | Hito 007 completado |
| **Estado** | 📋 PLANIFICADO |
| **Linaje de Referencia** | Era 001 (Mainframes / COBOL), Era 003 (Resiliencia SRI) |

---

## 1. Alcance y Entregables del Hito

1. **Migración DDL `006_create_bil_billing.up.sql` / `.down.sql`:**
   - Tablas: `bil_invoices`, `bil_invoice_items`, `bil_payments`, `bil_tax_retentions`.
2. **Generación de Clave de Acceso SRI (49 dígitos numéricos):**
   - Algoritmo Módulo 11 para comprobantes electrónicos de Ecuador.
3. **Worker Asíncrono de Procesamiento:**
   - Procesa los ítems pendientes en `ord_sync_outbox`, genera el XML firmado y envía al webservice del SRI con lógica de reintentos y tolerancia a caídas.
