/**
 * @typedef Configuration
 * @type {import('webpack').Configuration}
 */

import { fileURLToPath } from 'url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'

/**
 *
 * @param {*} a
 * @param {*} b
 * @returns {Configuration}
 */
function Configuration(a, b) {
    console.log(a, b)
    return {
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
            new HtmlWebpackPlugin(),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'process.env.NODE_DEBUG': 'undefined',
            }),
        ],
    }
}
export default Configuration
