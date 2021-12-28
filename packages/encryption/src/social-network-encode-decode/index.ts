import { Some } from 'ts-results'
import { SocialNetworkEnum } from '../payload/types'
import { TwitterDecoder, __TwitterEncoder } from './twitter'

export function socialNetworkDecoder(network: SocialNetworkEnum, content: string) {
    if (network === SocialNetworkEnum.Twitter) return TwitterDecoder(content)
    return Some(content)
}
export function socialNetworkEncoder(network: SocialNetworkEnum, content: string) {
    if (network === SocialNetworkEnum.Twitter) return __TwitterEncoder(content)
    return content
}
export * from './twitter'
