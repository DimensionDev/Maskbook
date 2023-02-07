/**
 * @typedef Configuration
 * @type {import('webpack').Configuration}
 */

import { fileURLToPath } from 'url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

/**
 *
 * @param {*} a
 * @param {*} b
 * @returns {Configuration}
 */
function Configuration(a, b) {
    return {
        mode: 'development',
        entry: './src/entry.tsx',
        experiments: { asyncWebAssembly: true },
        resolve: {
            extensionAlias: {
                '.js': ['.tsx', '.ts', '.js'],
                '.mjs': ['.mts', '.mjs'],
            },
            extensions: ['.js', '.ts', '.tsx'],
            conditionNames: ['mask-src', '...'],
            fallback: { https: false, http: false, crypto: false, stream: false },
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    include: fileURLToPath(new URL('../../', import.meta.url)),
                    loader: 'swc-loader',
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'typescript',
                                tsx: true,
                            },
                            target: 'es2022',
                            transform: {
                                react: {
                                    runtime: 'automatic',
                                },
                            },
                        },
                    },
                },
            ],
        },
        plugins: [
            new webpack.ProvidePlugin({
                // Polyfill for Node global "Buffer" variable
                Buffer: [require.resolve('buffer'), 'Buffer'],
                stream: require.resolve('stream-browserify'),
                crypto: require.resolve('crypto-browserify'),
            }),
            new HtmlWebpackPlugin(),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'process.env.NODE_DEBUG': 'undefined',
                'process.env.engine': `(${(ua) =>
                    ua.includes('Chrom')
                        ? 'chromium'
                        : ua.includes('Firefox')
                        ? 'firefox'
                        : 'safari'})(navigator.userAgent)`,
                'process.env.channel': JSON.stringify('stable'),
                'process.env.architecture': JSON.stringify('web'),
                'process.env.shadowRootMode': JSON.stringify('open'),
                'process.version': JSON.stringify('v19.0.0'),
                'process.browser': 'true',
            }),
        ],
    }
}
export default Configuration
