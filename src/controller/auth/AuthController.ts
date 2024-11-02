import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
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
        const result = validationResult(req);
        if (!result.isEmpty()) {
            this.logger.error('Validation error', {
                errors: result.array(),
            });
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, email } = req.body;
        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: '********',
        });
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
