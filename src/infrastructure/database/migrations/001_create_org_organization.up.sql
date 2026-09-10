-- =============================================================================
-- 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 001 (Edgar F. Codd 3NF) & Era 002 (SAP Mandante Multi-Tenant)
-- 📐 PATRONES DE DISEÑO FORMALES:
--    1. Shared Database, Shared Schema Multi-Tenancy (SAP Client Pattern vía holding_id)
--    2. Composite B-Tree Covering Index Pattern (Búsquedas O(log N) en índices compuestos)
--    3. Hybrid Schema Pattern (Relacional 3NF para datos nucleares + JSON metadata para extensiones)
--    4. Soft Delete / Forensic Integrity Pattern (FOREIGN KEY ON DELETE RESTRICT)
-- ⚙️ ESTRUCTURAS DE DATOS Y COMPLEJIDAD:
--    • B+Tree Clustered Index (InnoDB): O(log N) búsqueda y traversal secuencial de rangos.
--    • Adjacency List: Jerarquía relacional Holding -> Company -> Branch -> Store.
-- 🦹 VILLANOS NEUTRALIZADOS:
--    • Tenant Data Leakage: Toda tabla operativa tiene clave de aislamiento foránea.
--    • Full Table Scan (Index Starvation): Toda clave foránea posee índice B-Tree dedicado.
--    • EAV Anti-Pattern / Sparse Column Explosion: Metadata flexible en columna JSON sin tablas EAV.
--    • Cascading Deletion Holocaust: ON DELETE RESTRICT previene borrado accidental de empresas.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLA: org_countries
-- Forma Normal: 1FN / 2FN (Catálogo Maestro ISO 3166-1 alfa-2)
-- Propósito: Desacopla la entidad país de direcciones y empresas.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_countries (
  code VARCHAR(2) PRIMARY KEY, -- 'EC', 'US', 'VE', 'CO'
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 2. TABLA: org_currencies
-- Forma Normal: 1FN / 2FN (Catálogo Maestro ISO 4217)
-- Propósito: Monedas base y operacionales del ERP.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_currencies (
  code VARCHAR(3) PRIMARY KEY, -- 'USD', 'EUR', 'VES'
  name VARCHAR(50) NOT NULL,
  symbol VARCHAR(5) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 3. TABLA: org_cities
-- Forma Normal: 3FN (División Política Territorial)
-- Propósito: Ciudades asociadas a países y provincias para sucursales e impuestos.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country_code VARCHAR(2) NOT NULL,
  name VARCHAR(100) NOT NULL,
  state_province VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY uq_org_city_country (country_code, state_province, name),
  
  CONSTRAINT fk_org_cities_country
    FOREIGN KEY (country_code) REFERENCES org_countries(code)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  INDEX idx_org_cities_country (country_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 4. TABLA: org_holdings
-- Forma Normal: 3FN (Entidad Raíz del Grupo Empresarial / Licencia SaaS)
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
-- 5. TABLA: org_companies
-- Forma Normal: 3FN (Filiales con Personalidad Jurídica, RUC y Datos Fiscales)
-- Cumple con requerimientos de Facturación Electrónica (SRI Ecuador, DIAN, etc.)
-- metadata: Almacena datos dinámicos (redes sociales, branding, logo)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  holding_id INT NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  legal_name VARCHAR(200) NOT NULL, -- Razón Social (ej. Worldclass Travel S.A.)
  trade_name VARCHAR(150) NOT NULL, -- Nombre Comercial (ej. Worldclass Travel)
  tax_id VARCHAR(20) NOT NULL,      -- RUC / RIF / NIT / Tax Number (13 dígitos en Ecuador)
  legal_address VARCHAR(255) NOT NULL,
  corporate_email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  website VARCHAR(255) NULL,
  metadata JSON NULL,               -- Redes sociales, branding, logos
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Unicidad de RUC por Holding
  UNIQUE KEY uq_org_company_tax (holding_id, tax_id),
  
  CONSTRAINT fk_org_companies_holding
    FOREIGN KEY (holding_id) REFERENCES org_holdings(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  CONSTRAINT fk_org_companies_country
    FOREIGN KEY (country_code) REFERENCES org_countries(code)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  CONSTRAINT fk_org_companies_currency
    FOREIGN KEY (currency_code) REFERENCES org_currencies(code)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  INDEX idx_org_companies_holding (holding_id),
  INDEX idx_org_companies_tax (tax_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 6. TABLA: org_branches
-- Forma Normal: 3FN (Sucursales Físicas Operativas Atómicas)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  city_id INT NOT NULL,
  code VARCHAR(10) NOT NULL,        -- 'UIO-01', 'GYE-01', 'CUE-01'
  name VARCHAR(150) NOT NULL,       -- 'Agencia Amazonas', 'Agencia San Marino'
  address_line VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  zip_code VARCHAR(20) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uq_org_branch_code (company_id, code),
  
  CONSTRAINT fk_org_branches_company
    FOREIGN KEY (company_id) REFERENCES org_companies(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  CONSTRAINT fk_org_branches_city
    FOREIGN KEY (city_id) REFERENCES org_cities(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  INDEX idx_org_branches_company (company_id),
  INDEX idx_org_branches_city (city_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 7. TABLA: org_stores
-- Forma Normal: 3FN (Canales de Venta Digital / E-Commerce)
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
