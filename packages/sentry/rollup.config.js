import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { defineConfig } from 'rollup'
import { minify } from 'rollup-plugin-swc3'

export default defineConfig({
    input: 'node_modules/@sentry/browser/esm/index.js',
    output: {
        file: 'dist/sentry.js',
        format: 'umd',
        name: 'Sentry',
    },
    plugins: [
        nodeResolve(),
        replace({
            __SENTRY_BROWSER_BUNDLE__: true,
            __SENTRY_TRACING__: false,
            window: 'globalThis',
            'typeof window': '"object"',
            preventAssignment: true,
        }),
        // minify({ mangle: false, compress: false }),
    ],
    onLog(level, log, handler) {
        if (log.code === 'CIRCULAR_DEPENDENCY') return
        handler(level, log)
    },
})
