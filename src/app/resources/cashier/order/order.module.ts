// =========================================================================>> Core Library
import { Module } from '@nestjs/common';

// =========================================================================>> Custom Library
import { TelegramService } from 'src/app/services/telegram.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

// ======================================= >> Code Starts Here << ========================== //
@Module({
    controllers: [OrderController],
    providers: [OrderService, TelegramService]
})
export class OrderModule { }
