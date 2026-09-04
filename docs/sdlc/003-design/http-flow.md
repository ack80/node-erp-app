[ Petición HTTP Entrante ]
         │
         ▼
 1. 🛡️ Global Security Headers (Helmet, CORS)
         │
         ▼
 2. 📝 Request ID / Logger (¿Quién llama y cuándo?)
         │
         ▼
 3. 📦 Body Parser (Traduce el JSON del request)
         │
         ▼
 4. 🔑 Global Auth Middleware (¿Tiene token JWT válido? Opcional)
         │
         ▼
 5. 🔀 Enrutador Interno (Features: /users, /customers)
         │
         ▼
   [ Caso de Uso / Dominio ]
