module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom-fourteen',
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
    setupFiles: [require.resolve('react-app-polyfill/jsdom')],
}
