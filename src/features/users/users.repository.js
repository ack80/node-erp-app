
// src/features/users/users.repository.js
import { UserEntity } from './users.entity.js';

/**
 * Fábrica del Repositorio de Usuarios conectado a la tabla usr_users.
 * 100% Prepared Statements (Seguridad OWASP contra SQL Injection).
 *
 * @param {import('mysql2/promise').Pool} db - Pool de conexiones MySQL
 */
export function createUserRepository(db) {
    return {
    /**
     * Busca un usuario por email dentro de un Holding específico.
     *
     * @param {number} holdingId
     * @param {string} email
     * @returns {Promise<UserEntity|null>}
     */
    async findByEmail(holdingId, email) {
        const sql = `
        SELECT id, holding_id, company_id, branch_id, email, password_hash, name, is_active, created_at, updated_at
        FROM usr_users
        WHERE holding_id = ? AND email = ?
        LIMIT 1;
        `;

        const [rows] = await db.execute(sql, [holdingId, email]);

        if (!rows || rows.length === 0) {
        return null;
        }

        const row = rows[0];
        return new UserEntity({
        id: row.id,
        holdingId: row.holding_id,
        companyId: row.company_id,
        branchId: row.branch_id,
        email: row.email,
        passwordHash: row.password_hash,
        name: row.name,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        });
    },

    /**
     * Busca un usuario por su Primary Key (id).
     *
     * @param {number} id
     * @returns {Promise<UserEntity|null>}
     */
    async findById(id) {
        const sql = `
        SELECT id, holding_id, company_id, branch_id, email, password_hash, name, is_active, created_at, updated_at
        FROM usr_users
        WHERE id = ?
        LIMIT 1;
        `;

        const [rows] = await db.execute(sql, [id]);

        if (!rows || rows.length === 0) {
        return null;
        }

        const row = rows[0];
        return new UserEntity({
        id: row.id,
        holdingId: row.holding_id,
        companyId: row.company_id,
        branchId: row.branch_id,
        email: row.email,
        passwordHash: row.password_hash,
        name: row.name,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        });
    },

    /**
     * Registra un nuevo usuario en la base de datos.
     *
     * @param {object} userData
     * @returns {Promise<UserEntity>}
     */
    async create({ holdingId, companyId = null, branchId = null, email, passwordHash, name }) {
        const sql = `
        INSERT INTO usr_users (holding_id, company_id, branch_id, email, password_hash, name)
        VALUES (?, ?, ?, ?, ?, ?);
        `;

        const [result] = await db.execute(sql, [
        holdingId,
        companyId,
        branchId,
        email,
        passwordHash,
        name,
        ]);

        return new UserEntity({
        id: result.insertId,
        holdingId,
        companyId,
        branchId,
        email,
        passwordHash,
        name,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        });
    },
    };
}
