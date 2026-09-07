// src/infrastructure/http/response.js
    
/**
 * 6. Helper: Envía una respuesta HTTP en formato JSON.
 */
export function  sendJson(res, statusCode, data) {
    // 6.1 Código HTTP (200, 201, 400, etc.)
    res.statusCode = statusCode;

    // 6.1 Código HTTP (200, 201, 400, etc.)
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
 
    // 6.3 Serializa y expulsa los datos cerrando la conexión
    res.end(JSON.stringify(data));
}

/**
 * Helper: Envía una respuesta vacía (ej. 204 No Content).
 */
export function sendEmpty(res, statusCode = 204) {
    res.statusCode = statusCode;
    res.end();
}