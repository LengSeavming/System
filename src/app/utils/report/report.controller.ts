// ===========================================================================>> Core Library
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';

// ===========================================================================>> Costom Library

@Controller()
export class ReportController {

    constructor(private readonly _service: ReportService) { };
    
    @Get('sale')
    async generateSaleReportInDay(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {

        if (!startDate || !endDate) {
            throw new BadRequestException('Both startDate and endDate are required');
        }
        return this._service.generateSaleReportBaseOnStartDateAndEndDate(startDate, endDate);
    }

    @Get('cashier')
    async generateCashierReportInDay(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {

        if (!startDate || !endDate) {
            throw new BadRequestException('Both startDate and endDate are required');
        }
        return this._service.generateCashierReportBaseOnStartDateAndEndDate(startDate, endDate);
    }
    @Get('product')
    async generateProductReportInDay(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {

        if (!startDate || !endDate) {
            throw new BadRequestException('Both startDate and endDate are required');
        }
        return this._service.generateCashierReportBaseOnStartDateAndEndDate(startDate, endDate);
    }
}
