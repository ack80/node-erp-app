
    // src/features/users/test/create-user.test.js
    import { describe, it } from 'vitest';

    describe('CreateUser Use Case', () => {
      it.todo('debe crear un usuario exitosamente con password hasheado');
      it.todo('debe fallar con AppError conflict si el email ya está registrado');
      it.todo('debe validar que los campos requeridos no vengan vacíos');
    });
