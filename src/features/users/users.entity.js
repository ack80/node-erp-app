// src/features/users/users.entity.js

/**
 * Entidad de Dominio: Usuario del ERP.
 * Representa la regla de negocio pura de un usuario con ámbito jerárquico.
 * Cero dependencias externas.
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
