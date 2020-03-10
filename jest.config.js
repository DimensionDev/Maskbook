const path = require('path')

module.exports = {
    testRegex: ['/__tests__/.*\\.[jt]sx?$'],
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom-fourteen',
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
    globalSetup: path.join(__dirname, './scripts/jest-global-setup'),
    globalTeardown: path.join(__dirname, './scripts/jest-global-teardown'),
    setupFiles: [
        require.resolve('jest-webextension-mock'),
        require.resolve('fake-indexeddb/auto'),
        path.join(__dirname, './scripts/jest-setup.js'),
    ],
    // skip packages other than 'ts-results', 'async-call-rpc' and 'holoflows/kit'
    transformIgnorePatterns: ['node_modules((?!(ts-results|async-call-rpc|@holoflows\\/kit)).)*$'],
    transform: {
        '[/\\\\]node_modules[/\\\\].+\\.m?js$': 'jest-esm-transformer',
    },
    moduleNameMapper: {
        '^@holoflows/kit.+(?<!sleep)$': require.resolve('@holoflows/kit/umd/index.js'),
        'lodash-es': require.resolve('lodash'),
        'idb/with-async-ittr': require.resolve('idb/with-async-ittr-cjs.js'),
    },
}
