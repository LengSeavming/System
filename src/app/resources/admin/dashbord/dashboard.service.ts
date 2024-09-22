import { RoleEnum } from '@app/enums/role.enum';
import Order from '@models/order/order.model';
import Product from '@models/product/product.model';
import ProductsType from '@models/product/type.model';
import Role from '@models/user/role.model';
import UserRoles from '@models/user/user_roles.model';
import User from '@models/user/users.model';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Op, Sequelize } from 'sequelize';

@Injectable()
export class DashboardService {

    async findStaticData(filters: { today?: string; yesterday?: string; thisWeek?: string; thisMonth?: string }) {
        try {
            const dateFilter = this.getDateFilter(filters);

            // Build the document filter, including the date filter only if it's not empty
            const dataFilter: any = {
                ...dateFilter
            };

            const totalProduct = await this.countProduct(dataFilter);
            const totalProductType = await this.countProductType(dataFilter);
            const totalUser = await this.countUser(dataFilter);
            const totalOrder = await this.countOrder(dataFilter);

            return {
                statatics: {
                    totalProduct,
                    totalProductType,
                    totalUser,
                    totalOrder
                },
                message: "ទទួលបានទិន្នន័យអង្គភាពដោយជោគជ័យ",
            };
        } catch (err) {
            console.error("Error fetching static data:", err.message);
            throw new BadRequestException(err.message);
        }
    }

    async findCashierAndTotalSale(filters: { year?: number; week?: number }) {
        try {
            // Calculate the current week and year if no filter is provided
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentWeek = this.getWeekNumber(currentDate); // Helper method to get the week number

            // Set year and week based on filters, defaulting to current year/week if not provided
            const year = filters.year || currentYear;
            const week = filters.week || currentWeek;

            let startDate, endDate;
            let dateCondition = '';

            // If year and week are provided, calculate the start and end dates for the specified week
            if (filters.year && filters.week) {
                startDate = this.getStartDateOfISOWeek(week, year); // Helper method for start of week
                endDate = this.getEndDateOfISOWeek(week, year); // Helper method for end of week
                dateCondition = `AND o.ordered_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`;
            }

            const cashiers = await User.findAll({
                attributes: [
                    'id',
                    'name',
                    'avatar',
                    // Total sales amount calculation (with or without date filtering)
                    [Sequelize.literal(`(
                        SELECT COALESCE(SUM(o.total_price), 0)
                        FROM "order" AS o
                        WHERE o.cashier_id = "User".id
                        ${dateCondition}
                    )`), 'totalAmount'],

                    // Percentage change calculation between current and previous weeks
                    [Sequelize.literal(`(
                        SELECT CASE
                            WHEN COALESCE(lastWeekSales.total, 0) = 0 AND COALESCE(thisWeekSales.total, 0) > 0 THEN 100
                            WHEN COALESCE(thisWeekSales.total, 0) = 0 THEN 0
                            ELSE ((COALESCE(thisWeekSales.total, 0) - COALESCE(lastWeekSales.total, 0)) / GREATEST(lastWeekSales.total, 1)) * 100
                        END AS percentageChange
                        FROM (
                            -- This week's total sales (conditionally apply date filter)
                            SELECT SUM(o.total_price) AS total
                            FROM "order" AS o
                            WHERE o.cashier_id = "User".id
                            ${dateCondition}
                        ) AS thisWeekSales,
                        (
                            -- Last week's total sales for comparison
                            SELECT SUM(o.total_price) AS total
                            FROM "order" AS o
                            WHERE o.cashier_id = "User".id
                            AND o.ordered_at BETWEEN '${this.getStartDateOfISOWeek(week - 1, year).toISOString()}' AND '${this.getEndDateOfISOWeek(week - 1, year).toISOString()}'
                        ) AS lastWeekSales
                    )`), 'percentageChange'],
                ],
                include: [
                    {
                        model: UserRoles,
                        where: { role_id: RoleEnum.CASHIER },
                        attributes: ['id', 'role_id'],
                        include: [
                            {
                                model: Role,
                                attributes: ['id', 'name'],
                            },
                        ],
                    },
                ],
                // Order by total sales in descending order
                order: [
                    [Sequelize.literal('"totalAmount"'), 'DESC'],
                ],
            });

            if (cashiers.length === 0) {
                console.log("No cashier data found for the specified week.");
            }

            return {
                data: cashiers,
            };
        } catch (err) {
            console.error("Error fetching cashier data:", err.message);
            throw new BadRequestException(err.message);
        }
    }


    async findProductTypeWithProductHaveUsed(filters: { year?: number; week?: number }) {
        try {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentWeek = this.getWeekNumber(currentDate);

            // Use the provided year and week or default to the current ones
            const year = filters.year || currentYear;
            const week = filters.week || currentWeek;

            let dateCondition = '';

            // If filters are provided, create the date condition for filtering
            if (filters.year && filters.week) {
                const startDate = this.getStartDateOfISOWeek(week, year);
                const endDate = this.getEndDateOfISOWeek(week, year);

                dateCondition = `AND p.created_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`;
            }

            const productTypesWithProductCounts = await ProductsType.findAll({
                attributes: [
                    'id',
                    'name',
                    [Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM product AS p
                        WHERE p.type_id = "ProductsType".id
                        ${dateCondition}  -- Apply the date condition if filters are present
                    )`), 'productCount'],
                ],
                include: [
                    {
                        model: Product,
                        attributes: [],  // No need to retrieve product attributes, just count them
                    },
                ],
                group: ['ProductsType.id'],
            });

            // Transform the data into the format expected by a donut chart: { labels: [], data: [] }
            const result = {
                labels: productTypesWithProductCounts.map(pt => pt.name),
                data: productTypesWithProductCounts.map(pt => pt.get('productCount')),
            };

            return result;

        } catch (err) {
            console.error("Error fetching product types and their counts:", err.message);
            throw new BadRequestException(err.message);
        }
    }
async findDataSaleDayOfWeek(filters: { year?: number; week?: number }) {
        try {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentWeek = this.getWeekNumber(currentDate);

            const year = filters.year || currentYear;
            const week = filters.week || currentWeek;

            const startDate = this.getStartDateOfISOWeek(week, year);
            const endDate = this.getEndDateOfISOWeek(week, year);

            // Fetch total sales grouped by day of the week for the specified week
            const salesData = await Order.findAll({
                attributes: [
                    [Sequelize.fn('DATE_TRUNC', 'day', Sequelize.col('ordered_at')), 'day'],
                    [Sequelize.fn('SUM', Sequelize.col('total_price')), 'total_sales'],
                ],
                where: {
                    ordered_at: {
                        [Op.between]: [startDate.toISOString(), endDate.toISOString()],
                    },
                },
                group: ['day'],
                order: [[Sequelize.literal('day'), 'ASC']],
            });

            // Initialize an array for Monday to Sunday, with default total_sales of 0
            const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const salesByDay = weekDays.map(day => ({ day, total_sales: 0 }));

            // Map sales data to the corresponding days of the week
            salesData.forEach(sale => {
                const saleDayValue = sale.get('day') as string;

                // Convert saleDayValue to Date
                const saleDay = new Date(saleDayValue);

                if (!isNaN(saleDay.getTime())) {
                    const saleDayOfWeek = saleDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                    const dayIndex = saleDayOfWeek === 0 ? 6 : saleDayOfWeek - 1; // Adjust index (Sunday -> 6, Monday -> 0)

                    // Update the corresponding day with the total sales
                    salesByDay[dayIndex].total_sales = parseFloat(sale.get('total_sales').toString());
                }
            });

            // Transform the data into a format suitable for a bar chart
            const result = {
                labels: weekDays,
                data: salesByDay.map(day => day.total_sales),
            };

            return result;

        } catch (err) {
            console.error("Error fetching sales data:", err.message);
            throw new BadRequestException(err.message);
        }
    }


    // Helper function to get the current week number
    private getWeekNumber(date: Date): number {
        const firstJan = new Date(date.getFullYear(), 0, 1);
        const daysPassed = Math.ceil((date.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((daysPassed + firstJan.getDay()) / 7);
        return weekNumber;
    }

    // Helper function to get the start date of the ISO week
    private getStartDateOfISOWeek(week: number, year: number): Date {
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dayOfWeek = simple.getDay();
        const ISOweekStart = simple;
        if (dayOfWeek <= 4) {
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        } else {
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        }
        return ISOweekStart;
    }

    // Helper function to get the end date of the ISO week
    private getEndDateOfISOWeek(week: number, year: number): Date {
        const startDate = this.getStartDateOfISOWeek(week, year);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Add 6 days to get the end of the week
        return endDate;
    }

    // Helper method to construct date filter
    private getDateFilter(filters: { today?: string, yesterday?: string, thisWeek?: string, thisMonth?: string }): any {
        const dateFilter: { [key: string]: any } = {};

        if (filters.today) {
            const today = this.parseDate(filters.today);
            if (today) {
                dateFilter['created_at'] = { [Op.gte]: this.startOfDay(today), [Op.lt]: this.endOfDay(today) };
            }
        } else if (filters.yesterday) {
            const yesterday = this.parseDate(filters.yesterday);
            if (yesterday) {
                dateFilter['created_at'] = {
                    [Op.gte]: this.startOfDay(yesterday),
                    [Op.lt]: this.startOfDay(new Date())
                };
            }
        } else if (filters.thisWeek) {
            const startOfWeek = this.startOfWeek(new Date());
            dateFilter['created_at'] = { [Op.gte]: startOfWeek, [Op.lt]: this.endOfDay(new Date()) };
        } else if (filters.thisMonth) {
            const startOfMonth = this.startOfMonth(new Date());
            dateFilter['created_at'] = { [Op.gte]: startOfMonth, [Op.lt]: this.endOfDay(new Date()) };
        }

        return dateFilter;
    }

    // Helper method to parse dates safely
    private parseDate(dateString: string): Date | null {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    }

    // Helper method to get start of the day
    private startOfDay(date: Date): Date {
        return new Date(date.setHours(0, 0, 0, 0));
    }

    // Helper method to get end of the day
    private endOfDay(date: Date): Date {
        return new Date(date.setHours(23, 59, 59, 999));
    }

    // Helper method to get start of the week
    private startOfWeek(date: Date): Date {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust if Sunday is the start of the week
        return this.startOfDay(new Date(date.setDate(diff)));
    }

    // Helper method to get start of the month
    private startOfMonth(date: Date): Date {
        return this.startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
    }

    // Count documents based on the filter
    private async countProduct(filter: any): Promise<number> {
        return Product.count({
            where: filter
        });
    }

    private async countProductType(filter: any): Promise<number> {
        return ProductsType.count({
            where: filter
        });
    }

    private async countUser(filter: any): Promise<number> {
        return User.count({
            where: filter
        });
    }

    private async countOrder(filter: any): Promise<number> {
        return Order.count({
            where: filter
        });
    }

}
