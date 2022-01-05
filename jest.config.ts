/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
import type { InitialOptionsTsJest } from 'ts-jest/dist/types'
import { defaultsESM as tsjPreset } from 'ts-jest/presets'

Error.stackTraceLimit = Infinity
const config: InitialOptionsTsJest = {
    transform: {
        ...tsjPreset.transform,
    },
    globals: {
        'ts-jest': {
            useESM: true,
            isolatedModules: true,
        },
    },
    cacheDirectory: './node_modules/.cache/jest/',
    clearMocks: true,
    coverageProvider: 'v8',
    testMatch: ['**/tests/**/*.[jt]s?(x)'],
    modulePathIgnorePatterns: ['dist'],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        '@masknet/shared-base': '<rootDir>/packages/shared-base/src/index.ts',
        'jest-websocket-mock': '<rootDir>/packages/web3-shared/base/node_modules/jest-websocket-mock',
        'reconnecting-websocket': '<rootDir>/packages/web3-shared/base/node_modules/reconnecting-websocket',
        'date-fns/(.*)': '<rootDir>/packages/web3-shared/base/node_modules/date-fns/$1',
    },
    snapshotSerializers: ['@masknet/serializer'],
}

export default config
