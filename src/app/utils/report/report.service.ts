// ================================================================>> Core Library
import { Injectable } from '@nestjs/common';
// ================================================================>> Costom Library
import { JsReportService } from '@app/services/js-report.service';
import OrderDetails from '@models/order/detail.model';
import Order from '@models/order/order.model';
import User from '@models/user/users.model';
import { Op } from 'sequelize';

@Injectable()
export class ReportService {
    constructor(private jsReportService: JsReportService) { }

    async generateSaleReportBaseOnStartDateAndEndDate(startDate: string, endDate: string) {
        // Retrieving orders within the specified date range
        const orders = await Order.findAll({
            where: {
                ordered_at: {
                    [Op.between]: [startDate, endDate],
                },
            },
            attributes: ['id', 'receipt_number', 'total_price', 'ordered_at'],
            include: [
                {
                    model: OrderDetails,
                    attributes: ['id', 'unit_price', 'qty'],
                },
                {
                    model: User,
                    attributes: ['id', 'avatar', 'name'],
                },
            ],
            order: [['id', 'DESC']],
        });

        // Handling case when no orders are found
        if (!orders || orders.length === 0) {
            return orders;
        }

        // Calculating the total price of all orders
        let total = 0;
        orders.forEach((row) => {
            total += row.total_price;
        });

        // Structuring the data for the report
        const data = orders.map(order => order.toJSON()); // Convert Sequelize instances to plain objects

        return { data: data };
        // Get the report template
        //const template = process.env.JS_TEMPLATE;

        // try {
        //     // Generating the report using the JsReportService
        //    // const result = await this.jsReportService.generateReport(template, data);
        //     if (result.error) {
        //         throw new BadRequestException(result.error);
        //     }

        //     // Returning the generated report
        //     return result;
        // } catch (error) {
        //     // Log the error or handle it in a more appropriate way
        //     throw new BadRequestException(error?.message || 'Failed to generate the report');
        // }
    }

    async generateCashierReportBaseOnStartDateAndEndDate(startDate: string, endDate: string) {
        // Retrieving orders within the specified date range
        const orders = await Order.findAll({
            where: {
                ordered_at: {
                    [Op.between]: [startDate, endDate],
                },
            },
            attributes: ['id', 'receipt_number', 'total_price', 'ordered_at'],
            include: [
                {
                    model: OrderDetails,
                    attributes: ['id', 'unit_price', 'qty'],
                },
                {
                    model: User,
                    attributes: ['id', 'avatar', 'name'],
                },
            ],
            order: [['id', 'DESC']],
        });

        // Handling case when no orders are found
        if (!orders || orders.length === 0) {
            return orders;
        }

        // Calculating the total price of all orders
        let total = 0;
        orders.forEach((row) => {
            total += row.total_price;
        });

        // Structuring the data for the report
        const data = orders.map(order => order.toJSON()); // Convert Sequelize instances to plain objects



        return { data: data };
        // Get the report template
        //const template = process.env.JS_TEMPLATE;

        // try {
        //     // Generating the report using the JsReportService
        //    // const result = await this.jsReportService.generateReport(template, data);
        //     if (result.error) {
        //         throw new BadRequestException(result.error);
        //     }

        //     // Returning the generated report
        //     return result;
        // } catch (error) {
        //     // Log the error or handle it in a more appropriate way
        //     throw new BadRequestException(error?.message || 'Failed to generate the report');
        // }
    }
}
