import { staleCached } from '../helpers/fetchCached.js'

export async function staleNextIDCached(url: string): Promise<void> {
    const request = new Request(url)
    const response = await staleCached(request)

    if (response && !response.ok) throw new Error('Stale cache failed')
}
