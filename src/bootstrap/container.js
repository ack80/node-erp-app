// src/bootstrap/container.js
import { pool } from '../infrastructure/database/pool.js';
import { makeUserModule } from './modules/user.container.js';

/**
 * @file src/bootstrap/container.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 003 (Spring IoC / Hexagonal Ports & Adapters) & Era 007 (Go Explicit Composition / Cero Magia)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Dependency Injection Container (Pure Factory Composition Root)
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Object Graph Composition / Reference Passing | Tiempo: O(1) ensamblado | Espacio: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      Hardcoded Concrete Coupling (instanciar repositorios y conexiones dentro de las clases con `new MyRepo()`, imposibilitando unit tests y forzando bases de datos reales) & Black-Box Reflection Injection (decoradores mágicos opacos que dificultan depuración y hacen lenta la compilación)
 * 🛡️ EL ANTÍDOTO:                Inyección de dependencias funcional y transparente que permite sustitución con `overrides` en tests (Test Doubles en tiempo O(1)).
 *
 * @param {object} overrides - Permite sustituir dependencias en tests (ej. { db: mockPool })
 * @returns {object} Contenedor con los servicios y adaptadores del sistema
 */
export function createContainer(overrides = {}) {
  const db = overrides.db || pool;

  return {
    db,
    users: overrides.users || makeUserModule(db),
  };
}
