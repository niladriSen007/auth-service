// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        ignores: [
            'node_modules',
            'dist',
            'eslint.config.mjs',
            'jest.config.js',
            'coverage',
        ],
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            /*   'dot-notation': 'error',
            'no-console': 'error', */
            '@typescript-eslint/no-misused-promises': 'off',
        },
    },
);
