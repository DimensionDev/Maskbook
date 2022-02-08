import sucrase from '@rollup/plugin-sucrase'

// cspell:ignore iife

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
