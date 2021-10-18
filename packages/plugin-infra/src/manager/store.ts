import type { Plugin } from '../types'

const __registered = new Map<string, Plugin.DeferredDefinition>()

export const registeredPlugins: Iterable<Plugin.DeferredDefinition> = { [Symbol.iterator]: () => __registered.values() }
export const registeredPluginIDs: Iterable<string> = { [Symbol.iterator]: () => __registered.keys() }
export function getPluginDefine(id: string) {
    return __registered.get(id)
}
export function registerPlugin(def: Plugin.DeferredDefinition) {
    if (__registered.has(def.ID)) return
    if (!__meetRegisterRequirement(def)) return
    __registered.set(def.ID, def)
}

export function useRegisteredPlugins() {
    return [...__registered.values()]
}

function __meetRegisterRequirement(def: Plugin.Shared.Definition) {
    // arch check
    if (process.env.architecture === 'app' && !def.enableRequirement.architecture.app) return false
    if (process.env.architecture === 'web' && !def.enableRequirement.architecture.web) return false

    // build variant check
    if (process.env.NODE_ENV === 'production') {
        try {
            if (process.env.channel === 'stable' && def.enableRequirement.target !== 'stable') {
                return false
            } else if (process.env.channel === 'beta' && def.enableRequirement.target === 'insider') {
                return false
            }
        } catch {
            // process.env.channel might not be possible in each build environment.
            if (def.enableRequirement.target !== 'stable') return false
        }
    }
    return true
}
