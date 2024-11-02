/* eslint-disable @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { truncateTables } from '../utils';
import { User } from '../../src/entity/User';

describe('POST /auth/register', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await truncateTables(dataSource);
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    describe('All input fields are properly filled', () => {
        it('Should return status 201', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Niladri',
                lastName: 'Sen',
                email: 'niladri@gmail.com',
                password: '1',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(201);
        });

        it('Should return valid json data', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Niladri',
                lastName: 'Sen',
                email: 'nil@1,com',
                password: '1',
            };

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            //Assert
            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'));
        });

        it('Should return valid response body', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Niladri',
                lastName: 'Sen',
                email: 'nil@1,com',
                password: '1',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect((response.body as Record<string, string>).message).toEqual(
                'User registered successfully',
            );
        });

        it('Should persist the user data in database', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Niladri',
                lastName: 'Sen',
                email: 'nil@1,com',
                password: '1',
            };
            //Act
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            //Assert
            const userRepo = dataSource.getRepository(User);
            const users = await userRepo.find();
            expect(users).toHaveLength(1);
        });

        it('Should have user with specific data', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Niladri',
                lastName: 'Sen',
                email: 'nil@1,com',
                password: '1',
            };
            //Act
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            //Assert
            const userRepo = dataSource.getRepository(User);
            const users = await userRepo.find();
            expect(users[0].email).toBe('nil@1,com');
            expect(users[0].firstName).toBe('Niladri');
            expect(users[0].lastName).toBe('Sen');
        });
    });

    describe.skip('Some input fields are not filled properly', () => {
        it('Should return status 400', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: '',
                lastName: '',
                email: '',
                password: '',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
        });
    });
});
