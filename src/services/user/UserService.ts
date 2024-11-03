import createHttpError from 'http-errors';
import { Repository } from 'typeorm';
import { User } from '../../entity/User';
import { UserData } from '../../types';
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
