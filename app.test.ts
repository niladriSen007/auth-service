import app from './src/app';
import { calculateDiscount } from './src/utils';
import request from 'supertest';

describe('App', () => {
    it('should return correct discount', () => {
        expect(calculateDiscount(100, 0.1)).toBe(90);
    });

    it('should return status code 200', async () => {
        const response = await request(app).get('/').send();
        expect(response.statusCode).toBe(200);
    });
});
