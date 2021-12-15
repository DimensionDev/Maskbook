import { SocialNetworkID } from '../../../shared'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://www.instagram.com/*', 'https://m.instagram.com/*', 'https://instagram.com/*']
export const instagramBase: SocialNetwork.Base = {
    networkIdentifier: SocialNetworkID.Instagram,
    name: 'instagram',
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.host.endsWith(SocialNetworkID.Instagram)
    },
    notReadyForProduction: true,
}
export const instagramWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...instagramBase,
    gunNetworkHint: SocialNetworkID.Instagram,
}
