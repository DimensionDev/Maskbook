import type { SocialNetworkWorkerAndUIDefinition } from '../../social-network/shared'
import { usernameValidator } from './utils/user'
import { twitterEncoding } from './encoding'
import { twitterUrl, hostLeadingUrlAutoTwitter } from './utils/url'

export const sharedSettings: SocialNetworkWorkerAndUIDefinition = {
    name: 'twitter',
    networkIdentifier: twitterUrl.hostIdentifier,
    isValidUsername: usernameValidator,
    init() {},
    getHomePage: () => hostLeadingUrlAutoTwitter(false),
    ...twitterEncoding,
}
