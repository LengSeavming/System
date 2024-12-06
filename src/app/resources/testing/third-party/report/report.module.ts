// =========================================================================>> Core Library
import { Module } from '@nestjs/common';

// =========================================================================>> Custom Library
import { TelegramController } from './report.controller';
import { TelegramService } from './report.service';

// ======================================= >> Code Starts Here << ========================== //
@Module({
    controllers: [TelegramController],
    providers: [TelegramService]
})
export class TelegramModule { }
