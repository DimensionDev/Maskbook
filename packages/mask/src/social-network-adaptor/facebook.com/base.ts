import { SocialNetworkEnum } from '@masknet/encryption'
import { EnhanceableSite } from '@masknet/shared-base'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*', 'https://facebook.com/*']

export const facebookBase: SocialNetwork.Base = {
    encryptionNetwork: SocialNetworkEnum.Facebook,
    networkIdentifier: EnhanceableSite.Facebook,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith('facebook.com')
    },
}

export function isFacebook(ui: SocialNetwork.Base) {
    return ui.networkIdentifier === EnhanceableSite.Facebook
}

export const facebookWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...facebookBase,
    gunNetworkHint: '',
}
