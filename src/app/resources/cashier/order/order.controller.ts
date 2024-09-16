// =========================================================================>> Core Library
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

// =========================================================================>> Custom Library
import UserDecorator from '@app/core/decorators/user.decorator';
import { RoleGuard } from '@app/core/guards/role.guard';
import User from '@models/user/users.model';
import Order from 'src/models/order/order.model';
import Product from 'src/models/product/product.model';
import { CreateOrderDto } from './order.pos.dto';
import { PosService } from './order.service';

// ======================================= >> Code Starts Here << ========================== //

@UseGuards(RoleGuard)
@Controller()
export class PosController {

    constructor(private readonly posService: PosService) { };

    // Handling HTTP GET requests for retrieving products
    @Get('products')
    async getProducts(): Promise<{ data: { id: number, name: string, products: Product[] }[] }> {
        return await this.posService.getProducts();
    }

    // Handling HTTP POST requests for making an order
    @Post('order')
    async makeOrder(@Body() body: CreateOrderDto, @UserDecorator() user: User): Promise<{ data: Order, message: string }> {
        return await this.posService.makeOrder(user.id, body);
    }
}
