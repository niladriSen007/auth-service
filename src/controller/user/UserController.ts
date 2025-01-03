import { Logger } from 'winston';
import { UserService } from '../../services/user/UserService';
import { NextFunction, Request, Response } from 'express';
import {
    PaginationQueryPrams,
    UpdateUserData,
    UserRegisterRequest,
} from '../../types';
import { matchedData, validationResult } from 'express-validator';
import { Roles } from '../../entity/enum/Roles';
import createHttpError from 'http-errors';
import { TokenService } from '../../services/token/TokenService';

export class UserController {
    constructor(
        private readonly logger: Logger,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
    ) {}

    async createUsers(
        req: UserRegisterRequest,
        res: Response,
        next: NextFunction,
    ) {
        this.logger.info('Creating users');
        const result = validationResult(req);
        if (!result.isEmpty()) {
            this.logger.error('Validation error', {
                errors: result.array(),
            });
            return next(
                createHttpError(
                    400,
                    'Validation error',
                    result.array()?.at(0)?.msg as string,
                ),
            );
            /*             return res.status(400).json({ errors: result.array() });
             */
        }
        try {
            const { firstName, lastName, email, password, tenantId } = req.body;
            this.logger.debug('New request to register a user', {
                firstName,
                lastName,
                email,
                password: '********',
            });

            const user = await this.userService.registerUser({
                firstName,
                lastName,
                email,
                password,
                tenantId,
                role: Roles.MANAGER,
            });
            this.logger.info('Manager registered successfully');
            res.status(201).json({
                user: {
                    ...user,
                    password: '********',
                },
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        this.logger.info('Getting users');
        const validatedQuery = matchedData(req, {
            onlyValidData: true,
        });
        /*         console.log(validatedQuery,"validatedQuery")
         */ try {
            const [users, count] = await this.userService.getUsers(
                validatedQuery as PaginationQueryPrams,
            );
            res.status(200).json({
                users,
                count,
                currentPage: validatedQuery.currentPage as number,
                limit: validatedQuery.limit as number,
                totalPageCount: Math.ceil(
                    count / (validatedQuery.limit as number),
                ),
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        this.logger.info('Getting user');
        try {
            const userId = req.params.id;
            const user = await this.userService.getUserById(Number(userId));
            res.status(200).json({ user });
        } catch (error) {
            next(error);
            return;
        }
    }

    async updateUser(req: UpdateUserData, res: Response, next: NextFunction) {
        this.logger.info('Updating user');
        const result = validationResult(req);
        if (!result.isEmpty()) {
            this.logger.error('Validation error', {
                errors: result.array(),
            });
            return next(
                createHttpError(
                    400,
                    'Validation error',
                    result.array()?.at(0)?.msg as string,
                ),
            );
            /*             return res.status(400).json({ errors: result.array() });
             */
        }
        try {
            const { firstName, lastName, email, role, tenantId } = req.body;
            const id = req.params.id;
            this.logger.debug('New request to update a user', {
                id,
                firstName,
                lastName,
                email,
                roles: role,
                tenantId,
            });

            const user = await this.userService.updateUser(Number(id), {
                firstName,
                lastName,
                email,
                role,
                tenantId,
            } as UpdateUserData);
            this.logger.info('User updated successfully');
            res.status(200).json({
                user: {
                    ...user,
                },
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        this.logger.info('Deleting user');
        try {
            const userId = req.params.id;
            await this.userService.deleteUser(Number(userId));
            res.status(204).send({ message: 'User deleted successfully' });
        } catch (error) {
            next(error);
            return;
        }
    }
}
