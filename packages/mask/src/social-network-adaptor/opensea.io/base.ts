import { OPENSEA_ID } from '@masknet/shared'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://opensea.io/*']
export const openseaBase: SocialNetwork.Base = {
    networkIdentifier: OPENSEA_ID,
    name: 'opensea',
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.host.endsWith(OPENSEA_ID)
    },
    notReadyForProduction: true,
}
export const openseaWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...openseaBase,
    gunNetworkHint: '',
}
