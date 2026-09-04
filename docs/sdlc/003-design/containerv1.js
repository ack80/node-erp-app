// src/bootstrap/container.js (Contenedor Manual)
import { UserRepositoryPrisma } from '../features/users/infrastructure/user-repository-prisma.js';
import { CreateUser } from '../features/users/application/create-user.js';
import { UserController } from '../features/users/presentation/user-controller.js';

// 1. Instancias la infraestructura
const userRepository = new UserRepositoryPrisma();

// 2. Inyectas la infraestructura en el caso de uso
const createUserUseCase = new CreateUser(userRepository);

// 3. Inyectas el caso de uso en el controlador HTTP
const userController = new UserController(createUserUseCase);

export { userController };
