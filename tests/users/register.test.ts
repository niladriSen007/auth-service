/* eslint-disable @typescript-eslint/no-unsafe-argument */
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/entity/enum/Roles';

describe('POST /auth/register', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        /* await truncateTables(dataSource); */
        await dataSource.dropDatabase();
        await dataSource.synchronize();
    });

    /*  afterAll(async () => {
        await dataSource.destroy();
    }); */

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
                email: 'nil@1.com',
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
                email: 'nil@1.com',
                password: '1',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.body).toHaveProperty('message');
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
                email: 'nil@1.com',
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
                email: 'nil@1.com',
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
            expect(users[0].email).toEqual('nil@1.com');
            expect(users[0].firstName).toEqual('Niladri');
            expect(users[0].lastName).toEqual('Sen');
        });

        it('Should have a specific CUSTOMER role for the user', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Niladri',
                lastName: 'Sen',
                email: 'nil@1.com',
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
            expect(users[0]).toHaveProperty('roles');
            expect(users[0].roles).toContain(Roles.CUSTOMER);
        });

        it('Should store the password as hashed format in the database', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Niladri',
                lastName: 'Sen',
                email: 'nil@1.com',
                password: '1',
            };
            //Act

            await request(app).post('/auth/register').send(userData);

            //Assert
            const userRepo = dataSource.getRepository(User);
            const users = await userRepo.find();
            /* console.log(users[0].password); */
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it("Should return status 400 if the user's email is already registered", async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Niladri',
                lastName: 'Sen',
                email: 'nil@1.com',
                password: '1',
            };
            const userRepo = dataSource.getRepository(User);
            await userRepo.save(userData);
            const users = await userRepo.find();

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });

    describe('Some input fields are not filled properly', () => {
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
            const userRepo = dataSource.getRepository(User);
            const users = await userRepo.find();
            //Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });

    describe("Fields are not in the correct format or don't meet the requirements", () => {
        it('Should trim the email field', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Niladri',
                lastName: 'Sen',
                email: '   nil@1.com   ',
                password: '1',
            };
            //Act
            await request(app).post('/auth/register').send(userData);
            //Assert
            const userRepo = dataSource.getRepository(User);
            const users = await userRepo.find();
            expect(users[0]?.email).toEqual('nil@1.com');
        });

        it("Should return status 400 if the email field doesn't meet the email format", async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Niladri',
                lastName: 'Sen',
                email: 'nil1com',
                password: '1',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const userRepo = dataSource.getRepository(User);
            const users = await userRepo.find();
            //Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
});
