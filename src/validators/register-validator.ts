 
import { body } from 'express-validator';

export default [
    body('email').isString().notEmpty().withMessage('Email is required').trim(),
    body('password').isString().notEmpty().withMessage('Password is required'),
    body('firstName')
        .isString()
        .notEmpty()
        .withMessage('First name is required'),
    body('lastName').isString().notEmpty().withMessage('Last name is required'),
];

/* export default checkSchema({
  email: {
    errorMessage: 'Email is required',
    isEmail: true,
    notEmpty: true,
  },
  password: {
    isLength: {
      options: { min: 1 },
      errorMessage: 'Password should be at least 1 chars',
    },
    isString: true,
    notEmpty: true,
  },
  firstName: {
    isLength: {
      options: { min: 1 },
      errorMessage: 'First name should be at least 1 chars',
    },

  },
  lastName: {
    isLength: {
      options: { min: 1 },
      errorMessage: 'Last name should be at least 1 chars',
    },
  },
}); */
