// noinspection NpmUsedModulesInstalled
const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const fs = require('fs')

const src = file => path.join(__dirname, '../', file)
/**
 * Polyfills that needs to be copied to dist
 */
let polyfills = [
    'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
    'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map',
    'src/polyfill/asmcrypto.js',
]

const publicDir = src('./public')
const publicPolyfill = src('./public/polyfill')
const dist = src('./dist')

process.env.BROWSER = 'none'

const SSRPlugin = require('./SSRPlugin')
const WebExtensionHotLoadPlugin = require('webpack-web-ext-plugin')
const ManifestGeneratorPlugin = require('webpack-extension-manifest-plugin')

/**
 * All targets available:
 * --firefox
 * --firefox=nightly
 * --firefox-android
 * --firefox-gecko
 * --chromium
 * --wk-webview
 */
const target = (argv => ({
    /** @type {'nightly' | boolean} */
    Firefox: (argv.firefox || argv['firefox-android'] || argv['firefox-gecko']),
    /** @type {string | boolean} */
    FirefoxDesktop: (argv.firefox),
    /** @type {boolean} */
    FirefoxForAndroid: (argv['firefox-android']),
    /** @type {boolean} */
    StandaloneGeckoView: (argv['firefox-gecko']),
    /** @type {boolean} */
    Chromium: (argv.chromium),
    /** @type {boolean} */
    WKWebview: (argv['wk-webview']),
}))(require('yargs').argv)

/**
 * @param config {import("webpack").Configuration}
 * @param env {'development' | 'production'}
 * @returns {import("webpack").Configuration}
 */
function override(config, env) {
    if (target.Firefox) {
        polyfills = polyfills.filter(name => !name.includes('webextension-polyfill'))
        if (target.StandaloneGeckoView) polyfills.push('src/polyfill/permissions.js')
    }

    // CSP bans eval
    // And non-inline source-map not working
    if (env === 'development') config.devtool = 'inline-source-map'
    else delete config.devtool
    config.optimization.minimize = false
    function appendReactDevtools(src) {
        /**
         * If you are using Firefox and want to use React devtools,
         * use Firefox nightly or start without the flag --firefox,
         * then open about:config and switch network.websocket.allowInsecureFromHTTPS to true
         */
        if (target.Firefox && target.Firefox !== 'nightly') return src
        if (env === 'development') return ['react-devtools', src]
        return src
    }
    config.entry = {
        'options-page': appendReactDevtools(src('./src/index.tsx')),
        'content-script': appendReactDevtools(src('./src/content-script.ts')),
        'background-service': src('./src/background-service.ts'),
        'injected-script': src('./src/extension/injected-script/index.ts'),
        popup: appendReactDevtools(src('./src/extension/popup-page/index.tsx')),
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
        let templateContent = fs.readFileSync(path.join(__dirname, './template.html'), 'utf8')
        if (target.Firefox) {
            templateContent = templateContent.replace(
                '<script src="/polyfill/browser-polyfill.min.js"></script>',
                target.StandaloneGeckoView ? '<script src="/polyfill/permissions.js"></script>' : '',
            )
        }
        return new HtmlWebpackPlugin({
            templateContent,
            inject: 'body',
            ...options,
        })
    }

    // Loading debuggers
    if (target.FirefoxDesktop) {
        config.plugins.push(
            new WebExtensionHotLoadPlugin({
                sourceDir: dist,
                target: 'firefox-desktop',
                firefoxProfile: src('.firefox'),
                keepProfileChanges: true,
                // --firefox=nightly
                firefox: typeof target.FirefoxDesktop === 'string' ? target.FirefoxDesktop : undefined,
            }),
        )
    }
    if (target.Chromium) {
        config.plugins.push(
            new WebExtensionHotLoadPlugin({
                sourceDir: dist,
                target: 'chromium',
                chromiumProfile: src('.chrome'),
                keepProfileChanges: true,
            }),
        )
    }
    if (target.FirefoxForAndroid) {
        config.plugins.push(new WebExtensionHotLoadPlugin({ sourceDir: dist, target: 'firefox-android' }))
    }

    // Setting conditional compilations
    {
        /** @type {'Chromium' | 'Firefox' | 'WKWebview' | undefined} */
        let buildTarget = undefined
        /** @type {'android' | 'desktop' | 'GeckoView' | undefined} */
        let firefoxVariant = undefined
        if (target.Chromium) buildTarget = 'Chromium'
        if (target.Firefox) buildTarget = 'Firefox'
        if (target.FirefoxDesktop) firefoxVariant = 'desktop'
        if (target.FirefoxForAndroid) firefoxVariant = 'android'
        if (target.StandaloneGeckoView) firefoxVariant = 'GeckoView'
        if (target.WKWebview) buildTarget = 'WKWebview'
        config.plugins.push(
            new webpack.DefinePlugin({
                'process.env.target': typeof buildTarget === 'string' ? JSON.stringify(buildTarget) : 'undefined',
                firefoxVariant: typeof firefoxVariant === 'string' ? JSON.stringify(firefoxVariant) : 'undefined',
            }),
        )
    }

    // Manifest modifies
    {
        const manifest = require('../src/manifest.json')
        const modifiers = require('./manifest.overrides')
        if (target.Chromium) modifiers.chromium(manifest)
        if (target.FirefoxDesktop) modifiers.firefoxDesktop(manifest)
        if (target.FirefoxForAndroid) modifiers.firefoxAndroid(manifest)
        if (target.StandaloneGeckoView) modifiers.firefoxGeckoview(manifest)
        if (target.WKWebview) modifiers.WKWebview(manifest)

        config.plugins.push(new ManifestGeneratorPlugin({ config: { base: manifest } }))
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
    config.plugins.push(
        new (require('copy-webpack-plugin'))([{ from: publicDir, to: dist }], { ignore: ['index.html'] }),
    )
    if (!fs.existsSync(publicPolyfill)) {
        fs.mkdirSync(publicPolyfill)
    }
    polyfills.map(x => void fs.copyFileSync(src(x), path.join(publicPolyfill, path.basename(x))))

    if (env !== 'development') {
        config.plugins.push(new SSRPlugin('popup.html', src('./src/extension/popup-page/index.tsx')))
        config.plugins.push(new SSRPlugin('index.html', src('./src/index.tsx')))
    }

    const tsCheckerPlugin = config.plugins.filter(x => x.constructor.name === 'ForkTsCheckerWebpackPlugin')[0]
    tsCheckerPlugin.compilerOptions.isolatedModules = false

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
