import type { Compiler } from 'webpack'

const connect = 'if (cachedModule !== undefined) {'
const enter = '// Create a new module (and put it into the cache)'
const leaving = 'globalThis.measure?.leave?.(moduleId);'
const leave1 = 'if(threw) delete __webpack_module_cache__[moduleId];'
const leave3 = '// Return the exports of the module'

type data = Array<[from: string | number, asyncTarget: string[], deferTarget: string[]]>
export class ProfilingPlugin {
    apply(compiler: Compiler) {
        const { javascript, Template, RuntimeModule } = compiler.webpack
        class HintRuntimeModule extends RuntimeModule {
            constructor(private modules: data) {
                super('profiling-hint')
            }
            override generate() {
                return `globalThis.measure?.set_compile_info?.(${JSON.stringify(this.modules)});`
            }
        }
        compiler.hooks.compilation.tap('ProfilingPlugin', (compilation) => {
            compilation.hooks.afterOptimizeModuleIds.tap('ProfilingPlugin', (modules) => {
                const data: data = []
                for (const module of modules) {
                    const asyncTarget = new Set<string>()
                    const deferTarget = new Set<string>()
                    for (const dep of [...module.dependencies, ...module.blocks.flatMap((x) => x.dependencies)]) {
                        if (dep.defer)
                            deferTarget.add(
                                String(compilation.chunkGraph.getModuleId(compilation.moduleGraph.getModule(dep)!)),
                            )
                        else if (dep.type.startsWith('import()'))
                            asyncTarget.add(
                                String(compilation.chunkGraph.getModuleId(compilation.moduleGraph.getModule(dep)!)),
                            )
                    }
                    if (asyncTarget.size || deferTarget.size)
                        data.push([compilation.chunkGraph.getModuleId(module), [...asyncTarget], [...deferTarget]])
                }
                compilation.hooks.additionalChunkRuntimeRequirements.tap('ProfilingPlugin', (chunk) => {
                    if (data.length)
                        compilation.addRuntimeModule(chunk, new HintRuntimeModule(data), compilation.chunkGraph)
                })
            })
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
