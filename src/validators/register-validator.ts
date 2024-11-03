import { checkSchema } from 'express-validator';

/* export default [
    body('email').isString().withMessage('Email is required').notEmpty().trim(),
    body('password')
        .isString()
        .notEmpty()
        .withMessage('Password is required')
        .trim(),
    body('firstName')
        .isString()
        .notEmpty()
        .withMessage('First name is required')
        .trim(),
    body('lastName')
        .isString()
        .notEmpty()
        .withMessage('Last name is required')
        .trim(),
]; */

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
