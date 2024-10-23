// ================================================================>> Core Library
import { BadRequestException, Injectable, RequestTimeoutException } from '@nestjs/common';
// ================================================================>> Custom Library
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
        private readonly jsReportService: JsReportService,
        private readonly telegramService: TelegramService
    ) { }

    // =============================>> Public Methods

    async generateSaleReportBaseOnStartDateAndEndDate(
        startDate: string,
        endDate: string,
        userId: number
    ) {
        const { start, end } = this.getStartAndEndDateInCambodia(
            startDate || this.getCurrentDate(),
            endDate || this.getCurrentDate()
        );
        const user = await this.fetchUser(userId);
        const orders = await this.fetchOrders(start, end);

        const sumTotalPrice = this.calculateTotal(orders, 'total_price');
        const formattedOrders = this.formatOrderData(orders);

        const reportData = this.buildReportData(user, sumTotalPrice, formattedOrders, start, end);

        return this.generateAndSendReport(reportData, process.env.JS_TEMPLATE_POS, 'Sale Report', 'របាយការណ៍លក់រាយ');
    }

    async generateCashierReportBaseOnStartDateAndEndDate(
        startDate: string,
        endDate: string,
        userId: number
    ) {
        const { start, end } = this.getStartAndEndDateInCambodia(
            startDate || this.getCurrentDate(),
            endDate || this.getCurrentDate()
        );
        const user = await this.fetchUser(userId);
        const cashiers = await this.fetchCashierSales(start, end);

        const totalOrders = this.calculateTotal(cashiers, 'totalOrders');
        const totalSales = this.calculateTotal(cashiers, 'totalSales');

        const reportData = this.buildReportData(user, totalSales, cashiers, start, end, totalOrders);

        return this.generateAndSendReport(reportData, process.env.JS_TEMPLATE_CASHIER, 'Cashier Sales Report', 'របាយការណ៍លក់តាមអ្នកគិតប្រាក់');
    }

    async generateProductReportBaseOnStartDateAndEndDate(
        startDate: string,
        endDate: string,
        userId: number
    ) {
        const { start, end } = this.getStartAndEndDateInCambodia(
            startDate || this.getCurrentDate(),
            endDate || this.getCurrentDate()
        );
        const user = await this.fetchUser(userId);
        const products = await this.fetchProducts(start, end);

        const productData = this.processProductData(products);
        const totalSales = this.calculateTotal(productData, 'total_sales');
        const totalQty = this.calculateTotal(productData, 'total_qty');

        const reportData = this.buildReportData(user, totalSales, productData, start, end, totalQty);

        return this.generateAndSendReport(reportData, process.env.JS_TEMPLATE_PRODUCT, 'Product Sales Report', 'របាយការណ៍លក់តាមផលិតផល');
    }

    // =============================>> Private Helper Methods

    private async fetchUser(userId: number) {
        const user = await User.findByPk(userId);
        if (!user) throw new BadRequestException('User not found.');
        return user;
    }

    private async fetchOrders(startDate: Date, endDate: Date) {
        return Order.findAll({
            where: { ordered_at: { [Op.between]: [startDate, endDate] } },
            attributes: ['id', 'receipt_number', 'total_price', 'ordered_at'],
            include: [
                { model: OrderDetails, attributes: ['id', 'unit_price', 'qty'] },
                { model: User, attributes: ['id', 'avatar', 'name'] },
            ],
            order: [['id', 'ASC']],
        });
    }

    private async fetchCashierSales(startDate: Date, endDate: Date) {
        return User.findAll({
            attributes: [
                'id', 'name', 'phone',
                [fn('COUNT', col('orders.id')), 'totalOrders'],
                [fn('SUM', col('orders.total_price')), 'totalSales'],
            ],
            include: [
                { model: Order, as: 'orders', attributes: [], where: { ordered_at: { [Op.between]: [startDate, endDate] } } }
            ],
            group: ['User.id'],
            raw: true,
        });
    }

    private async fetchProducts(startDate: Date, endDate: Date) {
        return Product.findAll({
            attributes: ['id', 'name', 'unit_price'],
            include: [
                { model: ProductsType, as: 'type', attributes: ['id', 'name'] },
                {
                    model: OrderDetails, as: 'pod',
                    where: { created_at: { [Op.between]: [startDate, endDate] } },
                    attributes: ['id', 'product_id', 'qty', 'unit_price', 'created_at']
                }
            ],
        });
    }

    private processProductData(products: Product[]): ProductReport[] {
        return products.map(product => {
            const totalQty = product.pod.reduce((sum, detail) => sum + detail.qty, 0);
            const totalSales = totalQty * product.unit_price;

            return {
                id: product.id,
                name: product.name,
                unit_price: product.unit_price,
                type: product.type,
                total_qty: totalQty,
                total_sales: totalSales
            };
        });
    }

    private calculateTotal(items: any[], field: string): number {
        return items.reduce((sum, item) => sum + Number(item[field] || 0), 0);
    }

    private formatOrderData(orders: Order[]) {
        return orders.map(order => ({
            id: order.id,
            receipt_number: order.receipt_number,
            total_price: order.total_price,
            ordered_at: order.ordered_at,
            cashier: order.cashier ? {
                id: order.cashier.id,
                avatar: order.cashier.avatar,
                name: order.cashier.name
            } : null,
        }));
    }

    private buildReportData(user: User, totalSales: number, data: any[], startDate: Date, endDate: Date, totalQty = 0) {
        const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh', hour12: true });

        return {
            currentDate: now.split(',')[0],
            currentTime: now.split(',')[1].trim(),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            name: user.name,
            SumTotalPrice: totalSales,
            SumTotalSale: totalQty,
            data
        };
    }

    private getCurrentDate(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Returns 'YYYY-MM-DD'
    }

    // Helper to calculate start and end dates for Cambodia timezone (UTC+7)
    private getStartAndEndDateInCambodia(startDate: string, endDate: string) {
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);

        // Adjust for UTC+7 (Cambodia time)
        start.setHours(start.getHours() - start.getTimezoneOffset() / 60 + 7);
        end.setHours(end.getHours() - end.getTimezoneOffset() / 60 + 7);

        return { start, end };
    }



    private async generateAndSendReport(
        reportData: any,
        template: string,
        fileName: string,
        content: string,
        timeout: number = 30 * 1000
    ) {
        try {
            const result = await this.withTimeout(this.jsReportService.generateReport(template, reportData), timeout);
            if (result.error) throw new BadRequestException('Report generation failed.');

            return result;
        } catch (error) {
            if (error instanceof RequestTimeoutException) {
                throw new RequestTimeoutException('Request Timeout: Report generation took too long.');
            }
            throw new BadRequestException(error.message || 'Failed to generate and send the report.');
        }
    }

    private withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new RequestTimeoutException('Request Timeout: Operation took too long.')), timeout);
            promise.then(resolve).catch(reject).finally(() => clearTimeout(timer));
        });
    }
}
