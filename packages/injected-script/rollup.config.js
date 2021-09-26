import sucrase from '@rollup/plugin-sucrase'

export default {
    input: 'main/index.ts',
    output: {
        file: 'dist/injected-script.js',
        format: 'iife',
    },
    plugins: [
        sucrase({
            exclude: ['node_modules/**'],
            transforms: ['typescript'],
        }),
    ],
}
