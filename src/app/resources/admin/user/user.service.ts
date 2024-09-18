// ================================================================>> Core Library
import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";

// ================================================================>> Third Party Library
import { Op } from "sequelize";

// ================================================================>> Custom Library
import Role from "@models/user/role.model";
import UserRoles from "@models/user/user_roles.model";
import User from "@models/user/users.model";
import { FileService } from "src/app/services/file.service";
import { CreateUserDto, UpdatePasswordDto, UpdateStatusDto, UpdateUserDto } from "./user.dto";
import { Create, List, Update } from "./user.interface";

@Injectable()
export class UserService {

    constructor(private readonly fileService: FileService) { };


    async setup(): Promise<{ roles: { id: number; name: string }[] }> {
        const roles = await Role.findAll({
            attributes: ['id', 'name'],
        });

        return { roles: roles };
    }

    async listing(userId: number, page_size: number = 10, page: number = 1, key?: string): Promise<List> {
        const offset = (page - 1) * page_size;
        const where = {
            [Op.and]: [
                key
                    ? {
                        [Op.or]: [
                            { name: { [Op.iLike]: `%${key}%` } },
                            { phone: { [Op.like]: `%${key}%` } },
                        ],
                    }
                    : {},
                { id: { [Op.not]: userId } },
            ],
        };
        const data = await User.findAll({
            attributes: ['id', 'name', 'avatar', 'phone', 'email', 'is_active', 'created_at'],
            include: [
                {
                    model: UserRoles,
                    attributes: ['id', 'role_id'],
                    include: [
                        {
                            model: Role,
                            attributes: ['id', 'name'],
                        }
                    ]
                }
            ],
            order: [['id', 'DESC']],
            where: where,
            limit: page_size,
            offset,
        });
        const totalCount = await User.count();
        const totalPages = Math.ceil(totalCount / page_size);

        const dataFormat: List = {
            data: data,
            pagination: {
                currentPage: page,
                perPage: page_size,
                totalPages: totalPages,
                totalItems: totalCount,
            },
        };

        return dataFormat;
    }
    async view(userId: number) {
        const data = await User.findByPk(userId, {
            attributes: ['id', 'name', 'avatar', 'phone', 'email', 'is_active', 'created_at'],
            include: [
                {
                    model: UserRoles,
                    attributes: ['id', 'role_id'],
                    include: [
                        {
                            model: Role,
                            attributes: ['id', 'name'],
                        }
                    ]
                }
            ],
        });
        return { data: data };
    }

    async create(body: CreateUserDto, userId: number): Promise<Create> {
        let user: User;
        try {
            // Check if a user with the same phone or email already exists
            user = await User.findOne({
                where: {
                    [Op.or]: [
                        { phone: body.phone },
                        { email: body.email }
                    ]
                }
            });
        } catch (error) {
            throw new BadRequestException('Something went wrong. Please try again later.', 'Error Query');
        }

        // If user already exists, throw an error
        if (user) {
            throw new BadRequestException('Email or phone already exists!');
        }

        // Upload the avatar image to the file service
        const result = await this.fileService.uploadBase64Image('user', body.avatar);
        if (result.error) {
            throw new BadRequestException(result.error);
        }
        // Set the avatar to the file URI returned from the file service
        body.avatar = result.file.uri;

        // Create the new user in the database
        const createdUser = await User.create({
            name: body.name,
            avatar: body.avatar,
            phone: body.phone,
            email: body.email,
            password: body.password,
            creator_id: userId
        });

        // Assign roles to the user by creating entries in the UserRoles table
        if (body.role_ids && body.role_ids.length > 0) {
            const userRoles = body.role_ids.map(roleId => ({
                user_id: createdUser.id,
                role_id: roleId,
                added_id: userId, // The creator who added the roles
                created_at: new Date(),
                is_default: false // Assuming roles are not default, adjust if necessary
            }));
            await UserRoles.bulkCreate(userRoles);
        }

        // Fetch the created user data including the roles for response
        const data = await User.findByPk(createdUser.id, {
            attributes: ['id', 'name', 'avatar', 'phone', 'email', 'is_active', 'created_at'],
            include: [
                {
                    model: UserRoles,
                    attributes: ['id', 'role_id'],
                    include: [
                        {
                            model: Role,
                            attributes: ['id', 'name'],
                        }
                    ]
                }
            ],
        });

        // Format the response
        const dataFormat: Create = {
            data: data,
            message: "User has been created"
        };

        return dataFormat;
    }

    private isValidBase64(str: string): boolean {
        const base64Pattern = /^data:image\/(jpeg|png|gif|bmp|webp);base64,[a-zA-Z0-9+/]+={0,2}$/;
        return base64Pattern.test(str);
    }
    async update(userId: number, body: UpdateUserDto, updaterId: number): Promise<Update> {
        // Find the current user
        let currentUser: User;
        try {
            currentUser = await User.findByPk(userId);
        } catch (error) {
            throw new BadRequestException('Something went wrong! Please try again later.', 'Error Query');
        }
        if (!currentUser) {
            throw new BadRequestException('Invalid user_id');
        }

        // Check if the phone is already in use by another user
        let checkExistPhone: User;
        try {
            checkExistPhone = await User.findOne({
                where: {
                    id: { [Op.not]: userId },
                    phone: body.phone
                }
            });
        } catch (error) {
            throw new BadRequestException('Something went wrong! Please try again later.', 'Error Query');
        }
        if (checkExistPhone) {
            throw new ConflictException('Phone is already in use');
        }

        // Check if the email is already in use by another user
        let checkExistEmail: User;
        try {
            checkExistEmail = await User.findOne({
                where: {
                    id: { [Op.not]: userId },
                    email: body.email
                }
            });
        } catch (error) {
            throw new BadRequestException('Something went wrong! Please try again later.', 'Error Query');
        }
        if (checkExistEmail) {
            throw new ConflictException('Email is already in use');
        }

        if (body.avatar && !body.avatar.startsWith('upload/file/')) {
            if (this.isValidBase64(body.avatar)) {
                const result = await this.fileService.uploadBase64Image('user', body.avatar);
                if (result.error) {
                    throw new BadRequestException(result.error);
                }
                // Replace base64 string by file URI from FileService
                body.avatar = result.file?.uri;
            } else {
                throw new BadRequestException('Invalid image format');
            }
        }

        // Update basic user information (name, avatar, phone, email, updater_id)
        try {
            await User.update({
                name: body.name,
                avatar: body.avatar,
                phone: body.phone,
                email: body.email,
                updater_id: updaterId
            }, {
                where: { id: userId }
            });
        } catch (error) {
            throw new BadRequestException('Something went wrong! Please try again later.', 'Error Update');
        }

        // Handle role updates (add new roles that don't already exist)
        if (body.role_ids && body.role_ids.length > 0) {
            const existingRoles = await UserRoles.findAll({
                where: { user_id: userId },
                attributes: ['role_id']
            });

            const existingRoleIds = existingRoles.map(role => role.role_id);

            const newRoles = body.role_ids.filter(roleId => !existingRoleIds.includes(roleId));

            // Add new roles only if they are not already assigned
            if (newRoles.length > 0) {
                const newRoleAssignments = newRoles.map(roleId => ({
                    user_id: userId,
                    role_id: roleId,
                    added_id: updaterId,
                    created_at: new Date(),
                    is_default: false
                }));
                await UserRoles.bulkCreate(newRoleAssignments);
            }
        }

        // Fetch the updated user information (excluding password)
        let updateUser: User;
        try {
            updateUser = await User.findByPk(userId, {
                attributes: ['id', 'name', 'avatar', 'phone', 'email', 'is_active', 'created_at'],
            });
        } catch (error) {
            throw new BadRequestException('Something went wrong! Please try again later.', 'Error Query');
        }
        // Format the response
        const dataFormat: Update = {
            data: updateUser,
            message: 'User has been updated successfully.'
        };
        return dataFormat;
    }



    async delete(userId: number): Promise<{ message: string }> {
        try {
            const rowsAffected = await User.destroy({
                where: {
                    id: userId
                }
            });

            if (rowsAffected === 0) {
                throw new NotFoundException('This user not found.');
            }

            return { message: 'User has been deleted successfully.' };
        } catch (error) {
            throw new BadRequestException(error.message ?? 'Something went wrong!. Please try again later.', 'Error Delete');
        }
    }

    async updatePassword(userId: number, body: UpdatePasswordDto): Promise<{ message: string }> {
        //=============================================
        let currentUser: User;
        try {
            currentUser = await User.findByPk(userId);
        } catch (error) {
            throw new BadRequestException('Someting went wrong!. Please try again later.', 'Error Query');
        }
        if (!currentUser) {
            throw new BadRequestException('Invalid user_id');
        }

        //=============================================
        try {
            await User.update({
                password: body.confirm_password,
            }, {
                where: { id: userId }
            });
        } catch (error) {
            throw new BadRequestException('Someting went wrong!. Please try again later.', 'Error Update');
        }

        //=============================================
        return { message: 'Password has been updated successfully.' };
    }

    async updateStatus(userId: number, body: UpdateStatusDto): Promise<{ message: string }> {
        //=============================================
        let currentUser: User;
        try {
            currentUser = await User.findByPk(userId);
        } catch (error) {
            throw new BadRequestException('Something went wrong! Please try again later.', 'Error Query');
        }

        if (!currentUser) {
            throw new BadRequestException('Invalid user_id');
        }

        //=============================================
        // Convert is_active to `1` or `0` based on `true` or `false`
        const updatedStatus = body.is_active ? 1 : 0;

        // Prepare the body with the modified status
        const updateData = {
            is_active: updatedStatus
        };

        try {
            await User.update(updateData, {
                where: { id: userId }
            });
        } catch (error) {
            throw new BadRequestException('Something went wrong! Please try again later.', 'Error Update');
        }

        //=============================================
        return { message: 'Status has been updated successfully.' };
    }

}