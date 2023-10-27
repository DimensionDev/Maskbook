import type { Compiler, Dependency, sources, dependencies } from 'webpack'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

type HarmonyImportSpecifierDependency = dependencies.HarmonyImportDependency & {
    name: string
    ids: string[]
    asiSafe: boolean
}
type DependencyTemplateContext = Parameters<
    InstanceType<(typeof dependencies.ModuleDependency)['Template']>['apply']
>[2]

const InitFragment = require('webpack/lib/InitFragment')
const HarmonyImportSpecifierDependency = require('webpack/lib/dependencies/HarmonyImportSpecifierDependency')
const _oldGetCodeForIds = HarmonyImportSpecifierDependency.Template.prototype._getCodeForIds
const optimize = new WeakSet()

export class OptOutLiveBindingPlugin {
    constructor(private filter: (resource: string, ids: string[]) => boolean) {}
    apply(compiler: Compiler) {
        HarmonyImportSpecifierDependency.Template.prototype._getCodeForIds = this._getCodeForIds
        compiler.hooks.compilation.tap('OptOutLiveBindingPlugin', (compilation) => {
            compilation.hooks.optimizeModules.tap('OptOutLiveBindingPlugin', (modules) => {
                for (const module of modules) {
                    for (const dep of module.dependencies) {
                        if (!isHarmonyImportSpecifierDependency(dep) || dep.defer) continue
                        const module = compilation.moduleGraph.getModule(dep)
                        if (!module || !('resource' in module) || typeof module.resource !== 'string') continue
                        if (this.filter(module.resource, dep.ids)) optimize.add(dep)
                    }
                }
            })
        })
    }

    _getCodeForIds(
        dep: HarmonyImportSpecifierDependency,
        source: sources.ReplaceSource,
        templateContext: DependencyTemplateContext,
        ids: string[],
    ): string {
        if (!optimize.has(dep)) return _oldGetCodeForIds.call(this, dep, source, templateContext, ids)

        const { moduleGraph, concatenationScope } = templateContext
        const connection = moduleGraph.getConnection(dep)
        if (connection && concatenationScope && concatenationScope.isModuleInScope(connection.module)) {
            return _oldGetCodeForIds.call(this, dep, source, templateContext, ids)
        }
        dep.asiSafe = true
        const result = _oldGetCodeForIds.call(this, dep, source, templateContext, ids)

        let localVar
        if (dep.name === dep.ids[0] && dep.ids.length === 1) {
            localVar = '__webpack__' + dep.name
        } else {
            localVar = `__webpack__${dep.name}_${dep.ids.join(' ').replaceAll(/\P{ID_Continue}|_/gu, '__')}`
        }
        templateContext.initFragments.push(
            new InitFragment(
                `/* harmony specifier import (live binding opt-out) */ ${
                    templateContext.runtimeTemplate.supportsConst() ? 'var' : 'var'
                } ${localVar} = ${result};\n`,
                InitFragment.STAGE_HARMONY_IMPORTS,
                dep.sourceOrder,
                `harmony specifier import (live binding opt-out) ${dep.request} ${localVar}`,
            ),
        )
        return localVar
    }
}

function isHarmonyImportSpecifierDependency(dep: Dependency): dep is HarmonyImportSpecifierDependency {
    return dep.type === 'harmony import specifier'
}
