// src/infrastructure/database/pool.js
import mysql from 'mysql2/promise';
import { env } from '../../config/env.js';

/**
 * Pool de conexiones nativo a MySQL (sin ORM)
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
});
