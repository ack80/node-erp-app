// src/infrastructure/http/router.js
import { handleUserRoutes } from '../../features/users/presentation/user-routes.js';
import { handleCustomerRoutes } from '../../features/customers/presentation/customer-routes.js';

export async function registerRoutes(req, res, container) {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // El enrutador interno reparte el juego según la URL
    if (url.pathname.startsWith('/api/v1/users')) {
        return handleUserRoutes(req, res, container.users);
    }

    if (url.pathname.startsWith('/api/v1/customers')) {
        return handleCustomerRoutes(req, res, container.customers);
    }

    // Si ninguna ruta coincide
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
}
