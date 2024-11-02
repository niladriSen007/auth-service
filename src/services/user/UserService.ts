import { Repository } from 'typeorm';
import { User } from '../../entity/User';
import { UserData } from '../../types';

export class UserService {
    constructor(private readonly userRepository: Repository<User>) {}
    async registerUser({ firstName, lastName, email, password }: UserData) {
        await this.userRepository.save({
            firstName,
            lastName,
            email,
            password,
        });
    }
}
