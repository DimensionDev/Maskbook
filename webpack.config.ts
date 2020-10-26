import path from 'path'
import fs, { promises } from 'fs'

import { Configuration, HotModuleReplacementPlugin, EnvironmentPlugin, ProvidePlugin, RuleSetRule } from 'webpack'
// Merge declaration of Configuration defined in webpack
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'

//#region Development plugins
import WebExtensionHotLoadPlugin from '@dimensiondev/webpack-web-ext-plugin'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import ReactRefreshTypeScriptTransformer from 'react-refresh-typescript'
import WatchMissingModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin'
import NotifierPlugin from 'webpack-notifier'
import ForkTSCheckerPlugin from 'fork-ts-checker-webpack-plugin'
import ForkTSCheckerNotifier from 'fork-ts-checker-notifier-webpack-plugin'
//#endregion
//#region Production plugins
import { SSRPlugin } from './scripts/SSRPlugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
//#endregion
//#region Other plugins
import CopyPlugin from 'copy-webpack-plugin'
import HTMLPlugin from 'html-webpack-plugin'
import WebExtensionTarget from 'webpack-target-webextension'
import ManifestPlugin from 'webpack-extension-manifest-plugin'
//#endregion

import git from '@nice-labs/git-rev'

import * as modifiers from './scripts/manifest-modifiers'

const src = (file: string) => path.join(__dirname, file)
const publicDir = src('./public')

export default function (cli_env: Record<string, boolean> = {}, argv: any) {
    const target = getBuildPresets(cli_env)
    const env: 'production' | 'development' = argv.mode ?? 'production'
    const dist = env === 'production' ? src('./build') : src('./dist')

    const enableHMR = env === 'development' && !Boolean(process.env.NO_HMR)

    /**
     * On Firefox, CSP settings does not work. On iOS, eval is async.
     */
    const sourceMapKind: Configuration['devtool'] = target.Safari || target.Firefox ? false : 'eval-source-map'
    const config: Configuration = {
        name: 'main',
        mode: env,
        devtool: env === 'development' ? sourceMapKind : false,
        entry: {}, // ? Defined later
        resolve: {
            extensions: ['.js', '.ts', '.tsx'],
            //#region requirements of https://github.com/crimx/webpack-target-webextension
            mainFields: ['browser', 'module', 'main'],
            aliasFields: ['browser'],
            //#endregion

            // If anyone need profiling React please checkout: https://github.com/facebook/create-react-app/blob/865ea05bc93fd2ac56b7e561181c7dc2cead3e78/packages/react-scripts/config/webpack.config.js#L304
        },
        module: {
            // So it will not be conflict with the ProviderPlugin below.
            noParse: /webextension-polyfill/,
            // Treat as missing export as error
            strictExportPresence: true,
            rules: [
                // Opt in source map
                { test: /(async-call|webextension).+\.js$/, enforce: 'pre', use: ['source-map-loader'] },
                { parser: { requireEnsure: false, amd: false, system: false } },
                getTypeScriptLoader(),
            ],
            //#region Dismiss warning in gun
            wrappedContextCritical: false,
            exprContextCritical: false,
            unknownContextCritical: false,
            //#endregion
        },
        // ModuleNotFoundPlugin & ModuleScopePlugin not included please leave a comment if someone need it.
        plugins: [
            new EnvironmentPlugin({ NODE_ENV: env, ...getGitInfo(), ...getCompilationInfo() }),
            new WatchMissingModulesPlugin(path.resolve('node_modules')),
            // copy assets
            new CopyPlugin({
                patterns: [{ from: publicDir, to: dist, globOptions: { ignore: ['index.html'] } }],
            }),
            getManifestPlugin(),
            ...getBuildNotificationPlugins(),
            ...getWebExtensionReloadPlugin(),
            ...getSSRPlugin(),
            ...getHotModuleReloadPlugin(),
        ].filter(Boolean),
        optimization: {
            minimize: false,
            splitChunks: {
                // Chrome bug https://bugs.chromium.org/p/chromium/issues/detail?id=1108199
                automaticNameDelimiter: '-',
                maxInitialRequests: Infinity,
                chunks: 'all',
                cacheGroups: {
                    // per-npm-package splitting
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module) {
                            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
                            return `npm.${packageName.replace('@', '')}`
                        },
                    },
                },
            },
        },
        output: {
            futureEmitAssets: true,
            path: dist,
            filename: 'js/[name].js',
            chunkFilename: 'js/[name].chunk.js',
            globalObject: 'globalThis',
        },
        target: WebExtensionTarget(nodeConfig), // See https://github.com/crimx/webpack-target-webextension,
        // @ts-ignore sometimes ts don't merge declaration for unknown reason and report
        // Object literal may only specify known properties, and 'devServer' does not exist in type 'Configuration'.ts(2322)
        devServer: {
            // Have to write disk cause plugin cannot be loaded over network
            writeToDisk: true,
            compress: false,
            hot: enableHMR,
            hotOnly: enableHMR,
            // WDS does not support chrome-extension:// browser-extension://
            disableHostCheck: true,
            // Workaround of https://github.com/webpack/webpack-cli/issues/1955
            injectClient: (config) => enableHMR && config.name !== 'injected-script',
            injectHot: (config) => enableHMR && config.name !== 'injected-script',
            headers: {
                // We're doing CORS request for HMR
                'Access-Control-Allow-Origin': '*',
            },
            // If the content script runs in https, webpack will connect https://localhost:HMR_PORT
            https: true,
        } as DevServerConfiguration,
    }
    //#region Define entries
    if (!(target.Firefox || target.Safari)) {
        // Define "browser" globally in Chrome
        config.plugins.push(new ProvidePlugin({ browser: 'webextension-polyfill' }))
    }
    config.entry = {
        'options-page': withReactDevTools(src('./src/extension/options-page/index.tsx')),
        'content-script': withReactDevTools(src('./src/content-script.ts')),
        'background-service': src('./src/background-service.ts'),
        popup: withReactDevTools(src('./src/extension/popup-page/index.tsx')),
        qrcode: src('./src/web-workers/QRCode.ts'),
        debug: src('./src/extension/debug-page'),
    }
    for (const entry in config.entry) {
        config.entry[entry] = iOSWebExtensionShimHack(...toArray(config.entry[entry]))
    }
    config.plugins.push(
        // @ts-ignore
        getHTMLPlugin({ chunks: ['options-page'], filename: 'index.html' }),
        getHTMLPlugin({ chunks: ['background-service'], filename: 'background.html' }),
        getHTMLPlugin({ chunks: ['popup'], filename: 'popup.html' }),
        getHTMLPlugin({ chunks: ['content-script'], filename: 'generated__content__script.html' }),
        getHTMLPlugin({ chunks: ['debug'], filename: 'debug.html' }),
    ) // generate pages for each entry
    //#endregion

    if (argv.profile) config.plugins.push(new BundleAnalyzerPlugin())
    return [
        config,
        {
            name: 'injected-script',
            entry: { 'injected-script': src('./src/extension/injected-script/index.ts') },
            devtool: false,
            output: config.output,
            module: { rules: [getTypeScriptLoader(false)] },
            resolve: config.resolve,
            // We're not using this server, only need it write to disk.
            devServer: {
                writeToDisk: true,
                hot: false,
                injectClient: false,
                injectHot: false,
                port: 35938,
                overlay: false,
            },
            optimization: { splitChunks: false, minimize: false },
            plugins: [
                new EnvironmentPlugin({ NODE_ENV: env }),
                env === 'production' && new CleanWebpackPlugin({}),
            ].filter(Boolean),
        } as Configuration,
    ]

    /** If you are using Firefox and want to use React devtools, use Firefox nightly or start without the flag --firefox, then open about:config and switch network.websocket.allowInsecureFromHTTPS to true */
    function withReactDevTools(...src: string[]) {
        if (target.Firefox && target.Firefox !== 'nightly') return src
        if (env === 'development') return ['react-devtools', ...src]
        return src
    }
    function iOSWebExtensionShimHack(...path: string[]) {
        if (!(target.Safari || target.StandaloneGeckoView)) return path
        return [...path, src('./src/polyfill/permissions.js')]
    }
    function getTypeScriptLoader(hmr = enableHMR): RuleSetRule {
        return {
            test: /\.(ts|tsx)$/,
            include: src('./src'),
            loader: require.resolve('ts-loader'),
            options: {
                transpileOnly: true,
                compilerOptions: {
                    noEmit: false,
                    importsNotUsedAsValues: 'remove',
                },
                getCustomTransformers: () => ({
                    before: hmr ? [ReactRefreshTypeScriptTransformer()] : undefined,
                }),
            },
        }
    }
    function getBuildNotificationPlugins() {
        if (env === 'production') return []
        const opt = { title: 'Maskbook', excludeWarnings: true, skipFirstNotification: true, skipSuccessful: true }
        return [new NotifierPlugin(opt), new ForkTSCheckerPlugin(), new ForkTSCheckerNotifier(opt)]
    }
    function getWebExtensionReloadPlugin() {
        const dist = env === 'production' ? src('./build') : src('./dist')
        if (env === 'production') return []
        let args: ConstructorParameters<typeof WebExtensionHotLoadPlugin>[0] | undefined = undefined
        if (target.FirefoxDesktop)
            args = {
                sourceDir: dist,
                target: 'firefox-desktop',
                firefoxProfile: src('.firefox'),
                keepProfileChanges: true,
                // --firefox=nightly
                firefox: typeof target.FirefoxDesktop === 'string' ? target.FirefoxDesktop : undefined,
            }
        else if (target.Chromium)
            args = {
                sourceDir: dist,
                target: 'chromium',
                chromiumProfile: src('.chrome'),
                keepProfileChanges: true,
            }
        else if (target.FirefoxForAndroid)
            args = {
                sourceDir: dist,
                target: 'firefox-android',
            }
        if (args) return [new WebExtensionHotLoadPlugin(args)]
        return []
    }
    function getManifestPlugin() {
        const manifest = require('./src/manifest.json')
        if (target.Chromium) modifiers.chromium(manifest)
        else if (target.FirefoxDesktop) modifiers.firefox(manifest)
        else if (target.FirefoxForAndroid) modifiers.firefox(manifest)
        else if (target.StandaloneGeckoView) modifiers.geckoview(manifest)
        else if (target.Safari) modifiers.safari(manifest)
        else if (target.E2E) modifiers.E2E(manifest)

        if (env === 'development') modifiers.development(manifest)
        else modifiers.production(manifest)

        return new ManifestPlugin({ config: { base: manifest } })
    }
    function getHotModuleReloadPlugin() {
        if (!enableHMR) return []
        // overlay is not working in our environment
        return [new HotModuleReplacementPlugin(), new ReactRefreshWebpackPlugin({ overlay: false })]
    }

    /** Get environment targets */
    function getCompilationInfo() {
        let buildTarget: 'chromium' | 'firefox' | 'safari' | 'E2E' = 'chromium'
        let firefoxVariant: 'fennec' | 'geckoview' | undefined = undefined
        let architecture: 'web' | 'app' = 'web'
        let resolution: 'desktop' | 'mobile' = 'desktop'
        let buildType: 'stable' | 'beta' | 'insider' = 'stable'
        if (target.Chromium) buildTarget = 'chromium'
        if (target.Firefox) buildTarget = 'firefox'
        if (target.FirefoxForAndroid) firefoxVariant = 'fennec'
        if (target.StandaloneGeckoView) {
            firefoxVariant = 'geckoview'
            architecture = 'app'
        }
        if (target.Safari) {
            buildTarget = 'safari'
            architecture = 'app'
        }
        if (architecture === 'app' || firefoxVariant === 'fennec') resolution = 'mobile'
        if (target.E2E) buildTarget = 'E2E'
        if (target.Beta) buildType = 'beta'
        if (target.Insider) buildType = 'insider'

        // build the envs
        const allEnv = {
            STORYBOOK: false,
            target: buildTarget,
            build: buildType,
            architecture,
            resolution,
        }
        if (firefoxVariant) allEnv[firefoxVariant] = firefoxVariant
        return allEnv
    }
    function getSSRPlugin() {
        if (env === 'development') return []
        return [new SSRPlugin('popup.html', src('./src/extension/popup-page/index.tsx'))]
    }
}

/** All targets available: --firefox --firefox-android --firefox-gecko --chromium --wk-webview --e2e */
function getBuildPresets(argv: any) {
    return {
        Firefox: (argv.firefox || argv['firefox-android'] || argv['firefox-gecko']) as 'nightly' | boolean,
        FirefoxDesktop: argv.firefox as string | boolean,
        FirefoxForAndroid: !!argv['firefox-android'],
        StandaloneGeckoView: !!argv['firefox-gecko'],
        Chromium: !!argv.chromium,
        Safari: !!argv['wk-webview'],
        E2E: !!argv.e2e,
        Beta: !!argv.beta,
        Insider: !!argv.insider,
        ReproducibleBuild: !!argv['reproducible-build'],
    }
}
/** Get git info */
function getGitInfo() {
    if (git.isRepository())
        return {
            BUILD_DATE: new Date().toISOString(),
            VERSION: git.describe('--dirty'),
            TAG_NAME: git.tag(),
            COMMIT_HASH: git.commitHash(true),
            COMMIT_DATE: git.commitDate().toISOString(),
            REMOTE_URL: git.remoteURL(),
            BRANCH_NAME: git.branchName(),
            DIRTY: git.isDirty(),
            TAG_DIRTY: git.isTagDirty(),
        }
    return {
        BUILD_DATE: new Date(0).toISOString(),
        VERSION: require('./package.json').version + '-reproducible',
        TAG_NAME: 'N/A',
        COMMIT_HASH: 'N/A',
        COMMIT_DATE: 'N/A',
        REMOTE_URL: 'N/A',
        BRANCH_NAME: 'N/A',
        DIRTY: false,
        TAG_DIRTY: false,
    }
}

function toArray(x: string | string[]) {
    return typeof x === 'string' ? [x] : x
}

function getHTMLPlugin(options: HTMLPlugin.Options = {}) {
    const templateContent = fs.readFileSync(src('./scripts/template.html'), 'utf8')
    return new HTMLPlugin({
        templateContent,
        inject: 'body',
        ...options,
    })
}
const nodeConfig: Configuration['node'] = {
    module: 'empty',
    dgram: 'empty',
    dns: 'mock',
    fs: 'empty',
    http2: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
    Buffer: true,
    process: 'mock',
    global: true,
    setImmediate: true,
}
// Cleanup old HMR files
promises.readdir(path.join(__dirname, './dist')).then(
    async (files) => {
        for (const file of files) {
            if (!file.includes('hot')) continue
            await promises.unlink(path.join(__dirname, './dist/', file)).catch(() => {})
        }
    },
    () => {},
)
