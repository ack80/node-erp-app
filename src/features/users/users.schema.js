
    // src/features/users/users.schema.js
    import { z } from 'zod';
    
    /**
     * Contrato de entrada (DTO) para la creación de usuarios con ámbito jerárquico.
     * Reutilizable por el backend, React, Flutter o API externa.
     */
    export const createUserSchema = z.object({
      holdingId: z.number({ required_error: 'holdingId es obligatorio' }).int().positive(),
      companyId: z.number().int().positive().optional().nullable(),
      branchId: z.number().int().positive().optional().nullable(),
      email: z.string().email('Formato de correo electrónico inválido').toLowerCase().trim(),
      password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
      name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').trim(),
    });
