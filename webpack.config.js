const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const fs = require('fs')
const WebpackNotifierPlugin = require('webpack-notifier')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin')
const git = require('@nice-labs/git-rev').default

const src = (file) => path.join(__dirname, file)
/**
 * Polyfills that needs to be copied to dist
 */
let polyfills = [
    require.resolve('webextension-polyfill/dist/browser-polyfill.min.js'),
    require.resolve('webextension-polyfill/dist/browser-polyfill.min.js.map'),
]

const publicDir = src('./public')
const publicPolyfill = src('./public/polyfill')

// TODO: what does it used for?
process.env.BROWSER = 'none'

const SSRPlugin = require('./config-overrides/SSRPlugin')
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
 * --e2e
 */
const calcArgs = (argv) => ({
    /** @type {'nightly' | boolean} */
    Firefox: argv.firefox || argv['firefox-android'] || argv['firefox-gecko'],
    /** @type {string | boolean} */
    FirefoxDesktop: argv.firefox,
    /** @type {boolean} */
    FirefoxForAndroid: argv['firefox-android'],
    /** @type {boolean} */
    StandaloneGeckoView: argv['firefox-gecko'],
    /** @type {boolean} */
    Chromium: argv.chromium,
    /** @type {boolean} */
    WKWebview: argv['wk-webview'],
    /** @type {boolean} */
    E2E: argv.e2e,
    /** @type {boolean} */
    ReproducibleBuild: argv['reproducible-build'],
})

/**
 * @param {object} argvEnv
 * @returns {import("webpack").Configuration}
 */
module.exports = (argvEnv, argv) => {
    const target = calcArgs(argv)

    if (target.Firefox) {
        polyfills = polyfills.filter((name) => !name.includes('webextension-polyfill'))
    }
    if (target.StandaloneGeckoView || target.WKWebview) polyfills.push(require.resolve('./src/polyfill/permissions.js'))

    /** @type {"production" | "development"} */
    const env = argv.mode

    const dist = env === 'production' ? src('./build') : src('./dist')

    /** @type {import('webpack').Configuration} */
    const config = {
        mode: env,
        // CSP bans eval
        // And non-inline source-map not working
        devtool: env === 'development' ? 'inline-source-map' : false,
        entry: {},
        resolve: {
            extensions: ['.js', '.ts', '.tsx'],
            // https://github.com/facebook/create-react-app/blob/865ea05bc93fd2ac56b7e561181c7dc2cead3e78/packages/react-scripts/config/webpack.config.js#L304
            // add it if any one need React profiling mode for React devtools
        },
        module: {
            strictExportPresence: true,
            // ? We're going to move to ESModule in future.
            // ? Don't add new loaders if the motivation is not strong enough.
            rules: [{ parser: { requireEnsure: false } }, addTSLoader()],
        },
        plugins: [
            new webpack.EnvironmentPlugin({
                NODE_ENV: env,
            }),
            target.ReproducibleBuild
                ? undefined
                : new webpack.EnvironmentPlugin({
                      BUILD_DATE: new Date().toISOString(),
                      VERSION: git.describe('--dirty'),
                      TAG_NAME: git.tag(),
                      COMMIT_HASH: git.commitHash(),
                      COMMIT_DATE: git.commitDate().toISOString(),
                      REMOTE_URL: git.remoteURL(),
                      BRANCH_NAME: git.branchName(),
                      DIRTY: git.isDirty(),
                      TAG_DIRTY: git.isTagDirty(),
                  }),
            // The following plugins are from react-dev-utils. let me know if any one need it.
            // WatchMissingNodeModulesPlugin
            // ModuleNotFoundPlugin
            // ModuleScopePlugin
        ].filter((x) => x),
        node: disabledNodeBuiltins(),
        optimization: { minimize: false },
        output: {
            // futureEmitAssets prevents webpackDevServer from writing file to disk
            futureEmitAssets: false,
            path: dist,
        },
    }

    if (env === 'development') {
        const opt = { title: 'Maskbook', excludeWarnings: true, skipFirstNotification: true, skipSuccessful: true }
        config.plugins.push(
            new WebpackNotifierPlugin(opt),
            new ForkTsCheckerWebpackPlugin(),
            new ForkTsCheckerNotifierWebpackPlugin(opt),
        )
    }

    /**
     * @param {string} src
     */
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
        'crypto-worker': src('./src/modules/CryptoAlgorithm/EllipticBackend/worker.ts'),
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

    /**
     * @param {HtmlWebpackPlugin.Options} options
     */
    function newPage(options = {}) {
        let templateContent = fs.readFileSync(src('./config-overrides/template.html'), 'utf8')
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

    config.devServer = {
        writeToDisk: true,
        compress: false,
        hot: false,
        inline: false,
        injectClient: false,
        liveReload: false,
    }

    // The background.js is too big to analyzed by the Firefox Addon's linter.
    if (target.Firefox && env === 'production') {
        const TerserPlugin = require('terser-webpack-plugin')
        config.plugins.push(new TerserPlugin())
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
        /** @type {'Chromium' | 'Firefox' | 'WKWebview' | 'E2E' | undefined} */
        let buildTarget = undefined
        /** @type {'android' | 'desktop' | 'GeckoView' | undefined} */
        let firefoxVariant = undefined
        /** @type {'app' | 'browser'} */
        let genericTarget = 'browser'
        if (target.Chromium) buildTarget = 'Chromium'
        if (target.Firefox) buildTarget = 'Firefox'
        if (target.FirefoxDesktop) firefoxVariant = 'desktop'
        if (target.FirefoxForAndroid) firefoxVariant = 'android'
        if (target.StandaloneGeckoView) {
            firefoxVariant = 'GeckoView'
            genericTarget = 'facebookApp'
        }
        if (target.WKWebview) {
            buildTarget = 'WKWebview'
            genericTarget = 'facebookApp'
        }
        if (target.E2E) buildTarget = 'E2E'
        if (buildTarget)
            config.plugins.push(
                new webpack.DefinePlugin({
                    'webpackEnv.target': JSON.stringify(buildTarget),
                    'webpackEnv.genericTarget': JSON.stringify(genericTarget),
                }),
            )
        if (firefoxVariant)
            config.plugins.push(
                new webpack.DefinePlugin({
                    'webpackEnv.firefoxVariant': JSON.stringify(firefoxVariant),
                }),
            )
    }

    // Manifest modifies
    {
        const manifest = require('./src/manifest.json')
        const modifiers = require('./config-overrides/manifest.overrides')
        if (target.Chromium) modifiers.chromium(manifest)
        if (target.FirefoxDesktop) modifiers.firefox(manifest)
        if (target.FirefoxForAndroid) modifiers.firefox(manifest)
        if (target.StandaloneGeckoView) modifiers.geckoview(manifest)
        if (target.WKWebview) modifiers.WKWebview(manifest)
        if (env === 'development' || target.E2E) modifiers.development(manifest, target)
        else modifiers.production(manifest, target)

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
    polyfills.map((x) => void fs.copyFileSync(x, path.join(publicPolyfill, path.basename(x))))

    if (env !== 'development') {
        config.plugins.push(new SSRPlugin('popup.html', src('./src/extension/popup-page/index.tsx')))
        config.plugins.push(new SSRPlugin('index.html', src('./src/index.tsx')))
    }
    // futureEmitAssets prevents webpackDevServer from writing file to disk
    config.output.futureEmitAssets = false
    return config
}

/**
 * @returns {import('webpack').Rule}
 */
function addTSLoader() {
    return {
        test: /\.(js|ts|tsx)$/,
        include: src('./src'),
        loader: require.resolve('ts-loader'),
        options: {
            transpileOnly: true,
            compilerOptions: {
                module: 'esnext',
                jsx: 'react',
                noEmit: false,
                importsNotUsedAsValues: 'remove',
            },
        },
    }
}

/**
 * (Copied from cra and not modified.)
 * Some libraries import Node modules but don't use them in the browser.
 * Tell Webpack to provide empty mocks for them so importing them works.
 * @returns {import('webpack').Configuration['node']}
 */
function disabledNodeBuiltins() {
    return {
        module: 'empty',
        dgram: 'empty',
        dns: 'mock',
        fs: 'empty',
        http2: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    }
}
