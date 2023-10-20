import { createRequire } from 'node:module'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const require = createRequire(import.meta.url)
const { swc } = require('rollup-plugin-swc3')

export default {
    input: 'main/index.ts',
    output: {
        file: 'dist/injected-script.js',
        format: 'iife',
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        swc({
            tsconfig: '../../tsconfig.json',
        }),
    ],
}
