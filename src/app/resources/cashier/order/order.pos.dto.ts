// =========================================================================>> Custom Library
import { IsJSON, IsNotEmpty } from 'class-validator'

// ======================================= >> Code Starts Here << ========================== //
export class CreateOrderDto {
    @IsNotEmpty()
    @IsJSON()
    cart: string
}