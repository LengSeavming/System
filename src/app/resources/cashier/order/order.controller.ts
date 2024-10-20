// =========================================================================>> Core Library
import { Body, Controller, Get, Post } from '@nestjs/common';

// =========================================================================>> Custom Library
import { Platform } from '@app/core/decorators/device-info.decorator';
import UserDecorator from '@app/core/decorators/user.decorator';
import User from '@models/user/users.model';
import Order from 'src/models/order/order.model';
import Product from 'src/models/product/product.model';
import { CreateOrderDto } from './order.pos.dto';
import { OrderService } from './order.service';

// ======================================= >> Code Starts Here << ========================== //
@Controller()
export class OrderController {

    constructor(private readonly _service: OrderService) { };

    @Get('products')
    async getProducts(): Promise<{ data: { id: number, name: string, products: Product[] }[] }> {
        return await this._service.getProducts();
    }

    @Post('order')
    async makeOrder(@Body() body: CreateOrderDto, @UserDecorator() user: User, @Platform() platform: string,): Promise<{ data: Order, message: string }> {
        return await this._service.makeOrder(user.id, body, platform);
    }
    
}
