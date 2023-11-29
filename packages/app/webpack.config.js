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
import { emitJSONFile } from '@nice-labs/emit-file-webpack-plugin'
import Terser from 'terser-webpack-plugin'
import { getGitInfo } from './.webpack/git-info.js'
import CopyPlugin from 'copy-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const require = createRequire(import.meta.url)
const __dirname = fileURLToPath(dirname(import.meta.url))
const outputPath = fileURLToPath(new URL('./dist', import.meta.url))
const polyfillsFolderPath = join(outputPath, './js/polyfills')

/**
 * @param {*} env
 * @param {*} argv
 * @returns {Configuration}
 */
function Configuration(env, argv) {
    const mode = env.WEBPACK_SERVE ? 'development' : 'production'
    return {
        mode,
        name: 'mask',
        entry: './src/initialization/index.ts',
        output: {
            filename: '[name].[contenthash].js',
            path: outputPath,
            publicPath: 'auto',
            clean: true,
        },
        optimization: {
            minimizer: [
                new Terser({
                    terserOptions: {
                        compress: {
                            ecma: 2020,
                            // TODO: reduce_vars causes our @masknet/shared-base serializer not be able to serialize Some<T> from ts-results-es package, investigate why.
                            reduce_vars: false,
                            sequences: false,
                            passes: 2,
                        },
                    },
                }),
            ],
        },
        experiments: {
            backCompat: false,
            futureDefaults: true,
            asyncWebAssembly: true,
            syncImportAssertion: true,
            deferImport: { asyncModule: 'error' },
        },
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
                zlib: require.resolve('zlib-browserify'),
                'text-encoding': require.resolve('@sinonjs/text-encoding'),
            },
        },
        devtool: mode === 'development' ? /** default option */ 'eval-source-map' : 'source-map',
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
                {
                    test: /\.tsx?$/,
                    include: fileURLToPath(new URL('../../', import.meta.url)),
                    loader: require.resolve('swc-loader'),
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
            new MiniCssExtractPlugin(),
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
                'process.env.WEB3_CONSTANTS_RPC': process.env.WEB3_CONSTANTS_RPC ?? '{}',
                'process.env.MASK_SENTRY_DSN': process.env.MASK_SENTRY_DSN ?? '{}',
                'process.env.NODE_DEBUG': 'undefined',
                'process.version': JSON.stringify('v20.0.0'),
                'process.browser': 'true',
            }),
            new CopyPlugin({
                patterns: [
                    {
                        context: join(__dirname, '../polyfills/dist/'),
                        from: '*.js',
                        to: polyfillsFolderPath,
                    },
                ],
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
                    VERSION: '2.22.0',
                }
                return emitJSONFile({ content: json, name: 'build-info.json' })
            })(),
        ],
        node: {
            global: true,
            __dirname: false,
            __filename: false,
        },
        devServer: {
            historyApiFallback: true,
            client: {
                overlay: false,
            },
        },
    }
}
export default Configuration
