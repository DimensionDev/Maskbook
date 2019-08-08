import './worker'
import './ui'
import { SocialNetworkWorkerAndUI } from '../../social-network/shared'
import { usernameValidator } from './utils/user'

export const host = 'twitter.com'

export const sharedSettings: SocialNetworkWorkerAndUI = {
    version: 1,
    isDangerousNetwork: false,
    networkIdentifier: host,
    networkURL: 'https://www.twitter.com/',
    isValidUsername: usernameValidator,
    init() {},
}
