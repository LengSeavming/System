// =========================================================================>> Core Library
import { BadRequestException, Injectable } from '@nestjs/common';

// =========================================================================>> Third Party Library
import { Sequelize, Transaction } from 'sequelize';

// =========================================================================>> Custom Library
import Notifications from '@models/notification/notification.model';
import User from '@models/user/users.model';
import { TelegramService } from 'src/app/services/telegram.service';
import sequelizeConfig from 'src/config/sequelize.config';
import OrderDetails from 'src/models/order/detail.model';
import Order from 'src/models/order/order.model';
import Product from 'src/models/product/product.model';
import ProductsType from 'src/models/product/type.model';
import { CreateOrderDto } from './order.pos.dto';

// ======================================= >> Code Starts Here << ========================== //
@Injectable()
export class OrderService {

    constructor(private telegramService: TelegramService) { };

    async getProducts(): Promise<{ data: { id: number, name: string, products: Product[] }[] }> {
        const data = await ProductsType.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: Product,
                    attributes: ['id', 'type_id', 'name', 'image', 'unit_price', 'code'],
                    include: [
                        {
                            model: ProductsType,
                            attributes: ['name'],
                        },
                    ],
                },
            ],
            order: [['name', 'ASC']],
        });

        const dataFormat: { id: number, name: string, products: Product[] }[] = data.map(type => ({
            id: type.id,
            name: type.name,
            products: type.products || []
        }));

        return { data: dataFormat };
    }

    // Method for creating an order
    async makeOrder(cashierId: number, body: CreateOrderDto): Promise<{ data: Order, message: string }> {
        // Initializing DB Connection
        const sequelize = new Sequelize(sequelizeConfig);
        let transaction: Transaction;
    
        try {
            // Open DB Connection
            transaction = await sequelize.transaction();
    
            // Create an order using method create()
            const order = await Order.create({
                cashier_id: cashierId,
                total_price: 0, // Initialize with 0, will update later
                receipt_number: await this._generateReceiptNumber(),
                ordered_at: null, // Will be updated later
            }, { transaction });
    
            // Find Total Price & Order Details
            let totalPrice = 0;
            const cartItems = JSON.parse(body.cart); // Assuming cart is a JSON string
    
            // Loop through cart items and calculate total price
            for (const [productId, qty] of Object.entries(cartItems)) {
                const product = await Product.findByPk(parseInt(productId)); // Find product by its ID
    
                if (product) {
                    // Save to Order Details
                    await OrderDetails.create({
                        order_id: order.id,
                        product_id: product.id,
                        qty: Number(qty),
                        unit_price: product.unit_price,
                    }, { transaction });
    
                    totalPrice += Number(qty) * product.unit_price; // Add to total price
                }
            }
    
            // Update Order with total price and ordered_at timestamp
            await Order.update({
                total_price: totalPrice,
                ordered_at: new Date(),
            }, {
                where: { id: order.id },
                transaction,
            });
    
            // Create notification for this order
            await Notifications.create({
                order_id: order.id,
                user_id: cashierId,
                read: false,
            }, { transaction });
    
            // Get order details for client response
            const data: Order = await Order.findByPk(order.id, {
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
                transaction, // Ensure this is inside the same transaction
            });
    
            // Commit transaction after successful operations
            await transaction.commit();
    
            // Send Telegram Notification
            const htmlMessage = `
                <b>ការបញ្ជាទិញទទួលបានជោគជ័យ!</b>\n
                - លេខវិកយប័ត្រ៖ ${data.receipt_number}\n
                - អ្នកគិតលុយ៖ ${data.cashier?.name || ''}\n
                - កាលបរិច្ឆេទ: ${data.ordered_at ? new Date(data.ordered_at).toLocaleString() : ''}
            `;
            await this.telegramService.sendHTMLMessage(htmlMessage);
    
            return { data, message: 'ការបញ្ជាទិញត្រូវបានបង្កើតដោយជោគជ័យ។' };
    
        } catch (error) {
            if (transaction) {
                await transaction.rollback(); // Rollback transaction on error
            }
            console.error('Error during order creation:', error);
            throw new BadRequestException('Something went wrong! Please try again later.', 'Error during order creation.');
        } finally {
            // Close DB connection if necessary
            await sequelize.close(); // Close sequelize connection
        }
    }
    

    // Private method to generate a unique receipt number
    private async _generateReceiptNumber(): Promise<number> {
        const number = Math.floor(Math.random() * 9000000) + 1000000;
        return await Order.findOne({
            where: {
                receipt_number: number,
            },
        }).then((order) => {
            if (order) {
                return this._generateReceiptNumber();
            }
            return number;
        });
    }
}
