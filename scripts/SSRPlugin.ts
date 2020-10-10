import { execFile } from 'child_process'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { promisify } from 'util'

const ssrPath = require.resolve('../src/setup.ssr.js')

export class SSRPlugin {
    constructor(public htmlFileName: string, public pathName: string) {}
    async renderSSR(): Promise<string> {
        return (await promisify(execFile)('node', [ssrPath, this.pathName])).stdout
    }
    appendAfterBody(original: string, text: string) {
        return original.replace('</body>', text + '</body>')
    }
    removeScripts(text: string) {
        return text.replace(/<script src="(.+?)"><\/script>/g, '')
    }
    apply(compiler: import('webpack').Compiler) {
        compiler.hooks.compilation.tap('SSRPlugin', (compilation) => {
            /**
             * @see https://github.com/jantimon/html-webpack-plugin#options
             */
            // @ts-ignore
            const htmlWebpackPluginHook: import('webpack').compilation.CompilerHooks & {
                beforeEmit: import('tapable').SyncHook<{
                    html: string
                    outputName: string
                    plugin: HtmlWebpackPlugin
                }>
            } = HtmlWebpackPlugin.getHooks(compilation)
            htmlWebpackPluginHook.beforeEmit.tapPromise('SSRPlugin', async (args) => {
                const { html: originalHTML, outputName, plugin } = args
                if (outputName !== this.htmlFileName) return args
                const html = await this.generateSSRHTMLFile(compilation, originalHTML)
                return { html, outputName, plugin }
            })
        })
    }
    async generateSSRHTMLFile(compilation: import('webpack').compilation.Compilation, originalHTML: string) {
        const ssrString = await this.renderSSR()
        const allScripts = []
        {
            const regex = /<script src="(.+?)"><\/script>/g
            let current
            while ((current = regex.exec(originalHTML))) {
                allScripts.push(current[1])
            }
        }
        let regeneratedHTML = originalHTML
        regeneratedHTML = this.removeScripts(regeneratedHTML)
        regeneratedHTML = this.appendAfterBody(regeneratedHTML, ssrString)
        regeneratedHTML = appendScript(regeneratedHTML, '/' + this.htmlFileName + '.js', 'body', 'after')
        // Generate scripts loader
        const deferredLoader = allScripts.reduce(
            (prev, src) =>
                prev +
                `
        importScript('${src}')`,
            '',
        )
        const generated = `function untilDocumentReady() {
    if (document.readyState === 'complete') return Promise.resolve()
    return new Promise(resolve => {
        document.addEventListener('readystatechange', () => document.readyState === 'complete' && resolve(), {
            passive: true,
        })
    })
}
function importScript(src) {
    const script = document.createElement('script')
    script.src = src
    document.body.appendChild(script)
}
untilDocumentReady().then(() => {
    const head = document.head.firstElementChild
    Array.from(document.body.querySelectorAll('body > style')).reverse().forEach(x => head.before(x))
}).then(() => {
    setTimeout(() => {${deferredLoader}
    }, 20)
})
`
        compilation.assets[this.htmlFileName + '.js'] = {
            source: () => generated,
            size: () => generated.length,
        }
        return regeneratedHTML
    }
}
function appendScript(html: string, src: string, tagName: string, position: string) {
    if (position === 'before') {
        const [before, after] = html.split(`<${tagName}>`)
        return [before, `<${tagName}><script defer src="${src}"></script>`, after].join('')
    } else {
        const [before, after] = html.split(`</${tagName}>`)
        return [before, `<script defer src="${src}"></script></${tagName}>`, after].join('')
    }
}
