// ===========================================================================>> Core Library
import { InvoiceModule } from './invoice/invoice.module';

// ===========================================================================>> Custom Library
import { Routes } from '@nestjs/core';
import { NotificationModule } from './notification/notification.module';
import { NotificationGetwayModule } from './notification-getway/notifications.gateway.module';

export const utilsRoutes: Routes = [
    {
        path: 'print',
        module: InvoiceModule
    },
    {
        path: 'notifications',
        module: NotificationModule
    },
    {
        path: 'notifications-getway',
        module: NotificationGetwayModule
    },
];