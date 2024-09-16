// ================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { DashboardModule } from './dashbord/dashboard.module';
import { SaleModule } from './sale/sale.module';

// ================================================================>> Custom Library


export const cashierRoutes: Routes = [
    {
        path: 'dashboard',
        module: DashboardModule
    },
    {
        path: 'pos',
        module: DashboardModule
    },
    {
        path: 'sales',
        module: SaleModule
    },
];