import type { SocialNetworkWorkerAndUIDefinition } from '../../social-network/shared'
import { usernameValidator } from './utils/user'
import { twitterEncoding } from './encoding'
import { twitterUrl, hostLeadingUrlAutoTwitter } from './utils/url'

export const sharedSettings: SocialNetworkWorkerAndUIDefinition = {
    version: 1,
    internalName: 'twitter',
    isDangerousNetwork: false,
    networkIdentifier: twitterUrl.hostIdentifier,
    isValidUsername: usernameValidator,
    acceptablePayload: ['v38', 'latest'],
    init() {},
    gunNetworkHint: 'twitter-',
    getHomePage: () => hostLeadingUrlAutoTwitter(false),
    ...twitterEncoding,
}
