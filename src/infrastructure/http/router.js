// src/infrastructure/http/router.js
    import { sendJson } from './response.js';
    
    /**
     * Fábrica del Router artesanal para Node.js nativo.
     */
    export function createRouter() {
      // 1. Diccionario en memoria donde guardaremos las rutas registradas
      // Ejemplo de clave: "GET /health" o "POST /api/users"
      const routes = new Map();
    
      return {
        /**
         * Registra una ruta y su manejador.
         * @param {string} method - 'GET', 'POST', 'PUT', 'DELETE'
         * @param {string} path - '/api/users', etc.
         * @param {Function} handler - Función async (req, res, context) => void
         */
        add(method, path, handler) {
          const key = `${method.toUpperCase()} ${path}`;
          routes.set(key, handler);
        },

        /**
         * Métodos de conveniencia semántica
         */
        get(path, handler) {
          this.add('GET', path, handler);
        },
        post(path, handler) {
          this.add('POST', path, handler);
        },
        put(path, handler) {
          this.add('PUT', path, handler);
        },
        delete(path, handler) {
          this.add('DELETE', path, handler);
        },

        /**
         * Despacha la petición entrante buscando coincidencia en la tabla.
         *
         * @param {import('node:http').IncomingMessage} req
         * @param {import('node:http').ServerResponse} res
         * @param {object} context - Contenedor DI o dependencias opcionales
         */
        async handle(req, res, context = {}) {
          // Obtenemos solo el pathname ignorando query params (ej: "/users?page=1" -> "/users")
          const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const key = `${req.method.toUpperCase()} ${parsedUrl.pathname}`;

          const handler = routes.get(key);

          if (!handler) {
            // Si no existe, devolvemos 404 estandarizado con nuestro helper sendJson
            sendJson(res, 404, {
              error: 'Not Found',
              message: `Ruta ${req.method} ${parsedUrl.pathname} no encontrada`,
            });
            return;
          }

          // Si existe, ejecutamos el handler pasándole req, res y el contexto (DI)
          await handler(req, res, context);
        },
      };
    }
