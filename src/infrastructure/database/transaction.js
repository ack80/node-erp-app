// src/infrastructure/database/transaction.js
import { pool } from './pool.js';

/**
 * Ejecuta una operación atómica dentro de una transacción MySQL gestionada manualmente.
 * 
 * @param {Function} callback - Función que recibe la conexión activa (connection)
 * @returns {Promise<any>}
 */
export async function withTransaction(callback) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
