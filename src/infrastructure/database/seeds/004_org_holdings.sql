-- =============================================================================
-- Seed: 004_org_holdings.sql
-- Entidad: org_holdings
-- Descripción: Grupo Empresarial Raíz (Licencia SaaS / Tenant)
-- =============================================================================
INSERT INTO org_holdings (id, name, slug, deployment_mode, is_active) VALUES 
  (1, 'Worldclass Holding', 'worldclass', 'cloud_shared', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);
