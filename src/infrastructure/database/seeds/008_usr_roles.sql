-- =============================================================================
-- Seed: 008_usr_roles.sql
-- Entidad: usr_roles
-- Descripción: Catálogo Maestro de Roles del Sistema
-- Dominio: users/ (usr_)
-- =============================================================================
INSERT INTO usr_roles (id, name, description) VALUES 
  (1, 'SUPERADMIN',     'Acceso irrestricto a todo el Holding y sus filiales'),
  (2, 'COMPANY_ADMIN',  'Administrador general de la filial legal'),
  (3, 'BRANCH_MANAGER', 'Gerente de sucursal operativa'),
  (4, 'CASHIER',        'Operador de mostrador / cajero de ventas')
ON DUPLICATE KEY UPDATE description = VALUES(description);
