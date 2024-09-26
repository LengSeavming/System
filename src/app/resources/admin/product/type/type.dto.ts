// ===========================================================================>> Custom Library
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateProductTypeDto {
    @IsString()
    @IsNotEmpty()
    name: string
}

export class UpdateProductTypeDto {
    @IsString()
    @IsNotEmpty()
    name: string
}