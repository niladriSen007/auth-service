import { Request } from 'express';
import { Roles } from '../entity/enum/Roles';

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
        roles: Roles[];
    };
}
