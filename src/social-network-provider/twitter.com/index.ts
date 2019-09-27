import { SocialNetworkWorkerAndUIDefinition } from '../../social-network/shared'
import { usernameValidator } from './utils/user'
import { batchReplace, regexMatch, regexMatchAll } from '../../utils/utils'
import { isNil, isNull } from 'lodash-es'
import { ICAO9303Checksum } from './utils/encoding'

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
    publicKeyEncoder: (text: string) => `🎭${ICAO9303Checksum.encode(text)}🎭`,
    publicKeyDecoder: (text: string) =>
        (() => {
            const r = regexMatchAll(text, />([\dA-Za-z+=\/]{20,60})</)
            if (isNull(r)) {
                return null
            }
            for (const v of r) {
                const retV = ICAO9303Checksum.decode(v)
                if (isNull(retV)) {
                    continue
                }
                return retV
            }
            return null
        })(),
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

/**
 * this method tries to find every anchor element inside node with title attribute.
 * It's related to payloadDecoder.
 */
export const postContentParser = (node: HTMLElement) => {
    const contentRoot = node.querySelectorAll<HTMLAnchorElement>('a')
    let sto = ''
    for (const v of contentRoot) {
        sto = sto.concat(`${v.title} `)
    }
    return sto
}
