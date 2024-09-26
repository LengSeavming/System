// =========================================================================>> Core Library
import { Module } from '@nestjs/common';

// =========================================================================>> Custom Library
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';

@Module({
    imports: [
        AuthModule,
        ProfileModule
    ]
})
export class AccountModule { }