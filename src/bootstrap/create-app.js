// src/bootstrap/create-app.js
    import { createRouter } from '../infrastructure/http/router.js';
    import { registerRoutes } from './register-routes.js';

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
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
        }
      };

      return appHandler;
    }

