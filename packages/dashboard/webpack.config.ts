import { Configuration } from 'webpack'
import { join, resolve } from 'path'
import ReactRefreshTypeScriptTransformer from 'react-refresh-typescript'
import WatchMissingModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

type Env = { WEBPACK_BUNDLE: boolean; WEBPACK_BUILD: boolean; WEBPACK_SERVE: boolean }
export default function Config(env: Env): Configuration {
    const isDev = env.WEBPACK_SERVE
    return {
        mode: isDev ? 'development' : 'production',
        target: ['web', 'es2019'],
        experiments: { asset: true },
        cache: {
            type: 'filesystem',
            buildDependencies: { config: [__filename] },
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx'],
            fallback: { crypto: false, stream: 'stream-browserify' },
            alias: {
                lodash: 'lodash-es',
                '@dimensiondev/holoflows-kit': require.resolve('@dimensiondev/holoflows-kit/es'),
                '@dimensiondev/maskbook-shared': require.resolve('../shared/src/index.ts'),
                '@dimensiondev/maskbook-theme': require.resolve('../theme/src/theme.ts'),
                '@dimensiondev/icons': require.resolve('../icons/index.ts'),
                '@dimensiondev/mask-plugin-infra': require.resolve('../plugin-infra/src/index.ts'),
                '@dimensiondev/plugin-example': require.resolve('../plugins/example/src/index.ts'),
                '@dimensiondev/web3-shared': require.resolve('../web3-shared/src/index.ts'),
            },
        },
        entry: join(__dirname, './src/index.tsx'),
        module: {
            rules: [
                // TODO: sourcemap
                {
                    test: /\.tsx?$/,
                    // Compile all ts files in the workspace
                    include: join(__dirname, '../'),
                    loader: require.resolve('ts-loader'),
                    options: {
                        transpileOnly: true,
                        compilerOptions: {
                            importsNotUsedAsValues: 'remove',
                            jsx: !isDev ? 'react-jsx' : 'react-jsxdev',
                        },
                        getCustomTransformers: () => ({
                            before: [isDev ? ReactRefreshTypeScriptTransformer() : undefined].filter(Boolean),
                        }),
                    },
                },
            ],
        },
        plugins: [
            new WatchMissingModulesPlugin(resolve('node_modules')),
            new HtmlWebpackPlugin({ template: join(__dirname, './public/index.html') }),
            // isDev ? new HotModuleReplacementPlugin() : undefined,
            isDev ? new ReactRefreshWebpackPlugin() : undefined,
        ].filter(Boolean),
        // @ts-ignore
        devServer: {
            hot: isDev,
            hotOnly: isDev,
            port: 12346,
        },
    }
}
