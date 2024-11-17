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
                500,
                'Failed to store the data in the database',
            );
        }
    }
}
