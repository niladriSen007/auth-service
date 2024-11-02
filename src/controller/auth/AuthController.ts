import { Response } from 'express';
import { UserService } from '../../services/user/UserService';
import { UserRegisterRequest } from '../../types';

export class AuthController {
    constructor(private readonly userService: UserService) {}
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

        await this.userService.registerUser({
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
