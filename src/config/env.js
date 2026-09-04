// src/config/env.js
export const env = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  jwtSecret: process.env.JWT_SECRET,
};

// Validación de seguridad obligatoria (Fail Fast)
if (!env.jwtSecret) {
  throw new Error('FATAL: La variable de entorno JWT_SECRET es obligatoria.');
}