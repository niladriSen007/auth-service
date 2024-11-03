import { body } from 'express-validator';

export default [
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
