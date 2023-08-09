import { EncryptPayloadNetwork } from '@masknet/encryption'
import type { SocialNetwork } from '@masknet/types'
import { EnhanceableSite } from '@masknet/shared-base'

const origins = ['https://opensea.io/*']
export const openseaBase: SocialNetwork.Base = {
    networkIdentifier: EnhanceableSite.OpenSea,
    encryptPayloadNetwork: EncryptPayloadNetwork.Unknown,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.host.endsWith(EnhanceableSite.OpenSea)
    },
    notReadyForProduction: true,
}
