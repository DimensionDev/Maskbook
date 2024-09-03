import { nodeResolve } from '@rollup/plugin-node-resolve'
import image from '@rollup/plugin-image'
import { swc, minify } from 'rollup-plugin-swc3'
import { defineConfig } from 'rollup'

export default defineConfig({
    input: 'main/index.ts',
    output: {
        file: 'dist/mask-sdk.js',
        format: 'iife',
    },
    plugins: [
        //
        nodeResolve(),
        swc({ tsconfig: '../../tsconfig.json', jsc: { target: 'es2022' } }),
        minify({ mangle: false, compress: false }),
        image(),
    ],
    onLog(level, log, handler) {
        if (log.code === 'CIRCULAR_DEPENDENCY') return
        handler(level, log)
    },
})
