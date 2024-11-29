import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';

import createHttpError from 'http-errors';
import { JwtPayload } from 'jsonwebtoken';
import { Logger } from 'winston';
import { User } from '../../entity/User';
import { TokenService } from '../../services/token/TokenService';
import { UserService } from '../../services/user/UserService';
import {
    AuthRequest,
    UserLoginRequest,
    UserRegisterRequest,
} from '../../types';

export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
        private readonly tokenService: TokenService,
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
        try {
            const { firstName, lastName, email, password, role } = req.body;
            console.log('New request to register a user', {
                firstName,
                lastName,
                email,
                password: '********',
                role,
            });

            const user = await this.userService.registerUser({
                firstName,
                lastName,
                email,
                password,
                role,
            });
            this.logger.info('User registered successfully');

            const payload: JwtPayload = {
                sub: String(user.id),
                email: user.email,
                roles: user.roles,
            };

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const accessToken = this.tokenService.generateAccessToken(payload);
            /*  console.log(accessToken); */
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

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
                user: {
                    ...user,
                    password: '********',
                },
                message: 'User registered successfully',
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            next(err);
            return;
        }
    }

    async login(req: UserLoginRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            this.logger.error('Validation error', {
                errors: result.array(),
            });
            return res.status(400).json({ errors: result.array() });
        }
        const { email, password } = req.body;
        this.logger.debug('New request to register a user', {
            email,
            password: '********',
        });

        try {
            const currentUser = await this.userService.login({
                email,
                password,
            });
            this.logger.info('User logged in successfully', {
                user: currentUser,
            });

            const payload: JwtPayload = {
                sub: String(currentUser.id),
                email: currentUser.email,
                roles: currentUser.roles,
            };

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(currentUser);

            this.createAndStoreTokens(
                payload,
                { ...newRefreshToken, id: String(newRefreshToken.id) },
                res,
            );

            this.logger.info('User logged in successfully', {
                id: currentUser.id,
            });

            res.status(200).json({
                user: {
                    ...currentUser,
                    password: '********',
                },
                message: 'User logged in successfully',
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async self(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.getUserById(
                Number(req?.auth?.sub),
            );
            return res.status(200).json({ ...user, password: '*********' });
        } catch (error) {
            next(error);
            return;
        }
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                email: req.auth.email,
                roles: req.auth.roles,
            };

            const currentUser = await this.userService.getUserById(
                Number(payload.sub),
            );

            if (!currentUser) {
                const error = createHttpError(
                    404,
                    'User with the token not found',
                );
                next(error);
                return;
            }

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(currentUser);

            //delete old refresh token
            await this.tokenService.deletePreviousRefreshTokens(
                Number(req?.auth?.id),
            );

            this.createAndStoreTokens(
                payload,
                { ...newRefreshToken, id: String(newRefreshToken.id) },
                res,
            );

            /* const accessToken = this.tokenService.generateAccessToken(payload);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

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
            }); */
            res.status(200).json({
                user: {
                    ...currentUser,
                    password: '********',
                },
                message: 'User refresh token created successfully',
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    createAndStoreTokens(
        payload: JwtPayload,
        newRefreshToken: {
            user: User;
            expiresAt: Date;
            id?: string;
        },
        res: Response,
    ) {
        const accessToken = this.tokenService.generateAccessToken(payload);

        const refreshToken = this.tokenService.generateRefreshToken({
            ...payload,
            id: String(newRefreshToken.id),
        });

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
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        console.log(req.auth);
        try {
            await this.tokenService.deletePreviousRefreshTokens(
                Number(req?.auth?.id),
            );
            this.logger.info('Token has been deleted successfully', {
                id: req.auth.id,
            });
            this.logger.info('User logged out successfully', {
                id: req.auth.sub,
            });

            res.clearCookie('accessToken', {
                domain: 'localhost',
                sameSite: 'strict',
                httpOnly: true,
            });

            res.clearCookie('refreshToken', {
                domain: 'localhost',
                sameSite: 'strict',
                httpOnly: true,
            });

            res.status(200).json({ message: 'User logged out successfully' });
        } catch (error) {
            next(error);
            return;
        }
        return true;
    }
}
