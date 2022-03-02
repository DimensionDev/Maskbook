import { TWITTER_ID } from '@masknet/shared'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://mobile.twitter.com/*', 'https://twitter.com/*']
export const twitterBase: SocialNetwork.Base = {
    networkIdentifier: TWITTER_ID,
    name: 'twitter',
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith('twitter.com')
    },
}

export function isTwitter(ui: SocialNetwork.Base) {
    return ui.networkIdentifier === TWITTER_ID
}

export const twitterWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...twitterBase,
    gunNetworkHint: 'twitter-',
}
