import { SocialNetworkWorkerAndUI } from '../../social-network/shared'
import { usernameValidator } from './utils/user'

export const host = 'twitter.com'
export const hostURL = 'https://twitter.com'
export const hostMobileURL = 'https://mobile.twitter.com'

export const sharedSettings: SocialNetworkWorkerAndUI = {
    version: 1,
    internalName: 'twitter',
    isDangerousNetwork: false,
    networkIdentifier: host,
    isValidUsername: usernameValidator,
    acceptablePayload: ['v39', 'latest'],
    init() {},
}
