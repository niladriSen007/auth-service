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
    async registerUser({
        firstName,
        lastName,
        email,
        password,
        role,
    }: UserData) {
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
                roles: [role!],
                password: hashedPassword,
            });
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : 'Unknown error';
            const error = createHttpError(
                500,
                `Failed to store the data in the database - ${errorMessage}`,
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

    async getUsers() {
        return await this.userRepository.find();
    }

    async updateUser(id: number, data: UserData) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            const error = createHttpError(400, 'User not found');
            throw error;
        }
        await this.userRepository.update(id, data);
        return await this.userRepository.findOne({
            where: { id },
        });
    }

    async deleteUser(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            const error = createHttpError(400, 'User not found');
            throw error;
        }
        await this.userRepository.delete(id);
    }
}
