// =========================================================================>> Core Library
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
// =========================================================================>> Custom Library
import { AdminMiddleware } from '@app/core/middlewares/admin.middleware';
import { DashboardModule } from './dashbord/dashboard.module';
import { ProductModule } from './product/product.module';
import { ProductsTypeModule } from './product/type/type.module';
import { SaleModule } from './sale/sale.module';

// ======================================= >> Code Starts Here << ========================== //
@Module({
    imports: [
        DashboardModule,
        SaleModule,
        ProductModule,
        ProductsTypeModule
    ]
})

export class AdminModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AdminMiddleware)
            .forRoutes({ path: 'api/admin/*', method: RequestMethod.ALL });
    }
}