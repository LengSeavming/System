// ===========================================================================>> Core Library
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";

// ===========================================================================>> Custom Library

import { CreateBookTypeDto } from "./boo_type.dto";
import { BookTypeService } from "./book_type.service";
import BookType from "@models/book/book_type.model";

@Controller()
export class BookTypeController {
  constructor(private _service: BookTypeService) {}

  @Get("data")
  async getData(): Promise<{
    data: {
      id: number;
      name: string;
      created_at: Date;
      n_of_products: number;
    }[];
  }> {
    return await this._service.getData();
  }

  @Post()
  async create(
    @Body() body: CreateBookTypeDto
  ): Promise<{ data: BookType; message: string }> {
    return await this._service.create(body);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: CreateBookTypeDto
  ): Promise<any> {
    return this._service.update(body, id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async delete(@Param("id") id: number): Promise<{ message: string }> {
    return await this._service.delete(id);
  }
}
