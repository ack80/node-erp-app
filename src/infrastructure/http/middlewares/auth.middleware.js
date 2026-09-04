// src/infrastructure/http/middlewares/auth.middleware.js
import { tokenService } from '../../security/token-service.js'; // <-- Importa la herramienta de seguridad

export async function authMiddleware(req, res) {
    // 1. El Middleware hace su trabajo HTTP: lee las cabeceras
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Token no proporcionado' }));
        return false; // Corta el flujo
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Llama al servicio puro de security para verificar el token
        const decodedUser = tokenService.verifyToken(token);

        // 3. Inyecta los datos en el request para que las features los usen
        req.user = decodedUser;
        return true; // Deja pasar la petición
    } catch (error) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Token inválido o expirado' }));
        return false;
    }
}
