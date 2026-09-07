import { sendJson } from '../http/response.js';

    /**
     * Handler HTTP para el health check del servidor.
     */
    export function getHealthHandler(req, res) {
      sendJson(res, 200, {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      });
    }
