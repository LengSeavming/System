import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller()
export class DashboardController {

    constructor(
        private readonly _service: DashboardService
    ) { }

    @Get()
    async getDate() {
        return await this._service.Hello()
    }

}
