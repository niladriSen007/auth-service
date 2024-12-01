import { NextFunction, Request, Response } from 'express';
import { matchedData, validationResult } from 'express-validator';
import { Logger } from 'winston';
import { TenantService } from '../../services/tenant/TenantService';
import { PaginationQueryPrams, TenantRegisterRequest } from '../../types';
import createHttpError from 'http-errors';

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
            return next(
                createHttpError(
                    400,
                    'Validation error',
                    result.array()?.at(0)?.msg as string,
                ),
            );
            /*             return res.status(400).json({ errors: result.array() });
             */
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

    async getTenants(req: Request, res: Response, next: NextFunction) {
        this.logger.info('Getting tenants');
        const validatedQuery = matchedData(req, {
            onlyValidData: true,
        });
        try {
            const [tenants, count] = await this.tenantService.getTenants(
                validatedQuery as PaginationQueryPrams,
            );
            res.status(200).json({
                tenants,
                count,
                currentPage: validatedQuery.currentPage as number,
                limit: validatedQuery.limit as number,
                totalPageCount: Math.ceil(
                    count / (validatedQuery.limit as number),
                ),
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getTenant(req: Request, res: Response, next: NextFunction) {
        this.logger.info('Getting tenant');
        try {
            const tenantId = req.params.id;
            const tenant = await this.tenantService.getTenant(Number(tenantId));
            res.status(200).json({ tenant });
        } catch (error) {
            next(error);
            return;
        }
    }

    async updateTenant(
        req: TenantRegisterRequest,
        res: Response,
        next: NextFunction,
    ) {
        this.logger.info('Updating tenant');
        const result = validationResult(req);

        if (!result.isEmpty()) {
            this.logger.error('Validation error', {
                errors: result.array(),
            });
            return next(
                createHttpError(
                    400,
                    'Validation error',
                    result.array()?.at(0)?.msg as string,
                ),
            );
            /*             return res.status(400).json({ errors: result.array() });
             */
        }
        try {
            const tenantId = req.params.id;
            const { name, address } = req.body;
            this.logger.debug('New request to update a tenant', {
                tenantId,
                name,
                address,
            });

            await this.tenantService.updateTenant(Number(tenantId), {
                name,
                address,
            });
            res.status(200).json({
                message: 'Tenant updated successfully',
                tenant: await this.tenantService.getTenant(Number(tenantId)),
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async deleteTenant(req: Request, res: Response, next: NextFunction) {
        this.logger.info('Deleting tenant');
        try {
            const tenantId = req.params.id;
            this.logger.debug('New request to delete a tenant', {
                tenantId,
            });

            await this.tenantService.deleteTenant(Number(tenantId));
            res.status(200).json({
                message: 'Tenant deleted successfully',
            });
        } catch (error) {
            next(error);
            return;
        }
    }
}
