import type { Compiler } from 'webpack'

export class TrustedTypesPlugin {
    apply(compiler: Compiler) {
        const { RuntimeModule, Template } = compiler.webpack
        class TrustedTypesRuntimeModule extends RuntimeModule {
            constructor() {
                super('trustedTypes', RuntimeModule.STAGE_TRIGGER)
            }
            override generate(): string {
                const { compilation } = this
                if (!compilation)
                    return Template.asString(
                        '/* TrustedTypesRuntimeModule skipped because compilation is undefined. */',
                    )
                return Template.asString([
                    'if (typeof trustedTypes !== "undefined" && location.protocol.includes("extension") && !trustedTypes.defaultPolicy) {',
                    Template.indent(`trustedTypes.createPolicy('default', { createScriptURL: String });`),
                    '}',
                ])
            }
        }
        compiler.hooks.compilation.tap('TrustedTypes', (compilation) => {
            compilation.hooks.optimizeChunkModules.tap('TrustedTypes', (chunks) => {
                for (const c of chunks) {
                    if (compilation.chunkGraph.getNumberOfEntryModules) {
                        if (!compilation.chunkGraph.getNumberOfEntryModules(c)) continue
                    } else {
                        // rspack: ?
                    }
                    compilation.addRuntimeModule(c, new TrustedTypesRuntimeModule(), compilation.chunkGraph)
                }
            })
        })
    }
}
