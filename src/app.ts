import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { logger } from './config/logger';
import authRouter from './routes/auth/auth';
import tenantRouter from './routes/tenant/tenant';
import userRouter from './routes/user/user';
import cookieParser from 'cookie-parser';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const app: any = express();

app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json());

//Routes
app.use('/auth', authRouter);
app.use('/tenants', tenantRouter);
app.use('/users', userRouter);

//Global error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    logger.error(err);
    const status = err?.status || err?.statusCode || 500;

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
