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
import OrderDetails from "@models/order/detail.model";
import User from "@models/user/users.model";
import PetType from "./pet.type.model";

@Table({
  tableName: "pet",
  createdAt: "created_at",
  updatedAt: "updated_at",
})
class Pet extends Model<Pet> {
  // ============================================================================================= Primary Key
  @Column({ primaryKey: true, autoIncrement: true }) id: number;

  // ============================================================================================= Foreign Key
  @ForeignKey(() => PetType)
  @Column({ onDelete: "RESTRICT" })
  type_id: number;
  @ForeignKey(() => User) @Column({ onDelete: "CASCADE" }) creator_id: number;

  // ============================================================================================= Field
  @Column({ allowNull: false, unique: true, type: DataType.STRING(100) })
  code: string;
  @Column({ allowNull: false, type: DataType.STRING(100) }) name: string;
  @Column({ allowNull: true, type: DataType.STRING(100) }) image?: string;
  @Column({ allowNull: true, type: DataType.DOUBLE }) unit_price?: number;

  @Column({ allowNull: false, type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  discount: number;
  created_at: Date;
  // ===========================================================================================>> Many to One
  @BelongsTo(() => PetType) type: PetType;
  @BelongsTo(() => User) creator: User;

  // ===========================================================================================>> One to Many
  @HasMany(() => OrderDetails) pod: OrderDetails[];
}

export default Pet;
