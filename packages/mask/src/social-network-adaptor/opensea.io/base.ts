import { SocialNetworkEnum } from '@masknet/encryption'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'
import { EnhanceableSite } from '@masknet/shared-base'

const origins = ['https://opensea.io/*']
export const openseaBase: SocialNetwork.Base = {
    networkIdentifier: EnhanceableSite.OpenSea,
    encryptionNetwork: SocialNetworkEnum.Unknown,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.host.endsWith(EnhanceableSite.OpenSea)
    },
    notReadyForProduction: true,
}
export const openseaWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...openseaBase,
    gunNetworkHint: '',
}
