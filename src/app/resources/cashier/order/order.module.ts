// =========================================================================>> Core Library
import { Module } from '@nestjs/common';

// =========================================================================>> Custom Library
// External Service
import { TelegramService } from 'src/app/services/telegram.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

// Custom External Lib

// ======================================= >> Code Starts Here << ========================== //
@Module({
    controllers: [OrderController],
    providers: [OrderService, TelegramService]
})
export class OrderModule { }
