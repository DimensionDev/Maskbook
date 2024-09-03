import { defineConfig } from 'rollup'
import { swc, minify } from 'rollup-plugin-swc3'

export default defineConfig({
    input: 'main/index.ts',
    output: {
        file: 'dist/injected-script.js',
        format: 'iife',
        name: 'injectedScript',
    },
    plugins: [
        //
        swc({ tsconfig: '../../tsconfig.json', jsc: { target: 'es2022' } }),
        minify({ mangle: false, compress: false }),
    ],
})
