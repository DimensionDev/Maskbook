import { Flags } from '@masknet/flags'

function getCSRFToken() {
    const ct0 = document.cookie.split('; ').find((x) => x.includes('ct0'))
    if (!ct0) return ''
    const [, value] = ct0.split('=')
    return value
}

export async function getHeaders(overrides?: Record<string, string>) {
    return {
        authorization: `Bearer ${Flags.twitter_token}`,
        'x-csrf-token': getCSRFToken(),
        'x-twitter-auth-type': 'OAuth2Session',
        'x-twitter-client-language': typeof navigator !== undefined && navigator.language ? navigator.language : 'en',
        ...overrides,
    }
}
