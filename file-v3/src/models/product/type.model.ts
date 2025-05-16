// ================================================================================================= Third Party Library
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";

// ================================================================================================= Custom Library
import Product from "./product.model";

@Table({
  tableName: "products_type",
  createdAt: "created_at",
  updatedAt: "updated_at",
})
class ProductsType extends Model<ProductsType> {
  // ============================================================================================= Primary Key
  @Column({ primaryKey: true, autoIncrement: true }) id: number;

  // ============================================================================================= Field
  // @ForeignKey(() => ProductsType) @Column({ onDelete: 'RESTRICT' })                               type_id: number;
  @Column({ allowNull: false, type: DataType.STRING(100) }) name: string;
  @Column({ allowNull: true, type: DataType.STRING(100) }) image?: string;
  created_at: Date;
  // ===========================================================================================>> One to Many
  @HasMany(() => Product) products: Product[];
}

export default ProductsType;
