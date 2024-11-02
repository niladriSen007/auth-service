import { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source';
import { User } from '../../entity/User';

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface UserRegisterRequest extends Request {
    body: UserData;
}

export class AuthController {
    async register(req: UserRegisterRequest, res: Response) {
        if (
            !req?.body.firstName ||
            !req?.body.lastName ||
            !req?.body.email ||
            !req?.body.password
        ) {
            return res
                .status(400)
                .json({ message: 'All input fields are required' });
        }
        const { firstName, lastName, email, password } = req.body;

        const userRepo = AppDataSource.getRepository(User);
        await userRepo.save({
            firstName,
            lastName,
            email,
            password,
        });
        res.status(201).json({
            message: 'User registered successfully',
        });
    }
}
