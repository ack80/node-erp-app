-- =============================================================================
-- Seed: 006_org_branches.sql
-- Entidad: org_branches
-- Descripción: Sucursales Físicas Operativas (Atómicas 3FN con city_id)
-- =============================================================================
INSERT INTO org_branches (id, company_id, city_id, code, name, address_line, phone, zip_code, is_active) VALUES 
  -- Worldclass Travel S.A. (company_id = 1)
  (1, 1, 1, 'UIO-01', 'Agencia Quito Amazonas',           'Av. Amazonas N24-196 y Luis Cordero',                '+593 2 2500 101', '170150', TRUE),
  (2, 1, 2, 'GYE-01', 'Agencia Guayaquil Malecón',        'Malecón 2000, Av. Olmedo y García Avilés',           '+593 4 2300 201', '090150', TRUE),
  (3, 1, 3, 'CUE-01', 'Agencia Cuenca Centro Histórico',  'Gran Colombia 7-55 y Borrero',                       '+593 7 2831 201', '010150', TRUE),
  -- RapiVisa S.A. (company_id = 2)
  (4, 2, 1, 'UIO-01', 'RapiVisa Quito El Recreo',         'Av. Rodrigo de Chávez, CC El Recreo Local 45',      '+593 2 2501 401', '170401', TRUE),
  (5, 2, 2, 'GYE-01', 'RapiVisa Guayaquil San Marino',    'Av. Francisco de Orellana, CC San Marino Local 210', '+593 4 2301 501', '090650', TRUE),
  (6, 2, 3, 'CUE-01', 'RapiVisa Cuenca Mall del Río',     'Av. Felipe II, Mall del Río Local 318',             '+593 7 2831 601', '010250', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), address_line = VALUES(address_line);
