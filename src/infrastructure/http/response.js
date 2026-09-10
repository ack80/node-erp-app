// src/infrastructure/http/response.js

/**
 * @file src/infrastructure/http/response.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 001 (POSIX Byte Stream Output) & Era 006 (Node.js HTTP ServerResponse)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Response Presenter / Serializer Utility Pattern
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Direct Socket Serialization (`JSON.stringify` + TCP Flush) | Tiempo: O(N) payload size | Espacio: O(N) buffer
 * 🦹 VILLANO / ANTI-PATRÓN:      Missing Character Set / MIME Sniffing Attack (no especificar `utf-8` permitiendo exploits XSS) & Hanging Sockets (no cerrar `res.end()` dejando conexiones TCP huérfanas)
 * 🛡️ EL ANTÍDOTO:                Asignación forzada de `Content-Type: application/json; charset=utf-8` y terminación atómica determinista del socket de red con `res.end()`.
 */
export function sendJson(res, statusCode, data) {
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