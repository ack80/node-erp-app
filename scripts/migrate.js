// scripts/migrate.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/infrastructure/database/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, '../src/infrastructure/database/migrations');

async function runMigrations() {
  console.log('🔄 Iniciando ejecutor de migraciones nativo (Inteligente por Batches)...');

  const connection = await pool.getConnection();

  try {
    // 1. Creamos la tabla de control con soporte de lotes (batch) si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        batch INT NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. Consultamos qué migraciones ya fueron ejecutadas y el último batch
    const [rows] = await connection.query('SELECT name, batch FROM _migrations');
    const executedMigrations = new Set(rows.map((r) => r.name));
    
    // Calculamos el siguiente batch
    const currentMaxBatch = rows.reduce((max, r) => (r.batch > max ? r.batch : max), 0);
    const nextBatch = currentMaxBatch + 1;

    // 3. Leemos solo los archivos .up.sql ordenados alfabéticamente
    const upFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.up.sql'))
      .sort();

    let appliedCount = 0;

    for (const file of upFiles) {
      // El identificador canónico es el nombre sin '.up.sql'
      const migrationName = file.replace(/\.up\.sql$/, '');

      if (executedMigrations.has(migrationName)) {
        console.log(`⏩ Migración ya aplicada: ${migrationName}`);
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8').trim();

      if (!sql) {
        console.log(`⚠ Migración vacía omitida: ${file}`);
        continue;
      }

      console.log(`⚙ Aplicando lote [${nextBatch}] - migración: ${migrationName}...`);

      // 4. Ejecutamos la migración y la registramos con su batch
      await connection.beginTransaction();
      try {
        await connection.query(sql);
        await connection.query('INSERT INTO _migrations (name, batch) VALUES (?, ?)', [migrationName, nextBatch]);
        await connection.commit();
        console.log(`✅ Migración aplicada exitosamente: ${migrationName}`);
        appliedCount++;
      } catch (err) {
        await connection.rollback();
        console.error(`❌ Error fatal en migración ${migrationName}:`, err.message);
        throw err;
      }
    }

    if (appliedCount === 0) {
      console.log('✨ No hay nuevas migraciones pendientes.');
    } else {
      console.log(`\n🎉 Proceso finalizado. ${appliedCount} migraciones aplicadas en el lote #${nextBatch}.`);
    }
  } finally {
    connection.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('💥 Fallo en las migraciones:', err);
  process.exit(1);
});
