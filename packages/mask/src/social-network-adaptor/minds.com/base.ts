import { SocialNetworkEnum } from '@masknet/encryption'
import type { SocialNetwork } from '../../social-network/types'
import { EnhanceableSite } from '@masknet/shared-base'

const origins = ['https://www.minds.com/*', 'https://minds.com/*', 'https://cdn.minds.com/*']
export const mindsBase: SocialNetwork.Base = {
    networkIdentifier: EnhanceableSite.Minds,
    encryptionNetwork: SocialNetworkEnum.Minds,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith('minds.com')
    },
}

export function isMinds(ui: SocialNetwork.Base) {
    return ui.networkIdentifier === EnhanceableSite.Minds
}
