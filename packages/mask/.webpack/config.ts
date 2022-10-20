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
    const { sourceMapKind, lockdown } = computedBuildFlags(normalizedFlags)
    const { hmr, mode, profiling, reactRefresh, devtools, readonlyCache, reproducibleBuild, runtime, outputPath } =
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
        target: ['web', 'es2022'],
        entry: {},
        experiments: { backCompat: false, asyncWebAssembly: true },
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
            extensionAlias: {
                '.js': ['.tsx', '.ts', '.js'],
                '.mjs': ['.mts', '.mjs'],
            },
            extensions: ['.js', '.ts', '.tsx'],
            alias: (() => {
                const alias = {
                    // We want to always use the full version.
                    'async-call-rpc$': require.resolve('async-call-rpc/full'),
                    '@dimensiondev/holoflows-kit': require.resolve('@dimensiondev/holoflows-kit/es'),
                    // It's a Node impl for xhr which is unnecessary
                    'xhr2-cookies': require.resolve('./package-overrides/xhr2-cookies.js'),
                    // fake esm
                    '@uniswap/v3-sdk': require.resolve('@uniswap/v3-sdk/dist/index.js'),
                }
                if (lockdown) {
                    // https://github.com/near/near-api-js/issues/833
                    alias['error-polyfill'] = require.resolve('./package-overrides/null.js')
                }
                if (profiling || (mode === 'production' && devtools)) {
                    alias['react-dom$'] = 'react-dom/profiling'
                }
                if (devtools) {
                    // Note: when devtools is enabled, we will install react-refresh/runtime manually to keep the correct react global hook installation order.
                    // https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/680
                    alias[require.resolve('@pmmmwh/react-refresh-webpack-plugin/client/ReactRefreshEntry.js')] =
                        require.resolve('./package-overrides/null.js')
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
                },
            },
            rules: [
                // Opt in source map
                { test: /(async-call|webextension).+\.js$/, enforce: 'pre', use: ['source-map-loader'] },
                // Patch regenerator-runtime
                lockdown
                    ? {
                          test: /\..?js$/,
                          loader: require.resolve('./fix-regenerator-runtime.ts'),
                      }
                    : undefined!,
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
                            },
                            target: 'es2022',
                            externalHelpers: true,
                            transform: {
                                react: {
                                    runtime: 'automatic',
                                    refresh: reactRefresh && {
                                        refreshReg: '$RefreshReg$',
                                        refreshSig: '$RefreshSig$',
                                        emitFullSignatures: true,
                                    },
                                },
                            },
                            experimental: {
                                keepImportAssertions: true,
                            },
                        },
                    },
                },
                // compress svg files
                mode === 'production'
                    ? {
                          test: /\.svg$/,
                          loader: 'svgo-loader',
                          // overrides
                          options: {
                              js2svg: {
                                  pretty: false,
                              },
                          },
                          dependency(data) {
                              if (data === '') return false
                              if (data !== 'url')
                                  throw new TypeError(
                                      'The only import mode valid for a non-JS file is via new URL(). Current import mode: ' +
                                          data,
                                  )
                              return true
                          },
                          type: 'asset/resource',
                      }
                    : undefined!,
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
                    manifest: String(runtime.manifest),
                }
                if (mode === 'development') return EnvironmentPluginCache(runtimeValues)
                return EnvironmentPluginNoCache(runtimeValues)
            })(),
            new EnvironmentPlugin({
                NODE_ENV: mode,
                shadowRootMode: devtools ? 'open' : 'closed',
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
                    { from: join(__dirname, '../../gun-utils/gun.js'), to: distFolder },
                    { from: join(__dirname, '../../mask-sdk/dist/mask-sdk.js'), to: distFolder },
                    {
                        context: join(__dirname, '../../polyfills/dist/'),
                        from: '*.js',
                        to: polyfillFolder,
                    },
                    { from: require.resolve('webextension-polyfill/dist/browser-polyfill.js'), to: polyfillFolder },
                    {
                        from:
                            mode === 'development'
                                ? require.resolve('../../../node_modules/ses/dist/lockdown.umd.js')
                                : require.resolve('../../../node_modules/ses/dist/lockdown.umd.min.js'),
                        to: join(polyfillFolder, 'lockdown.js'),
                    },
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
                module: false,
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
            trustedTypes: {
                policyName: 'webpack',
            },
        },
        ignoreWarnings: [/Failed to parse source map/],
        // @ts-ignore
        devServer: {
            hot: hmr ? 'only' : false,
            liveReload: false,
            client: hmr ? undefined : false,
        } as DevServerConfiguration,
        stats: mode === 'production' ? 'errors-only' : undefined,
    }
    baseConfig.module!.rules = baseConfig.module!.rules!.filter(Boolean)

    const plugins = baseConfig.plugins!
    const entries: Record<string, EntryDescription> = (baseConfig.entry = {
        dashboard: normalizeEntryDescription(join(__dirname, '../src/extension/dashboard/index.tsx')),
        popups: normalizeEntryDescription(join(__dirname, '../src/extension/popups/SSR-client.ts')),
        contentScript: normalizeEntryDescription(join(__dirname, '../src/content-script.ts')),
        debug: normalizeEntryDescription(join(__dirname, '../src/extension/debug-page/index.tsx')),
    })
    baseConfig.plugins!.push(
        addHTMLEntry({ chunks: ['dashboard'], filename: 'dashboard.html', lockdown }),
        addHTMLEntry({ chunks: ['popups'], filename: 'popups.html', lockdown }),
        addHTMLEntry({
            chunks: ['contentScript'],
            filename: 'generated__content__script.html',
            lockdown,
        }),
        addHTMLEntry({ chunks: ['debug'], filename: 'debug.html', lockdown }),
    )
    if (devtools) {
        entries.devtools = normalizeEntryDescription(join(__dirname, '../devtools/panels/index.tsx'))
        baseConfig.plugins!.push(
            addHTMLEntry({ chunks: ['devtools'], filename: 'devtools-background.html', lockdown: false }),
        )
    }
    // background
    if (runtime.manifest === 3) {
        entries.background = {
            import: join(__dirname, '../background/mv3-entry.ts'),
            filename: 'js/background.js',
        }
        plugins.push(new WebExtensionPlugin({ background: { entry: 'background', manifest: 3 } }))
    } else {
        entries.background = normalizeEntryDescription(join(__dirname, '../background/mv2-entry.ts'))
        plugins.push(new WebExtensionPlugin({ background: { entry: 'background', manifest: 2 } }))
        plugins.push(
            addHTMLEntry({
                chunks: ['background'],
                filename: 'background.html',
                gun: true,
                lockdown,
            }),
        )
    }
    for (const entry in entries) {
        if (entry !== 'background' && entry !== 'devtools') {
            withReactDevTools(entries[entry])
        }
        with_iOSPatch(entries[entry])
    }

    return baseConfig

    function withReactDevTools(entry: EntryDescription) {
        if (!devtools) return
        entry.import = joinEntryItem(join(__dirname, '../devtools/content-script/index.ts'), entry.import)
    }
    function with_iOSPatch(entry: EntryDescription) {
        if (runtime.engine === 'safari' && runtime.architecture === 'app') {
            entry.import = joinEntryItem(entry.import, join(__dirname, '../src/polyfill/permissions.js'))
        }
    }
}
function addHTMLEntry(
    options: HTMLPlugin.Options & {
        gun?: boolean
        lockdown: boolean
    },
) {
    let templateContent = readFileSync(join(__dirname, './template.html'), 'utf8')
    if (options.gun) {
        templateContent = templateContent.replace(`<!-- Gun -->`, '<script src="/gun.js"></script>')
    }
    if (options.lockdown) {
        templateContent = templateContent.replace(
            `<!-- lockdown -->`,
            `<script src="/polyfill/lockdown.js"></script>
        <script src="/lockdown.js"></script>`,
        )
    }
    return new HTMLPlugin({
        templateContent,
        inject: 'body',
        scriptLoading: 'defer',
        minify: false,
        ...options,
    })
}
