import { defineSocialNetworkUI, defineSocialNetworkWorker } from '../../social-network-next'
import { facebookBase, facebookWorkerBase } from './base'

defineSocialNetworkUI({
    ...facebookBase,
    load: () => import('./ui-provider-next'),
})

defineSocialNetworkWorker({
    ...facebookWorkerBase,
    load: () => import('./worker-provider-next'),
})
