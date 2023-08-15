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
import { getGitInfo } from './.webpack/git-info.js'
import { emitJSONFile } from '@nice-labs/emit-file-webpack-plugin'

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
            path: fileURLToPath(new URL('./dist', import.meta.url)),
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
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                buffer: require.resolve('buffer'),
                'text-encoding': require.resolve('@sinonjs/text-encoding'),
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
                            externalHelpers: true,
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
            new HtmlWebpackPlugin({
                templateContent: readFileSync(join(__dirname, './.webpack/template.html'), 'utf8'),
                inject: 'body',
                scriptLoading: 'defer',
                minify: false,
            }),
            new webpack.ProvidePlugin({
                // Polyfill for Node global "Buffer" variable
                Buffer: [require.resolve('buffer'), 'Buffer'],
                'process.nextTick': require.resolve('next-tick'),
            }),
            new webpack.DefinePlugin({
                NODE_DEBUG: false,
                WEB3_CONSTANTS_RPC: process.env.WEB3_CONSTANTS_RPC ?? '',
                MASK_SENTRY_DSN: process.env.MASK_SENTRY_DSN ?? '',
                'process.env.NODE_DEBUG': 'undefined',
                'process.version': JSON.stringify('v19.0.0'),
                'process.browser': 'true',
            }),
            (() => {
                const { BRANCH_NAME, BUILD_DATE, COMMIT_DATE, COMMIT_HASH, DIRTY } = getGitInfo()
                const json = {
                    BRANCH_NAME,
                    BUILD_DATE,
                    channel: 'stable',
                    COMMIT_DATE,
                    COMMIT_HASH,
                    DIRTY,
                    VERSION: '2.21.0',
                }
                return emitJSONFile({ content: json, name: 'build-info.json' })
            })(),
        ],
        devServer: {
            historyApiFallback: true,
            client: {
                overlay: false,
            },
        },
    }
}
export default Configuration
