const path = require('path')
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom-fourteen',
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
    globalSetup: path.join(__dirname, './scripts/jest-global-setup'),
    setupFiles: [require.resolve('fake-indexeddb/auto'), path.join(__dirname, './scripts/jest-setup.js')],
    // skip packages other than 'ts-results' and 'async-call-rpc'
    transformIgnorePatterns: ['node_modules((?!(ts-results|async-call-rpc)).)*$'],
    transform: {
        '[/\\\\]node_modules[/\\\\].+\\.m?js$': 'jest-esm-transformer',
    },
    moduleNameMapper: {
        '^@holoflows/kit.+$': require.resolve('@holoflows/kit/umd/index.js'),
        'lodash-es': require.resolve('lodash'),
        'idb/with-async-ittr': require.resolve('idb/with-async-ittr-cjs.js'),
    },
}
