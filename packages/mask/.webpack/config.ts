/* spell-checker: disable */
import webpack from 'webpack'
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'
const { ProvidePlugin, DefinePlugin, EnvironmentPlugin } = webpack

import { emitJSONFile } from '@nice-labs/emit-file-webpack-plugin'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import DevtoolsIgnorePlugin from 'devtools-ignore-webpack-plugin'
import HTMLPlugin from 'html-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import WebExtensionPlugin from 'webpack-target-webextension'
import ReactCompiler from 'react-compiler-webpack'
import { getGitInfo } from './git-info.js'
import { emitManifestFile } from './plugins/manifest.js'
// @ts-expect-error
import LavaMoat from '@lavamoat/webpack'

import { readFile, readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'

import { computeCacheKey, computedBuildFlags, normalizeBuildFlags, type BuildFlags } from './flags.js'
import { ProfilingPlugin } from './plugins/ProfilingPlugin.js'
import { joinEntryItem, normalizeEntryDescription, type EntryDescription } from './utils.js'

import './clean-hmr.js'
import { TrustedTypesPlugin } from './plugins/TrustedTypesPlugin.js'

const require = createRequire(import.meta.url)
const patchesDir = join(import.meta.dirname, '../../../patches')

export async function createConfiguration(_inputFlags: BuildFlags): Promise<webpack.Configuration> {
    const VERSION = JSON.parse(await readFile(new URL('../../../package.json', import.meta.url), 'utf-8')).version
    const flags = normalizeBuildFlags(_inputFlags)
    const computedFlags = computedBuildFlags(flags)
    const cacheKey = computeCacheKey(flags, computedFlags)

    const productionLike = flags.mode === 'production' || flags.profiling

    const nonWebpackJSFiles = join(flags.outputPath, './js')
    const polyfillFolder = join(nonWebpackJSFiles, './polyfill')
    const pnpmPatches = readdir(patchesDir).then((files) => files.map((x) => join(patchesDir, x)))

    let WEB3_CONSTANTS_RPC = process.env.WEB3_CONSTANTS_RPC || ''
    if (WEB3_CONSTANTS_RPC) {
        try {
            if (typeof JSON.parse(WEB3_CONSTANTS_RPC) === 'object') {
                console.error("Environment variable WEB3_CONSTANTS_RPC should be JSON.stringify'ed twice")
                WEB3_CONSTANTS_RPC = JSON.stringify(WEB3_CONSTANTS_RPC)
            }
        } catch (err) {}
    }
    const baseConfig = {
        name: 'mask',
        // to set a correct base path for source map
        context: join(import.meta.dirname, '../../../'),
        mode: flags.mode,
        devtool: computedFlags.sourceMapKind,
        target: ['web', 'es2022'],
        entry: {},
        node: {
            global: true,
            __dirname: false,
            __filename: false,
        },
        experiments: {
            futureDefaults: true,
            syncImportAssertion: true,
            deferImport: { asyncModule: 'error' },
        },
        cache: {
            type: 'filesystem',
            buildDependencies: {
                config: [import.meta.filename],
                patches: await pnpmPatches,
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
                    // conflict with SES
                    'error-polyfill$': require.resolve('./package-overrides/null.mjs'),
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
                zlib: require.resolve('zlib-browserify'),
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
                computedFlags.sourceMapKind ?
                    { test: /\.js$/, enforce: 'pre', use: [require.resolve('source-map-loader')] }
                :   null,
                // Patch old regenerator-runtime
                {
                    test: /\..?js$/,
                    loader: require.resolve('./loaders/fix-regenerator-runtime.js'),
                },
                // TypeScript
                {
                    test: /\.[mc]?[jt]sx?$/i,
                    parser: { worker: ['OnDemandWorker', '...'] },
                    include: join(import.meta.dirname, '../../'),
                    use: [
                        {
                            loader: require.resolve('swc-loader'),
                            options: {
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
                                            // react 19 not using file names in _jsxDEV
                                            development: false,
                                            refresh: flags.reactRefresh,
                                        },
                                    },
                                    experimental: {
                                        keepImportAttributes: true,
                                        plugins: [['@lingui/swc-plugin', {}]],
                                    },
                                },
                            } satisfies import('@swc/core').Options,
                        },
                        flags.reactCompiler ?
                            {
                                loader: ReactCompiler.reactCompilerLoader,
                                options: ReactCompiler.defineReactCompilerLoaderOption({
                                    babelTransFormOpt: { sourceMaps: !!computedFlags.sourceMapKind },
                                    compilationMode: flags.reactCompiler === true ? 'infer' : flags.reactCompiler,
                                    sources: (x) => x.endsWith('.tsx') || !!x.match(/use[A-Z]/),
                                }),
                            }
                        :   undefined!,
                    ].filter(Boolean),
                },
                // compress svg files
                flags.mode === 'production' ?
                    {
                        test: /\.svg$/,
                        loader: require.resolve('svgo-loader'),
                        // overrides
                        options: {
                            js2svg: {
                                pretty: false,
                            },
                        },
                        exclude: /node_modules/,
                        dependency: 'url',
                        type: 'asset/resource',
                    }
                :   null,
            ],
        },
        plugins: [
            !productionLike && flags.lavamoat ?
                new LavaMoat({
                    policyLocation: join(import.meta.dirname, '../../../lavamoat/mask.json'),
                    generatePolicy: true,
                    emitPolicySnapshot: true,
                    readableResourceIds: true,
                    lockdown: false, // we lockdown on our own
                    runChecks: true,
                    diagnosticsVerbosity: 1,
                })
            :   undefined,
            new WebExtensionPlugin({ background: { pageEntry: 'background', serviceWorkerEntry: 'backgroundWorker' } }),
            flags.sourceMapHideFrameworks !== false &&
                new DevtoolsIgnorePlugin({
                    shouldIgnorePath: (path) => {
                        if (path.includes('masknet') || path.includes('dimensiondev')) return false
                        return path.includes('/node_modules/') || path.includes('/webpack/')
                    },
                }),
            new ProvidePlugin({
                // Widely used Node.js global variable
                Buffer: [require.resolve('buffer'), 'Buffer'],
                // same as https://github.com/MetaMask/extension-provider/issues/48
                'process.nextTick': [require.resolve('./package-overrides/process.nextTick.mjs'), 'default'],
            }),
            new EnvironmentPlugin({
                NODE_ENV: productionLike ? 'production' : flags.mode,
                NODE_DEBUG: false,
                /** JSON.stringify twice */
                WEB3_CONSTANTS_RPC: WEB3_CONSTANTS_RPC,
                MASK_SENTRY_DSN: process.env.MASK_SENTRY_DSN || '',
                MASK_SENTRY: process.env.MASK_SENTRY || JSON.stringify('disabled'),
                MASK_MIXPANEL: process.env.MASK_MIXPANEL || JSON.stringify('disabled'),
                NEXT_PUBLIC_FIREFLY_API_URL: process.env.NEXT_PUBLIC_FIREFLY_API_URL || '',
            }),
            new DefinePlugin({
                'process.browser': 'true',
                'process.version': JSON.stringify('v20.0.0'),
                // https://github.com/MetaMask/extension-provider/issues/48
                // MetaMaskInpageProvider
                'process.stdout': '/* stdout */ null',
                'process.stderr': '/* stdin */ null',
            }),
            flags.reactRefresh && new ReactRefreshWebpackPlugin({ overlay: false, esModule: true }),
            flags.profiling && new ProfilingPlugin(),
            new TrustedTypesPlugin(),
            ...emitManifestFile(flags, computedFlags),
            new CopyPlugin({
                patterns: [
                    { from: join(import.meta.dirname, '../public/'), to: flags.outputPath },
                    {
                        from: join(import.meta.dirname, '../../injected-script/dist/injected-script.js'),
                        to: nonWebpackJSFiles,
                    },
                    { from: join(import.meta.dirname, '../../gun-utils/gun.js'), to: nonWebpackJSFiles },
                    { from: join(import.meta.dirname, '../../mask-sdk/dist/mask-sdk.js'), to: nonWebpackJSFiles },
                    {
                        context: join(import.meta.dirname, '../../polyfills/dist/'),
                        from: '*.js',
                        to: polyfillFolder,
                    },
                    {
                        from:
                            productionLike ?
                                require.resolve('webextension-polyfill/dist/browser-polyfill.min.js')
                            :   require.resolve('webextension-polyfill/dist/browser-polyfill.js'),
                        to: join(polyfillFolder, 'browser-polyfill.js'),
                    },
                    {
                        from:
                            productionLike ?
                                require.resolve('../../../node_modules/ses/dist/lockdown.umd.min.js')
                            :   require.resolve('../../../node_modules/ses/dist/lockdown.umd.js'),
                        to: join(polyfillFolder, 'lockdown.js'),
                    },
                    {
                        from: join(import.meta.dirname, '../../sentry/dist/sentry.js'),
                        to: nonWebpackJSFiles,
                    },
                ],
            }),
            ...(() => {
                const { BRANCH_NAME, BUILD_DATE, COMMIT_DATE, COMMIT_HASH, DIRTY } = getGitInfo()
                const json = {
                    BRANCH_NAME,
                    BUILD_DATE,
                    channel: flags.channel,
                    COMMIT_DATE,
                    COMMIT_HASH,
                    DIRTY,
                    VERSION,
                    REACT_DEVTOOLS_EDITOR_URL: flags.devtools ? flags.devtoolsEditorURI : undefined,
                }
                return [
                    emitJSONFile({ content: json, name: 'build-info.json' }),
                    emitJSONFile({ content: { ...json, channel: 'beta' }, name: 'build-info-beta.json' }),
                ]
            })(),
        ],
        // Focus on performance optimization. Not for download size/cache stability optimization.
        optimization: {
            // we don't need deterministic, and we also don't have chunk request at init we don't need "size"
            chunkIds: productionLike ? 'total-size' : 'named',
            concatenateModules: productionLike,
            flagIncludedChunks: productionLike,
            mangleExports: false,
            minimize: productionLike,
            minimizer: [
                new TerserPlugin({
                    minify: TerserPlugin.swcMinify,
                    exclude: /polyfill/,
                    // https://swc.rs/docs/config-js-minify
                    terserOptions: {
                        compress: {
                            drop_debugger: false,
                            ecma: 2020,
                            keep_classnames: true,
                            keep_fnames: true,
                            keep_infinity: true,
                            passes: 3,
                            pure_getters: false,
                            sequences: false,
                        },
                        mangle: false,
                    },
                }),
            ],
            moduleIds: flags.channel === 'stable' && flags.mode === 'production' ? 'deterministic' : 'named',
            nodeEnv: false, // provided in EnvironmentPlugin
            realContentHash: false,
            removeAvailableModules: productionLike,
            // cannot use single, mv3 requires a different runtime.
            // cannot use false, in some cases there are more than 1 runtime in the single page and cause bug.
            runtimeChunk: {
                name: (entry: { name: string }) => {
                    return entry.name === 'backgroundWorker' ? false : 'runtime'
                },
            },
            splitChunks:
                productionLike ? undefined : (
                    {
                        maxInitialRequests: Infinity,
                        chunks: 'all',
                        cacheGroups: {
                            // split each npm package into a chunk to give better debug experience.
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
                    }
                ),
        },
        output: {
            environment: {
                module: false,
                dynamicImport: true,
            },
            path: flags.outputPath,
            filename: 'entry/[name].js',
            chunkFilename: productionLike ? 'bundled/[id].js' : 'bundled/chunk-[name].js',
            assetModuleFilename: productionLike ? 'assets/[hash][ext][query]' : 'assets/[name]-[hash][ext][query]',
            webassemblyModuleFilename: 'assets/[hash].wasm',
            hotUpdateMainFilename: 'hot/[runtime].[fullhash].json',
            hotUpdateChunkFilename: 'hot/[id].[fullhash].js',
            devtoolModuleFilenameTemplate:
                productionLike ?
                    'webpack://[namespace]/[resource-path]'
                :   join(import.meta.dirname, '../../../[resource-path]'),
            globalObject: 'globalThis',
            publicPath: '/',
            clean: flags.mode === 'production',
            trustedTypes:
                String(computedFlags.sourceMapKind).includes('eval') ?
                    {
                        policyName: 'webpack',
                    }
                :   undefined,
        },
        ignoreWarnings: [
            /Failed to parse source map/,
            /Critical dependency: the request of a dependency is an expression/,
        ],
        devServer: {
            hot: flags.hmr ? 'only' : false,
            liveReload: false,
            client: flags.hmr ? undefined : false,
        } as DevServerConfiguration,
        stats: flags.mode === 'production' ? 'errors-only' : undefined,
    } satisfies webpack.Configuration

    const entries = (baseConfig.entry = {
        dashboard: withReactDevTools(join(import.meta.dirname, '../dashboard/initialization/index.ts')),
        popups: withReactDevTools(join(import.meta.dirname, '../popups/initialization/index.ts')),
        contentScript: withReactDevTools(join(import.meta.dirname, '../content-script/index.ts')),
        background: normalizeEntryDescription(join(import.meta.dirname, '../background/initialization/mv2-entry.ts')),
        backgroundWorker: normalizeEntryDescription(
            join(import.meta.dirname, '../background/initialization/mv3-entry.ts'),
        ),
        devtools: undefined as EntryDescription | undefined,
    }) satisfies Record<string, EntryDescription | undefined>
    delete entries.devtools

    baseConfig.plugins.push(
        await addHTMLEntry(['dashboard'], 'dashboard.html', TemplateType.NoLoading, flags.profiling),
        await addHTMLEntry(['popups'], 'popups.html', TemplateType.Loading, flags.profiling),
        await addHTMLEntry(['contentScript'], 'contentScript.html', TemplateType.NoLoading, flags.profiling),
        await addHTMLEntry(['background'], 'background.html', TemplateType.Background, flags.profiling),
    )
    if (flags.devtools) {
        entries.devtools = normalizeEntryDescription(join(import.meta.dirname, '../devtools/panels/index.tsx'))
        baseConfig.plugins.push(
            await addHTMLEntry(['devtools'], 'devtools-background.html', TemplateType.NoLoading, flags.profiling),
        )
    }
    return baseConfig

    function withReactDevTools(entry: string | string[] | EntryDescription): EntryDescription {
        if (!flags.devtools) return normalizeEntryDescription(entry)
        entry = normalizeEntryDescription(entry)
        entry.import = joinEntryItem(join(import.meta.dirname, '../devtools/content-script/index.ts'), entry.import)
        return entry
    }
}

enum TemplateType {
    Loading,
    NoLoading,
    Background,
}
const pages = {
    loading: readFile(join(import.meta.dirname, './with-loading.html'), 'utf8'),
    noLoading: readFile(join(import.meta.dirname, './with-no-loading.html'), 'utf8'),
}

async function addHTMLEntry(
    chunks: string[],
    filename: string,
    template: TemplateType,
    perf: boolean,
    options?: HTMLPlugin.Options,
) {
    let content
    if (template === TemplateType.Background) {
        content = await pages.noLoading
        content = content.replace(`<!-- Gun -->`, '<script src="/js/gun.js"></script>')
    } else if (template === TemplateType.NoLoading) {
        content = await pages.noLoading
    } else if (template === TemplateType.Loading) {
        content = await pages.loading
    } else throw new Error()
    if (perf) content = content.replace(`<!-- Profiling -->`, '<script src="/js/perf-measure.js"></script>')
    return new HTMLPlugin({
        chunks,
        filename,
        templateContent: content,
        inject: 'body',
        scriptLoading: 'defer',
        minify: false,
        ...options,
    })
}
