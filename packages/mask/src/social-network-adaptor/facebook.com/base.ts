import { EnhanceableSite } from '@masknet/shared-base'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*', 'https://facebook.com/*']

export const facebookBase: SocialNetwork.Base = {
    networkIdentifier: EnhanceableSite.Facebook,
    name: 'facebook',
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
