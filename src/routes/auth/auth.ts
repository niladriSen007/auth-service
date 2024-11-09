import { TokenService } from './../../services/token/TokenService';
import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from '../../controller/auth/AuthController';
import { UserService } from '../../services/user/UserService';
import { AppDataSource } from '../../config/data-source';
import { User } from '../../entity/User';
import { logger } from '../../config/logger';
import { HelperService } from '../../services/helper/HelperService';
import registerValidator from '../../validators/register-validator';
import { RefreshToken } from '../../entity/RefreshToken';

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

export default router;
