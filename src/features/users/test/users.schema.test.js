// src/features/users/test/users.schema.test.js
import { describe, it, expect } from 'vitest';
import { createUserSchema } from '../users.schema.js';

describe('createUserSchema (Contrato de Entrada DTO con Holding)', () => {
  it('debe validar exitosamente un usuario con ámbito completo (holding, company, branch)', () => {
    const validData = {
      holdingId: 1,
      companyId: 10,
      branchId: 101,
      email: 'Carlos.Perez@ERP.COM',
      password: 'Password123!',
      name: 'Carlos Pérez',
    };

    const parsed = createUserSchema.parse(validData);

    expect(parsed.holdingId).toBe(1);
    expect(parsed.companyId).toBe(10);
    expect(parsed.branchId).toBe(101);
    expect(parsed.email).toBe('carlos.perez@erp.com');
    expect(parsed.name).toBe('Carlos Pérez');
  });

  it('debe validar un usuario de nivel corporativo global (solo holdingId)', () => {
    const validData = {
      holdingId: 1,
      email: 'auditor@holding.com',
      password: 'Password123!',
      name: 'Auditor Global',
    };

    const parsed = createUserSchema.parse(validData);

    expect(parsed.holdingId).toBe(1);
    expect(parsed.companyId).toBeUndefined();
    expect(parsed.branchId).toBeUndefined();
  });

  it('debe fallar si holdingId falta o es menor o igual a cero', () => {
    expect(() =>
      createUserSchema.parse({
        holdingId: 0,
        email: 'test@erp.com',
        password: 'Password123!',
        name: 'Test',
      })
    ).toThrow();

    expect(() =>
      createUserSchema.parse({
        email: 'test@erp.com',
        password: 'Password123!',
        name: 'Test',
      })
    ).toThrow();
  });
});
