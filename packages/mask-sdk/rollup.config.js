import { swc } from 'rollup-plugin-swc3'
import node from '@rollup/plugin-node-resolve'

export default {
    input: 'main/index.ts',
    output: {
        file: 'dist/mask-sdk.js',
        format: 'iife',
    },
    plugins: [
        node(),
        swc({
            tsconfig: '../../tsconfig.json',
        }),
    ],
}
