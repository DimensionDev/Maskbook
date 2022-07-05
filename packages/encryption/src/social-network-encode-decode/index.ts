import { SocialNetworkEnum } from '../payload/types'
import { sharedDecoder, sharedEncoder } from './shared'
import { TwitterDecoder, __TwitterEncoder } from './twitter'

export function socialNetworkDecoder(network: SocialNetworkEnum, content: string): Array<string | Uint8Array> {
    if (network === SocialNetworkEnum.Twitter) {
        return TwitterDecoder(content)
            .map((x) => [x])
            .unwrapOr([])
    }
    const newVersion = sharedDecoder(content)
    if (newVersion.some) return [newVersion.val]

    const v38 = content.match(/(\u{1F3BC}[\w+/=|]+:\|\|)/giu)
    if (v38) return v38
    return []
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

export * from './twitter'
