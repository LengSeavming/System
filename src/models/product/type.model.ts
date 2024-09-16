// ================================================================================================= Third Party Library
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

// ================================================================================================= Custom Library
import Product from './product.model';

@Table({ tableName: 'products_type', createdAt: 'created_at', updatedAt: 'updated_at' })
class ProductsType extends Model<ProductsType> {

    // ============================================================================================= Primary Key
    @Column({ primaryKey: true, autoIncrement: true }) id: number;

    // ============================================================================================= Field
    @Column({ allowNull: false, type: DataType.STRING(100) }) name: string;

    // ===========================================================================================>> One to Many
    @HasMany(() => Product) products: Product[];
}

export default ProductsType;