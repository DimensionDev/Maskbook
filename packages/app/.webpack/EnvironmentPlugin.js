import webpack from 'webpack'

export function EnvironmentPluginCache(def) {
    return new webpack.EnvironmentPlugin(def)
}

export function EnvironmentPluginNoCache(def) {
    const next = {}
    for (const key in def) {
        // Mark the usage site as not cacheable
        next['process.env.' + key] = webpack.DefinePlugin.runtimeValue(
            () => (def[key] === undefined ? 'undefined' : JSON.stringify(def[key])),
            true,
        )
    }
    return new webpack.DefinePlugin(next)
}
