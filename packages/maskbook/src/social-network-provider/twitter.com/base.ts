import type { SocialNetwork, SocialNetworkWorker } from '../../social-network-next/types'

export const twitterBase: SocialNetwork.Base = {
    networkIdentifier: 'twitter.com',
    shouldActivate(location) {
        return location.hostname.endsWith('twitter.com')
    },
}

export const twitterWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...twitterBase,
    gunNetworkHint: 'twitter-',
}
