-- =============================================================================
-- Seed: 001_org_master_data.sql
-- Dominio: organization/ & users/
-- Descripción: Datos Maestros Obligatorios - Holding Worldclass Ecuador
-- Entornos: development, staging, production
-- =============================================================================

-- 1. Holding Raíz
INSERT INTO org_holdings (id, name, slug, deployment_mode, is_active)
VALUES (1, 'Worldclass Holding', 'worldclass', 'cloud_shared', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 2. Filiales Legales en Ecuador (Moneda USD)
INSERT INTO org_companies (id, holding_id, name, tax_id, currency, is_active)
VALUES 
  (1, 1, 'Worldclass Travel S.A.', '1792345678001', 'USD', TRUE),
  (2, 1, 'RapiVisa S.A.', '1798765432001', 'USD', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 3. Sucursales en Ecuador (Quito, Guayaquil, Cuenca)
INSERT INTO org_branches (id, company_id, code, name, is_active)
VALUES 
  -- Worldclass Travel S.A.
  (1, 1, 'UIO', 'Sucursal Quito - Av. Amazonas', TRUE),
  (2, 1, 'GYE', 'Sucursal Guayaquil - Malecón 2000', TRUE),
  (3, 1, 'CUE', 'Sucursal Cuenca - Centro Histórico', TRUE),
  -- RapiVisa S.A.
  (4, 2, 'UIO', 'RapiVisa Quito - El Recreo', TRUE),
  (5, 2, 'GYE', 'RapiVisa Guayaquil - San Marino', TRUE),
  (6, 2, 'CUE', 'RapiVisa Cuenca - Mall del Río', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 4. Tiendas Digitales (E-Commerce Storefronts)
INSERT INTO org_stores (id, company_id, branch_id, code, name, url, is_active)
VALUES 
  (1, 1, 1, 'STORE_TRAVEL_EC', 'Worldclass Travel Online Ecuador', 'https://travel.worldclass.ec', TRUE),
  (2, 2, 4, 'STORE_VISA_EC', 'RapiVisa Portal Digital', 'https://rapivisa.ec', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 5. Catálogo Maestro de Roles
INSERT INTO usr_roles (id, name, description)
VALUES 
  (1, 'SUPERADMIN', 'Acceso irrestricto a todo el Holding'),
  (2, 'COMPANY_ADMIN', 'Administrador general de la filial legal'),
  (3, 'BRANCH_MANAGER', 'Gerente de sucursal operativa'),
  (4, 'CASHIER', 'Operador de mostrador / cajero de ventas')
ON DUPLICATE KEY UPDATE description = VALUES(description);
