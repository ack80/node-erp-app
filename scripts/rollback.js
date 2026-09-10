// scripts/rollback.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/infrastructure/database/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, '../src/infrastructure/database/migrations');

async function runRollback() {
  console.log('⏪ Iniciando reversión quirúrgica de migraciones (Rollback del último lote)...');

  const connection = await pool.getConnection();

  try {
    // 1. Verificamos si existe la tabla de migraciones
    const [tables] = await connection.query("SHOW TABLES LIKE '_migrations'");
    if (tables.length === 0) {
      console.log('ℹ️ No existe la tabla de control _migrations. Nada que revertir.');
      return;
    }

    // 2. Buscamos el lote más reciente (MAX batch)
    const [batchRows] = await connection.query('SELECT MAX(batch) as lastBatch FROM _migrations');
    const lastBatch = batchRows[0]?.lastBatch;

    if (!lastBatch) {
      console.log('✨ No hay migraciones registradas para revertir.');
      return;
    }

    // 3. Obtenemos las migraciones de ese último lote en orden inverso de ejecución (DESC)
    const [migrationsToRollback] = await connection.query(
      'SELECT name FROM _migrations WHERE batch = ? ORDER BY id DESC',
      [lastBatch]
    );

    console.log(`🎯 Revirtiendo lote #${lastBatch} (${migrationsToRollback.length} migraciones)...`);

    for (const { name } of migrationsToRollback) {
      const downFile = `${name}.down.sql`;
      const downPath = path.join(MIGRATIONS_DIR, downFile);

      if (!fs.existsSync(downPath)) {
        throw new Error(`Archivo de reversión requerido no encontrado: ${downFile}`);
      }

      const sql = fs.readFileSync(downPath, 'utf-8').trim();
      console.log(`⚙ Revirtiendo: ${name} usando ${downFile}...`);

      await connection.beginTransaction();
      try {
        if (sql) {
          await connection.query(sql);
        }
        await connection.query('DELETE FROM _migrations WHERE name = ?', [name]);
        await connection.commit();
        console.log(`✅ Revertida exitosamente: ${name}`);
      } catch (err) {
        await connection.rollback();
        console.error(`❌ Error fatal revirtiendo ${name}:`, err.message);
        throw err;
      }
    }

    console.log(`\n🎉 Reversión completada con éxito. Lote #${lastBatch} revertido.`);
  } finally {
    connection.release();
    await pool.end();
  }
}

runRollback().catch((err) => {
  console.error('💥 Fallo en el rollback:', err);
  process.exit(1);
});
