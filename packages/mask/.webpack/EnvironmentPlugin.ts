import webpack from 'webpack'
export function EnvironmentPluginCache(def: Record<string, any>) {
    return new webpack.EnvironmentPlugin(def)
}
export function EnvironmentPluginNoCache(def: Record<string, any>) {
    const next = {} as any
    for (const key in def) {
        // Mark the usage site as not cacheable
        next['process.env.' + key] = webpack.DefinePlugin.runtimeValue(
            () => (def[key] === undefined ? 'undefined' : JSON.stringify(def[key])),
            true,
        )
    }
    return new webpack.DefinePlugin(next)
}
