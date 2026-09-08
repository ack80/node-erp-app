// src/bootstrap/modules/user.container.js
import { createUserRepository } from '../../features/users/users.repository.js';
import { createCreateUserUseCase } from '../../features/users/users.create.use-case.js';
import { createUserController } from '../../features/users/users.controller.js';
import { passwordHasher } from '../../infrastructure/security/password-hasher.js';

/**
 * Fábrica del módulo de usuarios para el contenedor DI manual.
 * Conecta: Repositorio -> Caso de Uso -> Controlador.
 *
 * @param {import('mysql2/promise').Pool} dbPool
 */
export function makeUserModule(dbPool) {
  const userRepository = createUserRepository(dbPool);
  const createUserUseCase = createCreateUserUseCase({ userRepository, passwordHasher });
  const userController = createUserController({ createUserUseCase });

  return {
    repository: userRepository,
    useCase: {
      createUser: createUserUseCase,
    },
    controller: userController,
  };
}
