import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { swc } = require('rollup-plugin-swc3')

export default {
    input: 'main/index.ts',
    output: {
        file: 'dist/injected-script.js',
        format: 'iife',
    },
    plugins: [
        swc({
            tsconfig: '../../tsconfig.json',
        }),
    ],
}
