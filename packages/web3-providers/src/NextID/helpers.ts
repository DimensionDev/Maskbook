import { staleCached } from '../entry-helpers.js'

export async function staleNextIDCached(url: string): Promise<void> {
    const request = new Request(url)
    const response = await staleCached(request)

    if (!response?.ok) throw new Error('Stale cache failed')
}
