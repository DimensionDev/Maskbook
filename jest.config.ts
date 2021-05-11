import type { Config } from '@jest/types'
import { resolve } from 'path'

const options: Config.InitialOptions = {
    testRegex: ['/__tests__/.*\\.[jt]sx?$'],
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom-fourteen',
    globals: {
        'ts-jest': { isolatedModules: true },
    },
    globalTeardown: resolve(__dirname, 'scripts', 'jest-global-teardown'),
    setupFiles: [
        require.resolve('jest-webextension-mock'),
        require.resolve('fake-indexeddb/auto'),
        resolve(__dirname, 'scripts', 'jest-setup.js'),
    ],
    transformIgnorePatterns: [
        // skip packages other than 'holoflows/kit'
    ],
    transform: {
        'node_modules.+(holoflows).+.js$': 'jest-esm-transformer',
    },
    moduleNameMapper: {
        'lodash-es': require.resolve('lodash'),
        'idb/with-async-ittr-cjs': require.resolve('idb/with-async-ittr-cjs.js'),
    },
}

export default options
