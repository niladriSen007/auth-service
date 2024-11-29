import { checkSchema } from 'express-validator';

export default checkSchema(
    {
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
                    return isNaN(Number(value)) ? 6 : Number(value);
                },
            },
        },
    },
    ['query'],
);
