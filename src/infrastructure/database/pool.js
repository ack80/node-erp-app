
// src/infrastructure/database/pool.js
import mysql from 'mysql2/promise';
import { env } from '../../config/env.js';

/**
 * @file src/infrastructure/database/pool.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 001 (IBM CICS / Persistencia de Alto Rendimiento) & Era 002 (FoxPro / Conexiones directas sin ORM)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Object Pool Pattern (Creational GoF) & Module Singleton Pattern
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Doubly-Linked List / FIFO Queue (Gestión de sockets libres en memoria de mysql2) | Adquisición: O(1) | Liberación: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      Single Shared Socket Bottleneck (bloqueo en fila india y transacciones solapadas/corruptas) & Unbounded Connection Storm (abrir 1 socket TCP por petición hasta saturar MariaDB max_connections)
 * 🛡️ EL ANTÍDOTO:                Object Pool con límite determinista (`connectionLimit: 10`), reutilización de conexiones en O(1), y exportación como Module Singleton desacoplado en el Container.
 */
export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: true, // <--- Permite ejecutar scripts con múltiples CREATE TABLE
});
