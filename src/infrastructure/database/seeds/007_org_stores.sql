-- =============================================================================
-- Seed: 007_org_stores.sql
-- Entidad: org_stores
-- Descripción: Canales de Venta Digital (E-Commerce / Storefronts)
-- =============================================================================
INSERT INTO org_stores (id, company_id, branch_id, code, name, url, is_active) VALUES 
  (1, 1, 1, 'STORE_TRAVEL_EC', 'Worldclass Travel Online Ecuador', 'https://travel.worldclass.ec', TRUE),
  (2, 2, 4, 'STORE_VISA_EC',   'RapiVisa Portal Digital',          'https://rapivisa.ec',          TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), url = VALUES(url);
