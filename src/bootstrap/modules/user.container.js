// src/bootstrap/modules/user.container.js
import { UserRepositoryPrisma } from '../../features/users/infrastructure/user-repository-prisma.js';
import { CreateUser } from '../../features/users/application/create-user.js';
import { UserController } from '../../features/users/presentation/user-controller.js';

export function makeUserModule(prismaClient) {
    const repository = new UserRepositoryPrisma(prismaClient);
    const createUserUseCase = new CreateUser(repository);
    const controller = new UserController(createUserUseCase);

    return { controller };
}
