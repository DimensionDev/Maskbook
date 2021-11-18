/* spell-checker: disable */
import { Configuration, ProvidePlugin, DefinePlugin, EnvironmentPlugin } from 'webpack'
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'

import WebExtensionPlugin from 'webpack-target-webextension'
import CopyPlugin from 'copy-webpack-plugin'
import HTMLPlugin from 'html-webpack-plugin'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import { ReadonlyCachePlugin } from './ReadonlyCachePlugin'
import { EnvironmentPluginCache, EnvironmentPluginNoCache } from './EnvironmentPlugin'
import { emitManifestFile } from './manifest'
import { emitGitInfo, getGitInfo } from './git-info'

import { isAbsolute, join } from 'path'
import { readFileSync } from 'fs'
import { nonNullable, EntryDescription, normalizeEntryDescription, joinEntryItem } from './utils'
import { BuildFlags, normalizeBuildFlags, computedBuildFlags } from './flags'

import './clean-hmr'

export function createConfiguration(rawFlags: BuildFlags): Configuration {
    const normalizedFlags = normalizeBuildFlags(rawFlags)
    const { sourceMapKind } = computedBuildFlags(normalizedFlags)
    const { hmr, mode, profiling, reactRefresh, readonlyCache, reproducibleBuild, runtime, outputPath } =
        normalizedFlags

    const distFolder = (() => {
        if (outputPath) {
            if (isAbsolute(outputPath)) return outputPath
            else return join(__dirname, '../../../', outputPath)
        }
        return join(__dirname, '../../../', mode === 'development' ? 'dist' : 'build')
    })()
    const polyfillFolder = join(distFolder, './polyfill')

    const baseConfig: Configuration = {
        name: 'mask',
        mode,
        devtool: sourceMapKind,
        target: ['web', 'es2019'],
        entry: {},
        experiments: { backCompat: false },
        cache: {
            type: 'filesystem',
            buildDependencies: { config: [__filename] },
            version: (() => {
                // In development mode we treat all envs as static. Each runtimeEnv will have it own cache.
                // Therefore, those modules will be marked as cacheable (to not re-build very often).
                // In production mode we mark them as runtime value so different targets can share a cache.
                const envCacheKey = mode === 'development' ? JSON.stringify(runtime) : 'build'
                return `1-node${process.version}-${envCacheKey}`
            })(),
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx'],
            alias: (() => {
                const alias = {
                    // We want to always use the full version.
                    'async-call-rpc$': require.resolve('async-call-rpc/full'),
                    '@dimensiondev/holoflows-kit': require.resolve('@dimensiondev/holoflows-kit/es'),
                    // It's a Node impl for xhr which is unnecessary
                    'xhr2-cookies': require.resolve('./package-overrides/xhr2-cookies.js'),
                    // Monorepo building speed optimization
                    // Those packages are also installed as dependencies so they appears in node_modules
                    // By aliasing them to the original position,
                    // we can speed up the compile because there is no need to wait tsc build them to the dist folder.
                    '@masknet/dashboard$': require.resolve('../../dashboard/src/entry.tsx'),
                    '@masknet/injected-script': join(__dirname, '../../injected-script/sdk'),
                    '@masknet/shared': join(__dirname, '../../shared/src/'),
                    '@masknet/shared-base': join(__dirname, '../../shared-base/src/'),
                    '@masknet/theme': join(__dirname, '../../theme/src/'),
                    '@masknet/icons': join(__dirname, '../../icons/index.ts'),
                    '@masknet/web3-kit': join(__dirname, '../../web3-kit/src/'),
                    '@masknet/web3-shared-evm': join(__dirname, '../../web3-shared/evm/'),
                    '@masknet/web3-shared-flow': join(__dirname, '../../web3-shared/flow/'),
                    '@masknet/web3-shared-solana': join(__dirname, '../../web3-shared/solana/'),
                    '@masknet/plugin-infra': join(__dirname, '../../plugin-infra/src/'),
                    '@masknet/plugin-example': join(__dirname, '../../plugins/example/src/'),
                    '@masknet/plugin-flow': join(__dirname, '../../plugins/Flow/src/'),
                    '@masknet/plugin-wallet': join(__dirname, '../../plugins/Wallet/src/'),
                    '@masknet/external-plugin-previewer': join(__dirname, '../../external-plugin-previewer/src/'),
                    '@masknet/public-api': join(__dirname, '../../public-api/src/'),
                    '@masknet/sdk': join(__dirname, '../../mask-sdk/server/'),
                    '@masknet/backup-format': join(__dirname, '../../backup-format/src/'),
                    '@uniswap/v3-sdk': require.resolve('@uniswap/v3-sdk/dist/index.js'),
                }
                if (profiling) {
                    alias['react-dom$'] = 'react-dom/profiling'
                    alias['scheduler/tracing'] = 'scheduler/tracing-profiling'
                }
                return alias
            })(),
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
            parser: {
                javascript: {
                    // Treat as missing export as error
                    strictExportPresence: true,
                    // gun and @unstoppabledomains/resolution
                    exprContextCritical: false,
                },
            },
            rules: [
                // Opt in source map
                { test: /(async-call|webextension).+\.js$/, enforce: 'pre', use: ['source-map-loader'] },
                // TypeScript
                {
                    test: /\.tsx?$/,
                    parser: { worker: ['OnDemandWorker', '...'] },
                    // Compile all ts files in the workspace
                    include: join(__dirname, '../../'),
                    loader: require.resolve('swc-loader'),
                    options: {
                        // https://swc.rs/docs/configuring-swc/
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
                                    refresh: reactRefresh && {
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
        },
        plugins: [
            new ProvidePlugin({
                // Polyfill for Node global "Buffer" variable
                Buffer: ['buffer', 'Buffer'],
                'process.nextTick': 'next-tick',
            }),
            (() => {
                // In development mode, it will be shared across different target (and get inaccurate result).
                // This is a valuable trade-off.
                const runtimeValues = {
                    ...runtime,
                    ...getGitInfo(reproducibleBuild),
                    channel: normalizedFlags.channel,
                }
                if (mode === 'development') return EnvironmentPluginCache(runtimeValues)
                return EnvironmentPluginNoCache(runtimeValues)
            })(),
            new EnvironmentPlugin({
                NODE_ENV: mode,
                NODE_DEBUG: false,
                WEB3_CONSTANTS_RPC: process.env.WEB3_CONSTANTS_RPC ?? '',
            }),
            new DefinePlugin({
                'process.browser': 'true',
                'process.version': JSON.stringify(process.version),
                // MetaMaskInpageProvider => extension-port-stream => readable-stream depends on stdin and stdout
                'process.stdout': '/* stdout */ null',
                'process.stderr': '/* stdin */ null',
            }),
            reactRefresh && new ReactRefreshWebpackPlugin({ overlay: false, esModule: true }),
            // https://github.com/webpack/webpack/issues/13581
            readonlyCache && new ReadonlyCachePlugin(),
            new CopyPlugin({
                patterns: [
                    { from: join(__dirname, '../public/'), to: distFolder },
                    { from: join(__dirname, '../../injected-script/dist/injected-script.js'), to: distFolder },
                    { from: join(__dirname, '../../mask-sdk/dist/mask-sdk.js'), to: distFolder },
                    {
                        context: join(__dirname, '../../polyfills/dist/'),
                        from: '*.js',
                        to: polyfillFolder,
                    },
                    { from: require.resolve('webextension-polyfill/dist/browser-polyfill.js'), to: polyfillFolder },
                ],
            }),
            emitManifestFile(normalizedFlags),
            emitGitInfo(reproducibleBuild),
        ].filter(nonNullable),
        optimization: {
            minimize: false,
            runtimeChunk: false,
            splitChunks: {
                maxInitialRequests: Infinity,
                chunks: 'all',
                cacheGroups: {
                    // split each npm package into a chunk.
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
                // Our iOS App doesn't support dynamic import (it requires a heavy post-build time transform).
                dynamicImport: !(runtime.architecture === 'app' && runtime.engine === 'safari'),
            },
            path: distFolder,
            filename: 'js/[name].js',
            // In some cases webpack will emit files starts with "_" which is reserved in web extension.
            chunkFilename: 'js/chunk.[name].js',
            assetModuleFilename: 'assets/[hash][ext][query]',
            hotUpdateChunkFilename: 'hot/[id].[fullhash].js',
            hotUpdateMainFilename: 'hot/[runtime].[fullhash].json',
            globalObject: 'globalThis',
            publicPath: '/',
            clean: mode === 'production',
        },
        ignoreWarnings: [/Failed to parse source map/],
        // @ts-ignore
        devServer: {
            hot: hmr ? 'only' : false,
            liveReload: false,
            client: hmr ? undefined : false,
        } as DevServerConfiguration,
        stats: process.env.CI ? 'errors-warnings' : undefined,
    }

    const plugins = baseConfig.plugins!
    const entries: Record<string, EntryDescription> = (baseConfig.entry = {
        dashboard: normalizeEntryDescription(join(__dirname, '../src/extension/dashboard/index.tsx')),
        popups: normalizeEntryDescription(join(__dirname, '../src/extension/popups/render.tsx')),
        contentScript: normalizeEntryDescription(join(__dirname, '../src/content-script.ts')),
        debug: normalizeEntryDescription(join(__dirname, '../src/extension/debug-page/index.tsx')),
    })
    baseConfig.plugins!.push(
        addHTMLEntry({ chunks: ['dashboard'], filename: 'dashboard.html' }),
        addHTMLEntry({ chunks: ['popups'], filename: 'popups.html' }),
        addHTMLEntry({ chunks: ['contentScript'], filename: 'generated__content__script.html' }),
        addHTMLEntry({ chunks: ['debug'], filename: 'debug.html' }),
    )
    // background
    if (runtime.manifest === 3) {
        entries.background = {
            import: join(__dirname, '../src/background-worker.ts'),
            filename: 'js/background.js',
        }
        plugins.push(new WebExtensionPlugin({ background: { entry: 'background', manifest: 3 } }))
    } else {
        entries.background = normalizeEntryDescription(join(__dirname, '../src/background-service.ts'))
        plugins.push(new WebExtensionPlugin({ background: { entry: 'background', manifest: 2 } }))
        plugins.push(addHTMLEntry({ chunks: ['background'], filename: 'background.html' }))
    }
    for (const entry in entries) {
        withReactDevTools(entries[entry])
        with_iOSPatch(entries[entry])
    }

    return baseConfig

    function withReactDevTools(entry: EntryDescription) {
        // https://github.com/facebook/react/issues/20377 React-devtools conflicts with react-refresh
        if (reactRefresh) return
        if (!profiling) return

        entry.import = joinEntryItem(join(__dirname, './package-overrides/react-devtools.js'), entry.import)
    }
    function with_iOSPatch(entry: EntryDescription) {
        if (runtime.engine === 'safari' && runtime.architecture === 'app') {
            entry.import = joinEntryItem(entry.import, join(__dirname, '../src/polyfill/permissions.js'))
        }
    }
}
function addHTMLEntry(options: HTMLPlugin.Options = {}) {
    let templateContent = readFileSync(join(__dirname, './template.html'), 'utf8')
    if (options.chunks?.includes('background')) {
        templateContent.replace(`<!-- background -->`, '<script src="/polyfill/secp256k1.js"></script>')
    }
    return new HTMLPlugin({
        templateContent,
        inject: 'body',
        scriptLoading: 'defer',
        ...options,
    })
}
