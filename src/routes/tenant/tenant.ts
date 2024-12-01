import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import { AppDataSource } from '../../config/data-source';
import { logger } from '../../config/logger';
import { AuthController } from '../../controller/auth/AuthController';
import { TenantController } from '../../controller/tenant/TenantController';
import { RefreshToken } from '../../entity/RefreshToken';
import { User } from '../../entity/User';
import { HelperService } from '../../services/helper/HelperService';
import { UserService } from '../../services/user/UserService';
import { TokenService } from '../../services/token/TokenService';
import { TenantService } from '../../services/tenant/TenantService';
import { Tenant } from '../../entity/Tenant';
import tenantRegisterValidator from '../../validators/tenant-register-validator';
import { TenantRegisterRequest } from '../../types';
import authentication from '../../middleware/authentication';

import { Roles } from '../../entity/enum/Roles';
import listTenantsValidator from '../../validators/list-tenants-validator';
import { isValidRoleMiddleware } from '../../middleware/isValidRoleMiddleware';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const helperService = new HelperService();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(
    logger,
    tenantRepository,
    userRepository,
);
const tokenService = new TokenService(refreshTokenRepository);
const userService = new UserService(
    userRepository,
    helperService,
    tenantService,
    tenantRepository,
    tokenService,
);
const authController = new AuthController(userService, logger, tokenService);
const tenantController = new TenantController(logger, tenantService);

router.post(
    '/',
    authentication as RequestHandler,
    isValidRoleMiddleware([Roles.ADMIN]) as RequestHandler,
    tenantRegisterValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        (await tenantController.registerTenant(
            req as TenantRegisterRequest,
            res,
            next,
        )) as unknown as RequestHandler;
    },
);

router.get(
    '/',
    listTenantsValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        (await tenantController.getTenants(
            req,
            res,
            next,
        )) as unknown as RequestHandler;
    },
);

router.get(
    '/:id',
    authentication as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        (await tenantController.getTenant(
            req,
            res,
            next,
        )) as unknown as RequestHandler;
    },
);

router.patch(
    '/:id',
    authentication as RequestHandler,
    isValidRoleMiddleware([Roles.ADMIN]) as RequestHandler,
    tenantRegisterValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        (await tenantController.updateTenant(
            req as TenantRegisterRequest,
            res,
            next,
        )) as unknown as RequestHandler;
    },
);

router.delete(
    '/:id',
    authentication as RequestHandler,
    isValidRoleMiddleware([Roles.ADMIN]) as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        (await tenantController.deleteTenant(
            req,
            res,
            next,
        )) as unknown as RequestHandler;
    },
);

export default router;
