import { EncryptPayloadNetwork } from '@masknet/encryption'
import type { SiteAdaptor } from '@masknet/types'
import { EnhanceableSite } from '@masknet/shared-base'

const origins = ['https://www.minds.com/*', 'https://minds.com/*', 'https://cdn.minds.com/*']
export const mindsBase: SiteAdaptor.Base = {
    networkIdentifier: EnhanceableSite.Minds,
    encryptPayloadNetwork: EncryptPayloadNetwork.Minds,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith('minds.com')
    },
}

export function isMinds(ui: SiteAdaptor.Base) {
    return ui.networkIdentifier === EnhanceableSite.Minds
}
