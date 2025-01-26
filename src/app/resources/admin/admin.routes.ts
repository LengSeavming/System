// ===========================================================================>> Core Library
import { Routes } from "@nestjs/core";

// ===========================================================================>> Custom Library
import { ProductModule } from "./product/product.module";
import { ProductsTypeModule } from "./product/type/type.module";
import { UserModule } from "./user/user.module";

import { SaleModule } from "./sale/sale.module";

import { DashboardModule } from "./dashboard/dashboard.module";
import { PetTypeModule } from "./pet/type/type.module";
import { PetModule } from "./pet/pet.module";
import { BookModule } from "./book/book.module";

export const adminRoutes: Routes = [
  {
    path: "dashboard",
    module: DashboardModule,
  },
  {
    path: "sales",
    module: SaleModule,
  },
  {
    path: "products",
    module: ProductModule,
  },
  {
    path: "products/types",
    module: ProductsTypeModule,
  },
  {
    path: "users",
    module: UserModule,
  },
  {
    path: "pet",
    module: PetModule,
  },
  {
    path: "pet/types",
    module: PetTypeModule,
  },
  {
    path: "book",
    module: BookModule,
  },
];
