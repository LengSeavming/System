import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller()
export class DashboardController {

    constructor(
        private readonly _service: DashboardService
    ) { }

    @Get()
    async getStaticDataDucument(
        @Query('today') today?: string,
        @Query('yesterday') yesterday?: string,
        @Query('thisWeek') thisWeek?: string,
        @Query('thisMonth') thisMonth?: string,
    ) {
        return await this._service.findStaticData({ today, yesterday, thisWeek, thisMonth });
    }

    @Get('/cashier')
    async getAllWithRoleCashierAndAddTotalSale(
        @Query('today') today?: string,
        @Query('yesterday') yesterday?: string,
        @Query('thisWeek') thisWeek?: string,
        @Query('thisMonth') thisMonth?: string,
    ) {
        return await this._service.findAllWithRoleCashierAndAddTotalSale({ today, yesterday, thisWeek, thisMonth });
    }

}
