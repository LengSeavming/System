// ===========================================================================>> Custom Library
import { Controller, Get, Query } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { DashboardService } from './dashboard.service';

@Controller()
export class DashboardController {

    constructor(
        private readonly _service: DashboardService
    ) { }

    @Get()
    async getStaticData(
        @Query('today') today?: string,
        @Query('yesterday') yesterday?: string,
        @Query('thisWeek') thisWeek?: string,
        @Query('thisMonth') thisMonth?: string,
    ) {
        return await this._service.findStaticData({ today, yesterday, thisWeek, thisMonth });
    }
    @Get('/cashier')
    async getCashierAndTotalSale(
        @Query('today') today?: string,
        @Query('yesterday') yesterday?: string,
        @Query('thisWeek') thisWeek?: string,
        @Query('thisMonth') thisMonth?: string,
    ) {
        return await this._service.findCashierAndTotalSale({ today, yesterday, thisWeek, thisMonth });
    }

    @Get('/product-type')
    async getProductTypeWithProductHaveUsed(
        @Query('year') year?: number,
        @Query('week') week?: number,
    ) {
        return await this._service.findProductTypeWithProductHaveUsed({ year, week });
    }
    @Get('/data-sale')
    async getDataSaleDayOfWeek(
        @Query('year') year?: number,
        @Query('week') week?: number,
    ) {
        return await this._service.findDataSaleDayOfWeek({ year, week });
    }

}
