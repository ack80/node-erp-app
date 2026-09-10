
// src/features/users/users.controller.js
import { parseJsonBody } from '../../infrastructure/http/request-body.js';
import { sendJson } from '../../infrastructure/http/response.js';
import { createUserSchema } from './users.schema.js';

/**
 * @file src/features/users/users.controller.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 002 (Smalltalk MVC Controller) & Era 004 (Rails Skinny Controller) & Era 007 (Rust Axum Extractors)
 * 📐 PATRÓN FORMAL DE DISEÑO:    HTTP Adapter / Controller Pattern (Clean Architecture)
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Pipeline de 3 Pasos (Extract -> Validate -> Dispatch) | Tiempo: O(1) + tiempo de ejecución del UseCase | Espacio: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      Overloaded HTTP Boundary (acoplar lógica de bases de datos directamente a `req` y `res`, impidiendo reutilizar la lógica en CLI, WebSockets o colas)
 * 🛡️ EL ANTÍDOTO:                Controlador enjuto (*Skinny Controller*) que solo extrae el payload con límite anti-DoS, valida el contrato DTO con Zod y delega la ejecución al Caso de Uso.
 *
 * @param {object} dependencies
 * @param {object} dependencies.createUserUseCase
 */
export function createUserController({ createUserUseCase }) {
    return {
    /**
     * Manejador de la ruta POST /api/v1/users
     *
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} res
     */
    async create(req, res) {
        // 1. Extrae y parsea el cuerpo de la petición (TCP stream con límite anti-DoS de 1MB)
        const rawBody = await parseJsonBody(req);

        // 2. Validación de contrato DTO con Zod (falla rápido si faltan campos)
        const validatedInput = createUserSchema.parse(rawBody);

        // 3. Ejecución del Caso de Uso (reglas de negocio)
        const user = await createUserUseCase.execute(validatedInput);

        // 4. Respuesta HTTP 201 Created con el payload público
        sendJson(res, 201, user);
    },
    };
}
