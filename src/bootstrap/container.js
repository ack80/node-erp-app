// src/bootstrap/container.js
import { prisma } from '../infrastructure/database/prisma-client.js';
import { makeUserModule } from './modules/user.container.js';
import { makeCustomerModule } from './modules/customer.container.js';

export function createContainer() {
    // Instanciamos los módulos de nuestro ERP
    const users = makeUserModule(prisma);
    const customers = makeCustomerModule(prisma);

    return {
        users,
        customers
    };
}
