import { expressjwt } from 'express-jwt';
import { Config } from '../config';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { Cookie, RefreshTokenPayload } from '../types';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import createHttpError from 'http-errors';
import { logger } from '../config/logger';

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken: (req: Request) => {
        /*     console.log(req.cookies);
         */ const { refreshToken } = req.cookies as Cookie;
        return refreshToken;
    },
    async isRevoked(req: Request, token) {
        /*       console.log(token,"token")
         */ try {
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: Number((token?.payload as RefreshTokenPayload)?.id),
                    user: {
                        id: Number(token?.payload?.sub),
                    },
                },
            });
            return refreshToken === null;
        } catch (error) {
            logger.error('Error validating refresh token', error);
        }
        return true;
    },
});
