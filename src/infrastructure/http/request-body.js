
// src/infrastructure/http/request-body.js

// 1 MB como limite de proteccion DoS
const MAX_BODY_SIZE = 1024 * 1024; 

/**
 * @file src/infrastructure/http/request-body.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 001 (Unix POSIX Byte Streams) & Era 006 (Node.js Streams / libuv) & Era 007 (Rust Axum Extractors)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Extractor Pattern (Axum) & Stream Consumer with Backpressure
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Circular Ring Buffer / Byte Chunks de TCP | Tiempo: O(N) bytes | Espacio: O(N) acotado estrictamente a 1 MB
 * 🦹 VILLANO / ANTI-PATRÓN:      Memory Exhaustion DoS Attack (cargar payloads infinitos en RAM de golpe hasta provocar Out of Memory OOM y tirar el proceso)
 * 🛡️ EL ANTÍDOTO:                Lectura incremental en chunks binarios con corte inmediato de stream (`req.destroy()`) y rechazo HTTP 413 si totalBytes > 1 MB antes de parsear JSON.
 *
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<any>} Objeto parseado o vacío si no hay body
 */
export async function parseJsonBody(req) {
    //
    if (['GET', 'HEAD', 'DELETE'].includes(req.method)) {
        return {};
    }

    return new Promise((resolve, reject) => {
        let rawData = '';
        let totalBytes = 0;

        // 2. Escuchamos la llegada de cada chunk binario por el socket tcp
        req.on('data', (chunk) => {
            totalBytes += chunk.length;
            // Proteccion contra payloads gigantes que desbordan la ram
            if (totalBytes > MAX_BODY_SIZE) {
                req.destroy(); // se cierra el socket
                const err = new Error("Payload Too large: El body supera el limite de 1 MB.");
                err.statusCode = 413;
                return reject(err);
            }
            rawData += chunk;
        });

        // 3. cuando termina la transmision por la red
        req.on('end', () => {
            if (!rawData.trim()) {
                return resolve({})
            }
            try {
                const parsed = JSON.parse(rawData);
                resolve(parsed);
            } catch (err) {
                const parseError = new Error("Invalid JSON: El formato del cuerpo es invalido.");
                parseError.statusCode = 400;
                reject(parseError);
            }
        });

        // 4. Si hay unfall abrupto en l conexion TCP
        req.on('error', (err) => {
            reject(err);
        });
    });
}

