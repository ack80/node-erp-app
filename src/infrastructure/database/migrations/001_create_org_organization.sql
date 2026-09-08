-- =============================================================================
-- Migración: 001_create_org_organization.sql
-- Dominio: organization/ (Prefijo org_)
-- Descripción: Estructura Corporativa Jerárquica Multi-Tenant (Holdings -> Filiales -> Sucursales -> Tiendas)
-- Cumplimiento: 3FN estricto, InnoDB, Replicación MySQL
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLA: org_holdings
-- Forma Normal: 3FN (Entidad Raíz del Grupo Empresarial / Licencia SaaS)
-- Propósito: Representa el conglomerado o cuenta corporativa (ej. Worldclass Holding).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_holdings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  deployment_mode ENUM('cloud_shared', 'cloud_dedicated', 'self_hosted') NOT NULL DEFAULT 'cloud_shared',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_org_holdings_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 2. TABLA: org_companies
-- Forma Normal: 3FN (Filiales / Razones Sociales con Personalidad Jurídica Propia)
-- Propósito: Entidades legales (ej. Worldclass Travel C.A., RapiVisa C.A.).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  holding_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  tax_id VARCHAR(50) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Unicidad del RIF/TaxId por cada Holding
  UNIQUE KEY uq_org_company_tax (holding_id, tax_id),
  
  CONSTRAINT fk_org_companies_holding
    FOREIGN KEY (holding_id) REFERENCES org_holdings(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  INDEX idx_org_companies_holding (holding_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 3. TABLA: org_branches
-- Forma Normal: 3FN (Sucursales Físicas / Zonas Operativas Descentralizadas)
-- Propósito: Puntos físicos o regiones (ej. Caracas, Maracaibo, Valencia).
-- code: Prefijo único por compañía para numeración sin colisiones (CCS, MAR, VAL).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Unicidad del código de sucursal por filial
  UNIQUE KEY uq_org_branch_code (company_id, code),
  
  CONSTRAINT fk_org_branches_company
    FOREIGN KEY (company_id) REFERENCES org_companies(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  INDEX idx_org_branches_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 4. TABLA: org_stores
-- Forma Normal: 3FN (Canales de Venta Digital / Tiendas Web)
-- Propósito: Puntos de venta online vinculados a una sucursal despachadora.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  branch_id INT NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(150) NOT NULL,
  url VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uq_org_store_code (company_id, code),
  
  CONSTRAINT fk_org_stores_company
    FOREIGN KEY (company_id) REFERENCES org_companies(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  CONSTRAINT fk_org_stores_branch
    FOREIGN KEY (branch_id) REFERENCES org_branches(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  INDEX idx_org_stores_company (company_id),
  INDEX idx_org_stores_branch (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
