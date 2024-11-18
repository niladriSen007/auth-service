import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import { AppDataSource } from '../../config/data-source';
import { logger } from '../../config/logger';
import { UserController } from '../../controller/user/UserController';
import { Roles } from '../../entity/enum/Roles';
import { User } from '../../entity/User';
import authentication from '../../middleware/authentication';
import { isValidRoleMiddleware } from '../../middleware/isValidRoleMiddleware';
import { HelperService } from '../../services/helper/HelperService';
import { UserService } from './../../services/user/UserService';
import registerValidator from '../../validators/register-validator';
import { UpdateUserData } from '../../types';
import updateUserValidator from '../../validators/update-user-validator';
const router = express.Router();

const helperService = new HelperService();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository, helperService);
const userController = new UserController(logger, userService);

router.post(
    '/register',
    authentication as RequestHandler,
    isValidRoleMiddleware([Roles.ADMIN]) as RequestHandler,
    registerValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.createUsers(req, res, next);
    },
);

router.get(
    '/getAllUsers',
    authentication as RequestHandler,
    isValidRoleMiddleware([Roles.ADMIN]) as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.getAllUsers(req, res, next);
    },
);

router.get(
    '/:id',
    authentication as RequestHandler,
    isValidRoleMiddleware([Roles.ADMIN]) as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.getUserById(req, res, next);
    },
);

router.patch(
    '/:id',
    authentication as RequestHandler,
    isValidRoleMiddleware([Roles.ADMIN]) as RequestHandler,
    updateUserValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.updateUser(req as UpdateUserData, res, next);
    },
);

router.delete(
    '/:id',
    authentication as RequestHandler,
    isValidRoleMiddleware([Roles.ADMIN]) as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.deleteUser(req, res, next);
    },
);

export default router;
