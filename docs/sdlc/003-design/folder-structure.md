### Folder Strcucture

node-app/
├── package.json
├── package-lock.json
├── .env
├── .env.example
├── .gitignore
├── README.md
│
├── src/
│   ├── main.js
│   │
│   ├── config/
│   │   ├── env.js
│   │   └── logger.js
│   │
│   ├── bootstrap/
│   │   ├── create-app.js
│   │   ├── register-routes.js
│   │   └── shutdown.js
│   │
│   ├── infrastructure/
│   │   ├── http/
│   │   │   ├── server.js
│   │   │   ├── router.js
│   │   │   ├── request-body.js
│   │   │   ├── response.js
│   │   │   └── http-errors.js
│   │   │
│   │   ├── database/
│   │   │   ├── pool.js
│   │   │   ├── transaction.js
│   │   │   └── migrations/
│   │   │       ├── 001_create_users.sql
│   │   │       └── 002_create_customers.sql
│   │   │
│   │   └── security/
│   │       ├── password-hasher.js
│   │       └── token-service.js
│   │
│   ├── shared/
│   │   ├── errors/
│   │   │   ├── app-error.js
│   │   │   └── error-codes.js
│   │   ├── result/
│   │   │   └── result.js
│   │   ├── validation/
│   │   │   └── validation-error.js
│   │   └── utils/
│   │       ├── ids.js
│   │       └── dates.js
│   │
│   └── features/
│       ├── health/
│       │   ├── domain/
│       │   │   └── health-status.js
│       │   ├── application/
│       │   │   └── get-health.js
│       │   └── infrastructure/
│       │       └── health-routes.js
│       │
│       ├── users/
│       │   ├── domain/
│       │   │   ├── user.js
│       │   │   ├── user-errors.js
│       │   │   └── user-repository.js
│       │   ├── application/
│       │   │   ├── create-user.js
│       │   │   ├── get-user.js
│       │   │   └── list-users.js
│       │   ├── infrastructure/
│       │   │   ├── user-repository-pg.js
│       │   │   └── user-routes.js
│       │   └── interfaces/
│       │       └── user-schemas.js
│       │
│       ├── auth/
│       │   ├── domain/
│       │   │   └── auth-errors.js
│       │   ├── application/
│       │   │   ├── login.js
│       │   │   └── refresh-session.js
│       │   ├── infrastructure/
│       │   │   └── auth-routes.js
│       │   └── interfaces/
│       │       └── auth-schemas.js
│       │
│       └── customers/
│           ├── domain/
│           │   ├── customer.js
│           │   └── customer-repository.js
│           ├── application/
│           │   ├── create-customer.js
│           │   ├── update-customer.js
│           │   └── list-customers.js
│           ├── infrastructure/
│           │   ├── customer-repository-pg.js
│           │   └── customer-routes.js
│           └── interfaces/
│               └── customer-schemas.js
│
└── test/
    ├── unit/
    │   └── features/
    │       └── customers/
    ├── integration/
    │   ├── http/
    │   └── database/
    └── helpers/
        ├── fake-repositories.js
        └── test-server.js
