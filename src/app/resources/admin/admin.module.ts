// ===========================================================================>> Core Library
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";

// ============================================================================>> Custom Library
import { AdminMiddleware } from "@app/core/middlewares/admin.middleware";
import { DeviceTrackerMiddleware } from "@app/core/middlewares/device-tracker.middleware";

import { ProductModule } from "./product/product.module";
import { ProductsTypeModule } from "./product/type/type.module";

import { UserModule } from "./user/user.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { SaleModule } from "./sale/sale.module";
import { PetModule } from "./pet/pet.module";
import { PetTypeModule } from "./pet/type/type.module";
import { BookModule } from "./book/book.module";

// ======================================= >> Code Starts Here << ========================== //
@Module({
  imports: [
    DashboardModule,
    SaleModule,
    ProductModule,
    ProductsTypeModule,
    UserModule,
    PetModule,
    PetTypeModule,
    BookModule,
  ],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AdminMiddleware, DeviceTrackerMiddleware)
      .forRoutes({ path: "api/admin/*", method: RequestMethod.ALL });
  }
}
