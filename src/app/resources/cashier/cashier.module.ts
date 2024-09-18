// =========================================================================>> Core Library
import { UserMiddleware } from '@app/core/middlewares/user.middleware';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DashboardModule } from './dashbord/dashboard.module';
import { OrderModule } from './order/order.module';
import { SaleModule } from './sale/sale.module';

// =========================================================================>> Custom Library

// ======================================= >> Code Starts Here << ========================== //
@Module({
    imports: [
        DashboardModule,
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