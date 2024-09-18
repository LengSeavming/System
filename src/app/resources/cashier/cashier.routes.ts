// ================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { SaleModule } from './sale/sale.module';
import { OrderModule } from './order/order.module';

// ================================================================>> Custom Library


export const cashierRoutes: Routes = [
    {
        path: 'ordering',
        module: OrderModule
    },
    {
        path: 'sales',
        module: SaleModule
    },
];