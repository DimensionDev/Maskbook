import commonjs from '@rollup/plugin-commonjs'
import node from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'
import dts from 'rollup-plugin-dts'

const config = {
    input: '../encryption/dist/external.js',
    output: {
        file: 'dist/index.mjs',
        format: 'esm',
        inlineDynamicImports: true,
        generatedCode: 'es2015',
    },
    plugins: [
        commonjs(),
        node(),
        json(),
        alias({
            entries: [
                { find: '@masknet/typed-message', replacement: '../typed-message/dist/base/index.js' },
                { find: '@masknet/shared-base', replacement: '../shared-base/dist/external-encryption.js' },
            ],
        }),
    ],
    external: ['ts-results', '@msgpack/msgpack', 'tiny-secp256k1', 'pvtsutils', 'anchorme'],
    treeshake: { moduleSideEffects: false, propertyReadSideEffects: false },
}

const dtsConfig = {
    input: '../encryption/dist/external.d.ts',
    output: [{ file: './dist/index.d.ts', format: 'es' }],
    plugins: [dts({ respectExternal: true })],
    external: config.external,
}

export default [config, dtsConfig]
