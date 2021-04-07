import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

export const facebookBase: SocialNetwork.Base = {
    networkIdentifier: 'facebook.com',
    shouldActivate(location) {
        return location.hostname.endsWith('facebook.com')
    },
}

export const facebookWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...facebookBase,
    gunNetworkHint: '',
}
