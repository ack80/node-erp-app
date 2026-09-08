import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/infrastructure/database/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEEDS_DIR = path.resolve(__dirname, '../src/infrastructure/database/seeds');

async function runSeeds() {
  console.log('🌱 Iniciando ejecutor de semillas maestras (System Master Data)...');

  if (!fs.existsSync(SEEDS_DIR)) {
    console.log('⚠️ Carpeta de semillas no encontrada.');
    process.exit(0);
  }

  const files = fs.readdirSync(SEEDS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('⚠️ No hay archivos de semillas en src/infrastructure/database/seeds/');
    process.exit(0);
  }

  const connection = await pool.getConnection();

  try {
    for (const file of files) {
      console.log(`⚙ Sembrando datos maestros: ${file}...`);
      const filePath = path.join(SEEDS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8').trim();

      if (!sql) continue;

      await connection.beginTransaction();
      await connection.query(sql);
      await connection.commit();
      console.log(`✅ Semilla maestra aplicada exitosamente: ${file}`);
    }

    console.log('🎉 ¡Todas las semillas maestras se han aplicado exitosamente!');
  } catch (err) {
    await connection.rollback();
    console.error('❌ Error fatal al sembrar la base de datos:', err.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

runSeeds();
