import createHttpError from 'http-errors';
import { Repository } from 'typeorm';
import { User } from '../../entity/User';
import { UserData, UserLoginData } from '../../types';
import { HelperService } from '../helper/HelperService';

export class UserService {
    constructor(
        private readonly userRepository: Repository<User>,
        private readonly helperService: HelperService,
    ) {}
    async registerUser({ firstName, lastName, email, password }: UserData) {
        //const existingUser = await this.userRepository.findOneBy({ email });
        //or
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            const error = createHttpError(400, 'User already exists');
            throw error;
        }
        const hashedPassword = await this.helperService.hashPassword(password);

        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store the data in the database',
            );
            throw error;
        }
    }

    async login({ email, password }: UserLoginData) {
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            const error = createHttpError(400, 'Invalid email or password');
            throw error;
        }
        const isPasswordValid: boolean =
            await this.helperService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            const error = createHttpError(400, 'Invalid email or password');
            throw error;
        }
        return user;
    }

    async getUserById(id: number) {
        return await this.userRepository.findOne({
            where: { id },
        });
    }
}
