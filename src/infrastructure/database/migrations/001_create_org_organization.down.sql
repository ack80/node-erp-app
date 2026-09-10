-- =============================================================================
-- Rollback: 001_create_org_organization.down.sql
-- Revierte en orden inverso a la creación (respetando claves foráneas)
-- =============================================================================
DROP TABLE IF EXISTS org_stores;
DROP TABLE IF EXISTS org_branches;
DROP TABLE IF EXISTS org_companies;
DROP TABLE IF EXISTS org_holdings;
DROP TABLE IF EXISTS org_cities;
DROP TABLE IF EXISTS org_currencies;
DROP TABLE IF EXISTS org_countries;
