import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import fs from 'fs';
import createHttpError from 'http-errors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import { Logger } from 'winston';
import { UserService } from '../../services/user/UserService';
import { UserRegisterRequest } from '../../types';
import { Config } from '../../config';

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

            const user = await this.userService.registerUser({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info('User registered successfully');

            let privateKey: Buffer;
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, '../../../certs/private.pem'),
                );
            } catch (error) {
                this.logger.error('Error reading private key', { error });
                next(createHttpError(500, 'Error reading private key'));
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                email: user.email,
            };
            const token = jwt.sign(payload, privateKey, {
                expiresIn: '1h',
                algorithm: 'RS256',
                issuer: 'auth-service',
            });

            const accessToken = token;
            /*  console.log(accessToken); */
            const refreshToken = jwt.sign(
                payload,
                Config.REFRESH_TOKEN_SECRET!,
                {
                    algorithm: 'HS256',
                    expiresIn: '1y',
                    issuer: 'auth-service',
                },
            );

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                httpOnly: true,
                maxAge: 1000 * 60 * 60,
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'strict',
                domain: 'localhost',
                maxAge: 1000 * 60 * 60 * 24 * 365,
            });

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
