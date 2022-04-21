import { OPENSEA_ID } from '@masknet/shared'
import { SocialNetworkEnum } from '@masknet/encryption'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://opensea.io/*']
export const openseaBase: SocialNetwork.Base = {
    networkIdentifier: OPENSEA_ID,
    encryptionNetwork: SocialNetworkEnum.Unknown,
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
