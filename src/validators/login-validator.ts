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
    password: {
        trim: true,
        errorMessage: 'Password is required',
        isLength: {
            options: { min: 1 },
            errorMessage: 'Password should be at least 1 chars',
        },
        notEmpty: true,
    },
});
