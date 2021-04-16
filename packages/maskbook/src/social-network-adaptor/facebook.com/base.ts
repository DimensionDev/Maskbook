import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*', 'https://facebook.com/*']
export const facebookBase: SocialNetwork.Base = {
    networkIdentifier: 'facebook.com',
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith('facebook.com')
    },
}

export const facebookWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...facebookBase,
    gunNetworkHint: '',
}
