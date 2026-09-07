
// src/infrastructure/http/request-body.js
    

// 1  MB como limite de proteccion DoS
const MAX_BODY_SIZE = 1024 * 1024; 

/**
 * Lee el ReadableStream de la petición Node.js y lo parsea a JSON.
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

