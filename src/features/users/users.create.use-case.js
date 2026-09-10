// src/features/users/create-user.use-case.js
import { Errors } from '../../shared/errors/app-error.js';

/**
 * @file src/features/users/users.create.use-case.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 003 (Hexagonal Architecture / Application Service) & Era 004 (Django Vertical Slices)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Command Handler / Interactor (Clean Architecture)
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Sequential Business Orchestration | Tiempo: O(log N) por búsqueda en índice | Espacio: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      Fat Controller God Anti-Pattern (meter lógica de negocio, hashes, queries y HTTP en el mismo método del controlador) & Plain Text Password Storage (almacenar contraseñas sin hashing)
 * 🛡️ EL ANTÍDOTO:                Caso de Uso aislado con Inversión de Dependencias (DIP) que orquesta validación de unicidad, hash con Argon2id y persistencia sin acoplarse al protocolo HTTP.
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
