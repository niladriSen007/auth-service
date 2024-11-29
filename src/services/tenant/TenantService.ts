import { Repository } from 'typeorm';
import { Logger } from 'winston';
import { Tenant } from '../../entity/Tenant';
import createHttpError from 'http-errors';
import { TenantData } from '../../types';

export class TenantService {
    constructor(
        private readonly logger: Logger,
        private readonly tenantRepository: Repository<Tenant>,
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

    async getTenants() {
        try {
            this.logger.info('Getting tenants');
            return await this.tenantRepository.find({
                relations: ['users'],
            });
        } catch (error) {
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
            });

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
