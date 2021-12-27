import { DefinePlugin, EnvironmentPlugin } from 'webpack'
export function EnvironmentPluginCache(def: Record<string, any>) {
    return new EnvironmentPlugin(def)
}
export function EnvironmentPluginNoCache(def: Record<string, any>) {
    const next = {} as any
    for (const key in def) {
        // Mark the usage site as not cacheable
        next['process.env.' + key] = DefinePlugin.runtimeValue(
            () => (def[key] === undefined ? 'undefined' : JSON.stringify(def[key])),
            true,
        )
    }
    return new DefinePlugin(next)
}
