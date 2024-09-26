// ===========================================================================>> Core Library
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

// ===========================================================================>> Third party Library
import { Op, Sequelize } from 'sequelize';
// ===========================================================================>> Costom Library
import OrderDetails from '@models/order/detail.model';
import Product from '@models/product/product.model';
import ProductsType from '@models/product/type.model';
import User from '@models/user/users.model';
import Order from 'src/models/order/order.model';
import { List } from './sale.types';

@Injectable()
export class SaleService {

    async listing(userId: number, page_size: number = 10, page: number = 1, key?: string) {
        try {
            const offset = (page - 1) * page_size;
            const where: any = {
                cashier_id: userId,
                [Op.and]: [
                    key ? Sequelize.where(
                        Sequelize.literal(`CAST("receipt_number" AS TEXT)`),
                        {
                            [Op.like]: `%${key}%`
                        }
                    ) : {},
                ],
            };

            const data = await Order.findAll({
                attributes: ['id', 'receipt_number', 'total_price', 'ordered_at'],
                include: [
                    {
                        model: OrderDetails,
                        attributes: ['id', 'unit_price', 'qty'],
                        include: [
                            {
                                model: Product,
                                attributes: ['id', 'name', 'code', 'image'],
                                include: [
                                    {
                                        model: ProductsType,
                                        attributes: ['name'],
                                    }
                                ]
                            },
                        ],
                    },
                    {
                        model: User,
                        attributes: ['id', 'avatar', 'name'],
                    },
                ],
                where: where,
                order: [['ordered_at', 'DESC']],
                limit: page_size,
                offset,
            });

            const totalCount = await Order.count({
                where: where,
            });

            const totalPages = Math.ceil(totalCount / page_size);

            const dataFormat: List = {
                status: 'success',
                data: data,
                pagination: {
                    currentPage: page,
                    perPage: page_size,
                    totalPages: totalPages,
                    totalItems: totalCount,
                },
            };

            return dataFormat;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }


    async delete(id: number): Promise<{ message: string }> {
        try {
            const rowsAffected = await Order.destroy({
                where: {
                    id: id
                }
            });

            if (rowsAffected === 0) {
                throw new NotFoundException('Sale record not found.');
            }

            return { message: 'This order has been deleted successfully.' };
        } catch (error) {
            throw new BadRequestException(error.message ?? 'Something went wrong!. Please try again later.', 'Error Delete');
        }
    }
}
