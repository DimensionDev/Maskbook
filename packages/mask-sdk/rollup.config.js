import sucrase from '@rollup/plugin-sucrase'
import node from '@rollup/plugin-node-resolve'

export default {
    input: 'main/index.ts',
    output: {
        file: 'dist/mask-sdk.js',
        format: 'iife',
    },
    plugins: [
        node(),
        sucrase({
            exclude: ['node_modules/**'],
            transforms: ['typescript'],
        }),
    ],
}
