import http from 'node:http';

/**
 * Fábrica del servidor HTTP nativo.
 * Recibe un request handler (por ejemplo, el retornado por createApp())
 * y expone métodos de control de ciclo de vida.
 *
 * @param {Function} handler - Request listener de Node.js (req, res)
 * @returns {object} Controladores del servidor HTTP
 */
export function createHttpServer(handler) {
  const server = http.createServer(handler);

  return {
    start: (port) =>
      new Promise((resolve) => {
        server.listen(port, () => {
          resolve(server);
        });
      }),
    stop: () =>
      new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
    instance: server,
  };
}