const path = require('path')
const webpack = require('webpack')

process.env.BROWSER = 'none'
module.exports = function override(/** @type{import("webpack").Configuration} */ config, env) {
    // CSP bans eval
    // And non-inline source-map not working
    if (env === 'development') config.devtool = 'inline-source-map'
    else delete config.devtool
    config.optimization.minimize = false
    config.entry = {
        devtools: 'react-devtools',
        app: path.join(__dirname, './src/index.tsx'),
        contentscript: path.join(__dirname, './src/content-script.ts'),
        backgroundservice: path.join(__dirname, './src/background-service.ts'),
        injectedscript: path.join(__dirname, './src/extension/injected-script/index.ts'),
        qrcode: path.join(__dirname, './src/web-workers/QRCode.ts'),
    }
    if (env !== 'development') delete config.entry.devtools

    // Let bundle compatiable with web worker
    config.output.globalObject = 'globalThis'
    config.output.filename = 'js/[name].js'
    config.output.chunkFilename = 'js/[name].chunk.js'

    // Leads a loading failure in background service
    config.optimization.runtimeChunk = false
    config.optimization.splitChunks = undefined

    // Dismiss warning for gun.js
    config.module.wrappedContextCritical = false
    config.module.exprContextCritical = false
    config.module.unknownContextCritical = false

    // Prevent all other chunks from being injected to index.html
    config.plugins.forEach(p => {
        if (p.constructor.name !== 'HtmlWebpackPlugin') return
        const {devtools, app, ...exclude} = config.entry
        Object.keys(exclude).forEach(e => p.options.excludeChunks.push(e))
    })

    config.plugins.push(
        new (require('write-file-webpack-plugin'))({
            test: /(webp|jpg|png|shim|polyfill|js\/.*|index\.html|manifest\.json|_locales)/,
        }),
    )
    config.plugins.push(
        new webpack.BannerPlugin(`Maskbook is a open source project under GNU AGPL 3.0 licence.

More info about our project at https://github.com/DimensionDev/Maskbook

Maskbook is built on CircleCI, in which all the building process is available to the public.

We directly take the output to submit to the Web Store. We will integrate the automatic submission
into the CircleCI in the near future.`),
    )
    // Write files to /public
    const polyfills = [
        'node_modules/construct-style-sheets-polyfill/adoptedStyleSheets.js',
        'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
        'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map',
        'node_modules/webcrypto-liner/dist/webcrypto-liner.shim.js',
    ]
    const public = path.join(__dirname, './public')
    const publicPolyfill = path.join(__dirname, './public/polyfill')
    const dist = path.join(__dirname, './dist')
    if (env === 'development') {
        config.plugins.push(
            new (require('copy-webpack-plugin'))(
                [...polyfills.map(from => ({ from, to: publicPolyfill })), { from: public, to: dist }],
                { ignore: ['*.html'] },
            ),
        )
    } else {
        const fs = require('fs')
        if (!fs.existsSync(publicPolyfill)) fs.mkdirSync(publicPolyfill)
        polyfills.map(x =>
            fs.copyFile(x, path.join(publicPolyfill, path.basename(x)), err => {
                if (err) throw err
            }),
        )
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
                    include: path.resolve(__dirname, './src'),
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
    // write-file-webpack-plugin conflict with this
    // ! Don't upgrade webpack to 5 until they fix this
    config.output.futureEmitAssets = false
    return config
}
