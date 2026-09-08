import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/infrastructure/database/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, '../src/infrastructure/database/fixtures');

async function runFixtures() {
  console.log('🧪 Iniciando ejecutor de fixtures (Dummy / Test Data)...');

  if (!fs.existsSync(FIXTURES_DIR)) {
    console.log('ℹ️ Carpeta de fixtures vacía.');
    process.exit(0);
  }

  const files = fs.readdirSync(FIXTURES_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('ℹ️ No hay archivos de prueba en src/infrastructure/database/fixtures/');
    process.exit(0);
  }

  const connection = await pool.getConnection();

  try {
    for (const file of files) {
      console.log(`⚙ Cargando fixture de prueba: ${file}...`);
      const filePath = path.join(FIXTURES_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8').trim();

      if (!sql) continue;

      await connection.beginTransaction();
      await connection.query(sql);
      await connection.commit();
      console.log(`✅ Fixture aplicado: ${file}`);
    }

    console.log('🎉 ¡Fixtures de prueba cargados exitosamente!');
  } catch (err) {
    await connection.rollback();
    console.error('❌ Error al cargar fixtures:', err.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

runFixtures();
