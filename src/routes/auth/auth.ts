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
import { AuthRequest } from '../../types';
import validateRefreshTokens from '../../middleware/validateRefreshTokens';
import parseRefreshToken from '../../middleware/parseRefreshToken';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const helperService = new HelperService();
const userService = new UserService(userRepository, helperService);
const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController(userService, logger, tokenService);

router.post(
    '/register',
    registerValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        await authController.register(req, res, next);
    },
);

router.post(
    '/login',
    loginValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        await authController.login(req, res, next);
    },
);

router.get(
    '/self',
    authentication as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        await authController.self(req as AuthRequest, res, next);
    },
);

router.post(
    '/refresh',
    validateRefreshTokens as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        await authController.refresh(req as AuthRequest, res, next);
    },
);

router.post(
    '/logout',
    authentication as RequestHandler,
    parseRefreshToken as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        await authController.logout(req as AuthRequest, res, next);
    },
);

export default router;
