// ================================================================>> Core Library
import UserDecorator from '@app/core/decorators/user.decorator';
import User from '@models/user/users.model';
import { Body, Controller, Put } from '@nestjs/common';
import { UpdatePasswordDto, UpdateUserDto } from './profile.dto';
import { ProfileService } from './profile.service';


@Controller()
export class ProfileController {

    constructor(private profileService: ProfileService) { }


    @Put('/update')
    async updateProfile(@UserDecorator() auth: User, @Body() body: UpdateUserDto) {
        return await this.profileService.update(auth.id, body)
    }

    @Put('/update-password')
    async updatePassword(@UserDecorator() auth: User, @Body() body: UpdatePasswordDto): Promise<{ message: string }> {
        return await this.profileService.updatePassword(auth.id, body);
    }
}

