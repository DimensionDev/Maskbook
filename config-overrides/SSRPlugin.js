const { exec } = require('child_process')

const HtmlWebpackPlugin = require('html-webpack-plugin')

class SSRPlugin {
    /**
     * @param {string} htmlFileName
     * @param {string} pathName
     */
    constructor(htmlFileName, pathName) {
        this.htmlFileName = htmlFileName
        this.pathName = pathName
    }
    /**
     * @returns {Promise<string>}
     */
    renderSSR() {
        return new Promise((resolve, reject) => {
            exec(
                'node -r esm ./node_modules/ts-node/dist/bin.js --project ./tsconfig_cjs.json -T ./src/setup.ssr.js ' +
                this.pathName,
                (err, stdout) => (err ? reject(err) : resolve(stdout)),
            )
        })
    }
    /**
     * @param {string} original
     * @param {string} string
     */
    appendAfterBody(original, string) {
        return original.replace('</body>', string + '</body>')
    }
    /**
     * @param {string} string
     */
    removeScripts(string) {
        return string.replace(/<script src="(.+?)"><\/script>/g, '')
    }
    /**
     * @param {import('webpack').Compiler} compiler
     */
    apply(compiler) {
        compiler.hooks.compilation.tap('SSRPlugin', compilation => {
            /**
             * @see https://github.com/jantimon/html-webpack-plugin#options
             * @type {import('webpack').compilation.CompilerHooks
             * & {
             *      beforeEmit: import('tapable').SyncHook<{
             *          html: string
             *          outputName: string
             *          plugin: HtmlWebpackPlugin
             *  }>}}
             */
            const htmlWebpackPluginHook = HtmlWebpackPlugin.getHooks(compilation)
            htmlWebpackPluginHook.beforeEmit.tapPromise('SSRPlugin', async args => {
                let { html, outputName, plugin } = args
                if (outputName !== this.htmlFileName) return args
                html = await this.generateSSRHTMLFile(compilation, html)
                return { html, outputName, plugin }
            })
        })
    }
    /**
     * @param {import('webpack').compilation.Compilation} compilation
     */
    async generateSSRHTMLFile(compilation, originalHTML) {
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
        regeneratedHTML = this.appendAfterBody(regeneratedHTML, `<script src="${this.htmlFileName}.js"></script>`)
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
        document.addEventListener('readystatechange', resolve, { once: true, passive: true })
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

module.exports = SSRPlugin