import { checkSchema } from 'express-validator';
import { UpdateUserData } from '../types';

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
    role: {
        errorMessage: 'Role is required!',
        notEmpty: true,
        trim: true,
    },
    tenantId: {
        errorMessage: 'TenantId is required!',
        trim: true,
        custom: {
            options: (value: string, { req }) => {
                const role = (req as UpdateUserData).body.role;
                console.log(req.body, 'tenant', typeof value);
                if (role.includes('ADMIN')) return true;
                else return !!value;
            },
        },
    },
});
