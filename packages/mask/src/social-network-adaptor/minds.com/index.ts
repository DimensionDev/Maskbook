import { defineSocialNetworkUI } from '../../social-network/index.js'
import { mindsBase } from './base.js'

defineSocialNetworkUI({
    ...mindsBase,
    load: () => import('./ui-provider.js'),
    hotModuleReload(callback) {
        if (import.meta.webpackHot) {
            import.meta.webpackHot.accept('./ui-provider.ts', async () => {
                callback((await import('./ui-provider.js')).default)
            })
        }
    },
})
