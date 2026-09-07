// scripts/migrate.js
    import fs from 'node:fs';
    import path from 'node:path';
    import { fileURLToPath } from 'node:url';
    import { pool } from '../src/infrastructure/database/pool.js';
    import { logger } from '../src/config/logger.js';
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const MIGRATIONS_DIR = path.resolve(__dirname, '../src/infrastructure/database/migrations');
    
    async function runMigrations() {
      console.log('🔄 Iniciando ejecutor de migraciones nativo...');
    
      const connection = await pool.getConnection();
    
      try {
        // 1. Creamos la tabla de control de migraciones si no existe
        await connection.query(`
          CREATE TABLE IF NOT EXISTS _migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB;
        `);
    
        // 2. Consultamos qué migraciones ya fueron ejecutadas
        const [rows] = await connection.query('SELECT name FROM _migrations');
        const executedMigrations = new Set(rows.map((r) => r.name));
    
        // 3. Leemos los archivos .sql ordenados alfabéticamente
        const files = fs.readdirSync(MIGRATIONS_DIR)
          .filter((file) => file.endsWith('.sql'))
          .sort();
    
        let appliedCount = 0;
    
        for (const file of files) {
          if (executedMigrations.has(file)) {
            console.log(`⏩ Migración ya aplicada: ${file}`);
            continue;
          }

          const filePath = path.join(MIGRATIONS_DIR, file);
          const sql = fs.readFileSync(filePath, 'utf-8').trim();

          if (!sql) {
            console.log(`⚠ Migración vacía omitida: ${file}`);
             continue;
           }

           console.log(`⚙ Aplicando migración: ${file}...`);

            // 4. Ejecutamos la migración y la registramos en una transacción
            await connection.beginTransaction();
            try {
              await connection.query(sql);
              await connection.query('INSERT INTO _migrations (name) VALUES (?)', [file]);
              await connection.commit();
              console.log(`✅ Migración aplicada exitosamente: ${file}`);
              appliedCount++;
            } catch (err) {
              await connection.rollback();
              console.error(`❌ Error fatal en migración ${file}:`, err.message);
              throw err;
            }
          }

          console.log(`\n🎉 Proceso finalizado. ${appliedCount} migraciones nuevas aplicadas.`);
        } finally {
          connection.release();
          await pool.end();
        }
      }  

      runMigrations().catch((err) => {
        console.error('💥 Fallo en las migraciones:', err);
        process.exit(1);
      });
