// src/bootstrap/create-app.js
import { requestLogger } from '../infrastructure/http/middlewares/logger.middleware.js';
import { errorHandler } from '../infrastructure/http/middlewares/error.middleware.js';
import { registerRoutes } from '../infrastructure/http/router.js';
import { createContainer } from './container.js';

export function createApp() {
    // 1. Inicializamos el contenedor de dependencias de nuestro ERP
    const container = createContainer();

    // 2. Creamos el manejador de peticiones (el "serrucho" principal)
    const appHandler = async (req, res) => {
        try {
            // --- PIPELINE DE FILTROS (Estilo Gateway Interno) ---
            await requestLogger(req, res);

            // Aquí puedes meter más filtros globales:
            // await authMiddleware(req, res);
            // await corsMiddleware(req, res);

            // --- DESPACHADOR HACIA LAS FEATURES ---
            await registerRoutes(req, res, container);

        } catch (error) {
            // --- MANEJO GLOBAL DE ERRORES ---
            await errorHandler(error, req, res);
        }
    };

    return appHandler;
}
