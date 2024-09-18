// =========================================================================>> Core Library
import { Module } from '@nestjs/common';

// =========================================================================>> Custom Library
import { InvoiceModule } from './invoice/invoice.module';

// ======================================= >> Code Starts Here << ========================== //
@Module({
    imports: [
        InvoiceModule
    ]
})

export class UtilsModule {}