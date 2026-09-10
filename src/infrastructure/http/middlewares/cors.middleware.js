// src/infrastructure/http/middlewares/cors.middleware.js

/**
 * @file src/infrastructure/http/middlewares/cors.middleware.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 004 (Django Secure-by-Default) & Era 005 (Express Middleware Pipeline)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Interceptor Pattern / Middleware Filter (Chain of Responsibility)
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Header String Injection | Tiempo: O(1) constante | Espacio: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      Insecure Defaults / Clickjacking & MIME-Confusion Attacks (permitir iframes maliciosos y ejecución de scripts camuflados)
 * 🛡️ EL ANTÍDOTO:                Inyección forzada en el milisegundo cero de cabeceras OWASP (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`) y manejo determinista de preflight OPTIONS en O(1).
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
