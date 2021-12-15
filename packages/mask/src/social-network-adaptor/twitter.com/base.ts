import { SocialNetworkID } from '../../../shared'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://mobile.twitter.com/*', 'https://twitter.com/*']
export const twitterBase: SocialNetwork.Base = {
    networkIdentifier: SocialNetworkID.Twitter,
    name: 'twitter',
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith('twitter.com')
    },
}

export function isTwitter(ui: SocialNetwork.Base) {
    return ui.networkIdentifier === SocialNetworkID.Twitter
}

export const twitterWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...twitterBase,
    gunNetworkHint: 'twitter-',
}
