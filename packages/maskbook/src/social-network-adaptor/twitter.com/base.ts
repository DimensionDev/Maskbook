import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const id = 'twitter.com'
export const twitterBase: SocialNetwork.Base = {
    networkIdentifier: id,
    shouldActivate(location) {
        return location.hostname.endsWith('twitter.com')
    },
}

export function isTwitter(ui: SocialNetwork.Base) {
    return ui.networkIdentifier === id
}

export const twitterWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...twitterBase,
    gunNetworkHint: 'twitter-',
}
