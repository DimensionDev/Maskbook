const path = require('path')

process.env.NODE_ENV = 'development'
const env = process.env.NODE_ENV
process.env.GENERATE_SOURCEMAP = (env === 'development') + ''
module.exports = function override(/** @type{import("webpack").Configuration} */ config, env) {
    if (env === 'development') config.devtool = 'inline-source-map'
    config.entry = {
        app: path.join(__dirname, './src/index.tsx'),
        contentscript: path.join(__dirname, './src/content-script.ts'),
        backgroundservice: path.join(__dirname, './src/background-service.ts'),
        injectedscript: path.join(__dirname, './src/extension/injected-script/index.ts'),
    }
    config.output.filename = 'js/[name].js'
    config.output.chunkFilename = 'js/[name].chunk.js'

    // No split
    config.optimization.runtimeChunk = false
    config.optimization.splitChunks = undefined

    // Dismiss warning for gun.js
    config.module.wrappedContextCritical = false
    config.module.exprContextCritical = false
    config.module.unknownContextCritical = false

    config.plugins.push(
        new (require('write-file-webpack-plugin'))({
            test: /(shim|polyfill|js\/.*|.+\.png|index\.html|manifest\.json)/,
        }),
    )
    // Write files to /public
    const polyfills = [
        'node_modules/construct-style-sheets-polyfill/adoptedStyleSheets.min.js',
        'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
        'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map',
        'node_modules/webcrypto-liner/dist/webcrypto-liner.shim.js',
    ].map(x => ({ from: x, to: path.join(__dirname, './public/polyfill/') }))
    config.plugins.push(
        new (require('copy-webpack-plugin'))(
            [
                ...polyfills,
                {
                    from: path.join(__dirname, './public'),
                    to: path.join(__dirname, './dist'),
                },
            ],
            { ignore: ['*.html'] },
        ),
    )
    for (const x of config.module.rules) {
        if (!x.oneOf) continue
        for (const rule of x.oneOf) {
            // Replace babel-loader with ts-loader
            if (rule.loader === require.resolve('babel-loader')) {
                if (rule.include) {
                    rule.loader = require.resolve('ts-loader')
                    rule.options = {
                        transpileOnly: true,
                        compilerOptions: {
                            jsx: 'react',
                        },
                    }
                }
            }
        }
    }
    config.module.rules.forEach(rule => {
        // Remove the babel-loader
        if (rule.oneOf) rule.oneOf = rule.oneOf.filter(x => x.loader !== require.resolve('babel-loader'))
    })
    // Disable the eslint linter. We have tslint.
    config.module.rules = config.module.rules.filter(x => x.enforce !== 'pre')
    // write-file-webpack-plugin conflict with this
    // ! Don't upgrade webpack to 5 until they fix this
    config.output.futureEmitAssets = false
    return config
}
