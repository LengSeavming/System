// ================================================================================================= Third Party Library
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

// ================================================================================================= Custom Library
import ProductsType from './type.model';

@Table({ tableName: 'product', createdAt: 'created_at', updatedAt: 'updated_at' })
class Product extends Model<Product> {

    // ============================================================================================= Primary Key
    @Column({ primaryKey: true, autoIncrement: true })                                              id: number;

    // ============================================================================================= Foreign Key
    @ForeignKey(() => ProductsType) @Column({ onDelete: 'RESTRICT' })                               type_id: number;

    // ============================================================================================= Field
    @Column({ allowNull: false, unique: true, type: DataType.STRING(100) })                         code: string;
    @Column({ allowNull: false, type: DataType.STRING(100) })                                       name: string;
    @Column({ allowNull: true, type: DataType.STRING(100) })                                        image?: string;
    @Column({ allowNull: true, type: DataType.DOUBLE })                                             unit_price?: number;

    @Column({ allowNull: false, type: DataType.DECIMAL(10, 2), defaultValue: 0 })                   discount: number;

    // ===========================================================================================>> Many to One
    @BelongsTo(() => ProductsType)                                                                  type: ProductsType;
}

export default Product;