import type { SocialNetworkWorkerAndUIDefinition } from '../../social-network/shared'
import { isValidFacebookUsername, getFacebookHostName } from './parse-username'

export const sharedProvider: SocialNetworkWorkerAndUIDefinition = {
    name: 'facebook',
    networkIdentifier: 'facebook.com',
    isValidUsername: (v) => !!isValidFacebookUsername(v),
    init() {},
    getHomePage: () => getFacebookHostName('open'),
}
