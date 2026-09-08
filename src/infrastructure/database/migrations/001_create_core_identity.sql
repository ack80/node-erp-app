-- =============================================================================
-- Migración: 001_create_users.sql
-- Módulo: auth_ (Autenticación, Identidad y Control de Acceso)
-- Convención: Nombres de tabla por módulo clásico (auth_*)
-- Soporte Multi-Tenant nativo y cumplimiento estricto de Replicación MySQL
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLA: auth_tenants
-- Forma Normal: 3FN (Tercera Forma Normal)
--   - 1FN: Columnas atómicas con clave primaria única (id).
--   - 2FN: Dependencia total de la PK.
--   - 3FN: No existen dependencias transitivas; representa la entidad raíz de empresa.
-- Rol en Replicación: Tabla de escritura en Primary (Alta integridad transaccional).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_auth_tenants_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- TABLA: auth_roles
-- Forma Normal: 1FN / 2FN (Catálogo Maestro / Dimensión)
--   - 1FN: Atributos atómicos (id, name).
--   - 2FN: Cada descripción depende exclusivamente de la PK 'id'.
--   - Desacopla los roles de los usuarios para evitar duplicación de texto en 3FN.
-- Rol en Replicación: Datos estáticos de lectura intensiva (Ideal para Read-Replicas).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- TABLA: auth_users
-- Forma Normal: 3FN (Tercera Forma Normal)
--   - 1FN: Atributos atómicos (sin arrays de emails ni teléfonos).
--   - 2FN: Todos los atributos dependen de la clave primaria 'id'.
--   - 3FN: tenant_id es una clave foránea; los datos de la empresa no se repiten
--          aquí (evitando dependencias transitivas X -> Y -> Z).
-- Multi-Tenant: El email es único POR INQUILINO (tenant_id, email).
-- Rol en Replicación: Operaciones concurrentes en Primary (InnoDB + PK explícita).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Unicidad Multi-Tenant
  UNIQUE KEY uq_auth_tenant_email (tenant_id, email),
  
  -- Integridad Referencial estricta
  CONSTRAINT fk_auth_users_tenant
    FOREIGN KEY (tenant_id) REFERENCES auth_tenants(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  INDEX idx_auth_users_tenant (tenant_id),
  INDEX idx_auth_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- TABLA: auth_user_roles
-- Forma Normal: 3FN / BCNF (Tabla Asociativa / Junction Table)
--   - Resuelve la relación Muchos a Muchos (N:M) entre auth_users y auth_roles.
--   - 1FN: Atributos atómicos.
--   - 2FN: Clave primaria compuesta (user_id, role_id). El atributo 'assigned_at'
--          depende de la combinación COMPLETA de ambas claves, no de una sola.
--   - 3FN: Cero redundancia; roles y usuarios pueden crecer independientemente.
-- Rol en Replicación: PK compuesta explícita para replicación fila por fila segura.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (user_id, role_id),
  
  CONSTRAINT fk_auth_user_roles_user
    FOREIGN KEY (user_id) REFERENCES auth_users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    
  CONSTRAINT fk_auth_user_roles_role
    FOREIGN KEY (role_id) REFERENCES auth_roles(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
