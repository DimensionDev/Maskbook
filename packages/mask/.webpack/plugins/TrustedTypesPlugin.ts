import webpack, { type Compiler } from 'webpack'

const { RuntimeModule, Template } = webpack
class TrustedTypesRuntimeModule extends RuntimeModule {
    constructor() {
        super('trustedTypes', RuntimeModule.STAGE_TRIGGER)
    }
    override generate(): string {
        const { compilation } = this
        if (!compilation)
            return Template.asString('/* TrustedTypesRuntimeModule skipped because compilation is undefined. */')
        return Template.asString([
            'if (typeof trustedTypes !== "undefined" && location.protocol.includes("extension") && !trustedTypes.defaultPolicy) {',
            Template.indent(`trustedTypes.createPolicy('default', { createScriptURL: String });`),
            '}',
        ])
    }
}
export class TrustedTypesPlugin {
    apply(compiler: Compiler) {
        compiler.hooks.compilation.tap('TrustedTypes', (compilation) => {
            compilation.hooks.afterChunks.tap('TrustedTypes', (chunks) => {
                for (const c of chunks) {
                    if (!compilation.chunkGraph.getNumberOfEntryModules(c)) continue
                    compilation.addRuntimeModule(c, new TrustedTypesRuntimeModule(), compilation.chunkGraph)
                }
            })
        })
    }
}
