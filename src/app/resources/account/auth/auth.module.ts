// ================================================================>> Core Library
import { Module }           from '@nestjs/common';

// ================================================================>> Costom Library
import { AuthService }      from './auth.service';
import { AuthController }   from './auth.controller';

@Module({
    controllers: [AuthController],
    providers: [AuthService]
})

export class AuthModule { }
