import typescript from 'rollup-plugin-typescript2'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

function parseMaybe(s) {
    return typeof s === 'string' ? JSON.parse(s) : {}
}

const config = {
    input: './src/index.ts',
    output: {
        dir: 'dist',
        format: 'cjs',
    },
    plugins: [
        nodeResolve({
            preferBuiltins: false,
            mainFields: ['module', 'main'],
            customResolveOptions: {
                moduleDirectories: [process.env.MODULE_DIR || 'node_modules'],
            },
        }),
        typescript({
            compilerOptions: {
                declaration: false,
                declarationMap: false,
                ...parseMaybe(process.env.TS_OPTS),
            },
        }),
        commonjs({
            extensions: ['.js', '.ts', '.tsx'],
        }),
        json(),
    ],
}

export default config
