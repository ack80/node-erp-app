    // src/infrastructure/security/password-hasher.js
    import argon2 from 'argon2';
    
    /**
     * @file src/infrastructure/security/password-hasher.js
     * 
     * 🏛️ INSPIRACIÓN ARQUITECTÓNICA: Era 004 (Django Cryptographic Hashes) & OWASP Password Storage Standards (Argon2id)
     * 📐 PATRÓN FORMAL DE DISEÑO:    Service Adapter Pattern / Cryptographic Strategy
     * ⚙️ ESTRUCTURA Y ALGORITMO:     Memory-Hard Argon2id Hash Function (RFC 9106) | Tiempo: O(T * M) con T=3 iteraciones, M=64MB | Espacio: O(M) en RAM dedicada
     * 🦹 VILLANO / ANTI-PATRÓN:      GPU / ASIC Brute-Force Acceleration (algoritmos rápidos como MD5/SHA256 que permiten crackear millones de contraseñas por segundo en tarjetas gráficas) & Timing Attacks
     * 🛡️ EL ANTÍDOTO:                Algoritmo resistente a GPUs mediante consumo intensivo de memoria RAM (64 MB por hash) y comparación en tiempo constante.
     *
     * Parámetros recomendados por OWASP para Argon2id:
     * - type: argon2id (híbrido contra side-channel y GPU cracking)
     * - memoryCost: 64 MB (65536 KB)
     * - timeCost: 3 iteraciones
     * - parallelism: 4 hilos
     */
    const ARGON2_OPTIONS = {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    };

    /**
     * Servicio de hashing de contraseñas de grado empresarial.
     */
    export const passwordHasher = {
      /**
       * Genera un hash seguro con salting automático usando Argon2id.
       *
       * @param {string} plainPassword - Contraseña en texto plano
       * @returns {Promise<string>} Hash generado
       */
      async hash(plainPassword) {
        if (!plainPassword || typeof plainPassword !== 'string') {
          throw new Error('La contraseña debe ser una cadena de texto no vacía.');
        }
        return argon2.hash(plainPassword, ARGON2_OPTIONS);
      },

      /**
       * Compara una contraseña en texto plano contra su hash almacenado en tiempo constante.
       *
       * @param {string} hash - Hash guardado en la base de datos
       * @param {string} plainPassword - Contraseña candidata enviada por el usuario
       * @returns {Promise<boolean>} true si coincide, false si es inválida
       */
      async verify(hash, plainPassword) {
        if (!hash || !plainPassword) {
          return false;
        }
        try {
          return await argon2.verify(hash, plainPassword);
        } catch {
          return false;
        }
      },
    };
