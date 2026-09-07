// src/bootstrap/create-app.js
    import { createRouter } from '../infrastructure/http/router.js';
    import { registerRoutes } from './register-routes.js';
    import { errorHandler } from '../infrastructure/http/middlewares/error.middleware.js';

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
        try {
          await router.handle(req, res, container);
        } catch (error) {
          // Delegamos el manejo del error a nuestro middleware especializado
          errorHandler(error, req, res);
        }
      };

      return appHandler;
    }
