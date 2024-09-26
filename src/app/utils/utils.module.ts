// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { InvoiceModule } from './invoice/invoice.module';

@Module({
    imports: [
        InvoiceModule
    ]
})

export class UtilsModule {}