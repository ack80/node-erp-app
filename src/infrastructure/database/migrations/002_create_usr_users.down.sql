-- =============================================================================
-- Rollback: 002_create_usr_users.down.sql
-- Revierte en orden inverso a la creación (respetando claves foráneas)
-- =============================================================================
DROP TABLE IF EXISTS usr_user_roles;
DROP TABLE IF EXISTS usr_users;
DROP TABLE IF EXISTS usr_roles;
