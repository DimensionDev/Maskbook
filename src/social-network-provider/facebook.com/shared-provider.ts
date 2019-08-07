import { SocialNetworkWorkerAndUI } from '../../social-network/shared'
import { regularUsername } from './parse-username'

export const sharedProvider: SocialNetworkWorkerAndUI = {
    version: 1,
    name: 'facebook',
    isDangerousNetwork: false,
    networkIdentifier: 'facebook.com',
    networkURL: 'https://www.facebook.com/',
    isValidUsername: v => !!regularUsername(v),
    init() {},
}
