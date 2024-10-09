// =========================================================================>> Core Library
import { Module } from '@nestjs/common';

// =========================================================================>> Custom Library
import { TelegramService } from 'src/app/services/telegram.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { NotificationsGateway } from '@app/utils/notification-getway/notifications.gateway';

// ======================================= >> Code Starts Here << ========================== //
@Module({
    controllers: [OrderController],
    providers: [OrderService, TelegramService, NotificationsGateway]
})
export class OrderModule { }
