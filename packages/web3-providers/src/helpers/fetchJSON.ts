import { fetch, type Fetcher } from './fetch.js'
import { fetchSquashed } from './fetchSquashed.js'
import { fetchCached } from './fetchCached.js'

export async function fetchJSON<T = unknown>(
    input: RequestInfo | URL,
    init?: RequestInit,
    fetcher?: Fetcher,
): Promise<T> {
    const response = await fetch(input, init, fetcher ? [fetcher] : [fetchSquashed, fetchCached])
    if (!response.ok) throw new Error('Failed to fetch as JSON.')
    return response.json()
}
