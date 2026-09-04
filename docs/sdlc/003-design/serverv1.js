// src/infrastructure/http/server.js
import http from 'http';
import { logger } from '../config/logger.js';

export function createServer(appHandler) {
    const server = http.createServer(appHandler);

    return {
        start(port) {
            server.listen(port, () => {
                logger.info(`🚀 Servidor corriendo en el puerto ${port}`);
            });
        },
        stop(callback) {
            server.close(callback);
        }
    };
}
