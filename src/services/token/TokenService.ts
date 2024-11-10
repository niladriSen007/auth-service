import fs from 'fs';
import createHttpError from 'http-errors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import { Repository } from 'typeorm';
import { Config } from '../../config';
import { RefreshToken } from '../../entity/RefreshToken';
import { User } from '../../entity/User';
export class TokenService {
    constructor(
        private readonly refreshTokenRepository: Repository<RefreshToken>,
    ) {}

    generateAccessToken(payload: JwtPayload) {
        let privateKey: Buffer;
        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, '../../../certs/private.pem'),
            );
        } catch (err) {
            const error = createHttpError(500, 'Error reading private key');
            throw error;
        }
        const token = jwt.sign(payload, privateKey, {
            expiresIn: '1h',
            algorithm: 'RS256',
            issuer: 'auth-service',
        });
        return token;
    }

    generateRefreshToken(payload: JwtPayload) {
        return jwt.sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: String(payload.id),
        });
    }

    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
        return await this.refreshTokenRepository.save({
            user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });
    }
}
