// ===========================================================================>> Core Library
import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';

// ===========================================================================>> Custom Library
import UserDecorator from '@app/core/decorators/user.decorator';
import User from '@models/user/users.model';
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

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: number): Promise<{message: string }> {
        return await this._service.delete(id);
    }
}