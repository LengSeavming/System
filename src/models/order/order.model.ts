// ================================================================================================= Third Party Library
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';

// ================================================================================================= Custom Library
import User from '@models/user/users.model';
import OrderDetails from './detail.model';

@Table({ tableName: 'order', createdAt: 'created_at', updatedAt: 'updated_at' })
class Order extends Model<Order> {

    // ============================================================================================= Primary Key
    @Column({ primaryKey: true, autoIncrement: true })                                              id: number;

    // ============================================================================================= Foreign Key
    @ForeignKey(() => User) @Column({ onDelete: 'CASCADE' })                                        cashier_id: number;

    // ============================================================================================= Field
    @Column({ allowNull: false, unique: true, type: DataType.BIGINT })                              receipt_number: number;
    @Column({ allowNull: true, type: DataType.DOUBLE })                                             total_price?: number;
    @Column({ allowNull: true, type: DataType.DATE, defaultValue: new Date() })                     ordered_at?: Date;
    
    // ============================================================================================= Many to One
    @BelongsTo(() => User)                                                                          cashier: User;

    // ============================================================================================= One to Many
    @HasMany(() => OrderDetails)                                                                    details: OrderDetails[]
}

export default Order;