import { SocialNetworkWorkerAndUI } from '../../social-network/shared'
import { regularUsername } from './parse-username'

export const sharedProvider: SocialNetworkWorkerAndUI = {
    networkIdentifier: 'facebook.com',
    networkURL: 'https://www.facebook.com/',
    init() {},
    isValidUsername: v => !!regularUsername(v),
}
