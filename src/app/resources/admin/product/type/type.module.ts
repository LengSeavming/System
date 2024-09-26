// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { ProductsTypeController } from './type.controller';
import { ProductsTypeService } from './type.service';

@Module({
    controllers: [ProductsTypeController],
    providers: [ProductsTypeService]
})
export class ProductsTypeModule { }
