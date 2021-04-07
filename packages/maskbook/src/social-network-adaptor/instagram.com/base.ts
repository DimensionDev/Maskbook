import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const id = 'instagram.com'
export const instagramBase: SocialNetwork.Base = {
    networkIdentifier: id,
    shouldActivate(location) {
        return location.host.endsWith(id)
    },
    notReadyForProduction: true,
}
export const instagramWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...instagramBase,
    gunNetworkHint: id,
}
