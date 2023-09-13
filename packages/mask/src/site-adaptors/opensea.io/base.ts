import { EncryptPayloadNetwork } from '@masknet/encryption'
import type { SiteAdaptor } from '@masknet/types'
import { EnhanceableSite } from '@masknet/shared-base'

const origins = ['https://opensea.io/*']
export const openseaBase: SiteAdaptor.Base = {
    networkIdentifier: EnhanceableSite.OpenSea,
    encryptPayloadNetwork: EncryptPayloadNetwork.Unknown,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.host.endsWith(EnhanceableSite.OpenSea)
    },
    notReadyForProduction: true,
    shouldLoadMaskSDK: true,
}
