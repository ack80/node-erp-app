// scripts/reset.js
// Reinicia la base de datos de desarrollo: borra todo y vuelve a crear desde cero.
// ⚠️  NUNCA ejecutar en producción. Solo para entornos locales de desarrollo.
import { pool } from '../src/infrastructure/database/pool.js';
import { spawnSync } from 'node:child_process';
import { env } from '../src/config/env.js';

async function reset() {
  console.log('⚠️  RESET DEL ENTORNO DE DESARROLLO');
  console.log(`🗄️  Base de datos: ${env.db.database} en ${env.db.host}:${env.db.port}`);
  console.log('🔴 Borrando todas las tablas...');

  const connection = await pool.getConnection();

  try {
    // 1. Desactivar restricciones de claves foráneas para borrar en orden
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // 2. Obtener todas las tablas del esquema actual
    const [tables] = await connection.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_type = "BASE TABLE"',
      [env.db.database]
    );

    // 3. Borrar cada tabla
    for (const { table_name } of tables) {
      await connection.query(`DROP TABLE IF EXISTS \`${table_name}\``);
      console.log(`   🗑️  Tabla eliminada: ${table_name}`);
    }

    // 4. Reactivar restricciones
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Base de datos limpia.\n');
  } finally {
    connection.release();
    await pool.end();
  }

  // 5. Correr migraciones
  console.log('🔄 Aplicando migraciones...');
  const migrate = spawnSync('node', ['scripts/migrate.js'], { stdio: 'inherit' });
  if (migrate.status !== 0) process.exit(migrate.status);

  // 6. Correr seeds maestros
  console.log('\n🌱 Sembrando datos maestros...');
  const seed = spawnSync('node', ['scripts/seed.js'], { stdio: 'inherit' });
  if (seed.status !== 0) process.exit(seed.status);

  console.log('\n🎉 Reset de desarrollo completado. Base de datos lista.');
}

reset().catch((err) => {
  console.error('❌ Error fatal en reset:', err.message);
  process.exit(1);
});
