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

  // Dominio: Usuarios (POST /api/v1/users)
  router.post('/api/v1/users', async (req, res, container) => {
    await container.users.controller.create(req, res);
  });
}
