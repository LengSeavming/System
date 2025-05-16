// ================================================================================================= Third Party Library
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import Book from "./book.model";

// ================================================================================================= Custom Library

@Table({
  // book (id, type_id, name, cover, file, created_at)
  tableName: "book_type",
  createdAt: "created_at",
  updatedAt: "updated_at",
})
class BookType extends Model<BookType> {
  // ============================================================================================= Primary Key
  @Column({ primaryKey: true, autoIncrement: true }) id: number;

  // ============================================================================================= Field
  // @ForeignKey(() => ProductsType) @Column({ onDelete: 'RESTRICT' })                               type_id: number;
  @Column({ allowNull: false, type: DataType.STRING(100) }) name: string;
  @Column({ allowNull: true, type: DataType.STRING(100) }) image?: string;
  created_at: Date;
  // ===========================================================================================>> One to Many
  @HasMany(() => Book) book: Book[];
}

export default BookType;
