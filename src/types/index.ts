import { RefreshToken } from './../entity/RefreshToken';
import { Request } from 'express';
import { Roles } from '../entity/enum/Roles';
import { User } from '../entity/User';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface UserLoginData {
    email: string;
    password: string;
}

export interface UserRegisterRequest extends Request {
    body: UserData;
}

export interface UserLoginRequest extends Request {
    body: UserLoginData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        roles?: Roles[];
        email?: string;
        id?: number;
    };
}

export interface Cookie {
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenPayload {
    id: string;
}

export interface RefreshTokenTypes {
    user: User;
    expiresAt: Date;
    id?: number;
}
