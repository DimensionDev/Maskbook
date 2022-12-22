import { staleCached } from '../entry-helpers.js'

// const BASE_URL =
//     process.env.channel === 'stable' && process.env.NODE_ENV === 'production' ? KV_BASE_URL_PROD : KV_BASE_URL_DEV
// async function createRequest(screenName: string) {
//     const url = urlcat(BASE_URL, '/v1/kv', { persona: personaPublicKey })
//     return new Request(url)
// }

export async function staleNextIDCached(url: string): Promise<void> {
    const request = new Request(url)
    const response = await staleCached(request)

    if (!response?.ok) throw new Error('Stale cache failed')
}
