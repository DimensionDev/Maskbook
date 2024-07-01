import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { defineConfig } from 'rollup'

export default defineConfig({
    input: 'node_modules/@sentry/browser/build/npm/esm/index.js',
    output: {
        file: 'dist/sentry.js',
        format: 'umd',
        name: 'Sentry',
        intro: 'var window = globalThis;',
    },
    plugins: [
        nodeResolve(),
        replace({
            __SENTRY_BROWSER_BUNDLE__: true,
            __SENTRY_TRACING__: false,
            preventAssignment: true,
        }),
    ],
    onLog(level, log, handler) {
        if (log.code === 'CIRCULAR_DEPENDENCY') return
        handler(level, log)
    },
})
