import { SocialNetworkEnum } from '../payload/types.js'
import { sharedDecoder, sharedEncoder } from './shared.js'
import { TwitterDecoder, __TwitterEncoder } from './twitter.js'

export function socialNetworkDecoder(network: SocialNetworkEnum, content: string): Array<string | Uint8Array> {
    if (network === SocialNetworkEnum.Twitter) {
        return TwitterDecoder(content)
            .map((x) => [x])
            .unwrapOr([])
    }
    const possiblePayload = content.match(/(\u{1F3BC}[\w+/=|]+:\|\|)/giu) || []

    const result: Array<string | Uint8Array> = []
    for (const payload of possiblePayload) {
        const decoded = sharedDecoder(payload)
        if (decoded.some) result.push(decoded.val)
        else result.push(payload)
    }
    return result
}
export function socialNetworkEncoder(network: SocialNetworkEnum, content: string | Uint8Array): string {
    // v38
    if (typeof content === 'string') {
        if (network === SocialNetworkEnum.Twitter) return __TwitterEncoder(content)
        return content
    }

    // v37
    if (network === SocialNetworkEnum.Twitter) return __TwitterEncoder(content)
    return sharedEncoder(content)
}

export * from './twitter.js'
