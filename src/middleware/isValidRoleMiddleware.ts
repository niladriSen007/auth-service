import { NextFunction, Response } from 'express';
import createHttpError from 'http-errors';
import { AuthRequest } from '../types';

export const isValidRoleMiddleware = (roles: string[] = []) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const { roles: currentUserRoles } = req.auth;
        if (!currentUserRoles?.length) {
            return res.status(403).json({
                message: 'User is not authorized roles to do the action',
            });
        }
        if (roles?.some((role) => role === currentUserRoles)) {
            next();
        } else {
            next(
                createHttpError(
                    403,
                    'User is not authorized roles to do the action',
                ),
            );
        }
    };
};
