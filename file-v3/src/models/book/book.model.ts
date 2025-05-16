// ================================================================================================= Third Party Library
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";

// ================================================================================================= Custom Library
// import OrderDetails from "@models/order/detail.model";
import User from "@models/user/users.model";
import BookType from "./book_type.model";

@Table({
  tableName: "book",
  createdAt: "created_at",
  updatedAt: "updated_at",
})
class Book extends Model<Book> {
  // ============================================================================================= Primary Key
  @Column({ primaryKey: true, autoIncrement: true }) id: number;

  // ============================================================================================= Foreign Key
  @ForeignKey(() => BookType) @Column({ onDelete: "RESTRICT" }) type_id: number;
  @ForeignKey(() => User) @Column({ onDelete: "CASCADE" }) creator_id: number;

  // ============================================================================================= Field
  @Column({ allowNull: false, unique: true, type: DataType.STRING(100) })
  code: string;
  @Column({ allowNull: false, type: DataType.STRING(100) }) name: string;
  @Column({ allowNull: true, type: DataType.STRING(100) }) cover?: string;
  @Column({ allowNull: true, type: DataType.STRING(100) }) file?: string;
  @Column({ allowNull: true, type: DataType.DOUBLE }) unit_price?: number;

  @Column({ allowNull: false, type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  discount: number;
  created_at: Date;
  // ===========================================================================================>> Many to One
  @BelongsTo(() => BookType) type: BookType;
  @BelongsTo(() => User) creator: User;

  // ===========================================================================================>> One to Many
  // @HasMany(() => OrderDetails) pod: OrderDetails[];
}

export default Book;
