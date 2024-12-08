import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import 'reflect-metadata';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import authRouter from './routes/auth/auth';
import tenantRouter from './routes/tenant/tenant';
import userRouter from './routes/user/user';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const app: any = express();

app.use(
    cors({
        origin: ['http://localhost:5173'],
        credentials: true,
    }),
);
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json());

//Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tenants', tenantRouter);
app.use('/api/v1/users', userRouter);

//Global error handler
app.use(globalErrorHandler);

export default app;
