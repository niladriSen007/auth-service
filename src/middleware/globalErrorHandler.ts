import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';
import path from 'path';
export const globalErrorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const errorId = uuidv4();
    const status = err?.status || err?.statusCode || 500;

    const isProduction = process.env.NODE_ENV === 'prod';
    const errorMessage = isProduction ? 'Internal server error' : err.message;

    logger.error('Error occurred', {
        errorId,
        status,
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    res.status(status).json({
        errors: [
            {
                ref: errorId,
                type: err?.name,
                message: errorMessage,
                path: req.path,
                method: req.method,
                location: path.basename(__filename),
                stack: isProduction ? null : err.stack,
            },
        ],
    });
};
