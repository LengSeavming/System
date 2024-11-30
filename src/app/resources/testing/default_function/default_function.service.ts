// =========================================================================>> Core Library
import { Injectable } from '@nestjs/common';


// ======================================= >> Code Starts Here << ========================== //
@Injectable()
export class DefaultFunctionService {

    constructor() { };

    async sum1(): Promise<{ result: number }> {

        let a = 6;
        let b = 8;

        const c = a + b;

        //const d = Math.sqrt(c); 

        return { result: c };
    }

    async sum2( a: number = 0, b: number = 0 ): Promise<{ result: number }> {

        const c = a + b;

        return { result: c };
    }

}
