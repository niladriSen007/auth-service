import { TokenService } from './../../services/token/TokenService';
import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import { AuthController } from '../../controller/auth/AuthController';
import { UserService } from '../../services/user/UserService';
import { AppDataSource } from '../../config/data-source';
import { User } from '../../entity/User';
import { logger } from '../../config/logger';
import { HelperService } from '../../services/helper/HelperService';
import registerValidator from '../../validators/register-validator';
import { RefreshToken } from '../../entity/RefreshToken';
import loginValidator from '../../validators/login-validator';
import authentication from '../../middleware/authentication';
import { AuthRequest, UserData, UserRegisterRequest } from '../../types';
import validateRefreshTokens from '../../middleware/validateRefreshTokens';
import parseRefreshToken from '../../middleware/parseRefreshToken';
import { TenantService } from '../../services/tenant/TenantService';
import { Tenant } from '../../entity/Tenant';

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

router.post(
    '/register',
    registerValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        (await authController.register(
            req as UserRegisterRequest,
            res,
            next,
        )) as unknown as RequestHandler;
    },
);

router.post(
    '/login',
    loginValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        (await authController.login(
            req,
            res,
            next,
        )) as unknown as RequestHandler;
    },
);

router.get(
    '/self',
    authentication as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        (await authController.self(
            req as AuthRequest,
            res,
            next,
        )) as unknown as RequestHandler;
    },
);

router.post(
    '/refresh',
    validateRefreshTokens as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        (await authController.refresh(
            req as AuthRequest,
            res,
            next,
        )) as unknown as RequestHandler;
    },
);

router.post(
    '/logout',
    authentication as RequestHandler,
    parseRefreshToken as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        (await authController.logout(
            req as AuthRequest,
            res,
            next,
        )) as unknown as RequestHandler;
    },
);

export default router;
