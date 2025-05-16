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
import { CreatePetTypeDto, UpdatePetTypeDto } from "./type.dto";
import { PetTypeService } from "./type.service";
import PetType from "@models/pet/pet.type.model";

@Controller()
export class PetTypeController {
  constructor(private _service: PetTypeService) {}

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
    @Body() body: CreatePetTypeDto
  ): Promise<{ data: PetType; message: string }> {
    return await this._service.create(body);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdatePetTypeDto
  ): Promise<any> {
    return this._service.update(body, id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async delete(@Param("id") id: number): Promise<{ message: string }> {
    return await this._service.delete(id);
  }
}
