// ================================================================>> Core Library
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UsePipes } from '@nestjs/common';

// ================================================================>> Costom Library
import { ProductsTypeExistsPipe } from '@app/core/pipes/product.pipe';
import Product from 'src/models/product/product.model';
import ProductsType from 'src/models/product/type.model';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { ProductService } from './product.service';
@Controller()
export class ProductController {

    constructor(private _service: ProductService) { };

    @Get('setup')
    async setup(): Promise<{ data: ProductsType[] }> {
        return await this._service.setup();
    }

    @Get()
    async listing(
        @Query('page_size') page_size?: number,
        @Query('page') page?: number,
        @Query('key') key?: string,
        @Query('type_id') type_id?: number,
    ) {
        if (!page_size) {
            page_size = 10;
        }
        if (!page) {
            page = 1;
        }

        return await this._service.listing(page_size, page, key, type_id);
    }

    @Post()
    @UsePipes(ProductsTypeExistsPipe)
    async create(@Body() body: CreateProductDto): Promise<{ data: Product, message: string }> {
        return await this._service.create(body);
    }

    @Put(':id')
    @UsePipes(ProductsTypeExistsPipe)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateProductDto
    ) {
        return this._service.update(body, id);
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<{ message: string }> {
        return await this._service.delete(id);
    }
}
