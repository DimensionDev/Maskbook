// noinspection NpmUsedModulesInstalled
const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const fs = require('fs')

// Write files to /public
const polyfills = [
    'node_modules/construct-style-sheets-polyfill/adoptedStyleSheets.js',
    'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
    'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map',
]
const src = file => path.join(__dirname, file)
const public = src('./public')
const publicPolyfill = src('./public/polyfill')
const dist = src('./dist')

process.env.BROWSER = 'none'
/**
 * @type {import("webpack").Configuration}
 */
module.exports = function override(config, env) {
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
    config.optimization.splitChunks = { chunks: 'all' }

    // Dismiss warning for gun.js
    config.module.wrappedContextCritical = false
    config.module.exprContextCritical = false
    config.module.unknownContextCritical = false

    config.plugins.push(
        new (require('write-file-webpack-plugin'))({
            test: /.*(?!hot-update)/,
        }),
    )
    config.plugins = config.plugins.filter(x => x.constructor.name !== 'HtmlWebpackPlugin')
    /**
     * @param {HtmlWebpackPlugin.Options} options
     */
    function newPage(options = {}) {
        return new HtmlWebpackPlugin({
            templateContent: `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <script src="polyfill/browser-polyfill.min.js"></script>
    </head>
    <body></body>
</html>`,
            inject: 'body',
            ...options,
        })
    }
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
    if (env === 'development') {
        config.plugins.push(
            new (require('copy-webpack-plugin'))(
                [...polyfills.map(from => ({ from, to: publicPolyfill })), { from: public, to: dist }],
                { ignore: ['index.html'] },
            ),
        )
    } else {
        config.plugins.push(new SSRPlugin('popup.html', src('./src/extension/popup-page/index.tsx')))
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

const { exec } = require('child_process')
const SSRPlugin = class SSRPlugin {
    /**
     * @param {string} htmlFileName
     * @param {string} pathName
     */
    constructor(htmlFileName, pathName) {
        this.htmlFileName = htmlFileName
        this.pathName = pathName
    }
    /**
     * @returns {Promise<string>}
     */
    renderSSR() {
        return new Promise((resolve, reject) => {
            exec(
                'node -r esm ./node_modules/ts-node/dist/bin.js --project ./tsconfig_cjs.json -T ./src/setup.ssr.js ' +
                    this.pathName,
                (err, stdout) => (err ? reject(err) : resolve(stdout)),
            )
        })
    }
    /**
     * @param {string} original
     * @param {string} string
     */
    appendAfterBody(original, string) {
        return original.replace('</body>', string + '</body>')
    }
    /**
     * @param {string} string
     */
    removeScripts(string) {
        return string.replace(/<script src="(.+?)"><\/script>/g, '')
    }
    /**
     * @param {import('webpack').Compiler} compiler
     */
    apply(compiler) {
        compiler.hooks.compilation.tap('SSRPlugin', compilation => {
            /**
             * @see https://github.com/jantimon/html-webpack-plugin#options
             * @type {import('webpack').compilation.CompilerHooks
             * & {
             *      beforeEmit: import('tapable').SyncHook<{
             *          html: string
             *          outputName: string
             *          plugin: HtmlWebpackPlugin
             *  }>}
             */
            const htmlWebpackPluginHook = HtmlWebpackPlugin.getHooks(compilation)
            htmlWebpackPluginHook.beforeEmit.tapPromise('SSRPlugin', async args => {
                let { html, outputName, plugin } = args
                if (outputName !== this.htmlFileName) return args
                html = await this.generateSSRHTMLFile(compilation, html)
                return { html, outputName, plugin }
            })
        })
    }
    /**
     * @param {import('webpack').compilation.Compilation} compilation
     */
    async generateSSRHTMLFile(compilation, originalHTML) {
        const ssrString = await this.renderSSR()
        const allScripts = []
        {
            const regex = /<script src="(.+?)"><\/script>/g
            let current
            while ((current = regex.exec(originalHTML))) {
                allScripts.push(current[1])
            }
        }
        let regeneratedHTML = originalHTML
        regeneratedHTML = this.removeScripts(regeneratedHTML)
        regeneratedHTML = this.appendAfterBody(regeneratedHTML, ssrString)
        regeneratedHTML = this.appendAfterBody(regeneratedHTML, `<script src="${this.htmlFileName}.js"></script>`)
        // Generate scripts loader
        const deferredLoader = allScripts.reduce(
            (prev, src) =>
                prev +
                `
        importScript('${src}')`,
            '',
        )
        const generated = `function untilDocumentReady() {
    if (document.readyState === 'complete') return Promise.resolve()
    return new Promise(resolve => {
        document.addEventListener('readystatechange', resolve, { once: true, passive: true })
    })
}
function importScript(src) {
    const script = document.createElement('script')
    script.src = src
    document.body.appendChild(script)
}
untilDocumentReady().then(() => {
    setTimeout(() => {${deferredLoader}
    }, 20)
})
`
        compilation.assets[this.htmlFileName + '.js'] = {
            source: () => generated,
            size: () => generated.length,
        }
        return regeneratedHTML
    }
}
