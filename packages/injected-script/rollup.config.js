import { swc } from 'rollup-plugin-swc3'

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
