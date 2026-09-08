// src/features/users/create-user.use-case.js
import { Errors } from '../../shared/errors/app-error.js';

/**
 * Fábrica del Caso de Uso: Registro de Usuarios.
 *
 * @param {object} dependencies
 * @param {object} dependencies.userRepository
 * @param {object} dependencies.passwordHasher
 */
export function createCreateUserUseCase({ userRepository, passwordHasher }) {
  return {
    /**
     * Ejecuta el caso de uso de creación de usuario.
     *
     * @param {object} input - Datos del usuario
     * @returns {Promise<object>} Datos públicos del usuario creado
     */
    async execute({ holdingId, companyId = null, branchId = null, email, password, name }) {
      // 1. Regla de Negocio: Unicidad de email dentro del Holding
      const existingUser = await userRepository.findByEmail(holdingId, email);
      if (existingUser) {
        throw Errors.conflict(`El correo '${email}' ya se encuentra registrado en esta organización.`);
      }

      // 2. Regla de Seguridad: Hasheo criptográfico con Argon2id
      const passwordHash = await passwordHasher.hash(password);

      // 3. Persistencia en base de datos
      const user = await userRepository.create({
        holdingId,
        companyId,
        branchId,
        email,
        passwordHash,
        name,
      });

      // 4. Retorno seguro sin secretos expuestos
      return user.toPublicJSON();
    },
  };
}
