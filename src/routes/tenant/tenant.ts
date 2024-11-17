import express, { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source';
import { logger } from '../../config/logger';
import { AuthController } from '../../controller/auth/AuthController';
import { TenantController } from '../../controller/tenant/TenantController';
import { RefreshToken } from '../../entity/RefreshToken';
import { User } from '../../entity/User';
import { HelperService } from '../../services/helper/HelperService';
import { UserService } from '../../services/user/UserService';
import { TokenService } from './../../services/token/TokenService';
import { TenantService } from '../../services/tenant/TenantService';
import { Tenant } from '../../entity/Tenant';
import tenantRegisterValidator from '../../validators/tenant-register-validator';
import { TenantRegisterRequest } from '../../types';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const helperService = new HelperService();
const userService = new UserService(userRepository, helperService);
const tokenService = new TokenService(refreshTokenRepository);
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(logger, tenantRepository);
const authController = new AuthController(userService, logger, tokenService);
const tenantController = new TenantController(logger, tenantService);

router.post(
    '/',
    tenantRegisterValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        await tenantController.registerTenant(
            req as TenantRegisterRequest,
            res,
            next,
        );
    },
);

export default router;
