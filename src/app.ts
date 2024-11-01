/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { NextFunction, Request, Response } from 'express';
import { logger } from './config/logger';
import createHttpError, { HttpError } from 'http-errors';
const app = express();

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    const error = createHttpError(500, 'Internal Server Error');
    /*  throw error; */
    /*  next(error);  */ //if the function is async then we will have to use this in express v4.0 but in v.5.0 we can use throw error
    res.status(200).send('Hello World');
});

//Global error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err?.message);
    const status = err?.status || 500;

    res.status(status).json({
        errors: [
            {
                type: err?.name,
                message: err?.message,
                path: '',
                location: '',
            },
        ],
    });
});

export default app;
