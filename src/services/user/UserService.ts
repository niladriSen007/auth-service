import createHttpError from 'http-errors';
import { Brackets, Repository } from 'typeorm';
import { User } from '../../entity/User';
import {
    PaginationQueryPrams,
    UpdateUserData,
    UserData,
    UserLoginData,
} from '../../types';
import { HelperService } from '../helper/HelperService';
import { Roles } from '../../entity/enum/Roles';
import { TenantService } from '../tenant/TenantService';
import { Tenant } from '../../entity/Tenant';
import { TokenService } from '../token/TokenService';

export class UserService {
    constructor(
        private readonly userRepository: Repository<User>,
        private readonly helperService: HelperService,
        private readonly tenantService: TenantService,
        private readonly tenantRepository: Repository<Tenant>,
        private readonly tokenService: TokenService,
    ) {}
    async registerUser({
        firstName,
        lastName,
        email,
        password,
        tenantId,
        role,
    }: UserData) {
        //const existingUser = await this.userRepository.findOneBy({ email });
        //or
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            const error = createHttpError(400, 'User already exists');
            throw error;
        }
        const hashedPassword = await this.helperService.hashPassword(password);

        try {
            if (role === Roles.ADMIN) {
                return await this.userRepository.save({
                    firstName,
                    lastName,
                    email,
                    roles: [Roles?.ADMIN],
                    password: hashedPassword,
                });
            }
            if (tenantId) {
                return await this.userRepository.save({
                    firstName,
                    lastName,
                    email,
                    roles: [Roles?.MANAGER],
                    password: hashedPassword,
                    tenant: tenantId ? { id: tenantId } : undefined,
                });
            }
            console.log('User created', role);
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                roles: [Roles?.CUSTOMER],
                password: hashedPassword,
            });
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : 'Unknown error';
            const error = createHttpError(
                500,
                `Failed to store the data in the database - ${errorMessage}`,
            );
            throw error;
        }
    }

    async login({ email, password }: UserLoginData) {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: {
                tenant: true,
            },
        });
        if (!user) {
            const error = createHttpError(400, 'Invalid email or password');
            throw error;
        }
        const isPasswordValid: boolean =
            await this.helperService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            const error = createHttpError(400, 'Invalid email or password');
            throw error;
        }
        return user;
    }

    async getUserById(id: number) {
        return await this.userRepository.findOne({
            where: { id },
            select: ['id', 'firstName', 'lastName', 'email', 'roles', 'tenant'],
            relations: {
                tenant: true,
            },
        });
    }

    async getUsers(validatedQuery: PaginationQueryPrams) {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        const { limit, currentPage, q, role } = validatedQuery;

        if (q) {
            const searchTerm = `%${q}%`;
            /* queryBuilder.where(`user.firstName ILike :searchTerm`, { searchTerm })
            .orWhere(`user.lastName ILike :searchTerm`, { searchTerm })
            .orWhere(`user.email ILike :searchTerm`, { searchTerm }); */

            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(user.firstName, ' ', user.lastName) ILike :searchTerm",
                        { searchTerm },
                    ).orWhere('user.email ILike :searchTerm', { searchTerm });
                }),
            );
        }

        if (role) {
            queryBuilder.andWhere(`user.roles = :role`, { role });
        }

        const result = await queryBuilder
            .leftJoinAndSelect('user.tenant', 'tenant')
            .select([
                'user.id',
                'user.firstName',
                'user.lastName',
                'user.email',
                'user.roles',
                'tenant',
            ])
            .skip((currentPage - 1) * limit)
            .take(limit)
            .orderBy('user.id', 'DESC')
            .getManyAndCount();

        /* return { users, total }; */
        return result;
    }

    async updateUser(id: number, data: UpdateUserData) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            const error = createHttpError(400, 'User not found');
            throw error;
        }
        /*         console.log('data', data);
         */ await this.userRepository.update(id, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            roles: data.role ? data.role : user.roles,
            tenant: data.role?.includes(Roles.ADMIN)
                ? null
                : data?.tenantId
                  ? { id: data.tenantId }
                  : null,
        });
        return await this.userRepository.findOne({
            select: ['id', 'firstName', 'lastName', 'email', 'roles', 'tenant'],
            where: { id },
        });
    }

    async deleteUser(userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            const error = createHttpError(400, 'User not found');
            throw error;
        }
        const userRelatedTenant = user?.tenant;
        const refreshTokens = user?.refreshTokens;

        if (refreshTokens) {
            const demo = refreshTokens.map(async (token) => {
                await this.tokenService.deletePreviousRefreshTokens(token.id);
            });
            if (demo) {
                await Promise.all(demo);
            }
        }

        if (userRelatedTenant) {
            const tenant = await this.tenantService.getTenant(
                userRelatedTenant.id,
            );
            if (tenant) {
                tenant.users = tenant.users.filter(
                    (manager) => manager.id !== userId,
                );
            }
            await this.tenantRepository.save(tenant);
        }

        await this.userRepository.delete(userId);
    }
}
