import path from 'path'
import fs, { promises } from 'fs'

import { Configuration, ProvidePlugin, DefinePlugin, EnvironmentPlugin } from 'webpack'
// Merge declaration of Configuration defined in webpack
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'

//#region Development plugins
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
//#endregion
//#region Other plugins
import CopyPlugin from 'copy-webpack-plugin'
import HTMLPlugin from 'html-webpack-plugin'
import WebExtensionTarget from 'webpack-target-webextension'
import ManifestPlugin from 'webpack-extension-manifest-plugin'
import { ReadonlyCachePlugin } from './miscs/ReadonlyCachePlugin'
//#endregion

import git from '@nice-labs/git-rev'

import * as modifiers from './miscs/manifest-modifiers'

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
    isProfile: boolean
    disableHMR?: boolean
    disableReactHMR?: boolean
    hmrPort?: number
    noEval?: boolean
    readonlyCache?: boolean
}) {
    // https://github.com/facebook/react/issues/20377 React-devtools conflicts with react-refresh
    const disableReactHMR = opts.isProfile || opts.disableReactHMR
    const { mode, target, name, noEval, dist, hmrPort, isProfile } = opts
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
                'async-call-rpc$': require.resolve('async-call-rpc/full'),
                lodash: require.resolve('lodash-es'),
                // Strange...
                '@dimensiondev/holoflows-kit': require.resolve('@dimensiondev/holoflows-kit/es'),
                // It's a node impl for xhr which is unnecessary
                'xhr2-cookies': require.resolve('./miscs/package-overrides/xhr2-cookies'),
                // Monorepo building speed optimization
                // Those packages are also installed as dependencies so they appears in node_modules
                // By aliasing them to the original position, we can speed up the compile because there is no need to wait tsc build them to the dist folder.
                '@masknet/dashboard$': src('../dashboard/src/entry.tsx'),
                '@masknet/injected-script': src('../injected-script/sdk'),
                '@masknet/shared': src('../shared/src/'),
                '@masknet/shared-base': src('../shared-base/src/'),
                '@masknet/theme': src('../theme/src/'),
                '@masknet/icons': require.resolve('../icons/index.ts'),
                '@masknet/plugin-infra': src('../plugin-infra/src/'),
                '@masknet/plugin-example': src('../plugins/example/src/'),
                '@masknet/plugin-wallet': src('../plugins/Wallet/src/'),
                '@masknet/external-plugin-previewer': src('../external-plugin-previewer/src/'),
                '@masknet/web3-shared': src('../web3-shared/src/'),
                '@masknet/public-api': src('../public-api/src/'),
                '@uniswap/v3-sdk': require.resolve('@uniswap/v3-sdk/dist/index.js'),
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
                    test: /\.tsx?$/,
                    parser: { worker: ['OnDemandWorker', '...'] },
                    // Compile all ts files in the workspace
                    include: src('../'),
                    loader: require.resolve('swc-loader'),
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'typescript',
                                dynamicImport: true,
                                tsx: true,
                                importAssertions: true,
                            },
                            target: 'es2019',
                            externalHelpers: true,
                            transform: {
                                react: {
                                    runtime: 'automatic',
                                    useBuiltins: true,
                                    development: disableReactHMR ? false : mode === 'development',
                                    refresh: {
                                        refreshReg: '$RefreshReg$',
                                        refreshSig: '$RefreshSig$',
                                        emitFullSignatures: true,
                                    },
                                },
                            },
                        },
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
            // Note: In development mode gitInfo will share across cache (and get inaccurate result). I (@Jack-Works) think this is a valuable trade-off.
            (mode === 'development' ? EnvironmentPluginCache : EnvironmentPluginNoCache)({
                ...getGitInfo(target.isReproducibleBuild),
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
            // https://github.com/webpack/webpack/issues/13581
            opts.readonlyCache && new ReadonlyCachePlugin(),
        ].filter(nonNullable),
        optimization: {
            minimize: false,
            // Injected scripts must have it's own runtime chunks.
            // HMR must have single runtime chunks
            runtimeChunk: disableHMR ? undefined : 'single',
            splitChunks: {
                // Chrome bug https://bugs.chromium.org/p/chromium/issues/detail?id=1108199
                automaticNameDelimiter: '-',
                maxInitialRequests: Infinity,
                chunks: 'all',
                cacheGroups: {
                    // per-npm-package splitting
                    defaultVendors: {
                        test: /[/\\]node_modules[/\\]/,
                        name(module) {
                            const path = (module.context as string)
                                .replace(/\\/g, '/')
                                .match(/node_modules\/\.pnpm\/(.+)/)![1]
                                .split('/')
                            // [@org+pkgname@version, node_modules, @org, pkgname, ...inner path]
                            if (path[0].startsWith('@')) return `npm-ns.${path[2].replace('@', '')}.${path[3]}`
                            // [pkgname@version, node_modules, pkgname, ...inner path]
                            return `npm.${path[2]}`
                        },
                    },
                },
            },
        },
        output: {
            environment: {
                arrowFunction: true,
                const: true,
                destructuring: true,
                forOf: true,
                module: false,
                bigIntLiteral: false,
                dynamicImport: !target.iOS,
            },
            path: dist,
            filename: 'js/[name].js',
            // In some cases webpack will emit files starts with "_" which is reserved in web extension.
            chunkFilename: 'js/chunk.[name].js',
            hotUpdateChunkFilename: 'hot.[id].[fullhash].js',
            hotUpdateMainFilename: 'hot.[runtime].[fullhash].json',
            globalObject: 'globalThis',
            publicPath: '/',
            clean: mode === 'production',
        },
        ignoreWarnings: [/Failed to parse source map/],
        // @ts-ignore
        devServer: {
            host: '127.0.0.1',
            compress: false,
            devMiddleware: {
                // Have to write disk cause plugin cannot be loaded over network
                writeToDisk: true,
            },
            client: disableHMR
                ? false
                : {
                      overlay: false,
                      progress: false,
                      webSocketURL: {
                          protocol: 'ws',
                          hostname: '127.0.0.1',
                          port: hmrPort,
                      },
                  },
            // WDS does not support chrome-extension:// browser-extension://
            allowedHosts: 'all',
            hot: disableHMR ? false : 'only',
            port: hmrPort,
            headers: {
                // We're doing CORS request for HMR
                'Access-Control-Allow-Origin': '*',
            },
            static: { watch: { ignored: /\bnode_modules\b/ } },
        } as DevServerConfiguration,
        stats: mode === 'development' ? undefined : 'errors-only',
    }
    if (isProfile) {
        config.resolve!.alias!['react-dom$'] = 'react-dom/profiling'
        config.resolve!.alias!['scheduler/tracing'] = 'scheduler/tracing-profiling'
    }
    return config
    function getHotModuleReloadPlugin() {
        if (disableHMR) return []
        // overlay is not working in our environment
        return [!disableReactHMR && new ReactRefreshWebpackPlugin({ overlay: false, esModule: true })].filter(
            nonNullable,
        )
    }
}
function nonNullable<T>(x: T | false | undefined | null): x is T {
    return Boolean(x)
}

type Argv = {
    mode?: 'production' | 'development'
    outputPath?: string
}

export default async function (cli_env: Record<string, boolean> = {}, argv: Argv) {
    const target = getCompilationInfo(cli_env)
    const mode: 'production' | 'development' = argv.mode ?? 'production'
    const defaultDist = mode === 'production' ? root('./build') : root('./dist')
    const dist = argv.outputPath
        ? path.isAbsolute(argv.outputPath)
            ? argv.outputPath
            : root(argv.outputPath)
        : defaultDist
    const disableHMR = Boolean(process.env.NO_HMR)
    const isManifestV3 = target.runtimeEnv.manifest === 3

    const shared = { mode, target, dist, isProfile: target.isProfile, readonlyCache: target.readonlyCache }
    const main = config({ ...shared, disableHMR, name: 'main' })
    const manifestV3 = config({ ...shared, disableHMR: true, name: 'background-worker', hmrPort: 35938 })
    // Modify Main
    {
        main.plugins!.push(
            new (WebExtensionTarget as any)(), // See https://github.com/crimx/webpack-target-webextension,
            new CopyPlugin({ patterns: [{ from: publicDir, to: dist }] }),
            new CopyPlugin({ patterns: [{ from: src('../injected-script/dist/injected-script.js'), to: dist }] }),
            new CopyPlugin({ patterns: [{ from: src('../mask-sdk/dist/mask-sdk.js'), to: dist }] }),
            getManifestPlugin(),
        )
        main.entry = {
            'options-page': withBrowserPolyfill(...withReactDevTools(src('./src/extension/options-page/index.tsx'))),
            'dashboard-next': withBrowserPolyfill(...withReactDevTools(src('./src/extension/dashboard/index.tsx'))),
            'content-script': withBrowserPolyfill(...withReactDevTools(src('./src/content-script.ts'))),
            'browser-action': withBrowserPolyfill(
                ...withReactDevTools(src('./src/extension/browser-action/index.tsx')),
            ),
            'background-service': withBrowserPolyfill(src('./src/background-service.ts')),
            debug: withBrowserPolyfill(src('./src/extension/debug-page')),
            popups: withBrowserPolyfill(src('./src/extension/popups/render.tsx')),
        }
        if (isManifestV3) delete main.entry['background-script']
        for (const entry in main.entry) {
            main.entry[entry] = iOSWebExtensionShimHack(...toArray(main.entry[entry] as any))
        }
        main.plugins!.push(
            getHTMLPlugin({ chunks: ['options-page'], filename: 'index.html' }),
            getHTMLPlugin({ chunks: ['browser-action'], filename: 'browser-action.html' }),
            getHTMLPlugin({ chunks: ['content-script'], filename: 'generated__content__script.html' }),
            getHTMLPlugin({ chunks: ['debug'], filename: 'debug.html' }),
            getHTMLPlugin({ chunks: ['popups'], filename: 'popups.html' }),
            getHTMLPlugin({ chunks: ['dashboard-next'], filename: 'next.html' }),
        ) // generate pages for each entry
        if (!isManifestV3)
            main.plugins!.push(getHTMLPlugin({ chunks: ['background-service'], filename: 'background.html' }))
    }
    // Modify ManifestV3
    {
        manifestV3.entry = { 'background-worker': src('./src/background-worker.ts') }
        manifestV3.target = ['worker', 'es2018']
        main.plugins!.push(new (WebExtensionTarget as any)())
        // ? Service workers must registered at the / root
        manifestV3.output!.filename = 'manifest-v3.entry.js'
    }
    if (mode === 'production') return [main, isManifestV3 && manifestV3].filter(nonNullable)
    return main

    function withReactDevTools(...x: string[]) {
        // ! Use Firefox Nightly or enable network.websocket.allowInsecureFromHTTPS in about:config, then remove this line (but don't commit)
        if (target.FirefoxEngine) return x
        // if (mode === 'development' || target.isProfile)
        // https://github.com/facebook/react/issues/20377 React-devtools conflicts with react-refresh
        if (target.isProfile) return [src('./miscs/package-overrides/react-devtools'), ...x]
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
    const isProfile = !!argv.profile
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
    const readonlyCache = !!argv.readonlyCache

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
        readonlyCache,
    }
}

export type Target = ReturnType<typeof getCompilationInfo>
/** Get git info */
function getGitInfo(reproducible: boolean) {
    if (!reproducible && git.isRepository())
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
            WEB3_CONSTANTS_RPC: process.env.WEB3_CONSTANTS_RPC ?? '',
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
        WEB3_CONSTANTS_RPC: process.env.WEB3_CONSTANTS_RPC ?? '',
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
promises.readdir(path.join(__dirname, '../../dist')).then(
    async (files) => {
        for (const file of files) {
            if (!file.includes('hot')) continue
            await promises.unlink(path.join(__dirname, '../../dist/', file)).catch(() => {})
        }
    },
    () => {},
)
