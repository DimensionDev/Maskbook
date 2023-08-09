import { EncryptPayloadNetwork } from '@masknet/encryption'
import type { SocialNetwork } from '@masknet/types'
import { EnhanceableSite } from '@masknet/shared-base'

const origins = ['https://mirror.xyz/*']
export const mirrorBase: SocialNetwork.Base = {
    networkIdentifier: EnhanceableSite.Mirror,
    encryptPayloadNetwork: EncryptPayloadNetwork.Unknown,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.host.endsWith(EnhanceableSite.Mirror)
    },
}
