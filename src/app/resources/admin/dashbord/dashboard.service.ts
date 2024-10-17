// ===========================================================================>> Core Library
import { BadRequestException, Injectable } from '@nestjs/common';

// ===========================================================================>> Third Party Library
import { col, fn, Op, Sequelize, where } from 'sequelize';

// ===========================================================================>> Custom Library
import { RoleEnum } from '@app/enums/role.enum';
import { JsReportService } from '@app/services/js-report.service';
import Order from '@models/order/order.model';
import Product from '@models/product/product.model';
import ProductsType from '@models/product/type.model';
import Role from '@models/user/role.model';
import UserRoles from '@models/user/user_roles.model';
import User from '@models/user/users.model';

@Injectable()
export class DashboardService {

    constructor(private jsReportService: JsReportService) { }

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

            // Determine the date filters based on the provided filters
            let currentPeriodFilter: any;
            let previousPeriodFilter: any;

            // Helper function to get a date string in 'YYYY-MM-DD' format
            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            if (filters.yesterday) {
                // If 'yesterday' filter is provided, sum data for that date
                const yesterdayDate = new Date(filters.yesterday);

                // Calculate the day before the provided 'yesterday' filter
                const dayBeforeYesterday = new Date(yesterdayDate);
                dayBeforeYesterday.setDate(yesterdayDate.getDate() - 1);

                const yesterdayString = formatDate(yesterdayDate); // e.g., '2024-10-16'
                const dayBeforeYesterdayString = formatDate(dayBeforeYesterday); // e.g., '2024-10-15'

                // Set filters for the provided 'yesterday' and the day before
                currentPeriodFilter = {
                    where: where(fn('DATE', col('ordered_at')), Op.eq, yesterdayString),
                };

                previousPeriodFilter = {
                    where: where(fn('DATE', col('ordered_at')), Op.eq, dayBeforeYesterdayString),
                };
            } else if (filters.today) {
                const today = formatDate(new Date());

                const yesterday = new Date();
                yesterday.setDate(new Date().getDate() - 1);
                const yesterdayString = formatDate(yesterday);

                // Set filters for today and yesterday
                currentPeriodFilter = {
                    where: where(fn('DATE', col('ordered_at')), Op.eq, today),
                };

                previousPeriodFilter = {
                    where: where(fn('DATE', col('ordered_at')), Op.eq, yesterdayString),
                };
            } else if (filters.thisWeek) {
                const startOfThisWeek = this.getStartOfWeek(new Date());
                const startOfLastWeek = this.getStartOfWeek(new Date(startOfThisWeek));
                const endOfLastWeek = new Date(startOfThisWeek);
                endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);

                currentPeriodFilter = {
                    ordered_at: {
                        [Op.gte]: startOfThisWeek,
                    },
                };

                previousPeriodFilter = {
                    ordered_at: {
                        [Op.gte]: startOfLastWeek,
                        [Op.lte]: endOfLastWeek,
                    },
                };
            } else if (filters.thisMonth) {
                const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                const startOfLastMonth = new Date(startOfThisMonth);
                startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
                const endOfLastMonth = new Date(startOfThisMonth);
                endOfLastMonth.setDate(0);

                currentPeriodFilter = {
                    ordered_at: {
                        [Op.gte]: startOfThisMonth,
                    },
                };

                previousPeriodFilter = {
                    ordered_at: {
                        [Op.gte]: startOfLastMonth,
                        [Op.lte]: endOfLastMonth,
                    },
                };
            }

            // Query to sum total sales for the current period
            const totalSaleCurrent = await Order.sum('total_price', currentPeriodFilter) ?? 0;

            // Query to sum total sales for the previous period
            const totalSalePrevious = await Order.sum('total_price', previousPeriodFilter) ?? 0;

            // Calculate the sale increase or decrease
            const saleIncrease = totalSaleCurrent - totalSalePrevious;

            // Format the sale difference with a sign
            const saleDifferenceWithSign = saleIncrease >= 0
                ? `+${saleIncrease}`
                : `${saleIncrease}`;

            // Calculate percentage increase or decrease, capped at -100% to +100%
            let totalPercentageIncrease: number;

            if (totalSaleCurrent === 0 && totalSalePrevious === 0) {
                totalPercentageIncrease = 0; // No sales in both periods
            } else {
                // Calculate percentage change as (current - previous) / (current + previous) * 100
                const percentageChange = ((totalSaleCurrent - totalSalePrevious) /
                    (totalSaleCurrent + totalSalePrevious)) * 100;

                // Cap the percentage change between -100.00% and +100.00%
                totalPercentageIncrease = Math.max(-100, Math.min(percentageChange, 100));

                // Format to two decimal places
                totalPercentageIncrease = parseFloat(totalPercentageIncrease.toFixed(2));
            }
            return {
                statatics: {
                    totalProduct,
                    totalProductType,
                    totalUser,
                    totalOrder,
                    total: totalSaleCurrent,
                    totalPercentageIncrease,
                    saleIncreasePreviousDay: saleDifferenceWithSign,

                },
                message: "ទទួលបានទិន្នន័យដោយជោគជ័យ",
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
                            WHEN COALESCE(lastWeekSales.total, 0) = 0 AND COALESCE(thisWeekSales.total, 0) > 0 THEN 100.00
                            WHEN COALESCE(thisWeekSales.total, 0) = 0 THEN 0.00
                            ELSE TRUNC(
                            CAST(
                                ((COALESCE(thisWeekSales.total, 0) - COALESCE(lastWeekSales.total, 0)) 
                                / GREATEST(lastWeekSales.total, 1)) * 100 
                            AS NUMERIC), 2
                        )
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

            // Use filters if provided, otherwise default to the current year and week
            const year = filters.year || currentYear;
            const week = filters.week || currentWeek;

            // Get start and end date of the selected or current week
            const startDate = this.getStartDateOfISOWeek(week, year);
            const endDate = this.getEndDateOfISOWeek(week, year);

            // Define an alias for the computed column
            const dateTrunc = Sequelize.fn('DATE', Sequelize.col('ordered_at'));

            // Fetch total sales grouped by day of the week for the specified week
            const salesData = await Order.findAll({
                attributes: [
                    [dateTrunc, 'day'], // Use the alias for the computed date column
                    [Sequelize.fn('SUM', Sequelize.col('total_price')), 'total_sales'],
                ],
                where: {
                    [Op.and]: [
                        Sequelize.where(dateTrunc, {
                            [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
                        }),
                    ],
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

            // Extract labels (days of the week) and data (total sales)
            const result = {
                labels: salesByDay.map(s => s.day),
                data: salesByDay.map(s => s.total_sales),
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

    private getStartOfWeek(date: Date): Date {
        const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for week starting on Monday
        return new Date(date.setDate(diff));
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
