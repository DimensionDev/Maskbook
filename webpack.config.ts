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
//#endregion
//#region Production plugins
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
//#endregion
//#region Other plugins
import CopyPlugin from 'copy-webpack-plugin'
import HTMLPlugin from 'html-webpack-plugin'
import WebExtensionTarget from 'webpack-target-webextension'
import ManifestPlugin from 'webpack-extension-manifest-plugin'
import Webpack5AssetModuleTransformer from './scripts/transformers/webpack-5-asset-module-backport'
//#endregion

import git from '@nice-labs/git-rev'
import rimraf from 'rimraf'

import * as modifiers from './scripts/manifest-modifiers'
import { promisify } from 'util'

const src = (file: string) => path.join(__dirname, file)
const publicDir = src('./public')

export default async function (cli_env: Record<string, boolean> = {}, argv: { mode?: 'production' | 'development' }) {
    const target = getCompilationInfo(cli_env)
    const env: 'production' | 'development' = argv.mode ?? 'production'
    const dist = env === 'production' ? src('./build') : src('./dist')

    if (env === 'production') await promisify(rimraf)(dist)

    const isManifestV3 = target.runtimeEnv.manifest === 3
    const enableHMR = env === 'development' && !Boolean(process.env.NO_HMR) && !isManifestV3

    /** On iOS, eval is async. */
    const sourceMapKind: Configuration['devtool'] = target.iOS ? false : 'eval-source-map'
    const ProcessEnvPlugin = new EnvironmentPlugin({ NODE_ENV: env, ...getGitInfo(), ...target.runtimeEnv })
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
            alias: { 'async-call-rpc$': 'async-call-rpc/full', lodash: 'lodash-es' },

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
            ProcessEnvPlugin,
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
    if (!target.FirefoxEngine && !target.iOS) {
        // Define "browser" globally in platform that don't have "browser"
        config.plugins!.push(new ProvidePlugin({ browser: 'webextension-polyfill' }))
    }
    config.entry = {
        'options-page': withReactDevTools(src('./packages/maskbook/src/extension/options-page/index.tsx')),
        'content-script': withReactDevTools(src('./packages/maskbook/src/content-script.ts')),
        'background-service': src('./packages/maskbook/src/background-service.ts'),
        popup: withReactDevTools(src('./packages/maskbook/src/extension/popup-page/index.tsx')),
        debug: src('./packages/maskbook/src/extension/debug-page'),
    }
    if (isManifestV3) delete config.entry['background-script']
    for (const entry in config.entry) {
        config.entry[entry] = iOSWebExtensionShimHack(...toArray(config.entry[entry]))
    }
    config.plugins!.push(
        // @ts-ignore
        getHTMLPlugin({ chunks: ['options-page'], filename: 'index.html' }),
        isManifestV3 ? undefined : getHTMLPlugin({ chunks: ['background-service'], filename: 'background.html' }),
        getHTMLPlugin({ chunks: ['popup'], filename: 'popup.html' }),
        getHTMLPlugin({ chunks: ['content-script'], filename: 'generated__content__script.html' }),
        getHTMLPlugin({ chunks: ['debug'], filename: 'debug.html' }),
    ) // generate pages for each entry
    config.plugins = config.plugins.filter(Boolean)
    //#endregion

    if (target.isProfile) config.plugins!.push(new BundleAnalyzerPlugin())
    function getChildConfig(name: string, entry: string, modifier?: (x: Configuration) => void): Configuration {
        const c: Configuration = {
            name,
            entry: { [name]: entry },
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
                port: 35938 + ~~(Math.random() * 1000),
                overlay: false,
            },
            optimization: { splitChunks: false, minimize: false },
            plugins: [ProcessEnvPlugin],
        }
        if (modifier) modifier(c)
        return c
    }
    return [
        config,
        getChildConfig('injected-script', src('./packages/maskbook/src/extension/injected-script/index.ts')),
        isManifestV3 &&
            getChildConfig('background-worker', src('./packages/maskbook/src/background-worker.ts'), (x) => {
                x.target = 'webworker'
                x.output = {
                    futureEmitAssets: true,
                    path: dist,
                    // ? Service workers must registered at the / root
                    filename: 'manifest-v3.entry.js',
                    chunkFilename: 'js/[name]-worker.chunk.js',
                    globalObject: 'globalThis',
                }
            }),
    ].filter(Boolean)

    function withReactDevTools(...src: string[]) {
        // ! Use Firefox Nightly or enable network.websocket.allowInsecureFromHTTPS in about:config, then remove this line (but don't commit)
        if (target.FirefoxEngine) return src
        if (env === 'development') return ['react-devtools', ...src]
        return src
    }
    function iOSWebExtensionShimHack(...path: string[]) {
        if (!target.iOS && !target.Android) return path
        return [...path, src('./packages/maskbook/src/polyfill/permissions.js')]
    }
    function getTypeScriptLoader(hmr = enableHMR): RuleSetRule {
        return {
            test: /\.(ts|tsx)$/,
            include: src('./packages/maskbook/src'),
            loader: require.resolve('ts-loader'),
            options: {
                transpileOnly: true,
                compilerOptions: {
                    importsNotUsedAsValues: 'remove',
                    jsx: env === 'production' ? 'react-jsx' : 'react-jsxdev',
                },
                getCustomTransformers: () => ({
                    before: [Webpack5AssetModuleTransformer(), hmr && ReactRefreshTypeScriptTransformer()].filter(
                        Boolean,
                    ),
                }),
            },
        }
    }
    function getBuildNotificationPlugins() {
        if (env === 'production') return []
        const opt = { title: 'Maskbook', excludeWarnings: true, skipFirstNotification: true, skipSuccessful: true }
        return [new NotifierPlugin(opt)]
    }
    function getWebExtensionReloadPlugin() {
        const dist = env === 'production' ? src('./build') : src('./dist')
        if (env === 'production') return []
        let args: ConstructorParameters<typeof WebExtensionHotLoadPlugin>[0] | undefined = undefined
        if (target.Firefox && enableHMR) return [] // ! stuck on 99% [0] after emitting cause HMR not working
        if (target.Firefox) {
            if (target.webExtensionFirefoxLaunchVariant === 'firefox-desktop') {
                args = {
                    sourceDir: dist,
                    target: 'firefox-desktop',
                    firefoxProfile: src('.firefox'),
                    keepProfileChanges: true,
                    // --firefox=nightly
                    firefox: typeof target.Firefox === 'string' ? target.Firefox : undefined,
                }
            } else if (target.webExtensionFirefoxLaunchVariant === 'firefox-android') {
                args = {
                    sourceDir: dist,
                    target: 'firefox-android',
                }
            }
        } else if (target.Chromium)
            args = {
                sourceDir: dist,
                target: 'chromium',
                chromiumProfile: src('.chrome'),
                keepProfileChanges: true,
            }
        if (args) return [new WebExtensionHotLoadPlugin(args)]
        return []
    }
    function getManifestPlugin() {
        const manifest = require('./packages/maskbook/src/manifest.json')
        if (target.Chromium) modifiers.chromium(manifest)
        else if (target.Firefox) modifiers.firefox(manifest)
        else if (target.Android) modifiers.geckoview(manifest)
        else if (target.iOS) modifiers.safari(manifest)
        else if (target.E2E) modifiers.E2E(manifest)

        if (env === 'development') modifiers.development(manifest)
        else modifiers.production(manifest)

        if (isManifestV3) modifiers.manifestV3(manifest)

        if (target.runtimeEnv.build === 'beta') modifiers.beta(manifest)
        else if (target.runtimeEnv.build === 'insider') modifiers.nightly(manifest)

        return new ManifestPlugin({ config: { base: manifest } })
    }
    function getHotModuleReloadPlugin() {
        if (!enableHMR) return []
        // overlay is not working in our environment
        return [new HotModuleReplacementPlugin(), new ReactRefreshWebpackPlugin({ overlay: false })]
    }

    function getSSRPlugin() {
        if (env === 'development') return []
        return [
            // TODO: Help wanted
            // new SSRPlugin('popup.html', src('./packages/maskbook/src/extension/popup-page/index.tsx'), 'Mask Network'),
        ]
    }
}

type Presets = 'chromium' | 'e2e' | 'firefox' | 'android' | 'iOS'
function getCompilationInfo(argv: any) {
    let preset = 'chromium' as Presets

    //#region build time flags
    let isReproducibleBuild = !!argv.reproducible
    let isProfile = !!argv.profile
    let webExtensionFirefoxLaunchVariant = 'firefox-desktop' as 'firefox-desktop' | 'firefox-android'
    //#endregion

    //#region Set preset
    if (argv.chromium) preset = 'chromium'
    else if (argv.firefox) {
        preset = 'firefox'
        isReproducibleBuild = true
    } else if (argv.android) {
        preset = 'android'
        webExtensionFirefoxLaunchVariant = 'firefox-android'
    } else if (argv.iOS) preset = 'iOS'
    else if (argv.E2E) preset = 'e2e'
    else preset = 'chromium'
    //#endregion

    // ! this section must match packages/maskbook/src/env.d.ts
    let target: 'chromium' | 'firefox' | 'safari' | 'E2E' = 'chromium'
    let firefoxVariant: 'fennec' | 'geckoview' | false = false
    let architecture: 'web' | 'app' = 'web'
    let resolution: 'desktop' | 'mobile' = 'desktop'
    let build: 'stable' | 'beta' | 'insider' = 'stable'
    let manifest: 2 | 3 = 2

    //#region Manifest V3
    if (argv['manifest-v3']) {
        preset = 'chromium'
        manifest = 3
    }
    //#endregion

    //#region Build presets
    if (preset === 'chromium') {
    } else if (preset === 'firefox') {
        target = 'firefox'
        firefoxVariant = 'fennec'
    } else if (preset === 'android') {
        target = 'firefox'
        firefoxVariant = 'geckoview'
        architecture = 'app'
        resolution = 'mobile'
    } else if (preset === 'e2e') {
        target = 'E2E'
    } else if (preset === 'iOS') {
        target = 'safari'
        architecture = 'app'
        resolution = 'mobile'
    } else {
        throw new TypeError('Unknown preset ' + preset)
    }
    //#endregion

    //#region Build version Stable/Beta/Insider
    if (argv.insider) build = 'insider'
    else if (argv.beta) build = 'beta'
    else build = 'stable'
    //#endregion

    return {
        runtimeEnv: { target, firefoxVariant, architecture, resolution, build, manifest, STORYBOOK: false },
        isReproducibleBuild,
        isProfile,
        webExtensionFirefoxLaunchVariant,
        // Shortcut properties
        Chromium: preset === 'chromium',
        iOS: preset === 'iOS',
        Android: preset === 'android',
        E2E: preset === 'e2e',
        FirefoxEngine: preset === 'firefox' || preset === 'android',
        // ! We cannot upload different version for Firefox desktop and Firefox Android, so they must emit same output.
        Firefox: preset === 'firefox',
    }
}

export type Target = ReturnType<typeof getCompilationInfo>
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
