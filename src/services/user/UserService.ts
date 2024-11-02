import createHttpError from 'http-errors';
import { Repository } from 'typeorm';
import { User } from '../../entity/User';
import { UserData } from '../../types';

export class UserService {
    constructor(private readonly userRepository: Repository<User>) {}
    async registerUser({ firstName, lastName, email, password }: UserData) {
        try {
            await this.userRepository.save({
                firstName,
                lastName,
                email,
                password,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store the data in the database',
            );
            throw error;
        }
    }
}
