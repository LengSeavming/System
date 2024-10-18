
// ================================================================>> Core Library
import { BadRequestException, Injectable } from '@nestjs/common';
// ================================================================>> Costom Library
import { JsReportService } from '@app/services/js-report.service';
import { TelegramService } from '@app/services/telegram.service';
import OrderDetails from '@models/order/detail.model';
import Order from '@models/order/order.model';
import Product from '@models/product/product.model';
import ProductsType from '@models/product/type.model';
import User from '@models/user/users.model';
import { col, fn, Op } from 'sequelize';
import { ProductReport } from './interface';
@Injectable()
export class ReportService {

    constructor(
        private jsReportService: JsReportService,
        private telegramService: TelegramService) { }

    async generateSaleReportBaseOnStartDateAndEndDate(startDate: string, endDate: string, userId: number) {
        // Retrieving orders within the specified date range
        const user = await User.findByPk(userId)
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
            order: [['id', 'ASC']],
        });

        // Handling case when no orders are found
        if (!orders || orders.length === 0) {
            return { data: [], SumTotalPrice: 0 };
        }

        // Calculating the total price of all orders
        const sumTotalPrice = orders.reduce((total, row) => total + row.total_price, 0);

        // Structuring the data for the report
        const data = orders.map(order => ({
            id: order.id,
            receipt_number: order.receipt_number,
            total_price: order.total_price,
            ordered_at: order.ordered_at,
            cashier: {
                id: order.cashier?.id,
                avatar: order.cashier?.avatar,
                name: order.cashier?.name,
            },
        }));

        // Define options for consistent formatting
        const options: Intl.DateTimeFormatOptions = {
            hour12: true, // Enable 12-hour format with AM/PM
            timeZone: 'Asia/Phnom_Penh', // Cambodia's timezone (UTC+7)
        };

        // Get the current date and time
        const now = new Date();

        // Extract individual parts with proper formatting
        const year = now.toLocaleString('en-US', { ...options, year: 'numeric' });
        const month = now.toLocaleString('en-US', { ...options, month: '2-digit' });
        const day = now.toLocaleString('en-US', { ...options, day: '2-digit' });

        // Use 'numeric' to get the hour without AM/PM attached
        const hour = now.toLocaleString('en-US', { ...options, hour: 'numeric' }).split(' ')[0];
        const minute = now.toLocaleString('en-US', { ...options, minute: '2-digit' }).padStart(2, '0');
        const second = now.toLocaleString('en-US', { ...options, second: '2-digit' });
        const amPm = now.toLocaleString('en-US', { ...options, hour: 'numeric' }).split(' ')[1];
        const reportData = {
            currentDate: `${year}-${month}-${day}`,
            currentTime: `${hour.padStart(2, '0')}:${minute} ${amPm}`,
            startDate,
            endDate,
            name: user?.name || 'Unknown',
            SumTotalPrice: sumTotalPrice,
            data: data
        };
        const template = process.env.JS_TEMPLATE_POS;
        try {
            // Generate the report using the JsReportService
            const result = await this.jsReportService.generateReport(template, reportData);

            if (result.error) {
                throw new BadRequestException(result.error);
            }
            const reportBuffer = Buffer.from(result.data, 'base64');
            const fileName = 'Sale Report'; // Name of the PDF report
            const content = "របាយការណ៍លក់រាយ"
            // Send the report as a document via Telegram bot
            await this.telegramService.sendDocument(
                reportBuffer,
                fileName,
                content
            );

            // Return the generated report result
            return result;
        } catch (error) {
            // Log or handle the error appropriately
            throw new BadRequestException(error?.message || 'Failed to generate and send the report');
        }

    }

    async generateCashierReportBaseOnStartDateAndEndDate(
        startDate: string,
        endDate: string,
        userId: number
    ): Promise<any> {
        try {
            // Fetch the user generating the report
            const user = await this.fetchUser(userId);

            // Fetch cashier sales data
            const cashiers = await this.fetchCashierSales(startDate, endDate);

            // Prepare the report data
            const reportData = this.prepareReportDataCashier(user, cashiers, startDate, endDate);

            // Generate and send the report
            const result = await this.generateAndSendReport(reportData);

            return result;
        } catch (error) {
            console.error('Error generating cashier report:', error);
            throw new BadRequestException(error.message || 'Failed to generate cashier report.');
        }
    }

    private async fetchUser(userId: number) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new BadRequestException('User not found.');
        }
        return user;
    }

    private async fetchCashierSales(startDate: string, endDate: string) {
        return User.findAll({
            attributes: [
                'id',
                'name',
                'phone',
                [fn('COUNT', col('orders.id')), 'totalOrders'],
                [fn('SUM', col('orders.total_price')), 'totalSales'],
            ],
            include: [
                {
                    model: Order,
                    as: 'orders',
                    attributes: [],
                    where: {
                        ordered_at: { [Op.between]: [startDate, endDate] },
                    },
                },
            ],
            group: ['User.id'],
            raw: true,
        });
    }

    private prepareReportDataCashier(user: User, cashiers: any[], startDate: string, endDate: string) {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            hour12: true,
            timeZone: 'Asia/Phnom_Penh',
        };

        const [year, month, day, hour, minute, amPm] = [
            now.toLocaleString('en-US', { ...options, year: 'numeric' }),
            now.toLocaleString('en-US', { ...options, month: '2-digit' }),
            now.toLocaleString('en-US', { ...options, day: '2-digit' }),
            now.toLocaleString('en-US', { ...options, hour: 'numeric' }).split(' ')[0],
            now.toLocaleString('en-US', { ...options, minute: '2-digit' }).padStart(2, '0'),
            now.toLocaleString('en-US', { ...options, hour: 'numeric' }).split(' ')[1],
        ];
        const sumTotalOrders = cashiers.reduce((total, row) => total + Number(row.totalOrders), 0);
        const sumTotalSales = cashiers.reduce((total, row) => total + row.totalSales, 0);
        return {
            currentDate: `${year}-${month}-${day}`,
            currentTime: `${hour.padStart(2, '0')}:${minute} ${amPm}`,
            startDate,
            endDate,
            SumTotalPrice: sumTotalSales,
            SumTotalSale: sumTotalOrders,
            name: user.name,
            data: cashiers,
        };
    }

    private async generateAndSendReport(reportData: any) {
        const template = process.env.JS_TEMPLATE_CASHIER;

        try {
            const result = await this.jsReportService.generateReport(template, reportData);

            if (result.error) {
                throw new BadRequestException(result.error);
            }

            const reportBuffer = Buffer.from(result.data, 'base64');
            const fileName = 'Cashier Sales Report';
            const content = 'របាយការណ៍លក់តាមអ្នក គិតប្រាក់';

            await this.telegramService.sendDocument(reportBuffer, fileName, content);

            return result;
        } catch (error) {
            console.error('Error generating or sending report:', error);
            throw new BadRequestException('Failed to generate and send the report.');
        }
    }

    async generateProductReportBaseOnStartDateAndEndDate(
        startDate: string,
        endDate: string,
        userId: number,
    ): Promise<any> {
        try {
            const user = await User.findByPk(userId);
            const products = await this.fetchProducts(startDate, endDate);

            const data: ProductReport[] = this.processProductData(products);

            const reportData = this.prepareReportData(data, user, startDate, endDate);

            const result = await this.generateReportWithTimeoutHandling(
                reportData,
                process.env.JS_TEMPLATE_PRODUCT,
                5 * 60 * 1000 // Set timeout to 5 minutes
            );

            await this.sendReportToTelegram(result);

            return result;
        } catch (error) {
            console.error('Error generating product report:', error);
            throw new Error('Internal server error');
        }
    }

    private async fetchProducts(startDate: string, endDate: string) {
        return Product.findAll({
            attributes: ['id', 'name', 'unit_price'],
            include: [
                {
                    model: ProductsType,
                    as: 'type',
                    attributes: ['id', 'name'],
                },
                {
                    model: OrderDetails,
                    as: 'pod',
                    where: { created_at: { [Op.between]: [startDate, endDate] } },
                    attributes: ['id', 'product_id', 'qty', 'unit_price', 'created_at'],
                },
            ],
        });
    }

    private processProductData(products: Product[]): ProductReport[] {
        return products.map((product) => {
            const pod = product.pod as OrderDetails[];
            const total_qty = pod.reduce((sum, detail) => sum + detail.qty, 0);
            const total_sales = total_qty * product.unit_price;

            return {
                id: product.id,
                name: product.name,
                unit_price: product.unit_price,
                type: product.type,
                total_qty,
                total_sales,
            };
        });
    }

    private prepareReportData(
        data: ProductReport[],
        user: User | null,
        startDate: string,
        endDate: string,
    ) {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            hour12: true,
            timeZone: 'Asia/Phnom_Penh',
        };

        const [year, month, day, hour, minute, amPm] = [
            now.toLocaleString('en-US', { ...options, year: 'numeric' }),
            now.toLocaleString('en-US', { ...options, month: '2-digit' }),
            now.toLocaleString('en-US', { ...options, day: '2-digit' }),
            now.toLocaleString('en-US', { ...options, hour: 'numeric' }).split(' ')[0],
            now.toLocaleString('en-US', { ...options, minute: '2-digit' }).padStart(2, '0'),
            now.toLocaleString('en-US', { ...options, hour: 'numeric' }).split(' ')[1],
        ];

        const sumTotalPrice = data.reduce((total, row) => total + row.total_sales, 0);
        const sumTotalSale = data.reduce((total, row) => total + row.total_qty, 0);

        return {
            currentDate: `${year}-${month}-${day}`,
            currentTime: `${hour.padStart(2, '0')}:${minute} ${amPm}`,
            startDate,
            endDate,
            name: user?.name || 'Unknown',
            SumTotalPrice: sumTotalPrice,
            SumTotalSale: sumTotalSale,
            data,
        };
    }

    private async generateReportWithTimeoutHandling(
        reportData: any,
        template: string,
        timeout: number,
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Report generation timed out. Please try again later.'));
            }, timeout);

            try {
                const result = await this.jsReportService.generateReport(template, reportData);
                clearTimeout(timer); // Clear the timeout if the report is generated successfully
                if (result.error) throw new BadRequestException(result.error);
                resolve(result);
            } catch (error) {
                clearTimeout(timer);
                reject(error);
            }
        });
    }

    private async sendReportToTelegram(result: any) {
        const reportBuffer = Buffer.from(result.data, 'base64');
        const fileName = 'Product Sales Report';
        const content = 'របាយការណ៍លក់តាមផលិតផល';

        await this.telegramService.sendDocument(reportBuffer, fileName, content);
    }

}
