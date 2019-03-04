const path = require('path')

process.env.NODE_ENV = 'development'
const env = process.env.NODE_ENV
process.env.GENERATE_SOURCEMAP = (env === 'development') + ''
module.exports = function override(/** @type{import("webpack").Configuration} */ config, env) {
    if (env === 'development') config.devtool = 'inline-source-map'
    config.entry = {
        app: path.join(__dirname, './src/index.tsx'),
        contentscript: path.join(__dirname, './src/content-script.tsx'),
    }
    config.output.filename = 'static/js/[name].js'
    config.output.chunkFilename = 'static/js/[name].chunk.js'
    config.optimization.runtimeChunk = false
    config.optimization.splitChunks = undefined

    // @ts-ignore
    config.plugins.push(new (require('write-file-webpack-plugin'))())
    config.plugins.push(
        new (require('copy-webpack-plugin'))(
            [
                {
                    from: path.join(__dirname, './public'),
                    to: path.join(__dirname, './build'),
                },
            ],
            { ignore: ['*.html'] },
        ),
    )
    return config
}
