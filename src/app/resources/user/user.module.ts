// =========================================================================>> Core Library
import { UserMiddleware } from '@app/core/middlewares/user.middleware';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DashboardModule } from './dashbord/dashboard.module';

// =========================================================================>> Custom Library

// ======================================= >> Code Starts Here << ========================== //
@Module({
    imports: [
        DashboardModule,
    ]
})

export class UserModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(UserMiddleware)
            .forRoutes({ path: 'api/user/*', method: RequestMethod.ALL });
    }
}