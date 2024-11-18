import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        trim: true,
        errorMessage: 'Email is required',
        isEmail: {
            errorMessage: 'Invalid email format',
        },
        notEmpty: true,
    },
    firstName: {
        isLength: {
            options: { min: 1 },
            errorMessage: 'First name should be at least 1 chars',
        },
        notEmpty: true,
        trim: true,
    },
    lastName: {
        isLength: {
            options: { min: 1 },
            errorMessage: 'Last name should be at least 1 chars',
        },
        notEmpty: true,
        trim: true,
    },
});
