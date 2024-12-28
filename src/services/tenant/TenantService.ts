import { Repository } from 'typeorm';
import { Logger } from 'winston';
import { Tenant } from '../../entity/Tenant';
import createHttpError from 'http-errors';
import { PaginationQueryPrams, TenantData } from '../../types';
import { User } from '../../entity/User';

export class TenantService {
    constructor(
        private readonly logger: Logger,
        private readonly tenantRepository: Repository<Tenant>,
        private readonly userRepository: Repository<User>,
    ) {}

    async registerTenant({ name, address }: TenantData) {
        try {
            this.logger.info('Registering tenant');
            const existingTenant = await this.tenantRepository.findOne({
                where: { name },
            });

            if (existingTenant) {
                throw createHttpError(400, 'Tenant already exists');
            }

            return await this.tenantRepository.save({
                name,
                address,
            });
        } catch (error) {
            throw createHttpError(
                403,
                'Failed to store the data in the database',
            );
        }
    }

    async getTenants(validatedQuery: PaginationQueryPrams) {
        const queryBuilder = this.tenantRepository.createQueryBuilder('tenant');
        const { limit, currentPage, q } = validatedQuery;
        try {
            this.logger.info('Getting tenants');
            if (q) {
                const searchTerm = `%${q}%`;
                queryBuilder.where((qb) => {
                    qb.where('tenant.name ILike :searchTerm', {
                        searchTerm,
                    }).orWhere('tenant.address ILike :searchTerm', {
                        searchTerm,
                    });
                });
            }
            const result = await queryBuilder
                .leftJoinAndSelect('tenant.users', 'users')
                .skip((currentPage - 1) * limit)
                .take(limit)
                .orderBy('tenant.id', 'ASC')
                .getManyAndCount();
            const allTenants = [
                ...result[0],
                {
                    id: '',
                    name: 'All',
                },
            ];
            console.log(result, 'result');
            return [allTenants, result[1] + 1];
        } catch (error) {
            console.log(error);
            throw createHttpError(
                403,
                'Failed to fetch the data from the database',
            );
        }
    }

    async getTenant(id: number) {
        try {
            this.logger.info('Getting tenant');
            const tenant = await this.tenantRepository.findOne({
                where: { id },
                relations: {
                    users: true,
                },
            });

            if (!tenant) {
                throw createHttpError(404, 'Tenant not found');
            }

            return tenant;
        } catch (error) {
            throw createHttpError(
                403,
                'Failed to fetch the data from the database',
            );
        }
    }

    async updateTenant(id: number, { name, address }: TenantData) {
        try {
            this.logger.info('Updating tenant');
            const tenant = await this.tenantRepository.findOne({
                where: { id },
            });

            if (!tenant) {
                throw createHttpError(404, 'Tenant not found');
            }

            return await this.tenantRepository.update(id, {
                name,
                address,
            });
        } catch (error) {
            throw createHttpError(
                403,
                'Failed to store the data in the database',
            );
        }
    }

    async deleteTenant(id: number) {
        try {
            this.logger.info('Deleting tenant');
            const tenant = await this.tenantRepository.findOne({
                where: { id },
                relations: {
                    users: true,
                },
            });

            const tenantManagers = tenant?.users;

            const unlinkMangersFromTenantsArray = tenantManagers?.map(
                async (manager) => {
                    manager.tenant = null;
                    await this.userRepository.save(manager);
                },
            );
            if (unlinkMangersFromTenantsArray) {
                await Promise.all(unlinkMangersFromTenantsArray);
            }

            console.log(tenantManagers, 'tenantManagers', tenant);

            if (!tenant) {
                throw createHttpError(404, 'Tenant not found');
            }

            return await this.tenantRepository.delete(id);
        } catch (error) {
            throw createHttpError(
                403,
                'Failed to delete the data from the database',
            );
        }
    }
}
