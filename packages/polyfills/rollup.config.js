import { createRequire } from 'node:module'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import json from '@rollup/plugin-json'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { swc } = require('rollup-plugin-swc3')

export default [
    {
        input: fileURLToPath(new URL('./web-apis/index.ts', import.meta.url)),
        output: {
            file: 'dom.js',
            format: 'iife',
        },
        plugins: plugins(),
    },
    {
        input: fileURLToPath(new URL('./web-apis/worker.ts', import.meta.url)),
        output: {
            file: 'worker.js',
            format: 'iife',
        },
        plugins: plugins(),
    },
    {
        input: fileURLToPath(new URL('./lib-runtime.js', import.meta.url)),
        output: {
            file: 'lib-runtime.js',
            format: 'iife',
        },
        plugins: plugins(),
    },
]
function plugins() {
    return [
        nodeResolve(),
        commonjs(),
        json(),
        swc({
            tsconfig: './tsconfig.json',
            jsc: { target: 'es2021' },
        }),
        terser({ mangle: false }),
    ]
}
