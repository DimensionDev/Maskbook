import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

const config = {
    input: './src/index.ts',
    output: {
        dir: 'dist',
        format: 'cjs',
    },
    plugins: [
        typescript({
            compilerOptions: {
                declaration: false,
                declarationMap: false,
                tsconfig: 'tsconfig.json',
            },
        }),
        nodeResolve({
            exportConditions: ['node'],
            preferBuiltins: false,
            mainFields: ['module', 'main'],
            rootDir: '../..',
            moduleDirectories: ['../../node_modules', 'node_modules'],
        }),
        commonjs(),
        json(),
        terser(),
    ],
}

export default config
