import { defineSiteAdaptorUI } from '../../site-adaptor-infra/index.js'
import { instagramBase } from './base.js'

defineSiteAdaptorUI({
    ...instagramBase,
    load: () => import('./ui-provider.js'),
    hotModuleReload(callback) {
        if (import.meta.webpackHot) {
            import.meta.webpackHot.accept('./ui-provider.ts', async () => {
                callback((await import('./ui-provider.js')).default)
            })
        }
    },
})
