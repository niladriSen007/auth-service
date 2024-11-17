/* eslint-disable @typescript-eslint/no-unsafe-argument */
import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/entity/enum/Roles';
describe('GET /auth/self', () => {
    let dataSource: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:9001');
        dataSource = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        /* await truncateTables(dataSource); */
        jwks.start();
        await dataSource.dropDatabase();
        await dataSource.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    describe('All input fields are properly filled', () => {
        it('should return 200 status code', async () => {
            const accessToken = jwks.token({
                sub: String(1),
                email: 'n@1.com',
                roles: [Roles.CUSTOMER],
            });
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it('should return the user details', async () => {
            const userData = {
                firstName: 'Niladri',
                lastName: 'Sen',
                email: 'nil@1.com',
                password: '1',
            };

            const userRepo = dataSource.getRepository(User);
            const newUser = await userRepo.save({
                ...userData,
                roles: [Roles.CUSTOMER],
            });

            //generate token
            const accessToken = jwks.token({
                sub: String(newUser.id),
                email: newUser.email,
                roles: newUser.roles,
            });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send();

            //check if user id matches with registered user id
            expect((response.body as Record<string, string>).id).toBe(newUser);
        });
    });
});
