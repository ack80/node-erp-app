// src/infrastructure/http/router.js
import { sendJson } from './response.js';

/**
 * @file src/infrastructure/http/router.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 006 (Node.js Nativo) & Era 007 (Go HTTP Multiplexer / Explicit Routing)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Front Controller Pattern (PoEAA) & Command Dispatcher
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Hash Table (ES6 Map) | Tiempo de Búsqueda: O(1) promedio | Espacio: O(R) donde R = número de rutas
 * 🦹 VILLANO / ANTI-PATRÓN:      Linear Scan Routing O(N) (recorrer arreglos con regex en cada petición) y Supply Chain Attack (depender de routers externos con miles de sub-dependencias en node_modules)
 * 🛡️ EL ANTÍDOTO:                Búsqueda en tiempo constante O(1) mediante clave determinista `${METHOD} ${path}` sobre estructura hash nativa de V8 sin dependencias externas.
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
