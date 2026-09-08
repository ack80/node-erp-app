// src/features/users/test/users.repository.test.js
    import { describe, it, expect, vi } from 'vitest';
    import { createUserRepository } from '../users.repository.js';
    import { UserEntity } from '../users.entity.js';
    
    describe('UserRepository (MySQL Native Adapter)', () => {
      function createFakeDb() {
        return {
          execute: vi.fn(),
        };
      }
    
      it('findByEmail: debe retornar una UserEntity si el usuario existe en el holding', async () => {
        const fakeDb = createFakeDb();
        const fakeRow = {
          id: 5,
          holding_id: 1,
          company_id: 10,
          branch_id: 101,
          email: 'gerente@worldclass.com',
          password_hash: '$argon2id$v=19$hash_real',
          name: 'Gerente General',
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date(),
        };
    
        fakeDb.execute.mockResolvedValueOnce([[fakeRow]]);
    
        const repo = createUserRepository(fakeDb);
        const user = await repo.findByEmail(1, 'gerente@worldclass.com');
    
        expect(user).toBeInstanceOf(UserEntity);
        expect(user.id).toBe(5);
        expect(user.holdingId).toBe(1);
        expect(user.companyId).toBe(10);
        expect(user.branchId).toBe(101);
        expect(user.email).toBe('gerente@worldclass.com');
        expect(fakeDb.execute).toHaveBeenCalledWith(
          expect.stringContaining('FROM usr_users'),
          [1, 'gerente@worldclass.com']
        );
      });

      it('findByEmail: debe retornar null si la consulta no devuelve filas', async () => {
        const fakeDb = createFakeDb();
        fakeDb.execute.mockResolvedValueOnce([[]]);

        const repo = createUserRepository(fakeDb);
        const user = await repo.findByEmail(1, 'no_existe@erp.com');

        expect(user).toBeNull();
      });

      it('create: debe insertar en usr_users y retornar UserEntity con el insertId asignado', async () => {
        const fakeDb = createFakeDb();
        fakeDb.execute.mockResolvedValueOnce([{ insertId: 88 }]);

        const repo = createUserRepository(fakeDb);
        const newUser = await repo.create({
          holdingId: 1,
          companyId: 2,
          branchId: 3,
          email: 'cajero@tienda.com',
          passwordHash: '$argon2id$hash',
          name: 'Cajero Principal',
        });

        expect(newUser).toBeInstanceOf(UserEntity);
        expect(newUser.id).toBe(88);
        expect(newUser.email).toBe('cajero@tienda.com');
        expect(newUser.holdingId).toBe(1);
        expect(fakeDb.execute).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO usr_users'),
          [1, 2, 3, 'cajero@tienda.com', '$argon2id$hash', 'Cajero Principal']
        );
      });
    });
