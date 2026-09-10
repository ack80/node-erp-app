// src/infrastructure/database/transaction.js

/**
 * @file src/infrastructure/database/transaction.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 001 (IBM CICS / Unidad Lógica de Trabajo ACID) & Era 002 (SAP LUW de Negocio) & Era 005 (Laravel DB::transaction)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Template Method / Loan Pattern (GoF) sobre Unit of Work (PoEAA)
 * ⚙️ ESTRUCTURA Y ALGORITMO:     LIFO Call Stack (V8 Engine try/catch/finally) | Complejidad Temporal: O(1) + tiempo del callback | Complejidad Espacial: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      
 *    1. Connection Leak / Socket Starvation (olvidar connection.release() en bloques catch dejando sockets TCP colgados hasta agotar el pool de MariaDB).
 *    2. Split-Brain Inconsistent Writes (modificar tablas financieras o de usuarios sin transacción, fallando en el segundo INSERT y corrompiendo la BD fiscal).
 *    3. Hardcoded Pool Coupling (importar el pool concreto impidiendo unit tests deterministas con fake DBs).
 * 🛡️ EL ANTÍDOTO:                
 *    Función de orden superior que adquiere la conexión del pool inyectado, orquesta `beginTransaction()`, `commit()` y auto-`rollback()`, garantizando la devolución del socket en el bloque léxico `finally` del Call Stack incluso ante excepciones asíncronas no capturadas.
 *
 * @param {import('mysql2/promise').Pool} pool - Pool de conexiones MySQL inyectado (DIP)
 * @param {Function} callback - Función asíncrona de negocio que recibe la conexión transaccional activa: (connection) => Promise<T>
 * @returns {Promise<T>} Resultado devuelto por el callback
 */
export async function withTransaction(pool, callback) {
  if (!pool || typeof pool.getConnection !== 'function') {
    throw new TypeError('withTransaction requiere un pool de base de datos válido con método getConnection()');
  }

  if (typeof callback !== 'function') {
    throw new TypeError('withTransaction requiere un callback de ejecución transaccional válido');
  }

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

