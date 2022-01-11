import { SocialNetworkEnum } from '../payload/types'
import { TwitterDecoder, __TwitterEncoder } from './twitter'

export function socialNetworkDecoder(network: SocialNetworkEnum, content: string): string[] {
    if (network === SocialNetworkEnum.Twitter)
        return TwitterDecoder(content)
            .map((x) => [x])
            .unwrapOr([])
    const all = content.match(/(🎼[\d\/\|\w=_\+]+:\|\|)/gi)
    if (all) return all
    return []
}
export function socialNetworkEncoder(network: SocialNetworkEnum, content: string) {
    if (network === SocialNetworkEnum.Twitter) return __TwitterEncoder(content)
    return content
}
export * from './twitter'
