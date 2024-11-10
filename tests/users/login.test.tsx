/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/entity/enum/Roles';
describe('POST /auth/login', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        /* await truncateTables(dataSource); */
        await dataSource.dropDatabase();
        await dataSource.synchronize();
    });

    /* afterAll(async () => {
       await dataSource.destroy();
   }); */

    describe('All input fields are properly filled', () => {
        it('should return 200 status code', async () => {
            const userData = {
                firstName: 'Niladri',
                lastName: 'Sen',
                email: 'n@1.com',
                password: '1',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepo = dataSource.getRepository(User);
            await userRepo.save({
                ...userData,
                password: hashedPassword,
                roles: [Roles.CUSTOMER],
            });

            const response = await request(app)
                .post('/auth/login')
                .send(userData);

            expect(response.statusCode).toBe(200);
        });
    });
});
