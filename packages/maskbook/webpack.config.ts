import path from 'path'
import fs, { promises } from 'fs'

import webpack, {
    Configuration,
    HotModuleReplacementPlugin,
    ProvidePlugin,
    DefinePlugin,
    EnvironmentPlugin,
} from 'webpack'
// Merge declaration of Configuration defined in webpack
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'

//#region Development plugins
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
//#endregion

import git from '@nice-labs/git-rev'
import rimraf from 'rimraf'

import * as modifiers from './miscs/manifest-modifiers'
import { promisify } from 'util'

const src = (file: string) => path.join(__dirname, file)
const root = (file: string) => path.join(__dirname, '../../', file)
const publicDir = src('./public')

function EnvironmentPluginCache(def: Record<string, any>) {
    return new EnvironmentPlugin(def)
}
function EnvironmentPluginNoCache(def: Record<string, any>) {
    const next = {} as any
    for (const key in def) {
        // Mark the usage site as not cachable
        next['process.env.' + key] = DefinePlugin.runtimeValue(
            () => (def[key] === undefined ? 'undefined' : JSON.stringify(def[key])),
            true,
        )
    }
    return new DefinePlugin(next)
}

function config(opts: {
    name: string
    target: Target
    mode: Configuration['mode']
    dist: string
    disableHMR?: boolean
    disableReactHMR?: boolean
    hmrPort?: number
    noEval?: boolean
}) {
    const { disableReactHMR, mode, target, name, noEval, dist, hmrPort } = opts
    let { disableHMR } = opts
    const isManifestV3 = target.runtimeEnv.manifest === 3
    if (mode === 'production') disableHMR = true
    if (mode === 'none') throw new TypeError('env cannot be none in this config')

    /** On iOS, eval is async (it is hooked by webextension-shim). */
    const sourceMapKind: Configuration['devtool'] = target.iOS || isManifestV3 || noEval ? false : 'eval-source-map'
    const config: Configuration = {
        name,
        mode,
        devtool: mode === 'development' ? sourceMapKind : false,
        target: ['web', 'es2018'],
        experiments: { asset: true },
        cache: {
            type: 'filesystem',
            buildDependencies: { config: [__filename] },
            // In development mode we treat all envs as static. Each runtimeEnv will have it own cache. Therefor those modules won't be marked as uncacheable (and cause re-build very often).
            // In production mode we mark them as runtime value so different targets can share a cache.
            version: `1-node${process.version}-${mode === 'development' ? JSON.stringify(target.runtimeEnv) : 'build'}`,
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx'],
            alias: {
                // If anyone need profiling React please checkout: https://github.com/facebook/create-react-app/blob/396892/packages/react-scripts/config/webpack.config.js#L338
                'async-call-rpc$': 'async-call-rpc/full',
                lodash: 'lodash-es',
                // Strange...
                '@dimensiondev/holoflows-kit': require.resolve('@dimensiondev/holoflows-kit/es'),
                'xhr2-cookies': require.resolve('./miscs/package-overrides/xhr2-cookies'),
            },
            // Polyfill those Node built-ins
            fallback: {
                http: 'stream-http',
                https: 'https-browserify',
                stream: 'stream-browserify',
                crypto: 'crypto-browserify',
                buffer: 'buffer',
                'text-encoding': '@sinonjs/text-encoding',
            },
        },
        module: {
            // So it will not be conflict with the ProviderPlugin below.
            noParse: /webextension-polyfill/,
            // Treat as missing export as error
            strictExportPresence: true,
            rules: [
                // Opt in source map
                { test: /(async-call|webextension).+\.js$/, enforce: 'pre', use: ['source-map-loader'] },
                // TypeScript
                {
                    test: /\.(ts|tsx)$/,
                    parser: { worker: ['OnDemandWorker', '...'] },
                    include: src('./src'),
                    loader: require.resolve('ts-loader'),
                    options: {
                        transpileOnly: true,
                        compilerOptions: {
                            importsNotUsedAsValues: 'remove',
                            jsx: mode === 'production' ? 'react-jsx' : 'react-jsxdev',
                        },
                        getCustomTransformers: () => ({
                            before: [!disableHMR && !disableReactHMR && ReactRefreshTypeScriptTransformer()].filter(
                                Boolean,
                            ),
                        }),
                    },
                },
            ],
            //#region Dismiss warning in gun
            wrappedContextCritical: false,
            exprContextCritical: false,
            unknownContextCritical: false,
            //#endregion
        },
        plugins: [
            new ProvidePlugin({
                // Polyfill for Node global "Buffer" variable
                Buffer: ['buffer', 'Buffer'],
                'process.nextTick': 'next-tick',
            }),
            new WatchMissingModulesPlugin(path.resolve('node_modules')),
            // Note: In development mode gitInfo will share across cache (and get inaccurate result). I (@Jack-Works) think this is a valuable trade-off.
            (mode === 'development' ? EnvironmentPluginCache : EnvironmentPluginNoCache)({
                ...getGitInfo(),
                ...target.runtimeEnv,
            }),
            new EnvironmentPlugin({ NODE_ENV: mode, NODE_DEBUG: false, STORYBOOK: false }),
            new DefinePlugin({
                'process.browser': 'true',
                'process.version': JSON.stringify(process.version),
                // MetaMaskInpageProvider => extension-port-stream => readable-stream depends on stdin and stdout
                'process.stdout': '/* stdout */ null',
                'process.stderr': '/* stdin */ null',
            }),
            ...getHotModuleReloadPlugin(),
            target.isProfile && new BundleAnalyzerPlugin(),
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
                    defaultVendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module) {
                            const path = (module.context as string)
                                .replace(/\\/g, '/')
                                .match(/node_modules\/\.pnpm\/(.+)/)[1]
                                .split('/')
                            const pkg: string[] = [path[0]]
                            if (path[0].startsWith('@')) pkg.push(path[1])
                            // drop version number
                            pkg[pkg.length - 1] = pkg[pkg.length - 1].replace(/@.+/, '')
                            return `npm.${pkg.join('.').replace('@', '')}`
                        },
                    },
                },
            },
        },
        output: {
            path: dist,
            filename: 'js/[name].js',
            // In some cases webpack will emit files starts with "_" which is reserved in web extension.
            chunkFilename: 'js/chunk.[name].js',
            hotUpdateChunkFilename: 'hot.[id].[fullhash].js',
            hotUpdateMainFilename: 'hot.[runtime].[fullhash].json',
            globalObject: 'globalThis',
            publicPath: '/',
        },
        ignoreWarnings: [/Failed to parse source map/],
        // @ts-ignore
        devServer: {
            // Have to write disk cause plugin cannot be loaded over network
            writeToDisk: true,
            compress: false,
            hot: !disableHMR,
            hotOnly: !disableHMR,
            port: hmrPort,
            // WDS does not support chrome-extension:// browser-extension://
            disableHostCheck: true,
            // Workaround of https://github.com/webpack/webpack-cli/issues/1955
            injectClient: (config) => !disableHMR && config.name !== 'injected-script',
            injectHot: (config) => !disableHMR && config.name !== 'injected-script',
            headers: {
                // We're doing CORS request for HMR
                'Access-Control-Allow-Origin': '*',
            },
            // If the content script runs in https, webpack will connect https://localhost:HMR_PORT
            https: true,
        } as DevServerConfiguration,
    }
    return config
    function getHotModuleReloadPlugin() {
        if (disableHMR) return []
        // overlay is not working in our environment
        return [
            new HotModuleReplacementPlugin(),
            !disableReactHMR && new ReactRefreshWebpackPlugin({ overlay: false }),
        ].filter(Boolean)
    }
}

export default async function (cli_env: Record<string, boolean> = {}, argv: { mode?: 'production' | 'development' }) {
    const target = getCompilationInfo(cli_env)
    const mode: 'production' | 'development' = argv.mode ?? 'production'
    const dist = mode === 'production' ? root('./build') : root('./dist')
    if (mode === 'production') await promisify(rimraf)(root('./build'))
    const disableHMR = Boolean(process.env.NO_HMR)
    const isManifestV3 = target.runtimeEnv.manifest === 3

    const shared = { mode, target, dist }
    const main = config({ ...shared, disableHMR, name: 'main' })
    const manifestV3 = config({ ...shared, disableHMR: true, name: 'background-worker', hmrPort: 35938 })
    const injectedScript = config({
        ...shared,
        disableHMR: true,
        name: 'injected-script',
        noEval: true,
        hmrPort: 35939,
    })
    // Modify Main
    {
        main.plugins!.push(
            new WebExtensionTarget(), // See https://github.com/crimx/webpack-target-webextension,
            new CopyPlugin({ patterns: [{ from: publicDir, to: dist }] }),
            getManifestPlugin(),
            ...getBuildNotificationPlugins(),
        )
        main.entry = {
            'options-page': withBrowserPolyfill(...withReactDevTools(src('./src/extension/options-page/index.tsx'))),
            'dashboard-next': withBrowserPolyfill(...withReactDevTools(src('./src/extension/dashboard/index.tsx'))),
            'content-script': withBrowserPolyfill(...withReactDevTools(src('./src/content-script.ts'))),
            popup: withBrowserPolyfill(...withReactDevTools(src('./src/extension/popup-page/index.tsx'))),
            'background-service': withBrowserPolyfill(src('./src/background-service.ts')),
            debug: withBrowserPolyfill(src('./src/extension/debug-page')),
        }
        if (isManifestV3) delete main.entry['background-script']
        if (mode === 'production') delete main.entry['dashboard-next']
        for (const entry in main.entry) {
            main.entry[entry] = iOSWebExtensionShimHack(...toArray(main.entry[entry] as any))
        }
        main.plugins!.push(
            getHTMLPlugin({ chunks: ['options-page'], filename: 'index.html' }),
            getHTMLPlugin({ chunks: ['popup'], filename: 'popup.html' }),
            getHTMLPlugin({ chunks: ['content-script'], filename: 'generated__content__script.html' }),
            getHTMLPlugin({ chunks: ['debug'], filename: 'debug.html' }),
        ) // generate pages for each entry
        if (mode === 'development')
            main.plugins!.push(getHTMLPlugin({ chunks: ['dashboard-next'], filename: 'next.html' }))
        if (!isManifestV3)
            main.plugins!.push(getHTMLPlugin({ chunks: ['background-service'], filename: 'background.html' }))
    }
    // Modify ManifestV3
    {
        manifestV3.entry = { 'background-worker': src('./src/background-worker.ts') }
        manifestV3.target = ['worker', 'es2018']
        main.plugins!.push(new WebExtensionTarget())
        // ? Service workers must registered at the / root
        manifestV3.output.filename = 'manifest-v3.entry.js'
    }
    // Modify injectedScript
    {
        injectedScript.entry = { 'injected-script': src('./src/extension/injected-script/index.ts') }
        injectedScript.optimization.splitChunks = false
    }
    if (mode === 'production') return [main, isManifestV3 && manifestV3, injectedScript].filter(Boolean)
    // TODO: multiple config seems doesn't work well therefore we start the watch mode webpack compiler manually.
    delete injectedScript.devServer
    // TODO: ignore the message currently
    webpack(injectedScript, () => {}).watch({}, () => {})
    return main

    function withReactDevTools(...x: string[]) {
        // ! Use Firefox Nightly or enable network.websocket.allowInsecureFromHTTPS in about:config, then remove this line (but don't commit)
        if (target.FirefoxEngine) return x
        if (mode === 'development') return [src('./miscs/package-overrides/react-devtools'), ...x]
        return x
    }
    function iOSWebExtensionShimHack(...path: string[]) {
        if (!target.iOS && !target.Android) return path
        return [...path, src('./src/polyfill/permissions.js')]
    }
    function withBrowserPolyfill(...path: string[]) {
        if (target.iOS || target.runtimeEnv.target === 'firefox') return path
        return [src('./miscs/browser-loader.js'), ...path]
    }
    function getBuildNotificationPlugins() {
        if (mode === 'production') return []
        const opt = { title: 'Mask', excludeWarnings: true, skipFirstNotification: true, skipSuccessful: true }
        return [new NotifierPlugin(opt)]
    }
    function getManifestPlugin() {
        const manifest = require('./src/manifest.json')
        if (target.Chromium) modifiers.chromium(manifest)
        else if (target.Firefox) modifiers.firefox(manifest)
        else if (target.Android) modifiers.geckoview(manifest)
        else if (target.iOS) modifiers.safari(manifest)
        else if (target.E2E) modifiers.E2E(manifest)

        if (mode === 'development') modifiers.development(manifest)
        else modifiers.production(manifest)

        if (isManifestV3) modifiers.manifestV3(manifest)

        if (target.runtimeEnv.build === 'beta') modifiers.beta(manifest)
        else if (target.runtimeEnv.build === 'insider') modifiers.nightly(manifest)

        return new ManifestPlugin({ config: { base: manifest } })
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
        runtimeEnv: { target, firefoxVariant, architecture, resolution, build, manifest },
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

const templateContent = fs.readFileSync(src('./miscs/template.html'), 'utf8')
function getHTMLPlugin(options: HTMLPlugin.Options = {}) {
    return new HTMLPlugin({
        templateContent,
        inject: 'body',
        scriptLoading: 'defer',
        ...options,
    })
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
