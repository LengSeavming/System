// ================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { DashboardModule } from './dashbord/dashboard.module';
// ================================================================>> Custom Library


export const adminRoutes: Routes = [
    {
        path: 'dashboard',
        module: DashboardModule
    },
];