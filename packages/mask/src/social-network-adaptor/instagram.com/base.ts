import { INSTAGRAM_ID } from '@masknet/shared'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://www.instagram.com/*', 'https://m.instagram.com/*', 'https://instagram.com/*']
export const instagramBase: SocialNetwork.Base = {
    networkIdentifier: INSTAGRAM_ID,
    name: 'instagram',
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.host.endsWith(INSTAGRAM_ID)
    },
    notReadyForProduction: true,
}
export const instagramWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...instagramBase,
    gunNetworkHint: INSTAGRAM_ID,
}
