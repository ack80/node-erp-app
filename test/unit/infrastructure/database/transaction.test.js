// test/unit/infrastructure/database/transaction.test.js

/**
 * @file test/unit/infrastructure/database/transaction.test.js
 *
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 002 (Smalltalk TDD / Kent Beck) & Era 005 (Laravel Test Doubles)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Test Double / Fake Pattern (Meszaros xUnit Patterns)
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Arrange-Act-Assert (AAA) con Fake Object | Tiempo: O(1) | Espacio: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      Integration-Leaking Unit Tests (requerir una base de datos real levantada
 *    para probar la lógica de commit/rollback, acoplando pruebas rápidas a infraestructura de red).
 * 🛡️ EL ANTÍDOTO:                Fake Pool y Fake Connection inyectados como Test Doubles puros,
 *    verificando el comportamiento de orquestación de la transacción en tiempo O(1) sin red.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withTransaction } from '../../../../src/infrastructure/database/transaction.js';

// ---------------------------------------------------------------------------
// FAKE OBJECTS: Test Doubles que simulan mysql2 Pool y Connection
// Implementan el mismo contrato de interfaz (Duck Typing) sin red real.
// ---------------------------------------------------------------------------
function createFakeConnection({ shouldFailBeginTransaction = false, shouldFailCallback = false } = {}) {
  return {
    beginTransaction: vi.fn(async () => {
      if (shouldFailBeginTransaction) throw new Error('DB: BEGIN TRANSACTION fallido');
    }),
    commit: vi.fn(async () => {}),
    rollback: vi.fn(async () => {}),
    release: vi.fn(),
  };
}

function createFakePool(connection) {
  return {
    getConnection: vi.fn(async () => connection),
  };
}

// ---------------------------------------------------------------------------
// SUITE DE PRUEBAS: 6 escenarios que cubren el 100% de la lógica de orquestación
// ---------------------------------------------------------------------------
describe('withTransaction — Loan Pattern / Unit of Work', () => {
  let fakeConnection;
  let fakePool;

  beforeEach(() => {
    fakeConnection = createFakeConnection();
    fakePool = createFakePool(fakeConnection);
  });

  // ✅ Camino Feliz: La transacción completa correctamente
  it('debe ejecutar beginTransaction, el callback y commit en el orden correcto', async () => {
    const callbackResult = { id: 1, name: 'WorldClass' };
    const callback = vi.fn(async (_connection) => callbackResult);

    const result = await withTransaction(fakePool, callback);

    expect(fakePool.getConnection).toHaveBeenCalledOnce();
    expect(fakeConnection.beginTransaction).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(fakeConnection);
    expect(fakeConnection.commit).toHaveBeenCalledOnce();
    expect(fakeConnection.rollback).not.toHaveBeenCalled();
    expect(result).toBe(callbackResult);
  });

  // ✅ El Antídoto Principal: release() SIEMPRE se ejecuta en finally, incluso en commit exitoso
  it('debe llamar connection.release() en finally incluso cuando el callback tiene éxito', async () => {
    await withTransaction(fakePool, async () => 'ok');

    expect(fakeConnection.release).toHaveBeenCalledOnce();
  });

  // ✅ El Antídoto de Rollback: Si el callback falla, ejecuta rollback y NO commit
  it('debe ejecutar rollback y NO commit cuando el callback lanza un error', async () => {
    const callbackError = new Error('Error de negocio: stock insuficiente');
    const failingCallback = vi.fn(async () => { throw callbackError; });

    await expect(withTransaction(fakePool, failingCallback)).rejects.toThrow('Error de negocio: stock insuficiente');

    expect(fakeConnection.rollback).toHaveBeenCalledOnce();
    expect(fakeConnection.commit).not.toHaveBeenCalled();
  });

  // ✅ El Antídoto de Connection Leak: release() se ejecuta en finally INCLUSO cuando el callback falla
  it('debe llamar connection.release() en finally incluso cuando el callback falla (anti Connection Leak)', async () => {
    const failingCallback = async () => { throw new Error('crash'); };

    await expect(withTransaction(fakePool, failingCallback)).rejects.toThrow('crash');

    expect(fakeConnection.release).toHaveBeenCalledOnce();
  });

  // ✅ Re-lanzamiento del Error: El error del callback no se traga (no swallowing)
  it('debe re-lanzar el error original del callback sin modificarlo ni envolverlo', async () => {
    const originalError = new RangeError('Saldo insuficiente para la operación');
    const failingCallback = async () => { throw originalError; };

    const caughtError = await withTransaction(fakePool, failingCallback).catch((e) => e);

    expect(caughtError).toBe(originalError);
    expect(caughtError).toBeInstanceOf(RangeError);
  });

  // ✅ Guards de Entrada: Rechaza pools o callbacks inválidos con TypeError claro (Fail Fast)
  it('debe lanzar TypeError si pool no tiene el método getConnection (guard clause)', async () => {
    await expect(withTransaction(null, async () => {}))
      .rejects.toThrow(TypeError);

    await expect(withTransaction({}, async () => {}))
      .rejects.toThrow(TypeError);
  });

  it('debe lanzar TypeError si el callback no es una función (guard clause)', async () => {
    await expect(withTransaction(fakePool, null))
      .rejects.toThrow(TypeError);

    await expect(withTransaction(fakePool, 'no-es-funcion'))
      .rejects.toThrow(TypeError);
  });
});
