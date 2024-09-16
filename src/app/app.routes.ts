// ================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { accountRoutes } from './resources/account/account.routes';
import { adminRoutes } from './resources/admin/admin.routes';
import { userRoutes } from './resources/user/user.routes';
// ================================================================>> Custom Library
export const appRoutes: Routes = [{
    path: 'api',
    children: [
        {
            path: 'account',
            children: accountRoutes
        },
        {
            path: 'admin',
            children: adminRoutes
        },
        {
            path: 'user',
            children: userRoutes
        },
    ]
}];