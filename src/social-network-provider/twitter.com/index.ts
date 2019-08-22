export const twitterUI = [import('./ui')]
export const twitterWorker = [import('./worker')]

import { SocialNetworkWorkerAndUI } from '../../social-network/shared'
import { usernameValidator } from './utils/user'

export const host = 'twitter.com'
export const hostURL = 'https://twitter.com'

export const sharedSettings: SocialNetworkWorkerAndUI = {
    version: 1,
    internalName: 'twitter',
    isDangerousNetwork: false,
    networkIdentifier: host,
    isValidUsername: usernameValidator,
    acceptablePayload: ['v39', 'latest'],
    init() {},
}
