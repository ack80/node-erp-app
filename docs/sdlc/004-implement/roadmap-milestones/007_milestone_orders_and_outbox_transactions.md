# Hito 007: Feature `orders/` — Núcleo Comercial Transaccional y Outbox Pattern

| Metadato | Valor |
|---|---|
| **Hito** | 007 |
| **Clasificación** | 👞 Zapatos (Capa 5 de Negocio: Transacciones de Venta) |
| **Precedencia Requerida** | Hito 006 completado (Requiere productos, clientes y sucursales) |
| **Estado** | 📋 PLANIFICADO |
| **Linaje de Referencia** | Era 001 (ACID), Era 002 (SAP LUW), Era 003 (Circuit Breaker / Outbox) |

---

## 1. Alcance y Entregables del Hito

1. **Migración DDL `005_create_ord_orders.up.sql` / `.down.sql`:**
   - Tablas: `ord_orders`, `ord_order_items`, `ord_order_statuses`, `ord_sync_outbox`.
   - Subtotales, IVA (15% Ecuador) y totales en `DECIMAL(12, 4)`.
2. **Caso de Uso de Creación de Orden Transaccional:**
   - Envuelto en `withTransaction`:
     1. Verifica y descuenta stock atómico en `prd_inventory`.
     2. Inserta la orden y sus ítems.
     3. Inserta la tarea en `ord_sync_outbox` para facturación electrónica sin bloquear la respuesta.
3. **Auditoría Append-Only:**
   - Registros de cambios de estado inmutables con ID de usuario y marca de tiempo.
