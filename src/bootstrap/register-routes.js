// src/bootstrap/register-routes.js
    import { getHealthHandler } from '../infrastructure/health/get-health.js';

    /**
     * Registra todas las rutas del sistema en el router artesanal.
     *
     * @param {ReturnType<import('../infrastructure/http/router.js').createRouter>} router
     */
    export function registerRoutes(router) {
      // Rutas de infraestructura / monitoreo
      router.get('/health', getHealthHandler);

      // Aquí registraremos los features de negocio en los siguientes pasos:
      // registerAuthRoutes(router);
      // registerUserRoutes(router);
    }
