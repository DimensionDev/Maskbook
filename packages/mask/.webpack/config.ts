/* spell-checker: disable */
import webpack from 'webpack'
const { ProvidePlugin, DefinePlugin, EnvironmentPlugin } = webpack
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'

import WebExtensionPlugin from 'webpack-target-webextension'
import DevtoolsIgnorePlugin from 'devtools-ignore-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import HTMLPlugin from 'html-webpack-plugin'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import { EnvironmentPluginCache, EnvironmentPluginNoCache } from './EnvironmentPlugin.js'
import { emitManifestFile } from './manifest.js'
import { emitGitInfo, getGitInfo } from './git-info.js'

import { dirname, join } from 'node:path'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

import { type EntryDescription, normalizeEntryDescription, joinEntryItem } from './utils.js'
import { type BuildFlags, normalizeBuildFlags, computedBuildFlags, computeCacheKey } from './flags.js'

import './clean-hmr.js'

const __dirname = fileURLToPath(dirname(import.meta.url))
const require = createRequire(import.meta.url)
export async function createConfiguration(_inputFlags: BuildFlags): Promise<webpack.Configuration> {
    const VERSION = JSON.parse(await readFile(new URL('../src/manifest.json', import.meta.url), 'utf-8')).version
    const flags = normalizeBuildFlags(_inputFlags)
    const computedFlags = computedBuildFlags(flags)
    const cacheKey = computeCacheKey(flags, computedFlags)

    const polyfillFolder = join(flags.outputPath, './polyfill')

    const patchesDir = join(__dirname, '../../../patches')
    const pnpmPatches = readdirSync(patchesDir).map((x) => join(patchesDir, x))
    const baseConfig: webpack.Configuration = {
        name: 'mask',
        // to set a correct base path for source map
        context: join(__dirname, '../../../'),
        mode: flags.mode,
        devtool: computedFlags.sourceMapKind,
        target: ['web', 'es2022'],
        entry: {},
        experiments: {
            backCompat: false,
            asyncWebAssembly: true,
            syncImportAssertion: true,
            deferImport: { asyncModule: 'error' },
        },
        cache: {
            type: 'filesystem',
            readonly: flags.readonlyCache,
            buildDependencies: {
                config: [fileURLToPath(import.meta.url)],
                patches: pnpmPatches,
            },
            version: cacheKey,
        },
        resolve: {
            extensionAlias: {
                '.js': ['.js', '.tsx', '.ts'],
                '.mjs': ['.mjs', '.mts'],
            },
            extensions: ['.js', '.ts', '.tsx'],
            alias: (() => {
                const alias: Record<string, string> = {
                    // It's a Node impl for xhr which is unnecessary
                    'xhr2-cookies': require.resolve('./package-overrides/xhr2-cookies.mjs'),
                    'error-polyfill': require.resolve('./package-overrides/null.mjs'),
                }
                if (computedFlags.reactProductionProfiling) alias['react-dom$'] = require.resolve('react-dom/profiling')
                if (flags.devtools) {
                    // Note: when devtools is enabled, we will install react-refresh/runtime manually to keep the correct react global hook installation order.
                    // https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/680
                    alias[require.resolve('@pmmmwh/react-refresh-webpack-plugin/client/ReactRefreshEntry.js')] =
                        require.resolve('./package-overrides/null.mjs')
                }
                return alias
            })(),
            // Polyfill those Node built-ins
            fallback: {
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                stream: require.resolve('stream-browserify'),
                crypto: require.resolve('crypto-browserify'),
                buffer: require.resolve('buffer'),
                'text-encoding': require.resolve('@sinonjs/text-encoding'),
            },
            conditionNames: ['mask-src', '...'],
        },
        module: {
            parser: {
                javascript: {
                    // Treat as missing export as error
                    strictExportPresence: true,
                },
            },
            rules: [
                // Source map for libraries
                computedFlags.sourceMapKind
                    ? { test: /\.js$/, enforce: 'pre', use: [require.resolve('source-map-loader')] }
                    : null,
                // Patch old regenerator-runtime
                {
                    test: /\..?js$/,
                    loader: require.resolve('./fix-regenerator-runtime.ts'),
                },
                // TypeScript
                {
                    test: /\.tsx?$/,
                    parser: { worker: ['OnDemandWorker', '...'] },
                    // Compile all ts files in the workspace
                    include: join(__dirname, '../../'),
                    loader: require.resolve('swc-loader'),
                    options: {
                        sourceMaps: !!computedFlags.sourceMapKind,
                        // https://swc.rs/docs/configuring-swc/
                        jsc: {
                            preserveAllComments: true,
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
                                    refresh: flags.reactRefresh && {
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
                flags.mode === 'production'
                    ? {
                          test: /\.svg$/,
                          loader: require.resolve('svgo-loader'),
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
                    : null,
            ],
        },
        plugins: [
            flags.sourceMapHideFrameworks !== false &&
                new DevtoolsIgnorePlugin({
                    shouldIgnorePath: (path) => {
                        if (path.includes('masknet') || path.includes('dimensiondev')) return false
                        return path.includes('/node_modules/') || path.includes('/webpack/')
                    },
                }),
            new ProvidePlugin({
                // Polyfill for Node global "Buffer" variable
                Buffer: [require.resolve('buffer'), 'Buffer'],
                'process.nextTick': require.resolve('next-tick'),
            }),
            (() => {
                // In development mode, it will be shared across different target to speedup.
                // This is a valuable trade-off.
                const runtimeValues: Record<string, string | boolean> = {
                    ...getGitInfo(flags.reproducibleBuild),
                    channel: flags.channel,
                }
                if (flags.mode === 'development') runtimeValues.REACT_DEVTOOLS_EDITOR_URL = flags.devtoolsEditorURI
                if (flags.mode === 'development') return EnvironmentPluginCache(runtimeValues)
                return EnvironmentPluginNoCache(runtimeValues)
            })(),
            new EnvironmentPlugin({
                NODE_ENV: flags.mode,
                NODE_DEBUG: false,
                WEB3_CONSTANTS_RPC: process.env.WEB3_CONSTANTS_RPC ?? '',
                MASK_SENTRY_DSN: process.env.MASK_SENTRY_DSN ?? '',
            }),
            new DefinePlugin({
                'process.env.VERSION': `(typeof browser === 'object' && browser.runtime ? browser.runtime.getManifest().version : ${JSON.stringify(
                    VERSION,
                )})`,
                'process.browser': 'true',
                'process.version': JSON.stringify('v19.0.0'),
                // MetaMaskInpageProvider => extension-port-stream => readable-stream depends on stdin and stdout
                'process.stdout': '/* stdout */ null',
                'process.stderr': '/* stdin */ null',
            }),
            flags.reactRefresh && new ReactRefreshWebpackPlugin({ overlay: false, esModule: true }),
            new CopyPlugin({
                patterns: [
                    { from: join(__dirname, '../public/'), to: flags.outputPath },
                    { from: join(__dirname, '../../injected-script/dist/injected-script.js'), to: flags.outputPath },
                    { from: join(__dirname, '../../gun-utils/gun.js'), to: flags.outputPath },
                    { from: join(__dirname, '../../mask-sdk/dist/mask-sdk.js'), to: flags.outputPath },
                    {
                        context: join(__dirname, '../../polyfills/dist/'),
                        from: '*.js',
                        to: polyfillFolder,
                    },
                    { from: require.resolve('webextension-polyfill/dist/browser-polyfill.js'), to: polyfillFolder },
                    {
                        from:
                            flags.mode === 'development'
                                ? require.resolve('../../../node_modules/ses/dist/lockdown.umd.js')
                                : require.resolve('../../../node_modules/ses/dist/lockdown.umd.min.js'),
                        to: join(polyfillFolder, 'lockdown.js'),
                    },
                    {
                        from: join(__dirname, '../../sentry/dist/sentry.js'),
                        to: join(flags.outputPath, 'sentry.js'),
                    },
                ],
            }),
            emitManifestFile(flags, computedFlags),
            emitGitInfo(flags.reproducibleBuild),
        ],
        optimization: {
            minimize: false,
            runtimeChunk: false,
            moduleIds: flags.channel === 'stable' && flags.mode === 'production' ? 'deterministic' : 'named',
            splitChunks: {
                maxInitialRequests: Infinity,
                chunks: 'all',
                cacheGroups: {
                    // split each npm package into a chunk.
                    defaultVendors: {
                        test: /[/\\]node_modules[/\\]/,
                        name(module: any) {
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
                dynamicImport: true,
            },
            path: flags.outputPath,
            filename: 'js/[name].js',
            // In some cases webpack will emit files starts with "_" which is reserved in web extension.
            chunkFilename: 'js/chunk.[name].js',
            assetModuleFilename: 'assets/[hash][ext][query]',
            devtoolModuleFilenameTemplate: 'webpack://[namespace]/[resource-path]',
            hotUpdateChunkFilename: 'hot/[id].[fullhash].js',
            hotUpdateMainFilename: 'hot/[runtime].[fullhash].json',
            globalObject: 'globalThis',
            publicPath: '/',
            clean: flags.mode === 'production',
            trustedTypes: String(computedFlags.sourceMapKind).includes('eval')
                ? {
                      policyName: 'webpack',
                  }
                : undefined,
        },
        ignoreWarnings: [/Failed to parse source map/],
        devServer: {
            hot: flags.hmr ? 'only' : false,
            liveReload: false,
            client: flags.hmr ? undefined : false,
        } as DevServerConfiguration,
        stats: flags.mode === 'production' ? 'errors-only' : undefined,
    }

    const plugins = baseConfig.plugins!
    const entries: Record<string, EntryDescription> = (baseConfig.entry = {
        dashboard: normalizeEntryDescription(join(__dirname, '../src/extension/dashboard/index.tsx')),
        popups: normalizeEntryDescription(join(__dirname, '../src/extension/popups/SSR-client.ts')),
        connect: normalizeEntryDescription(join(__dirname, '../src/extension/popups/renderConnect.tsx')),
        contentScript: normalizeEntryDescription(join(__dirname, '../src/content-script.ts')),
        debug: normalizeEntryDescription(join(__dirname, '../src/extension/debug-page/index.tsx')),
    })
    baseConfig.plugins!.push(
        addHTMLEntry({ chunks: ['dashboard'], filename: 'dashboard.html' }),
        addHTMLEntry({ chunks: ['popups'], filename: 'popups.html' }),
        addHTMLEntry({ chunks: ['connect'], filename: 'popups-connect.html' }),
        addHTMLEntry({ chunks: ['contentScript'], filename: 'generated__content__script.html' }),
        addHTMLEntry({ chunks: ['debug'], filename: 'debug.html' }),
    )
    if (flags.devtools) {
        entries.devtools = normalizeEntryDescription(join(__dirname, '../devtools/panels/index.tsx'))
        baseConfig.plugins!.push(addHTMLEntry({ chunks: ['devtools'], filename: 'devtools-background.html' }))
    }
    // background
    if (flags.manifest === 3) {
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
            }),
        )
    }
    for (const entry in entries) {
        if (entry !== 'background' && entry !== 'devtools') {
            withReactDevTools(entries[entry])
        }
    }

    return baseConfig

    function withReactDevTools(entry: EntryDescription) {
        if (!flags.devtools) return
        entry.import = joinEntryItem(join(__dirname, '../devtools/content-script/index.ts'), entry.import)
    }
}
function addHTMLEntry(
    options: HTMLPlugin.Options & {
        gun?: boolean
    },
) {
    let templateContent = readFileSync(join(__dirname, './template.html'), 'utf8')
    if (options.gun) {
        templateContent = templateContent.replace(`<!-- Gun -->`, '<script src="/gun.js"></script>')
    }
    return new HTMLPlugin({
        templateContent,
        inject: 'body',
        scriptLoading: 'defer',
        minify: false,
        ...options,
    })
}
