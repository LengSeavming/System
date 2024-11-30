// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';

// ===========================================================================>> Custom Library
import { BasicModule } from './basic/basic.module';

export const testingRoutes: Routes = [
    {
        path: '/basic',
        module: BasicModule
    }
];