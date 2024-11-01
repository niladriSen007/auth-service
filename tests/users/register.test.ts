import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/register', () => {
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
