import express, { Request, Response } from 'express';
import { AuthController } from '../../controller/auth/AuthController';
import { UserService } from '../../services/user/UserService';
import { AppDataSource } from '../../config/data-source';
import { User } from '../../entity/User';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService);

router.post('/register', async (req: Request, res: Response) => {
    await authController.register(req, res);
});

export default router;
