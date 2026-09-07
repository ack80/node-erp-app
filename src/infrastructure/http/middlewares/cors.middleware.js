// src/infrastructure/http/middlewares/cors.middleware.js

    /**
     * Middleware de CORS y Security Headers para permitir conexión con React y proteger el navegador.
     *
     * @param {import('node:http').IncomingMessage} req
     * @param {import('node:http').ServerResponse} res
     * @returns {boolean} Retorna false si la petición era un preflight OPTIONS y ya fue respondida
     */
    export function corsMiddleware(req, res) {
      // 1. Cabeceras CORS (Cross-Origin Resource Sharing) para el Frontend (React)
      res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400'); // Cache del preflight por 24 horas

      // 2. Cabeceras de Seguridad del Navegador (OWASP Security Headers)
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // 3. Manejo de Peticiones Preflight del navegador (OPTIONS)
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return false; // Indica que la petición ya fue finalizada
      }

      return true; // La petición normal puede continuar
    }
