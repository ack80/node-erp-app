-- =============================================================================
-- Seed: 001_org_countries.sql
-- Entidad: org_countries
-- Descripción: Catálogo Maestro de Países (ISO 3166-1 alfa-2)
-- =============================================================================
INSERT INTO org_countries (code, name) VALUES 
  ('EC', 'Ecuador'),
  ('US', 'Estados Unidos'),
  ('CO', 'Colombia'),
  ('VE', 'Venezuela'),
  ('PE', 'Perú'),
  ('MX', 'México'),
  ('PA', 'Panamá'),
  ('DO', 'República Dominicana')
ON DUPLICATE KEY UPDATE name = VALUES(name);
