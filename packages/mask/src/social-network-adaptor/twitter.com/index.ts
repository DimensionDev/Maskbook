import { defineSiteAdaptorUI } from '../../social-network/index.js'
import { twitterBase } from './base.js'

defineSiteAdaptorUI({
    ...twitterBase,
    load: () => import('./ui-provider.js'),
    hotModuleReload(callback) {
        if (import.meta.webpackHot) {
            import.meta.webpackHot.accept('./ui-provider.ts', async () => {
                callback((await import('./ui-provider.js')).default)
            })
        }
    },
})
