// ===========================================================================>> Core Library
import { Body, Controller, HttpCode, HttpStatus, Post, Req, UsePipes } from '@nestjs/common';

// ===========================================================================>> Costom Library
import UserDecorator from '@app/core/decorators/user.decorator';
import { RoleExistsPipe } from '@app/core/pipes/role.pipe';
import User from '@models/user/users.model';
import { LoginRequestDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() data: LoginRequestDto, @Req() req: Request) {
        return await this.authService.login(data, req);
    }

    @Post('switch')
    @UsePipes(RoleExistsPipe)
    async switch(@UserDecorator() auth: User, @Body() body: { role_id: number }) {
        return await this.authService.switchDefaultRole(auth, Number(body.role_id));
    }
}
