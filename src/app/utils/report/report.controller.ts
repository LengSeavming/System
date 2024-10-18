// ===========================================================================>> Core Library
import UserDecorator from '@app/core/decorators/user.decorator';
import User from '@models/user/users.model';
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';

// ===========================================================================>> Costom Library

@Controller()
export class ReportController {

    constructor(private readonly _service: ReportService) { };

    @Get('sale')
    async generateSaleReportInDay(
        @UserDecorator() auth: User,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string) {

        if (!startDate || !endDate) {
            throw new BadRequestException('Both startDate and endDate are required');
        }
        return this._service.generateSaleReportBaseOnStartDateAndEndDate(startDate, endDate, auth.id);
    }

    @Get('cashier')
    async generateCashierReportInDay(
        @UserDecorator() auth: User,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string) {

        if (!startDate || !endDate) {
            throw new BadRequestException('Both startDate and endDate are required');
        }
        return this._service.generateCashierReportBaseOnStartDateAndEndDate(startDate, endDate, auth.id);
    }

    @Get('product')
    async generateProductReportInDay(
        @UserDecorator() auth: User,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string) {

        if (!startDate || !endDate) {
            throw new BadRequestException('Both startDate and endDate are required');
        }
        return this._service.generateProductReportBaseOnStartDateAndEndDate(startDate, endDate, auth.id);
    }
}
