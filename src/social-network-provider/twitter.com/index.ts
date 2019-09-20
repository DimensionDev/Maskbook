import { SocialNetworkWorkerAndUIDefinition } from '../../social-network/shared'
import { usernameValidator } from './utils/user'
import { regexMatch } from '../../utils/utils'

export const host = 'twitter.com'
export const hostURL = 'https://twitter.com'
export const hostMobileURL = 'https://mobile.twitter.com'

export const sharedSettings: SocialNetworkWorkerAndUIDefinition = {
    version: 1,
    internalName: 'twitter',
    isDangerousNetwork: false,
    networkIdentifier: host,
    isValidUsername: usernameValidator,
    acceptablePayload: ['v39', 'latest'],
    init() {},
    publicKeyEncoder: (text: string) => `🎭${text}🎭`,
    publicKeyDecoder: (text: string) => regexMatch(text, /(🎭)(.+)(🎭)/, 2),
    notReadyForProduction: true,
}
