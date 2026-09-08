// src/features/users/test/create-user.test.js
import { describe, it, expect, vi } from 'vitest';
import { createCreateUserUseCase } from '../users.create.use-case.js';
import { UserEntity } from '../users.entity.js';
import { AppError } from '../../../shared/errors/app-error.js';

describe('CreateUser Use Case', () => {
    function createDependencies() {
    const userRepository = {
        findByEmail: vi.fn(),
        create: vi.fn(),
    };

    const passwordHasher = {
        hash: vi.fn(),
        verify: vi.fn(),
    };

    return { userRepository, passwordHasher };
    }

    it('debe crear un usuario exitosamente con password hasheado y devolver datos públicos', async () => {
    const { userRepository, passwordHasher } = createDependencies();

    // 1. Mock: El email no está registrado previamente
    userRepository.findByEmail.mockResolvedValueOnce(null);

    // 2. Mock: Hasheo exitoso con Argon2id
    passwordHasher.hash.mockResolvedValueOnce('$argon2id$v=19$hash_generado');

    // 3. Mock: Creación exitosa en BD
    const createdUserEntity = new UserEntity({
        id: 100,
        holdingId: 1,
        companyId: 10,
        branchId: 101,
        email: 'nuevo@worldclass.com',
        passwordHash: '$argon2id$v=19$hash_generado',
        name: 'Nuevo Operador',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    userRepository.create.mockResolvedValueOnce(createdUserEntity);

    // Instanciamos el Caso de Uso con inyección de dependencias
    const createUser = createCreateUserUseCase({ userRepository, passwordHasher });

    const result = await createUser.execute({
        holdingId: 1,
        companyId: 10,
        branchId: 101,
        email: 'nuevo@worldclass.com',
        password: 'PasswordSeguro123!',
        name: 'Nuevo Operador',
    });

    // Verificaciones de negocio
    expect(result.id).toBe(100);
    expect(result.holdingId).toBe(1);
    expect(result.email).toBe('nuevo@worldclass.com');
    // Seguridad: jamás devuelve el hash
    expect(result.passwordHash).toBeUndefined();

    // Verificamos que llamó al hasher y al repositorio con los datos correctos
    expect(passwordHasher.hash).toHaveBeenCalledWith('PasswordSeguro123!');
    expect(userRepository.create).toHaveBeenCalledWith({
        holdingId: 1,
        companyId: 10,
        branchId: 101,
        email: 'nuevo@worldclass.com',
        passwordHash: '$argon2id$v=19$hash_generado',
        name: 'Nuevo Operador',
    });
    });

    it('debe lanzar AppError (409 CONFLICT) si el email ya existe en el Holding', async () => {
    const { userRepository, passwordHasher } = createDependencies();

    // Mock: El usuario YA existe en el holding
    userRepository.findByEmail.mockResolvedValueOnce(
        new UserEntity({
        id: 1,
        holdingId: 1,
        email: 'ya_existe@worldclass.com',
        passwordHash: '$argon2id$hash',
        name: 'Usuario Existente',
        })
    );

    const createUser = createCreateUserUseCase({ userRepository, passwordHasher });

    await expect(
        createUser.execute({
        holdingId: 1,
        email: 'ya_existe@worldclass.com',
        password: 'Password123!',
        name: 'Intento Duplicado',
        })
    ).rejects.toThrow(AppError);

    // No debe llegar a hashear contraseñas si el usuario ya existía
    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
    });
});
