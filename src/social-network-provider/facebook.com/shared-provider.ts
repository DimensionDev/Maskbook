import { SocialNetworkWorkerAndUIDefinition } from '../../social-network/shared'
import { regularUsername, getFacebookHostName } from './parse-username'

export const sharedProvider: SocialNetworkWorkerAndUIDefinition = {
    version: 1,
    internalName: 'facebook',
    isDangerousNetwork: false,
    networkIdentifier: 'facebook.com',
    isValidUsername: (v) => !!regularUsername(v),
    init() {},
    acceptablePayload: ['v40', 'v39', 'v38', 'latest'],
    gunNetworkHint: '',
    getHomePage: () => getFacebookHostName('open'),
}
