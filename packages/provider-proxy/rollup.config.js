import commonjs from '@rollup/plugin-commonjs'
import node from '@rollup/plugin-node-resolve'
import sucrase from '@rollup/plugin-sucrase'
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'
import typescript from '@rollup/plugin-typescript'

const typesBuildConfig = {
    input: './src/index.ts',
    output: [{ file: './dist/index.ts', format: 'cjs' }],
    plugins: [typescript({ tsconfig: './tsconfig.json' })],
}

const config = {
    input: './src/index.ts',
    output: {
        file: 'dist/output.js',
        format: 'cjs',
    },
    plugins: [
        commonjs(),
        node(),
        json(),
        alias({
            entries: [
                { find: '@masknet/web3-shared-evm', replacement: '../web3-shared/evm/index.ts' },
                { find: '@masknet/web3-shared-base', replacement: '../web3-shared/base/index.ts' },
            ],
        }),
        sucrase({ transforms: ['typescript', 'jsx'] }),
    ],
    external: (id) => {
        if (id.startsWith('.')) return false
        if (id.includes('@masknet')) return false
        if (id.includes('node_modules')) return true
        return false
    },
    treeshake: { moduleSideEffects: false, propertyReadSideEffects: false },
}

export default [config, typesBuildConfig]
