
    // src/features/users/users.schema.js
import { z } from 'zod';

/**
 * @file src/features/users/users.schema.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 002 (PowerBuilder DataWindow Validation) & Era 006 (FastAPI Pydantic Single Source of Truth)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Data Transfer Object (DTO) & Schema Validation Pattern
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Deterministic Schema Graph Parsing | Tiempo: O(K) donde K = número de propiedades del DTO | Espacio: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      Garbage In Garbage Out / Implicit Type Coercion (procesar datos corruptos o tipos mezclados hasta la capa de persistencia) & Dual Contract Drift (tener validadores en JS desfasados respecto a la documentación Swagger)
 * 🛡️ EL ANTÍDOTO:                Esquema Zod fuertemente tipado que valida, sanitiza y sirve como única fuente de verdad para tiempo de ejecución y documentación.
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
