-- =============================================================================
-- Seed: 003_org_cities_ecuador.sql
-- Entidad: org_cities
-- Descripción: Ciudades Principales de Ecuador (Provincias SENPLADES)
-- =============================================================================
INSERT INTO org_cities (id, country_code, name, state_province) VALUES 
  (1, 'EC', 'Quito',     'Pichincha'),
  (2, 'EC', 'Guayaquil', 'Guayas'),
  (3, 'EC', 'Cuenca',    'Azuay'),
  (4, 'EC', 'Manta',     'Manabí'),
  (5, 'EC', 'Ambato',    'Tungurahua'),
  (6, 'EC', 'Ibarra',    'Imbabura'),
  (7, 'EC', 'Loja',      'Loja'),
  (8, 'EC', 'Riobamba',  'Chimborazo')
ON DUPLICATE KEY UPDATE name = VALUES(name);
