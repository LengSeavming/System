// ===========================================================================>> Core Library
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { UserMiddleware } from '@app/core/middlewares/user.middleware';
import { OrderModule } from './order/order.module';
import { SaleModule } from './sale/sale.module';

@Module({
    imports: [
        SaleModule,
        OrderModule
    ]
})

export class CashierModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(UserMiddleware)
            .forRoutes({ path: 'api/cashier/*', method: RequestMethod.ALL });
    }
}