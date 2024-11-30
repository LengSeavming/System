// =========================================================================>> Core Library
import { Body, Controller, Get, Query } from '@nestjs/common';

// =========================================================================>> Custom Library
import { DefaultFunctionService } from './default_function.service';

// ======================================= >> Code Starts Here << ========================== //
@Controller()
export class DefaultFunctionController {

    constructor(private readonly _service: DefaultFunctionService) { };

    // ====================================================>> Sum 1
    @Get('sum-1')
    async sum1(): Promise<{ result: number  }> {

        return await this._service.sum1();

    }

    // ====================================================>> Sum 2
    @Get('sum-2')
    async sum2(

        @Query('a') a?: number,
        @Query('b') b?: number
    
    ): Promise<{ result: number  }> {

        return await this._service.sum2(a, b);

    }


    
}
