// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { InvoiceModule } from './invoice/invoice.module';
import { NotificationModule } from './notification/notification.module';

@Module({
    imports: [
        InvoiceModule,
        NotificationModule
    ]
})

export class UtilsModule {}