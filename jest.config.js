module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom-fourteen',
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
    setupFiles: [require.resolve('react-app-polyfill/jsdom')],
    moduleNameMapper: {
        '^@holoflows/kit.+$': require.resolve('@holoflows/kit/umd/index.js'),
        'lodash-es': require.resolve('lodash'),
    },
}
