import { SocialNetworkWorkerAndUI } from '../../social-network/shared'
import { regularUsername } from './parse-username'

export const sharedProvider: SocialNetworkWorkerAndUI = {
    version: 1,
    internalName: 'facebook',
    isDangerousNetwork: false,
    networkIdentifier: 'facebook.com',
    isValidUsername: v => !!regularUsername(v),
    init() {},
    acceptablePayload: ['v40', 'v39', 'latest'],
}
