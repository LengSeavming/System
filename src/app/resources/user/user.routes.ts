// ================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { DashboardModule } from './dashbord/dashboard.module';

// ================================================================>> Custom Library


export const userRoutes: Routes = [
    {
        path: 'dashboard',
        module: DashboardModule
    },
];