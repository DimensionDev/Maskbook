import HtmlWebpackPlugin from 'html-webpack-plugin'
import { buildWebpackTask, getWebpackConfig } from './helper'
import { assetsPath, entries, output } from './paths'

export const { watch: dependenciesWatch, build: dependenciesBuild } = buildWebpackTask(
    'dependencies',
    'Build all node style dependencies by Webpack',
    (mode) => {
        const obj = getWebpackConfig(mode, entries, output.libraries.relative('./bundle/'))
        obj.output!.publicPath = output.libraries.relativeFromRuntimeExtensionRoot('./bundle/')
        // replace ts-loader
        obj.module!.rules[2] = {
            test: /\.(ts|tsx)$/,
            loader: require.resolve('./tree-shake-loader.ts'),
        }
        obj.plugins!.push(
            // @ts-ignore
            ...newPage({
                background_page: 'background.html',
                content_script: 'content-script.html',
                options_page: 'index.html',
                popup_page: 'popup.html',
            }),
        )
        return obj
    },
)
function* newPage(name: typeof entries) {
    for (const each in entries) {
        yield new HtmlWebpackPlugin({
            inject: 'head',
            chunks: [each],
            // @ts-ignore
            template: assetsPath.relativeFromCWD(name[each]),
            // @ts-ignore
            filename: '../../' + name[each],
            minify: false,
        })
    }
}
