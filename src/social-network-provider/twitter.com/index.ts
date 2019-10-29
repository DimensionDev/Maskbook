import { SocialNetworkWorkerAndUIDefinition } from '../../social-network/shared'
import { usernameValidator } from './utils/user'
import { twitterEncoding } from './encoding'
import { hostIdentifier } from "./utils/url";

export const sharedSettings: SocialNetworkWorkerAndUIDefinition = {
    version: 1,
    internalName: 'twitter',
    isDangerousNetwork: false,
    networkIdentifier: hostIdentifier,
    isValidUsername: usernameValidator,
    acceptablePayload: ['v38', 'latest'],
    init() {},
    ...twitterEncoding,
}
