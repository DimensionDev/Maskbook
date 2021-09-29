import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*', 'https://facebook.com/*']

export const FACEBOOK_ID = 'facebook.com'
export const facebookBase: SocialNetwork.Base = {
    networkIdentifier: FACEBOOK_ID,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith(FACEBOOK_ID)
    },
}

export const facebookWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...facebookBase,
    gunNetworkHint: '',
}
