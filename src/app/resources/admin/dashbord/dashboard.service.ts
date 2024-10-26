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

    async findStaticData(filters: { today?: string; yesterday?: string; thisWeek?: string; thisMonth?: string } = {}): Promise<any> {
        try {

            const dateFilter = this.getDateFilter(filters);

            // Build the document filter, including the date filter only if it's not empty
            const dataFilter: any = { ...dateFilter };

            const totalProduct = await this.countProduct(dataFilter);
            const totalProductType = await this.countProductType(dataFilter);
            const totalUser = await this.countUser(dataFilter);
            const totalOrder = await this.countOrder(dataFilter);

            let currentPeriodFilter: any;
            let previousPeriodFilter: any;

            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            if (filters.yesterday) {
                const yesterdayDate = new Date(filters.yesterday);
                const dayBeforeYesterday = new Date(yesterdayDate);
                dayBeforeYesterday.setDate(yesterdayDate.getDate() - 1);

                currentPeriodFilter = {
                    where: where(fn('DATE', col('ordered_at')), Op.eq, formatDate(yesterdayDate)),
                };
                previousPeriodFilter = {
                    where: where(fn('DATE', col('ordered_at')), Op.eq, formatDate(dayBeforeYesterday)),
                };
            } else if (filters.today) {
                const today = formatDate(new Date());
                const yesterday = new Date();
                yesterday.setDate(new Date().getDate() - 1);

                currentPeriodFilter = {
                    where: where(fn('DATE', col('ordered_at')), Op.eq, today),
                };
                previousPeriodFilter = {
                    where: where(fn('DATE', col('ordered_at')), Op.eq, formatDate(yesterday)),
                };
            } else if (filters.thisWeek) {
                const startOfThisWeek = this.getStartOfWeek(new Date());
                const startOfLastWeek = this.getStartOfWeek(new Date(startOfThisWeek));
                const endOfLastWeek = new Date(startOfThisWeek);
                endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);

                currentPeriodFilter = {
                    ordered_at: { [Op.gte]: startOfThisWeek },
                };
                previousPeriodFilter = {
                    ordered_at: { [Op.gte]: startOfLastWeek, [Op.lte]: endOfLastWeek },
                };
            } else if (filters.thisMonth) {
                const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                const startOfLastMonth = new Date(startOfThisMonth);
                startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
                const endOfLastMonth = new Date(startOfThisMonth);
                endOfLastMonth.setDate(0);

                currentPeriodFilter = {
                    ordered_at: { [Op.gte]: startOfThisMonth },
                };
                previousPeriodFilter = {
                    ordered_at: { [Op.gte]: startOfLastMonth, [Op.lte]: endOfLastMonth },
                };
            }

            const totalSaleCurrent = await Order.sum('total_price', currentPeriodFilter) ?? 0;
            const totalSalePrevious = await Order.sum('total_price', previousPeriodFilter) ?? 0;
            const saleIncrease = totalSaleCurrent - totalSalePrevious;
            const saleDifferenceWithSign = saleIncrease >= 0 ? `+${saleIncrease}` : `${saleIncrease}`;

            let totalPercentageIncrease: number;
            if (totalSaleCurrent === 0 && totalSalePrevious === 0) {
                totalPercentageIncrease = 0;
            } else {
                const percentageChange = ((totalSaleCurrent - totalSalePrevious) /
                    (totalSaleCurrent + totalSalePrevious)) * 100;
                totalPercentageIncrease = Math.max(-100, Math.min(percentageChange, 100));
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

    async findCashierAndTotalSale(filters: { today?: string; yesterday?: string; thisWeek?: string; thisMonth?: string } = {}) {
        try {
            const { currentPeriodFilter, previousPeriodFilter } = this.getDateFilters(filters);

            const cashiers = await User.findAll({
                attributes: [
                    'id',
                    'name',
                    'avatar',

                    // Total sales for the current period
                    [Sequelize.literal(`(
                        SELECT COALESCE(SUM(o.total_price), 0)
                        FROM "order" AS o
                        WHERE o.cashier_id = "User".id
                        AND ${currentPeriodFilter}
                    )`), 'totalAmount'],

                    // Percentage change between today and yesterday (or current and previous period)
                    [Sequelize.literal(`(
                        SELECT CASE
                            WHEN COALESCE(yesterdaySales.total, 0) = 0 AND COALESCE(todaySales.total, 0) > 0 THEN 100.00
                            WHEN COALESCE(todaySales.total, 0) = 0 THEN 0.00
                            ELSE TRUNC(
                                CAST(
                                    ((COALESCE(todaySales.total, 0) - COALESCE(yesterdaySales.total, 0)) 
                                    / GREATEST(yesterdaySales.total, 1)) * 100 
                                AS NUMERIC), 2
                            )
                        END AS percentageChange
                        FROM (
                            SELECT SUM(o.total_price) AS total
                            FROM "order" AS o
                            WHERE o.cashier_id = "User".id
                            AND ${currentPeriodFilter}
                        ) AS todaySales,
                        (
                            SELECT SUM(o.total_price) AS total
                            FROM "order" AS o
                            WHERE o.cashier_id = "User".id
                            AND ${previousPeriodFilter}
                        ) AS yesterdaySales
                    )`), 'percentageChange'],
                ],
                include: [
                    {
                        model: UserRoles,
                        where: { role_id: RoleEnum.CASHIER },
                        attributes: ['id', 'role_id'],
                        include: [{ model: Role, attributes: ['id', 'name'] }],
                    },
                ],
                order: [[Sequelize.literal('"totalAmount"'), 'DESC']],
            });

            if (cashiers.length === 0) {
                console.log("No cashier data found for the specified filters.");
            }

            return { data: cashiers };
        } catch (err) {
            console.error("Error fetching cashier data:", err.message);
            throw new BadRequestException(err.message);
        }
    }

    private getDateFilters(filters: { today?: string; yesterday?: string; thisWeek?: string; thisMonth?: string }) {
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        let currentPeriodFilter: string;
        let previousPeriodFilter: string;

        if (filters.yesterday) {
            const yesterday = new Date(filters.yesterday);
            const dayBeforeYesterday = new Date(yesterday);
            dayBeforeYesterday.setDate(yesterday.getDate() - 1);

            currentPeriodFilter = `o.ordered_at::date = '${formatDate(yesterday)}'`;
            previousPeriodFilter = `o.ordered_at::date = '${formatDate(dayBeforeYesterday)}'`;
        } else if (filters.today) {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            currentPeriodFilter = `o.ordered_at::date = '${formatDate(today)}'`;
            previousPeriodFilter = `o.ordered_at::date = '${formatDate(yesterday)}'`;
        } else if (filters.thisWeek) {
            const startOfThisWeek = this.startOfWeek(new Date());
            const startOfLastWeek = this.startOfWeek(new Date(startOfThisWeek));
            const endOfLastWeek = new Date(startOfThisWeek);
            endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);

            currentPeriodFilter = `o.ordered_at >= '${startOfThisWeek.toISOString()}'`;
            previousPeriodFilter = `o.ordered_at BETWEEN '${startOfLastWeek.toISOString()}' AND '${endOfLastWeek.toISOString()}'`;
        } else if (filters.thisMonth) {
            const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const startOfLastMonth = new Date(startOfThisMonth);
            startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
            const endOfLastMonth = new Date(startOfThisMonth);
            endOfLastMonth.setDate(0);

            currentPeriodFilter = `o.ordered_at >= '${startOfThisMonth.toISOString()}'`;
            previousPeriodFilter = `o.ordered_at BETWEEN '${startOfLastMonth.toISOString()}' AND '${endOfLastMonth.toISOString()}'`;
        } else {
            // Default to today and yesterday if no filters provided
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            currentPeriodFilter = `o.ordered_at::date = '${formatDate(today)}'`;
            previousPeriodFilter = `o.ordered_at::date = '${formatDate(yesterday)}'`;
        }

        return { currentPeriodFilter, previousPeriodFilter };
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

    private startOfWeek(date: Date): Date {
        const day = date.getDay(); // Get the current day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust if Sunday is the start of the week
        return this.startOfDay(new Date(date.setDate(diff))); // Set the correct date and time to 00:00:00
    }

    private startOfMonth(date: Date): Date {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1); // First day of the month
        return this.startOfDay(startOfMonth); // Ensure the time is set to 00:00:00
    }

    // Count documents based on the filter
    private async countProduct(filter: any): Promise<number> {
        return Product.count({
            // where: filter
        });
    }

    private async countProductType(filter: any): Promise<number> {
        return ProductsType.count({
            // where: filter
        });
    }

    private async countUser(filter: any): Promise<number> {
        return User.count({
            // where: filter
        });
    }

    private async countOrder(filter: any): Promise<number> {
        return Order.count({
            // where: filter
        });
    }

}
