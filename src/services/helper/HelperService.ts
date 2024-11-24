import bcrypt from 'bcryptjs';
import { SALTROUNDS } from '../../constants';

export class HelperService {
    async hashPassword(password: string) {
        return await bcrypt.hash(password, SALTROUNDS);
    }
    async comparePassword(password: string, hashedPassword: string) {
        return await bcrypt.compare(password, hashedPassword);
    }
}
