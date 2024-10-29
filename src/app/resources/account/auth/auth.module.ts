// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ===========================================================================>> Costom Library
import { EmailService } from '@app/services/email.service';
import { TwilioService } from '@app/services/twilio.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    controllers: [AuthController],
    providers: [AuthService, EmailService, TwilioService]
})

export class AuthModule { }
