// src/infrastructure/http/router.js (El despachador interno)
import { userRoutes } from '../../features/users/presentation/user-routes.js';
import { customerRoutes } from '../../features/customers/presentation/customer-routes.js';

export function registerRoutes(app) {
    // El enrutador actúa como el "portero interno" de la app
    app.use('/api/v1/users', userRoutes);
    app.use('/api/v1/customers', customerRoutes);
}
