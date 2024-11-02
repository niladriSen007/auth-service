import { calculateDiscount } from './src/utils';

describe('App', () => {
    it('should return correct discount', () => {
        expect(calculateDiscount(100, 0.1)).toBe(90);
    });
});
