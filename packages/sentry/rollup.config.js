import node from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'

export default {
    input: 'node_modules/@sentry/browser/esm/index.js',
    output: {
        file: 'dist/sentry.js',
        format: 'umd',
        name: 'Sentry',
    },
    plugins: [
        node(),
        replace({
            __SENTRY_BROWSER_BUNDLE__: true,
            __SENTRY_TRACING__: false,
            window: 'globalThis',
            'typeof window': '"object"',
        }),
    ],
}
