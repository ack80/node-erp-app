-- =============================================================================
-- 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 001 (Integridad Referencial ACID) & Era 002 (SAP Mandante) & Era 004 (Django Auth Schema)
-- 📐 PATRONES DE DISEÑO FORMALES:
--    1. Junction Table Pattern / Association Table (usr_user_roles para N:M desacoplado)
--    2. Composite Unique Key Pattern ((holding_id, email) para unicidad contextual)
--    3. State Integrity Pattern (is_active TINYINT(1) para Soft Delete)
-- ⚙️ ESTRUCTURAS DE DATOS Y COMPLEJIDAD:
--    • B+Tree Index Compuesto: O(log N) para resolución de logins por email y holding.
--    • Clustered Primary Keys (INT AUTO_INCREMENT): Espacio O(1) adicional sin fragmentación de páginas de disco.
-- 🦹 VILLANOS NEUTRALIZADOS:
--    • Global Email Collisions: Permite que 'admin@empresa.com' exista independientemente en holdings distintos.
--    • Hard-Coded Role Enumerations: usr_roles desacoplado en tabla física sin `ENUM` rígidos que bloquean DDL.
--    • Ghost Orphan Users: Relaciones foráneas estrictas con RESTRICT protegiendo trazabilidad histórica.
-- =============================================================================
    
    -- -----------------------------------------------------------------------------
    -- 1. TABLA: usr_roles
    -- Forma Normal: 1FN / 2FN (Catálogo Maestro de Roles)
    -- Propósito: Desacopla los roles de los usuarios (ADMIN, OPERATOR, CASHIER, AUDITOR).
    -- Rol en Replicación: Tabla estática de alta lectura (Read-Replicas).
    -- -----------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS usr_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      description VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    
    -- -----------------------------------------------------------------------------
    -- 2. TABLA: usr_users
    -- Forma Normal: 3FN (Usuarios del ERP con Ámbito Jerárquico)
    -- - holding_id: Obligatorio (a qué grupo empresarial pertenece).
    -- - company_id: Opcional (si es NULL, es directivo/auditor de todo el Holding).
    -- - branch_id: Opcional (si es NULL, opera a nivel central de la filial).
    -- -----------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS usr_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      holding_id INT NOT NULL,
      company_id INT NULL,
      branch_id INT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(150) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      -- Unicidad Multi-Tenant: El email es único por Holding
      UNIQUE KEY uq_usr_holding_email (holding_id, email),
      
      -- Integridad Referencial hacia el Módulo de Organización
      CONSTRAINT fk_usr_users_holding
        FOREIGN KEY (holding_id) REFERENCES org_holdings(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
        
      CONSTRAINT fk_usr_users_company
        FOREIGN KEY (company_id) REFERENCES org_companies(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
        
      CONSTRAINT fk_usr_users_branch
        FOREIGN KEY (branch_id) REFERENCES org_branches(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
        
      INDEX idx_usr_users_holding (holding_id),
      INDEX idx_usr_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- -----------------------------------------------------------------------------
    -- 3. TABLA: usr_user_roles
    -- Forma Normal: 3FN / BCNF (Tabla Asociativa / Junction Table N:M)
    -- Propósito: Asignación de uno o más roles a un usuario.
    -- -----------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS usr_user_roles (
      user_id INT NOT NULL,
      role_id INT NOT NULL,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      PRIMARY KEY (user_id, role_id),
      
      CONSTRAINT fk_usr_user_roles_user
        FOREIGN KEY (user_id) REFERENCES usr_users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
        
      CONSTRAINT fk_usr_user_roles_role
        FOREIGN KEY (role_id) REFERENCES usr_roles(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
