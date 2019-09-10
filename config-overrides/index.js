// noinspection NpmUsedModulesInstalled
const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const fs = require('fs')
const pkg = require('../package.json')

const src = file => path.join(__dirname, '../', file)
const argv = require('yargs').argv

const publicDir = src('./public')
const dist = src('./dist')

process.env.BROWSER = 'none'

const SSRPlugin = require('./SSRPlugin')
const WebExtPlugin = require('webpack-web-ext-plugin')
const ExtensionManifestPlugin = require('webpack-extension-manifest-plugin')

/**
 * @type {import("webpack").Configuration}
 */
function override(config, env) {
    // CSP bans eval
    // And non-inline source-map not working
    if (env === 'development') config.devtool = 'inline-source-map'
    else delete config.devtool
    config.optimization.minimize = false
    config.entry = {
        'options-page': src('./src/index.tsx'),
        'content-script': src('./src/content-script.ts'),
        'background-service': src('./src/background-service.ts'),
        'injected-script': src('./src/extension/injected-script/index.ts'),
        popup: src('./src/extension/popup-page/index.tsx'),
        qrcode: src('./src/web-workers/QRCode.ts'),
    }
    if (env !== 'development') delete config.entry.devtools

    // Let bundle compatible with web worker
    config.output.globalObject = 'globalThis'
    config.output.filename = 'js/[name].js'
    config.output.chunkFilename = 'js/[name].chunk.js'

    // We cannot do runtimeChunk because extension CSP disallows inline <script>
    config.optimization.runtimeChunk = false
    config.optimization.splitChunks = false

    // Dismiss warning for gun.js
    config.module.wrappedContextCritical = false
    config.module.exprContextCritical = false
    config.module.unknownContextCritical = false

    config.plugins = config.plugins.filter(x => x.constructor.name !== 'HtmlWebpackPlugin')
    /**
     * @param {HtmlWebpackPlugin.Options} options
     */
    function newPage(options = {}) {
        return new HtmlWebpackPlugin({
            templateContent: fs.readFileSync(path.join(__dirname, './template.html'), 'utf8'),
            inject: 'body',
            ...options,
        })
    }

    if (argv.firefox) {
        config.plugins.push(
            new WebExtPlugin({
                sourceDir: dist,
                target: 'firefox-desktop',
                firefoxProfile: src('.firefox'),
                keepProfileChanges: true,
                // --firefox=nightly
                firefox: typeof argv.firefox === 'string' ? argv.firefox : undefined,
            }),
        )
    }

    const manifest_extend = { version: pkg.version }

    if (argv.chromium) {
        config.plugins.push(
            new WebExtPlugin({
                sourceDir: dist,
                target: 'chromium',
                chromiumProfile: src('.chrome'),
                keepProfileChanges: true,
            }),
        )
    }

    if (argv['firefox-android']) {
        config.plugins.push(new WebExtPlugin({ sourceDir: dist, target: 'firefox-android' }))
    }

    if (argv['firefox-gecko']) {
        Object.assign(manifest_extend, { permissions: ['<all_urls>'] })
    }

    config.plugins.push(
        new ExtensionManifestPlugin({
            config: {
                base: require('../src/manifest'),
                extend: manifest_extend,
            },
        }),
    )

    config.plugins.push(
        newPage({ chunks: ['options-page'], filename: 'index.html' }),
        newPage({ chunks: ['background-service'], filename: 'background.html' }),
        newPage({ chunks: ['popup'], filename: 'popup.html' }),
        newPage({ chunks: ['content-script'], filename: 'generated__content__script.html' }),
    )

    config.plugins.push(
        new webpack.BannerPlugin(
            'Maskbook is a open source project under GNU AGPL 3.0 licence.\n\n\n' +
                'More info about our project at https://github.com/DimensionDev/Maskbook\n\n' +
                'Maskbook is built on CircleCI, in which all the building process is available to the public.\n\n' +
                'We directly take the output to submit to the Web Store. We will integrate the automatic submission\n' +
                'into the CircleCI in the near future.',
        ),
    )

    // Write files to /public
    config.plugins.push(
        new (require('copy-webpack-plugin'))([{ from: publicDir, to: dist }], { ignore: ['index.html'] }),
    )
    if (env !== 'development') {
        config.plugins.push(new SSRPlugin('popup.html', src('./src/extension/popup-page/index.tsx')))
        config.plugins.push(new SSRPlugin('index.html', src('./src/index.tsx')))
    }

    // Let webpack build to es2017 instead of es5
    config.module.rules = [
        // from cra
        {
            parser: { requireEnsure: false },
        },
        // eslint omitted
        {
            oneOf: [
                // url-loader from cra
                {
                    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                    loader: require.resolve('url-loader'),
                    options: { limit: 10000, name: 'static/media/[name].[hash:8].[ext]' },
                },
                // babel-loader omitted
                // babel-loader omitted
                // css module loader omitted
                // css module loader omitted
                // scss loader omitted
                // scss (with css module) loader omitted,
                // file-loader from cra
                {
                    loader: require.resolve('file-loader'),
                    exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                    options: { name: 'static/media/[name].[hash:8].[ext]' },
                },
                // our own ts-loader
                {
                    test: /\.(js|mjs|jsx|ts|tsx)$/,
                    include: src('src'),
                    loader: require.resolve('ts-loader'),
                    options: {
                        transpileOnly: true,
                        compilerOptions: {
                            jsx: 'react',
                        },
                    },
                },
            ],
        },
    ]

    // futureEmitAssets prevents webpackDevServer from writing file to disk
    config.output.futureEmitAssets = false
    return config
}

module.exports = {
    webpack: override,
    devServer: function(configFunction) {
        return function(proxy, allowedHost) {
            const config = configFunction(proxy, allowedHost)
            config.writeToDisk = true
            return config
        }
    },
}
