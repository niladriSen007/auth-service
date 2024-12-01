import { checkSchema } from 'express-validator';

export default checkSchema(
    {
        q: {
            trim: true,
            customSanitizer: {
                options: (value) => {
                    return value ?? '';
                },
            },
        },
        currentPage: {
            customSanitizer: {
                options: (value) => {
                    return isNaN(Number(value)) ? 1 : Number(value);
                },
            },
        },
        limit: {
            customSanitizer: {
                options: (value) => {
                    return isNaN(Number(value)) ? 3 : Number(value);
                },
            },
        },
    },
    ['query'],
);
