// ===========================================================================>> Core Library
import { InvoiceModule } from './invoice/invoice.module';

// ===========================================================================>> Custom Library
import { Routes } from '@nestjs/core';
import { NotificationModule } from './notification/notification.module';

export const utilsRoutes: Routes = [
    {
        path: 'print',
        module: InvoiceModule
    },
    {
        path: 'notifications',
        module: NotificationModule
    },
];