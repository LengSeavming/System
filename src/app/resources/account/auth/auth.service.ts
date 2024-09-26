// ===========================================================================>> Core Library
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';

// ===========================================================================>> Third Party Library
import * as bcrypt from 'bcryptjs';
import { DatabaseError, Op } from 'sequelize';

// ===========================================================================>> Costom Library
// Model
import Role from '@models/user/role.model';
import User from '@models/user/users.model';

import { JwtTokenGenerator, TokenGenerator } from '@app/shared/jwt/token';
import UserRoles from '@models/user/user_roles.model';
import { ActiveEnum } from 'src/app/enums/active.enum';

interface LoginPayload {
    username: string
    password: string
}

@Injectable()
export class AuthService {

    private tokenGenerator: TokenGenerator;
    constructor() {
        this.tokenGenerator = new JwtTokenGenerator();
    }

    async login(body: LoginPayload) {
        let user: User;
        try {
            user = await User.findOne({
                where: {
                    [Op.or]: [
                        { phone: body.username },
                        { email: body.username }
                    ],
                    is_active: ActiveEnum.ACTIVE
                },
                attributes: ['id', 'name', 'avatar', 'phone', 'email', 'password', 'created_at'
                ],
                include: [Role]
            });
        } catch (error) {
            console.error(error);
            if (error instanceof DatabaseError && error.message.includes('invalid identifier')) {
                throw new BadRequestException('Invalid input data or database error', 'Database Error');
            } else {
                throw new BadRequestException('Server database error', 'Database Error');
            }
        }
        if (!user) {
            throw new BadRequestException('Invalid credentials');
        }
        if (!user.roles.length) {
            throw new ForbiddenException('Cannot access. invalid role');
        }
        const isPasswordValid = await bcrypt.compare(body.password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid password', 'Password Error');
        }
        const token = this.tokenGenerator.getToken(user);

        // ===>> Prepare Response
        return {
            token: token,
            message: 'ចូលប្រព័ន្ធបានដោយជោគជ័យ'
        }
    }

    async switchDefaultRole(auth: User, role_id: number) {
        try {
            const userRole = await UserRoles.findOne({
                where: {
                    user_id: auth.id,
                    role_id: role_id
                }
            });

            if (!userRole) {
                throw new BadRequestException('The specified role is not associated with the user.');
            }

            if (userRole.is_default) {
                return {
                    message: 'This role is already set as default.',
                };
            }

            const transaction = await UserRoles.sequelize.transaction();
            try {
                await UserRoles.update(
                    { is_default: false },
                    {
                        where: {
                            user_id: auth.id,
                            is_default: true
                        },
                        transaction
                    }
                );

                await userRole.update(
                    { is_default: true },
                    { transaction }
                );

                await transaction.commit();
            } catch (updateError) {
                await transaction.rollback();
                throw new InternalServerErrorException('Failed to switch default role.');
            }

            const user = await User.findOne({
                where: {
                    id: auth.id,
                    is_active: ActiveEnum.ACTIVE
                },
                attributes: ['id', 'name', 'avatar', 'phone', 'email', 'password', 'created_at'
                ],
                include: [Role]
            });

            if (!user) {
                throw new InternalServerErrorException('Failed to retrieve updated user information.');
            }
            // Ensure roles are populated
            if (!user.roles || user.roles.length === 0) {
                throw new InternalServerErrorException('User roles are missing or not properly loaded.');
            }

            const token = this.tokenGenerator.getToken(user);

            return {
                token: token,
                message: 'User default role has been switched successfully.',
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException('An unexpected error occurred while switching the default role.');
        }
    }

}
