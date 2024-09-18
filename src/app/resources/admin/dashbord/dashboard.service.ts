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
    constructor(
    ) { }

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

    async findAllWithRoleCashierAndAddTotalSale(filters: { today?: string; yesterday?: string; thisWeek?: string; thisMonth?: string }) {
        try {
            const dateFilter = this.getDateFilter(filters); // Use the date filter for today/yesterday

            const cashiers = await User.findAll({
                attributes: [
                    'id',
                    'name',
                    'avatar',
                    // Total sales amount calculation for the specified date range
                    [Sequelize.literal(`(
                        SELECT COALESCE(SUM(o.total_price), 0)
                        FROM "order" AS o
                        WHERE o.cashier_id = "User".id
                        ${dateFilter && dateFilter['created_at'] ? `AND o.ordered_at BETWEEN '${dateFilter['created_at'][Op.gte].toISOString()}' AND '${dateFilter['created_at'][Op.lt].toISOString()}'` : ''}
                    )`), 'totalAmount'],

                    // Percentage change calculation between today and yesterday
                    [Sequelize.literal(`(
                        SELECT CASE
                            -- Case 1: No sales yesterday, but sales today
                            WHEN COALESCE(yesterdaySales.total, 0) = 0 AND COALESCE(todaySales.total, 0) > 0 THEN 100
                            
                            -- Case 2: No sales today
                            WHEN COALESCE(todaySales.total, 0) = 0 THEN 0
                            
                            -- Case 3: Normal percentage change calculation
                            ELSE ((COALESCE(todaySales.total, 0) - COALESCE(yesterdaySales.total, 0)) / GREATEST(yesterdaySales.total, 1)) * 100
                        END AS percentageChange
                        FROM (
                            -- Subquery to calculate today's total sales
                            SELECT SUM(o.total_price) AS total
                            FROM "order" AS o
                            WHERE o.cashier_id = "User".id
                            ${filters.today ? `AND o.ordered_at::date = '${filters.today}'::date` : ''}
                        ) AS todaySales,
                        (
                            -- Subquery to calculate yesterday's total sales
                            SELECT SUM(o.total_price) AS total
                            FROM "order" AS o
                            WHERE o.cashier_id = "User".id
                            ${filters.yesterday ? `AND o.ordered_at::date = '${filters.yesterday}'::date` : ''}
                        ) AS yesterdaySales
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
            });

            // Check if the sales data for today and yesterday exists and log them
            if (cashiers.length === 0) {
                console.log("No cashier data found for today or yesterday.");
            }

            return {
                data: cashiers,
            };
        } catch (err) {
            console.error("Error fetching cashier data:", err.message);
            throw new BadRequestException(err.message);
        }
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
