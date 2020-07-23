import { readFileSync } from 'fs'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import type { Configuration } from 'webpack'
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
            ...createHTML(
                mode,
                {
                    background_page: 'background.html',
                    content_script: 'content-script.html',
                    options_page: 'index.html',
                    popup_page: 'popup.html',
                },
                { popup_page: entries.popup_page },
            ),
        )
        return obj
    },
)
function* createHTML(
    mode: Configuration['mode'],
    name: Partial<typeof entries>,
    ssr: Partial<Record<keyof typeof entries, string>>,
) {
    for (const each in name) {
        const htmlName = (name as any)[each]
        const ssrEntry = (ssr as any)[each]
        const template = assetsPath.relativeFromCWD(htmlName)
        yield new HtmlWebpackPlugin({
            inject: 'head',
            chunks: [each],
            filename: '../../' + htmlName,
            minify: false,
            ...(mode === 'production' && ssrEntry
                ? { templateContent: SSR.bind(null, template, ssrEntry) }
                : { template }),
        }) as any
    }
}
async function SSR(htmlPath: string, ssrEntry: string) {
    const html = readFileSync(htmlPath, 'utf-8')
    require = require('esm')(module, {})
    require('../../src/setup.ssr')
    const ssrResult = await import(ssrEntry).then((x) => x.default)
    return html.replace('<!-- ssr -->', ssrResult)
}
