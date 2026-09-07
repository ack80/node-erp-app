// src/bootstrap/modules/user.container.js

    /**
     * Fábrica del módulo de usuarios para el contenedor DI.
     *
     * @param {import('mysql2/promise').Pool} dbPool
     */
    export function makeUserModule(dbPool) {
      // Se conectará cuando construyamos UserRepository y UseCases en la Fase 2
      return {
        db: dbPool,
      };
    }
