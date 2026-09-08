
// src/features/users/users.controller.js
import { parseJsonBody } from '../../infrastructure/http/request-body.js';
import { sendJson } from '../../infrastructure/http/response.js';
import { createUserSchema } from './users.schema.js';

/**
 * Fábrica del controlador HTTP para el dominio de Usuarios.
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
