import { swc } from 'rollup-plugin-swc3'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import json from '@rollup/plugin-json'
import { join } from 'path'

export default [
    {
        input: join(__dirname, './ecmascript-intl/index.ts'),
        output: {
            file: 'intl.js',
            format: 'iife',
        },
        plugins: plugins(),
    },
    {
        input: join(__dirname, './web-apis/index.ts'),
        output: {
            file: 'dom.js',
            format: 'iife',
        },
        plugins: plugins(),
    },
    {
        input: join(__dirname, './web-apis/worker.ts'),
        output: {
            file: 'worker.js',
            format: 'iife',
        },
        plugins: plugins(),
    },
    {
        input: join(__dirname, './lib-runtime.mjs'),
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
