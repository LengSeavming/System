// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { InvoiceModule } from './invoice/invoice.module';
import { NotificationModule } from './notification/notification.module';
import { NotificationGetwayModule } from './notification-getway/notifications.gateway.module';

@Module({
    imports: [
        InvoiceModule,
        NotificationModule,
        NotificationGetwayModule
    ]
})

export class UtilsModule {}