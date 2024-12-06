// ================================================================================================= Third Party Library
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import Pet from "./pet.model";

// ================================================================================================= Custom Library

@Table({
  tableName: "pet_type",
  createdAt: "created_at",
  updatedAt: "updated_at",
})
class PetType extends Model<PetType> {
  // ============================================================================================= Primary Key
  @Column({ primaryKey: true, autoIncrement: true }) id: number;

  // ============================================================================================= Field
  // @ForeignKey(() => ProductsType) @Column({ onDelete: 'RESTRICT' })                               type_id: number;
  @Column({ allowNull: false, type: DataType.STRING(100) }) name: string;
  @Column({ allowNull: true, type: DataType.STRING(100) }) image?: string;
  created_at: Date;
  // ===========================================================================================>> One to Many
  @HasMany(() => Pet) products: Pet[];
}

export default PetType;
