module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: [
        'google',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        // 'plugin:prettier/recommended',
    ], // we can also use default one -> 'plugin:@typescript-eslint/recommended'
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'prettier'],
    rules: {
        // 'prettier/prettier': 'error
        camelcase: 2,
        // '@typescript-eslint/camelCase': ['error', { properties: 'never' }],
        '@typescript-eslint/class-name-casing': [
            'error',
            { allowUnderscorePrefix: true },
        ],
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-types': [
            'error',
            {
                types: {
                    Object: 'Use {} instead.',
                    String: "Use 'string' instead.",
                    Number: "Use 'number' instead.",
                    Boolean: "Use 'boolean' instead.",
                },
            },
        ],
        'no-empty-function': 'off',
        '@typescript-eslint/no-empty-function': ['error'],
        // '@typescript-eslint/no-empty-inteface': [
        //     'error',
        //     {
        //         allowSingleExtends: false,
        //     },
        // ],
        // '@typescript-eslint/no-promise-floating': 'error',
        '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
        '@typescript-eslint/no-misused-new': ['error'],
        '@typescript-eslint/prefer-for-of': ['error'],
        'require-jsdoc': 1,
    },
};