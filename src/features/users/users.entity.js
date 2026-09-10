// src/features/users/users.entity.js

/**
 * @file src/features/users/users.entity.js
 * 
 * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 002 (Smalltalk OOP Pura) & Era 003 (Eric Evans DDD Entity / Ubiquitous Language) & Era 007 (Rust Inmutable States)
 * 📐 PATRÓN FORMAL DE DISEÑO:    Domain Entity (DDD) & Information Hiding Pattern
 * ⚙️ ESTRUCTURA Y ALGORITMO:     Class Instance con Record Projections | Tiempo: O(1) creación y serialización | Espacio: O(1)
 * 🦹 VILLANO / ANTI-PATRÓN:      Anemic Domain Model (objetos que son solo bolsas de getters/setters sin lógica) & Password Hash Leakage (fugar el hash de contraseña al frontend en respuestas JSON)
 * 🛡️ EL ANTÍDOTO:                Entidad rica con métodos de proyección controlados (`toPublicJSON()`) que excluyen explícitamente el `passwordHash` de la frontera pública.
 */
export class UserEntity {
  constructor({
    id,
    holdingId,
    companyId = null,
    branchId = null,
    email,
    passwordHash,
    name,
    isActive = true,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.holdingId = holdingId;
    this.companyId = companyId;
    this.branchId = branchId;
    this.email = email;
    this.passwordHash = passwordHash;
    this.name = name;
    this.isActive = Boolean(isActive);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Serializa el usuario para respuestas públicas u operacionales hacia React/Flutter,
   * garantizando que el password_hash jamás sea expuesto fuera del backend.
   */
  toPublicJSON() {
    return {
      id: this.id,
      holdingId: this.holdingId,
      companyId: this.companyId,
      branchId: this.branchId,
      email: this.email,
      name: this.name,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}  
