// ===========================================================================>> Core Library
import { InvoiceModule } from './invoice/invoice.module';

// ===========================================================================>> Custom Library
import { Routes } from '@nestjs/core';

export const utilsRoutes: Routes = [
    {
        path: 'print',
        module: InvoiceModule
    },
];