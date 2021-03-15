import { defineSocialNetworkUI, defineSocialNetworkWorker } from '../../social-network'
import { facebookBase, facebookWorkerBase } from './base'

defineSocialNetworkUI({
    ...facebookBase,
    load: () => import('./ui-provider'),
})

defineSocialNetworkWorker({
    ...facebookWorkerBase,
    load: () => import('./worker-provider'),
})
