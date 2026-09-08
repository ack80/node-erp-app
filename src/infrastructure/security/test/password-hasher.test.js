
    // src/infrastructure/security/test/password-hasher.test.js
    import { describe, it, expect } from 'vitest';
    import { passwordHasher } from '../password-hasher.js';

    describe('passwordHasher (Argon2id Enterprise Service)', () => {
      it('debe generar un hash válido con formato Argon2id y verificarlo exitosamente', async () => {
        const rawPassword = 'MiPasswordSeguro2026!';
        const hash = await passwordHasher.hash(rawPassword);

        expect(hash).toBeDefined();
        // El formato estándar de Argon2id comienza con $argon2id$
        expect(hash.startsWith('$argon2id$')).toBe(true);

        const isValid = await passwordHasher.verify(hash, rawPassword);
        expect(isValid).toBe(true);
      });

      it('debe retornar false si la contraseña no coincide', async () => {
        const hash = await passwordHasher.hash('ClaveCorrecta123');
        const isValid = await passwordHasher.verify(hash, 'ClaveIncorrecta456');

        expect(isValid).toBe(false);
      });

      it('debe generar hashes distintos para la misma contraseña gracias al salting criptográfico', async () => {
        const password = 'PasswordIdentico';
        const hash1 = await passwordHasher.hash(password);
        const hash2 = await passwordHasher.hash(password);

        // Salting: Dos llamadas nunca deben producir el mismo hash
        expect(hash1).not.toBe(hash2);

        // Pero ambos deben ser verificables
        expect(await passwordHasher.verify(hash1, password)).toBe(true);
        expect(await passwordHasher.verify(hash2, password)).toBe(true);
      });

      it('debe lanzar error si se intenta hashear un valor no string o vacío', async () => {
        await expect(passwordHasher.hash('')).rejects.toThrow('La contraseña debe ser una cadena');
        await expect(passwordHasher.hash(null)).rejects.toThrow('La contraseña debe ser una cadena');
      });
    });

