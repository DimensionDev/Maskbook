import type { Compiler } from 'webpack'

const connect = 'if (cachedModule !== undefined) {'
const enter = '// Create a new module (and put it into the cache)'
const leaving = 'globalThis.measure?.leave?.(moduleId);'
const leave1 = 'if(threw) delete __webpack_module_cache__[moduleId];'
const leave3 = '// Return the exports of the module'

export class ProfilingPlugin {
    apply(compiler: Compiler) {
        const { javascript, Template } = compiler.webpack
        compiler.hooks.compilation.tap('ProfilingPlugin', (compilation) => {
            javascript.JavascriptModulesPlugin.getCompilationHooks(compilation).renderRequire.tap(
                'ProfilingPlugin',
                (source, context) => {
                    return source
                        .replace(
                            connect,
                            Template.asString([connect, Template.indent('globalThis.measure?.connect?.(moduleId);')]),
                        )
                        .replace(enter, Template.asString([enter, 'globalThis.measure?.enter?.(moduleId);']))
                        .replace(leave3, Template.asString([leave3, leaving]))
                },
            )
        })
    }
}
