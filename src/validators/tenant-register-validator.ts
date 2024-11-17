import { checkSchema } from 'express-validator';

export default checkSchema({
    name: {
        trim: true,
        errorMessage: 'Tenant name is required',
        notEmpty: true,
    },
    address: {
        trim: true,
        errorMessage: 'Address is required',
        isLength: {
            options: { min: 10 },
            errorMessage: 'Address should be at least 10 chars',
        },
        notEmpty: true,
    },
});
