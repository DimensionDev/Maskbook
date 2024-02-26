import node from '@rollup/plugin-node-resolve'
import image from '@rollup/plugin-image'
import swc from 'rollup-plugin-swc3'

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
        image(),
    ],
}
