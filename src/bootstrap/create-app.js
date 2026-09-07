
    // src/bootstrap/create-app.js
    import { createRouter } from '../infrastructure/http/router.js';
    import { registerRoutes } from './register-routes.js';
    import { errorHandler } from '../infrastructure/http/middlewares/error.middleware.js';
    import { requestLogger } from '../infrastructure/http/middlewares/logger.middleware.js';
    import { corsMiddleware } from '../infrastructure/http/middlewares/cors.middleware.js';

    /**
     * Ensambla la aplicación HTTP del ERP.
     * Registra rutas y retorna el manejador de peticiones.
     *
     * @param {object} container - Contenedor de dependencias (opcional)
     * @returns {Function} Request handler para el servidor HTTP de Node.js
     */
    export function createApp(container = {}) {
      // 1. Inicializamos el router artesanal
      const router = createRouter();

      // 2. Registramos las rutas del sistema
      registerRoutes(router);

      // 3. Retornamos el manejador de peticiones HTTP
      const appHandler = async (req, res) => {
        // 1. Auditoría y medición de latencia
        requestLogger(req, res);

        // 2. Seguridad de navegador y CORS para frontend React
        const shouldContinue = corsMiddleware(req, res);
        if (!shouldContinue) {
          return; // Era una petición OPTIONS preflight y ya fue respondida con 204
        }

        // 3. Despacho hacia el router y casos de uso
        try {
          await router.handle(req, res, container);
        } catch (error) {
          errorHandler(error, req, res);
        }
      };

      return appHandler;
    }
