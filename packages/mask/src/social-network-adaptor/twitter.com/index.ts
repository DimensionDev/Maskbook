import { defineSocialNetworkUI } from '../../social-network'
import { twitterBase } from './base'

defineSocialNetworkUI({
    ...twitterBase,
    load: () => import('./ui-provider'),
    hotModuleReload(callback) {
        if (import.meta.webpackHot) {
            import.meta.webpackHot.accept('./ui-provider.ts', async () => {
                callback((await import('./ui-provider')).default)
            })
        }
    },
})
