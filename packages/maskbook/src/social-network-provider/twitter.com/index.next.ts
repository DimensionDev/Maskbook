import { defineSocialNetworkUI, defineSocialNetworkWorker } from '../../social-network-next'
import { twitterBase, twitterWorkerBase } from './base'

defineSocialNetworkUI({
    ...twitterBase,
    load: () => import('./ui-provider-next'),
})

defineSocialNetworkWorker({
    ...twitterWorkerBase,
    load: () => import('./worker-provider-next'),
})
