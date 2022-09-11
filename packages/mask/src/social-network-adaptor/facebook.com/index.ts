import { defineSocialNetworkUI } from '../../social-network/index.js'
import { facebookBase } from './base.js'

defineSocialNetworkUI({
    ...facebookBase,
    load: () => import('./ui-provider.js'),
    hotModuleReload(callback) {
        if (import.meta.webpackHot) {
            import.meta.webpackHot.accept('./ui-provider.ts', async () => {
                callback((await import('./ui-provider.js')).default)
            })
        }
    },
})
