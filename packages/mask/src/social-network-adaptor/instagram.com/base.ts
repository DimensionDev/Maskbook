import { SocialNetworkEnum } from '@masknet/encryption'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const id = 'instagram.com'
const origins = ['https://www.instagram.com/*', 'https://m.instagram.com/*', 'https://instagram.com/*']
export const instagramBase: SocialNetwork.Base = {
    networkIdentifier: id,
    network: SocialNetworkEnum.Instagram,
    name: 'instagram',
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.host.endsWith(id)
    },
    notReadyForProduction: true,
}
export const instagramWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...instagramBase,
    gunNetworkHint: id,
}
