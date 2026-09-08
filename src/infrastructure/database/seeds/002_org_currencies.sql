-- =============================================================================
-- Seed: 002_org_currencies.sql
-- Entidad: org_currencies
-- Descripción: Catálogo Maestro de Monedas (ISO 4217)
-- =============================================================================
INSERT INTO org_currencies (code, name, symbol) VALUES 
  ('USD', 'Dólar Estadounidense', '$'),
  ('EUR', 'Euro', '€'),
  ('COP', 'Peso Colombiano', '$'),
  ('VES', 'Bolívar Venezolano', 'Bs.'),
  ('PEN', 'Sol Peruano', 'S/'),
  ('MXN', 'Peso Mexicano', '$'),
  ('PAB', 'Balboa Panameño', 'B/')
ON DUPLICATE KEY UPDATE name = VALUES(name);
