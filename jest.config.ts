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
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
}

export default config
