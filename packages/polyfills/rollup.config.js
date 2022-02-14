import sucrase from '@rollup/plugin-sucrase'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import json from '@rollup/plugin-json'
import { join } from 'path'

export default [
    {
        input: join(__dirname, './ecmascript/index.ts'),
        output: {
            file: 'esnext.js',
            format: 'iife',
        },
        plugins: plugins(),
    },
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
        input: join(__dirname, './elliptic.js'),
        output: {
            file: 'internal_elliptic.js',
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
        sucrase({
            exclude: ['node_modules/**'],
            transforms: ['typescript'],
        }),
        terser({ mangle: false }),
    ]
}
