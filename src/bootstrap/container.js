
    // src/bootstrap/container.js
    import { pool } from '../infrastructure/database/pool.js';

    /**
     * Contenedor de Inyección de Dependencias manual.
     * Centraliza la creación y cableado de dependencias del ERP.
     *
     * @param {object} overrides - Permite sustituir dependencias en tests (ej. { db: mockPool })
     * @returns {object} Contenedor con los servicios y adaptadores del sistema
     */
    export function createContainer(overrides = {}) {
      const db = overrides.db || pool;

      return {
        db,
        // Aquí iremos inyectando users, auth, customers conforme los construyamos:
        // users: makeUserModule(db),
      };
    }
