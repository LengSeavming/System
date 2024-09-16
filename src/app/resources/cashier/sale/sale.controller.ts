// ================================================================>> Core Library
import UserDecorator from '@app/core/decorators/user.decorator';
import User from '@models/user/users.model';
import { Controller, Get, Query } from '@nestjs/common';
import { SaleService } from './sale.service';
@Controller()
export class SaleController {

    constructor(private readonly _service: SaleService) { };

    @Get()
    async getAllSale(
        @UserDecorator() auth: User,
        @Query('page_size') page_size?: number,
        @Query('page') page?: number,
        @Query('key') key?: string,
    ) {
        if (!page_size) {
            page_size = 10;
        }
        if (!page) {
            page = 1;
        }

        return await this._service.listing(auth.id, page_size, page, key);
    }
}