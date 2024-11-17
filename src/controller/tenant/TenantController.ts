import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { Logger } from 'winston';
import { TenantService } from '../../services/tenant/TenantService';
import { TenantRegisterRequest } from '../../types';

export class TenantController {
    constructor(
        private readonly logger: Logger,
        private readonly tenantService: TenantService,
    ) {}

    async registerTenant(
        req: TenantRegisterRequest,
        res: Response,
        next: NextFunction,
    ) {
        this.logger.info('Registering tenant');
        const result = validationResult(req);

        if (!result.isEmpty()) {
            this.logger.error('Validation error', {
                errors: result.array(),
            });
            return res.status(400).json({ errors: result.array() });
        }
        try {
            const { name, address } = req.body;
            this.logger.debug('New request to register a tenant', {
                name,
                address,
            });

            const tenant = await this.tenantService.registerTenant({
                name,
                address,
            });
            res.status(201).json({
                message: 'Tenant registered successfully',
                tenant,
            });
        } catch (error) {
            next(error);
            return;
        }
    }
}
