import { defineSocialNetworkUI, defineSocialNetworkWorker } from '../../social-network'
import { twitterBase, twitterWorkerBase } from './base'

defineSocialNetworkUI({
    ...twitterBase,
    load: () => import('./ui-provider'),
})

defineSocialNetworkWorker({
    ...twitterWorkerBase,
    load: () => import('./worker-provider'),
})
