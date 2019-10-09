import { SocialNetworkWorkerAndUIDefinition } from '../../social-network/shared'
import { usernameValidator } from './utils/user'
import { batchReplace, regexMatch } from '../../utils/utils'
import { isNil } from 'lodash-es'

export const host = 'twitter.com'
export const hostURL = 'https://twitter.com'
export const hostMobileURL = 'https://mobile.twitter.com'

export const sharedSettings: SocialNetworkWorkerAndUIDefinition = {
    version: 1,
    internalName: 'twitter',
    isDangerousNetwork: false,
    networkIdentifier: host,
    isValidUsername: usernameValidator,
    acceptablePayload: ['v38', 'latest'],
    init() {},
    publicKeyEncoder: (text: string) => `🎭${text}🎭`,
    publicKeyDecoder: (text: string) => regexMatch(text, /(🎭)(.+)(🎭)/, 2),
    payloadEncoder: (text: string) =>
        `https://google.com/${batchReplace(text, [['🎼', '%20'], [':||', '%40'], ['+', '-'], ['=', '_'], ['|', '.']])}`,
    payloadDecoder: (text: string) => {
        let r = regexMatch(text, /https:\/\/google\.com\/%20(.+)%40/, 1)
        if (isNil(r)) {
            return 'null'
        }
        r = batchReplace(r, [['-', '+'], ['_', '='], ['.', '|']])
        return `🎼${r}:||`
    },
    notReadyForProduction: true,
}
