import node from '@rollup/plugin-node-resolve'
import image from '@rollup/plugin-image'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { swc } = require('rollup-plugin-swc3')

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
