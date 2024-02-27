import nodePolyfills from 'rollup-plugin-polyfill-node'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import swc from 'rollup-plugin-swc3'

export default {
    input: 'main/index.ts',
    output: {
        file: 'dist/injected-script.js',
        format: 'iife',
        name: 'injectedScript',
        inlineDynamicImports: true,
    },
    plugins: [
        nodePolyfills({
            include: ['crypto'],
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        resolve({ browser: true, preferBuiltins: false }),
        commonjs(),
        swc({
            tsconfig: '../../tsconfig.json',
        }),
    ],
}
