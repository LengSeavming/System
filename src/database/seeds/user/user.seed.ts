import { RoleEnum } from "@app/enums/role.enum";
import Role from "@models/user/role.model";
import UserRoles from "@models/user/user_roles.model";
import User from "@models/user/users.model";

export class UserSeeder {

    public static seed = async () => {
        try {
            await UserSeeder.seedRoles();
            await UserSeeder.seedUsers();
            await UserSeeder.seedUserRoles();
        } catch (error) {
            console.error('\x1b[31m\nError seeding data user:', error);
        }
    }

    private static async seedRoles() {
        try {
            await Role.bulkCreate(data.role);
            console.log('\x1b[32mRoles data inserted successfully.');
        } catch (error) {
            console.error('Error seeding roles:', error);
            throw error;
        }
    }

    private static async seedUsers() {
        try {
            await User.bulkCreate(data.users);
            console.log('\x1b[32mUsers data inserted successfully.');
        } catch (error) {
            console.error('Error seeding users:', error);
            throw error;
        }
    }

    private static async seedUserRoles() {
        try {
            await UserRoles.bulkCreate(data.user_roles);
            console.log('\x1b[32mUser Roles data inserted successfully.');
        } catch (error) {
            console.error('Error seeding user roles:', error);
            throw error;
        }
    }

}

// Mock-data
const data = {
    role: [{ name: 'អ្នកគ្រប់គ្រង', slug: 'admin' }, { name: 'អ្នកគិតប្រាក់', slug: 'cashier' }],
    users: [
        {
            name: 'ចាន់​ សុវ៉ាន់ណេត',
            phone: '0889566929',
            email: 'suvannetchan@gmail.com',
            password: '123456',
            avatar: 'upload/file/f9b94c44-ceda-44bf-b1bf-71866ce0d6c7',
            creator_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            name: 'Heng Tongsour',
            phone: '0889566930',
            email: 'hengtongsour@gmail.com',
            password: '123456',
            avatar: 'upload/file/c07c5373-4be0-402f-a76b-a042f3315bd7',
            creator_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            name: 'ENG SOKCHHENG',
            phone: '012894154',
            email: 'engsokchheng@gmail.com',
            password: '123456',
            avatar: 'upload/file/2a1b13a3-221b-4d4c-aedd-d32627f420b5',
            creator_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
        },
    ],
    user_roles: [
        { user_id: 1, role_id: RoleEnum.ADMIN, added_id: 1, created_at: new Date(), is_default: true },
        { user_id: 1, role_id: RoleEnum.CASHIER, added_id: 1, created_at: new Date() },
        { user_id: 2, role_id: RoleEnum.CASHIER, added_id: 1, created_at: new Date(), is_default: true },
        { user_id: 3, role_id: RoleEnum.CASHIER, added_id: 1, created_at: new Date(), is_default: true },
    ],
};

