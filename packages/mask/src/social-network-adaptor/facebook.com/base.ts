import { SocialNetworkID } from '../../../shared'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*', 'https://facebook.com/*']

export const facebookBase: SocialNetwork.Base = {
    networkIdentifier: SocialNetworkID.Facebook,
    name: 'facebook',
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith(SocialNetworkID.Facebook)
    },
}

export function isFacebook(ui: SocialNetwork.Base) {
    return ui.networkIdentifier === SocialNetworkID.Facebook
}

export const facebookWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...facebookBase,
    gunNetworkHint: '',
}
