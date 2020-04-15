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
    globalTeardown: path.join(__dirname, './scripts/jest-global-teardown'),
    setupFiles: [
        require.resolve('jest-webextension-mock'),
        require.resolve('fake-indexeddb/auto'),
        path.join(__dirname, './scripts/jest-setup.js'),
    ],
    // skip packages other than 'ts-results', 'async-call-rpc' and 'holoflows/kit'
    transformIgnorePatterns: [],
    transform: {
        'node_modules.+(ts-results|async-call-rpc|holoflows).+.js$': 'jest-esm-transformer',
    },
    moduleNameMapper: {
        'lodash-es': require.resolve('lodash'),
        'idb/with-async-ittr-cjs': require.resolve('idb/with-async-ittr-cjs.js'),
    },
}
