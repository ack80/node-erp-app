-- Migración: 001_create_users.sql
-- Estándar SAP / Enterprise:
--   sec_core_tenants    : [3FN] Organización / Tenant raíz del sistema
--   sec_cat_roles       : [1FN/2FN] Catálogo de roles del sistema
--   sec_core_users      : [3FN] Usuarios vinculados a un tenant
--   sec_rel_user_roles  : [3FN] Tabla puente N:M para asignación de roles
-- Cumplimiento de Replicación MySQL: InnoDB, PKs explícitas, Índices B-Tree

-- 1. [3FN] Organizaciones / Empresas (Multi-Tenant raíz)
CREATE TABLE IF NOT EXISTS sec_core_tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sec_tenants_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. [1FN/2FN] Catálogo de Roles
CREATE TABLE IF NOT EXISTS sec_cat_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. [3FN] Usuarios vinculados a Tenant
CREATE TABLE IF NOT EXISTS sec_core_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Unicidad Multi-Tenant: El email es único por empresa
  UNIQUE KEY uq_sec_tenant_user_email (tenant_id, email),
  
  -- Integridad Referencial
  CONSTRAINT fk_sec_users_tenant
    FOREIGN KEY (tenant_id) REFERENCES sec_core_tenants(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  INDEX idx_sec_users_tenant (tenant_id),
  INDEX idx_sec_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. [3FN] Tabla Puente Usuarios <-> Roles (N:M)
CREATE TABLE IF NOT EXISTS sec_rel_user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (user_id, role_id),
  
  CONSTRAINT fk_sec_user_roles_user
    FOREIGN KEY (user_id) REFERENCES sec_core_users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    
  CONSTRAINT fk_sec_user_roles_role
    FOREIGN KEY (role_id) REFERENCES sec_cat_roles(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
