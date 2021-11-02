import { defineSocialNetworkUI, defineSocialNetworkWorker } from '../../social-network'
import { facebookBase, facebookWorkerBase } from './base'

defineSocialNetworkUI({
    ...facebookBase,
    load: () => import('./ui-provider'),
    hotModuleReload(callback) {
        if (import.meta.webpackHot) {
            import.meta.webpackHot.accept('./ui-provider.ts', async () => {
                callback((await import('./ui-provider')).default)
            })
        }
    },
})

defineSocialNetworkWorker({
    ...facebookWorkerBase,
    load: () => import('./worker-provider'),
    hotModuleReload(callback) {
        if (import.meta.webpackHot) {
            import.meta.webpackHot.accept('./worker-provider.ts', async () => {
                callback((await import('./worker-provider')).default)
            })
        }
    },
})
