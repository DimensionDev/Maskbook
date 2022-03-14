import { SocialNetworkEnum } from '@masknet/encryption'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*', 'https://facebook.com/*']

export const FACEBOOK_ID = 'facebook.com'
export const facebookBase: SocialNetwork.Base = {
    networkIdentifier: FACEBOOK_ID,
    encryptionNetwork: SocialNetworkEnum.Facebook,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith(FACEBOOK_ID)
    },
}

export function isFacebook(ui: SocialNetwork.Base) {
    return ui.networkIdentifier === FACEBOOK_ID
}

export const facebookWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...facebookBase,
    gunNetworkHint: '',
}
