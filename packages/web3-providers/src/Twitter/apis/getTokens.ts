import { Flags } from '@masknet/flags'
import { getCookie } from '@masknet/shared-base'

export function getHeaders(overrides?: Record<string, string>) {
    return {
        authorization: `Bearer ${Flags.twitter_token}`,
        'x-csrf-token': getCookie('ct0'),
        'x-twitter-auth-type': 'OAuth2Session',
        'x-twitter-client-language': navigator.language ? navigator.language : 'en',
        ...overrides,
    }
}
