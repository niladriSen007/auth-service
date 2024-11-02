import { NextFunction, Response } from 'express';
import { Logger } from 'winston';
import { UserService } from '../../services/user/UserService';
import { UserRegisterRequest } from '../../types';

export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
    ) {}
    async register(
        req: UserRegisterRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { firstName, lastName, email, password } = req.body;
        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: '********',
        });
        if (!firstName || !lastName || !email || !password) {
            return res
                .status(400)
                .json({ message: 'All input fields are required' });
        }
        try {
            const { firstName, lastName, email, password } = req.body;

            await this.userService.registerUser({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info('User registered successfully');
            res.status(201).json({
                message: 'User registered successfully',
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            next(err);
            return;
        }
    }
}
