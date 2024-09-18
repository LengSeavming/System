// ================================================================================================= Third Party Library
import { BelongsTo, BelongsToMany, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

// ================================================================================================= Custom Library
import UserRoles from '@models/user/user_roles.model';
import * as bcrypt from 'bcryptjs';
import { ActiveEnum } from 'src/app/enums/active.enum';
import Role from './role.model';
@Table({ tableName: 'users', createdAt: 'created_at', updatedAt: 'updated_at', deletedAt: 'deleted_at', paranoid: true })
class User extends Model<User> {

    // ============================================================================================= Primary Key
    @Column({ primaryKey: true, autoIncrement: true })                                              id: number;

    // ============================================================================================= Field
    @Column({ allowNull: true, type: DataType.STRING(200), defaultValue: 'static/avatar.png' })     avatar: string;
    @Column({ allowNull: false, type: DataType.STRING(50) })                                        name: string;
    @Column({ allowNull: true, unique: true, type: DataType.STRING(100) })                          email: string;
    @Column({ allowNull: false, unique: true, type: DataType.STRING(100) })                         phone: string;
    @Column({ allowNull: false, type: DataType.STRING(100), set(value: string) 
        {const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(value, salt);
            this.setDataValue('password', hash);
        },
    })                                                                                              password: string;
    @Column({ allowNull: false, type: DataType.INTEGER, defaultValue: ActiveEnum.ACTIVE })          is_active: ActiveEnum;
    @Column({ allowNull: true, type: DataType.INTEGER })                                            creator_id: number;
    @Column({ allowNull: true, type: DataType.INTEGER })                                            updater_id: number;

    // ===========================================================================================>> Many to One
    @BelongsTo(() => User, { foreignKey: 'creator_id', as: 'creator' })                             creator: User;
    @BelongsTo(() => User, { foreignKey: 'updater_id', as: 'updater' })                             updater: User;

    // ===========================================================================================>> One to Many
    @HasMany(() => UserRoles)                                                                       role: UserRoles[];

    // ===========================================================================================>> Many to Many
    @BelongsToMany(() => Role, () => UserRoles)                                                     roles: Role[];
}
export default User;
