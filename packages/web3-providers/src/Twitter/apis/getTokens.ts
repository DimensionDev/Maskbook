import { Flags } from '@masknet/flags'

function getCSRFToken() {
    const ct0 = document.cookie.split('; ').find((x) => x.includes('ct0'))
    if (!ct0) return ''
    const [, value] = ct0.split('=')
    return value
}

export async function getTokens() {
    return {
        csrfToken: getCSRFToken(),
    }
}

export async function getHeaders(overrides?: Record<string, string>) {
    const { csrfToken } = await getTokens()

    return {
        authorization: `Bearer ${Flags.twitter_token}`,
        'x-csrf-token': csrfToken,
        'x-twitter-auth-type': 'OAuth2Session',
        ...overrides,
    }
}
