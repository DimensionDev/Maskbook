import { getTokens } from './getTokens.js'

export async function getHeaders(overrides?: Record<string, string>) {
    const { bearerToken, csrfToken } = await getTokens()

    return {
        authorization: `Bearer ${bearerToken}`,
        'x-csrf-token': csrfToken,
        'content-type': 'application/json',
        'x-twitter-auth-type': 'OAuth2Session',
        'x-twitter-active-user': 'yes',
        referer: 'https://twitter.com/',
        ...overrides,
    }
}
