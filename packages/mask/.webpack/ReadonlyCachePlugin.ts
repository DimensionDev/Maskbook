import webpack from 'webpack'

export class ReadonlyCachePlugin {
    apply(compiler: webpack.Compiler) {
        compiler.cache.hooks.store.intercept({
            register: (tapInfo) => {
                return {
                    name: ReadonlyCachePlugin.name,
                    type: tapInfo.type,
                    fn: function preventCacheStore() {},
                }
            },
        })
    }
}
