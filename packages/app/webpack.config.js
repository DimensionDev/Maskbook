/**
 * @typedef Configuration
 * @type {import('webpack').Configuration}
 */

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const __dirname = fileURLToPath(dirname(import.meta.url))

/**
 * @param {*} env
 * @param {*} argv
 * @returns {Configuration}
 */
function Configuration(env, argv) {
    const mode = env.WEBPACK_SERVE ? 'development' : 'production'
    return {
        mode,
        entry: './src/index.tsx',
        output: {
            path: fileURLToPath(new URL('../netlify/sites/app', import.meta.url)),
            publicPath: 'auto',
            clean: true,
        },
        experiments: { asyncWebAssembly: true, topLevelAwait: true },
        resolve: {
            extensionAlias: {
                '.js': ['.tsx', '.ts', '.js'],
                '.mjs': ['.mts', '.mjs'],
            },
            extensions: ['.js', '.ts', '.tsx'],
            conditionNames: ['mask-src', '...'],
            fallback: {
                https: false,
                http: false,
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
            },
        },
        devtool: mode === 'development' ? /** default option */ undefined : 'source-map',
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
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
            }),
            new HtmlWebpackPlugin({
                templateContent: readFileSync(join(__dirname, './.webpack/template.html'), 'utf8'),
                inject: 'body',
                scriptLoading: 'defer',
                minify: false,
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_DEBUG': 'undefined',
                'process.env.VERSION': JSON.stringify('v19.0.0'),
                'process.env.APP': 'true',
                'process.env.channel': JSON.stringify('stable'),
                'process.version': JSON.stringify('v19.0.0'),
                'process.browser': 'true',
            }),
        ],
        devServer: {
            client: {
                overlay: false,
            },
        },
    }
}
export default Configuration
