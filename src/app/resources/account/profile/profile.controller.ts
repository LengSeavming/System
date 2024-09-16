// ================================================================>> Core Library
import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';


@Controller()
export class ProfileController {

    constructor(private profileService: ProfileService) { }

    @Get()
    public testRawQuery() {
        return this.profileService.testRawQuery();
    }

}

