// src/main.js
import { createApp } from './bootstrap/create-app.js';
import { createHttpServer } from './infrastructure/http/server.js';
import { env } from './config/env.js';

// 1. Ensamblamos la aplicación
const appHandler = createApp();

// 2. Creamos la instancia del servidor HTTP nativo
const server = createHttpServer(appHandler);

// 3. Encendemos el servidor en el puerto configurado
const port = env.port || 5000;
await server.start(port);
console.log(`🚀 ERP Server corriendo exitosamente en http://localhost:${port}`);
console.log(`🩺 Health check disponible en http://localhost:${port}/health`);

// 4. Graceful Shutdown (Apagado elegante)
async function shutdown(signal) {
  console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor HTTP de forma segura...`);
  try {
    await server.stop();
    console.log('✅ Servidor cerrado limpiamente. ¡Hasta luego!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el cierre del servidor:', error);
    process.exit(1);
  }
}  

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
