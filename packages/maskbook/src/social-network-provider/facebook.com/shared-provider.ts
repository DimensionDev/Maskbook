import type { SocialNetworkWorkerAndUIDefinition } from '../../social-network/shared'
import { regularUsername, getFacebookHostName } from './parse-username'

export const sharedProvider: SocialNetworkWorkerAndUIDefinition = {
    name: 'facebook',
    networkIdentifier: 'facebook.com',
    isValidUsername: (v) => !!regularUsername(v),
    init() {},
    getHomePage: () => getFacebookHostName('open'),
}
