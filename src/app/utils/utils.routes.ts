// ================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { InvoiceModule } from './invoice/invoice.module';

// ================================================================>> Custom Library


export const utilsRoutes: Routes = [
    {
        path: 'print',
        module: InvoiceModule
    },
];